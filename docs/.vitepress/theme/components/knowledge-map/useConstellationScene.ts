import * as THREE from "three";
import type { MapNode } from "./graphModel";
import { mergeHighlightLinkIds } from "./graphModel";
import {
  applyOrbitPositions,
  nodeVal,
  starColor,
  starGlow,
  type ForceGraphData
} from "./buildConstellationGraph";
import { playBranchTap } from "./useGraphSound";

export interface ConstellationCallbacks {
  onSelectionChange: (nodes: MapNode[]) => void;
  onOpenEntry: (node: MapNode) => void;
}

export interface ConstellationController {
  destroy: () => void;
  refresh: (data: ForceGraphData) => void;
  clearSelection: () => void;
  deselectNode: (id: string) => void;
  focusNode: (id: string) => void;
  resize: () => void;
}

type GraphNode = MapNode & { __threeObj?: THREE.Group };

function createStarMesh(
  node: MapNode,
  colors: { main: string; glow: string }
): THREE.Group {
  const group = new THREE.Group();
  const size =
    node.kind === "domain" ? 5.5 : node.kind === "topic" ? 3.2 : node.isBare ? 2.2 : 2;

  const coreOpacity = node.isBare ? 0.45 : 0.95;
  const haloOpacity = node.isBare ? 0.12 : 0.28;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(size, 16, 16),
    new THREE.MeshBasicMaterial({
      color: colors.main,
      transparent: true,
      opacity: coreOpacity
    })
  );
  group.add(core);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.85, 12, 12),
    new THREE.MeshBasicMaterial({
      color: colors.glow,
      transparent: true,
      opacity: haloOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  group.add(halo);

  if (node.kind === "domain") {
    group.add(new THREE.PointLight(colors.main, 1.8, 280));
  }

  group.userData = { coreOpacity, haloOpacity };
  return group;
}

function addStarfield(scene: THREE.Scene): void {
  const count = 2400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 400 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true
    })
  );
  scene.add(stars);
}

export async function initConstellationScene(
  container: HTMLElement,
  initialData: ForceGraphData,
  callbacks: ConstellationCallbacks
): Promise<ConstellationController> {
  const ForceGraph3D = (await import("3d-force-graph")).default;

  let currentData = initialData;
  const selectedIds = new Set<string>();
  let highlightLinkIds = new Set<string>();
  let orbitNodes = new Map<string, MapNode>();
  let animRaf = 0;
  let startTime = performance.now();

  const width = container.clientWidth || container.offsetWidth || 800;
  const height = container.clientHeight || container.offsetHeight || 600;

  const graph = ForceGraph3D()(container)
    .width(width)
    .height(height)
    .backgroundColor("#030508")
    .showNavInfo(false)
    .nodeRelSize(4)
    .nodeVal((n) => nodeVal((n as GraphNode).kind))
    .nodeColor(() => "#ffffff")
    .nodeLabel((n) => {
      const node = n as GraphNode;
      const kind =
        node.kind === "domain" ? "引力核心" : node.kind === "topic" ? "内轨恒星" : "外轨星辰";
      return `<div class="constellation-tooltip"><strong>${node.label}</strong><br/><span>${kind}</span></div>`;
    })
    .nodeThreeObject((n) => {
      const node = n as GraphNode;
      return createStarMesh(node, {
        main: starColor(node.domainId),
        glow: starGlow(node.domainId)
      });
    })
    .nodeThreeObjectExtend(false)
    .linkWidth((link) => (highlightLinkIds.has((link as { id: string }).id) ? 1.4 : 0))
    .linkOpacity((link) => (highlightLinkIds.has((link as { id: string }).id) ? 0.75 : 0))
    .linkColor((link) => starColor((link as { domainId?: string }).domainId ?? "ai"))
    .linkDirectionalParticles((link) =>
      highlightLinkIds.has((link as { id: string }).id) ? 4 : 0
    )
    .linkDirectionalParticleWidth(0.8)
    .linkDirectionalParticleSpeed(0.004)
    .d3AlphaDecay(1)
    .d3VelocityDecay(0.4)
    .warmupTicks(0)
    .cooldownTicks(0)
    .onNodeClick((n) => handleNodeClick(n as GraphNode))
    .graphData(toGraphPayload(initialData));

  const controls = graph.controls();
  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
  }

  addStarfield(graph.scene());

  function rebuildOrbitMap(nodes: MapNode[]) {
    orbitNodes = new Map(nodes.map((n) => [n.id, n]));
  }

  function toGraphPayload(data: ForceGraphData) {
    const nodes = data.nodes.map((n) => ({ ...n }));
    rebuildOrbitMap(nodes);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    applyOrbitPositions(nodes, byId);
    return { nodes, links: data.links.map((l) => ({ ...l })) };
  }

  function nodesById(): Map<string, GraphNode> {
    const g = graph.graphData();
    return new Map((g.nodes as GraphNode[]).map((n) => [n.id, n]));
  }

  function selectedNodeList(): MapNode[] {
    const byId = nodesById();
    return [...selectedIds].map((id) => byId.get(id)).filter(Boolean) as MapNode[];
  }

  function syncHighlight() {
    highlightLinkIds = mergeHighlightLinkIds(selectedIds, currentData.nodes);
    graph
      .linkWidth(graph.linkWidth())
      .linkOpacity(graph.linkOpacity())
      .linkDirectionalParticles(graph.linkDirectionalParticles());
    syncNodeAppearance();
  }

  function isOnPathToSelection(nodeId: string): boolean {
    for (const selId of selectedIds) {
      let cur = currentData.nodes.find((n) => n.id === selId);
      while (cur) {
        if (cur.id === nodeId) return true;
        cur = cur.parentId
          ? currentData.nodes.find((n) => n.id === cur!.parentId)
          : undefined;
      }
    }
    return false;
  }

  function syncNodeAppearance() {
    const g = graph.graphData();
    for (const n of g.nodes as GraphNode[]) {
      const selected = selectedIds.has(n.id);
      const dimmed = selectedIds.size > 0 && !selected && !isOnPathToSelection(n.id);
      const group = n.__threeObj;
      if (!group) continue;
      const { coreOpacity, haloOpacity } = group.userData as {
        coreOpacity: number;
        haloOpacity: number;
      };
      const children = group.children;
      if (children[0]?.material) {
        (children[0] as THREE.Mesh).material.opacity = dimmed ? coreOpacity * 0.35 : coreOpacity;
      }
      if (children[1]?.material) {
        (children[1] as THREE.Mesh).material.opacity = dimmed ? haloOpacity * 0.35 : haloOpacity;
      }
    }
  }

  function tickOrbits() {
    const g = graph.graphData();
    const nodes = g.nodes as GraphNode[];
    const byId = new Map(nodes.map((n) => [n.id, n]));

    for (const node of nodes) {
      const src = orbitNodes.get(node.id);
      if (!src?.orbitSpeed || src.orbitAngle == null) continue;
      src.orbitAngle += src.orbitSpeed;
      node.orbitAngle = src.orbitAngle;
    }

    applyOrbitPositions(nodes, byId);

    const t = (performance.now() - startTime) / 1000;
    for (const node of nodes) {
      if (node.kind !== "domain" || !node.__threeObj) continue;
      const pulse = 1 + Math.sin(t * 1.2) * 0.06;
      node.__threeObj.scale.setScalar(pulse);
    }

    graph.graphData({ nodes, links: g.links });
    animRaf = requestAnimationFrame(tickOrbits);
  }

  function handleNodeClick(node: GraphNode) {
    if (node.kind === "domain") {
      selectedIds.clear();
      selectedIds.add(node.id);
      playBranchTap();
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
      return;
    }

    if (node.kind === "topic") {
      if (node.isBare) {
        const parent = currentData.nodes.find((n) => n.id === node.parentId);
        if (parent) {
          selectedIds.clear();
          selectedIds.add(parent.id);
          syncHighlight();
          callbacks.onSelectionChange(selectedNodeList());
        }
        return;
      }
      if (selectedIds.has(node.id)) selectedIds.delete(node.id);
      else selectedIds.add(node.id);
      playBranchTap();
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
      return;
    }

    if (!selectedIds.has(node.id)) selectedIds.add(node.id);
    syncHighlight();
    callbacks.onSelectionChange(selectedNodeList());
    callbacks.onOpenEntry(node);
  }

  function focusNode(id: string) {
    const byId = nodesById();
    const node = byId.get(id);
    if (!node || node.x == null) return;

    const dist = node.kind === "domain" ? 240 : node.kind === "topic" ? 170 : 130;
    graph.cameraPosition(
      {
        x: (node.x ?? 0) + dist * 0.35,
        y: (node.y ?? 0) + dist * 0.28,
        z: (node.z ?? 0) + dist
      },
      node as { x: number; y: number; z: number },
      1200
    );

    if (node.kind === "entry") {
      if (!selectedIds.has(node.id)) selectedIds.add(node.id);
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
      callbacks.onOpenEntry(node);
    } else if (node.kind === "domain") {
      selectedIds.clear();
      selectedIds.add(node.id);
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
    } else {
      if (!selectedIds.has(node.id)) selectedIds.add(node.id);
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
    }
  }

  rebuildOrbitMap(initialData.nodes);
  animRaf = requestAnimationFrame(tickOrbits);

  return {
    destroy() {
      cancelAnimationFrame(animRaf);
      graph._destructor?.();
      container.innerHTML = "";
    },
    refresh(data: ForceGraphData) {
      currentData = data;
      selectedIds.clear();
      highlightLinkIds = new Set();
      graph.graphData(toGraphPayload(data));
      syncHighlight();
    },
    clearSelection() {
      selectedIds.clear();
      syncHighlight();
      callbacks.onSelectionChange([]);
    },
    deselectNode(id: string) {
      selectedIds.delete(id);
      syncHighlight();
      callbacks.onSelectionChange(selectedNodeList());
    },
    focusNode,
    resize() {
      const parent = container.parentElement;
      const w = container.clientWidth || parent?.clientWidth || 800;
      const h = container.clientHeight || parent?.clientHeight || 600;
      graph.width(w);
      graph.height(h);
    }
  };
}
