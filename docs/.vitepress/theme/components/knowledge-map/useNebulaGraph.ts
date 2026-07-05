import type { Ref } from "vue";
import type * as THREE from "three";
import type { NebulaGraphData, NebulaNode } from "./nebulaGraphData";
import { DOMAIN_PALETTE } from "./nebulaGraphData";

export interface NebulaGraphCallbacks {
  onNodeClick: (node: NebulaNode) => void;
  onBackgroundClick: () => void;
}

export interface NebulaGraphController {
  destroy: () => void;
  refresh: (data: NebulaGraphData) => void;
  focusNode: (nodeId: string | null) => void;
}

type ForceGraph3DFactory = () => ForceGraph3DInstance;

interface ForceGraph3DInstance {
  graphData: (data?: NebulaGraphData) => NebulaGraphData;
  width: (w?: number) => number;
  height: (h?: number) => number;
  backgroundColor: (c?: string) => string;
  showNavInfo: (v?: boolean) => boolean;
  nodeLabel: (fn: (n: NebulaNode) => string) => ForceGraph3DInstance;
  nodeVal: (fn: (n: NebulaNode) => number) => ForceGraph3DInstance;
  nodeColor: (fn: (n: NebulaNode) => string) => ForceGraph3DInstance;
  nodeOpacity: (fn: (n: NebulaNode) => number) => ForceGraph3DInstance;
  linkColor: (fn: (l: { domainId: string }) => string) => ForceGraph3DInstance;
  linkWidth: (l: { source: NebulaNode; target: NebulaNode }) => number;
  linkOpacity: (fn: (l: { domainId: string }) => number) => ForceGraph3DInstance;
  nodeThreeObject: (fn: (n: NebulaNode) => THREE.Mesh) => ForceGraph3DInstance;
  onNodeClick: (fn: (n: NebulaNode) => void) => ForceGraph3DInstance;
  onBackgroundClick: (fn: () => void) => ForceGraph3DInstance;
  enableNodeDrag: (v?: boolean) => boolean;
  enableNavigationControls: (v?: boolean) => boolean;
  cameraPosition: (
    pos?: { x: number; y: number; z: number },
    lookAt?: { x: number; y: number; z: number },
    ms?: number
  ) => void;
  scene: () => THREE.Scene;
  _destructor?: () => void;
}

function createStarfield(THREE: typeof import("three"), scene: THREE.Scene, count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

function createNebulaGlows(THREE: typeof import("three"), scene: THREE.Scene) {
  const anchors = [
    { id: "ai", x: 0, y: 60, z: 0 },
    { id: "math", x: -90, y: -45, z: 30 },
    { id: "economics", x: 90, y: -45, z: -30 }
  ];

  const meshes: THREE.Mesh[] = [];

  for (const anchor of anchors) {
    const palette = DOMAIN_PALETTE[anchor.id];
    const geometry = new THREE.SphereGeometry(42, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: palette.glow,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(anchor.x, anchor.y, anchor.z);
    scene.add(mesh);
    meshes.push(mesh);

    const coreGeometry = new THREE.SphereGeometry(22, 24, 24);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: palette.color,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(anchor.x, anchor.y, anchor.z);
    scene.add(core);
    meshes.push(core);
  }

  return meshes;
}

export async function initNebulaGraph(
  container: HTMLElement,
  data: NebulaGraphData,
  callbacks: NebulaGraphCallbacks,
  options: { isMobile: boolean }
): Promise<NebulaGraphController> {
  const [THREE, ForceGraph3DModule] = await Promise.all([
    import("three"),
    import("3d-force-graph")
  ]);

  const ForceGraph3D = ForceGraph3DModule.default as ForceGraph3DFactory;
  let currentData = data;
  let focusedId: string | null = null;

  const graph = ForceGraph3D()(container);

  const getOpacity = (n: NebulaNode) => {
    if (!focusedId) return 1;
    if (n.id === focusedId) return 1;
    const focused = currentData.nodes.find((node) => node.id === focusedId);
    if (focused && n.domainId === focused.domainId) return 0.75;
    return 0.22;
  };

  const getLinkOpacity = (l: { domainId: string }) => {
    if (!focusedId) return 0.35;
    const focused = currentData.nodes.find((n) => n.id === focusedId);
    if (focused && l.domainId === focused.domainId) return 0.7;
    return 0.1;
  };

  graph
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor("#030014")
    .showNavInfo(false)
    .enableNodeDrag(false)
    .enableNavigationControls(true)
    .nodeLabel((n) => n.label)
    .nodeVal((n) => n.val)
    .nodeColor((n) => n.color)
    .nodeOpacity(getOpacity)
    .linkColor((l) => {
      const palette = DOMAIN_PALETTE[l.domainId];
      return palette ? palette.glow : "#ffffff";
    })
    .linkWidth((l) => {
      const source = l.source as NebulaNode;
      if (source.kind === "domain") return 1.2;
      return 0.6;
    })
    .linkOpacity(getLinkOpacity)
    .nodeThreeObject((node) => {
      const geometry = new THREE.SphereGeometry(node.val, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.glow,
        emissiveIntensity: node.isPreview ? 1.2 : node.kind === "domain" ? 0.9 : 0.55,
        metalness: 0.2,
        roughness: 0.35,
        transparent: Boolean(node.isPreview),
        opacity: node.isPreview ? 0.85 : 1
      });
      const mesh = new THREE.Mesh(geometry, material);

      if (node.isPreview) {
        const ringGeometry = new THREE.RingGeometry(node.val * 1.4, node.val * 1.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: node.color,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        mesh.add(new THREE.Mesh(ringGeometry, ringMaterial));
      }

      return mesh;
    })
    .onNodeClick((node) => {
      focusedId = node.id;
      graph.graphData(currentData);
      callbacks.onNodeClick(node);
    })
    .onBackgroundClick(() => {
      focusedId = null;
      graph.graphData(currentData);
      callbacks.onBackgroundClick();
    })
    .graphData(data);

  const scene = graph.scene();
  scene.fog = new THREE.FogExp2(0x030014, 0.0018);
  scene.add(new THREE.AmbientLight(0x404060, 0.6));

  const pointLight = new THREE.PointLight(0xffffff, 0.8, 600);
  pointLight.position.set(0, 100, 120);
  scene.add(pointLight);

  const starCount = options.isMobile ? 800 : 2000;
  const stars = createStarfield(THREE, scene, starCount);
  const glows = createNebulaGlows(THREE, scene);

  graph.cameraPosition({ x: 0, y: 30, z: 220 }, { x: 0, y: 0, z: 0 }, 0);

  let animationId = 0;
  const animate = () => {
    if (stars) {
      stars.rotation.y += 0.00015;
      stars.rotation.x += 0.00005;
    }
    for (const glow of glows) {
      glow.scale.setScalar(1 + Math.sin(Date.now() * 0.001 + glow.position.x) * 0.04);
    }
    animationId = requestAnimationFrame(animate);
  };
  animate();

  const onResize = () => {
    graph.width(container.clientWidth).height(container.clientHeight);
  };
  window.addEventListener("resize", onResize);

  const refresh = (newData: NebulaGraphData) => {
    currentData = newData;
    graph.graphData(newData);
  };

  return {
    destroy() {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      if (stars) {
        scene.remove(stars);
        stars.geometry.dispose();
        (stars.material as THREE.Material).dispose();
      }
      for (const glow of glows) {
        scene.remove(glow);
        glow.geometry.dispose();
        (glow.material as THREE.Material).dispose();
      }
      graph._destructor?.();
      container.innerHTML = "";
    },
    refresh,
    focusNode(nodeId: string | null) {
      focusedId = nodeId;
      graph.graphData(currentData);
      if (nodeId) {
        const node = currentData.nodes.find((n) => n.id === nodeId);
        if (node?.fx != null) {
          graph.cameraPosition(
            { x: (node.fx ?? 0) * 0.5, y: (node.fy ?? 0) * 0.5 + 40, z: 160 },
            { x: node.fx ?? 0, y: node.fy ?? 0, z: node.fz ?? 0 },
            800
          );
        }
      }
    }
  };
}
