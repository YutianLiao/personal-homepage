import * as THREE from "three";
import type { FlatKnowledgePoint } from "../types";

import { SPHERE_RADIUS } from "./constants";

function slerpOnSphere(
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number,
  radius: number
): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const theta = Math.acos(dot);
  if (theta < 1e-5) return a.clone().multiplyScalar(radius);
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;
  return new THREE.Vector3(
    a.x * w1 + b.x * w2,
    a.y * w1 + b.y * w2,
    a.z * w1 + b.z * w2
  ).multiplyScalar(radius);
}

function arcPoints(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  segments = 28
): THREE.Vector3[] {
  const va = new THREE.Vector3(a.x, a.y, a.z).normalize();
  const vb = new THREE.Vector3(b.x, b.y, b.z).normalize();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    pts.push(slerpOnSphere(va, vb, i / segments, SPHERE_RADIUS));
  }
  return pts;
}

export function createEdges(points: FlatKnowledgePoint[]): {
  group: THREE.Group;
  dispose: () => void;
} {
  const group = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const bySubtopic = new Map<string, FlatKnowledgePoint[]>();
  for (const p of points) {
    const list = bySubtopic.get(p.l2Id) ?? [];
    list.push(p);
    bySubtopic.set(p.l2Id, list);
  }

  for (const pts of bySubtopic.values()) {
    const n = pts.length;
    if (n < 2) continue;

    const pairs: [number, number][] = [];
    if (n <= 4) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) pairs.push([i, j]);
      }
    } else {
      for (let i = 0; i < n; i++) pairs.push([i, (i + 1) % n]);
    }

    for (const [ai, bi] of pairs) {
      const arc = arcPoints(pts[ai].position, pts[bi].position);
      const geom = new THREE.BufferGeometry().setFromPoints(arc);
      const mat = new THREE.LineBasicMaterial({
        color: 0x90b8e8,
        transparent: true,
        opacity: 0.05,
        depthWrite: false
      });
      const line = new THREE.Line(geom, mat);
      line.renderOrder = 0;
      group.add(line);
      geoms.push(geom);
      mats.push(mat);
    }
  }

  return {
    group,
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
    }
  };
}

export function updateEdgeHighlight(
  group: THREE.Group,
  highlightIds: Set<string>,
  pointIdsBySubtopic: Map<string, Set<string>>,
  hasQuery: boolean,
  selectedId: string | null
) {
  let lineIdx = 0;
  for (const ids of pointIdsBySubtopic.values()) {
    const arr = [...ids];
    const n = arr.length;
    if (n < 2) continue;

    const pairCount = n <= 4 ? (n * (n - 1)) / 2 : n;
    for (let i = 0; i < pairCount; i++) {
      const line = group.children[lineIdx] as THREE.Line | undefined;
      if (line) {
        const mat = line.material as THREE.LineBasicMaterial;
        const connectedToSelected =
          selectedId !== null && arr.includes(selectedId);
        const connectedToHighlight = arr.some((id) => highlightIds.has(id));

        if (selectedId && connectedToSelected) {
          mat.opacity = 0.28;
        } else if (!hasQuery) {
          mat.opacity = 0.05;
        } else if (connectedToHighlight) {
          mat.opacity = 0.14;
        } else {
          mat.opacity = 0.03;
        }
      }
      lineIdx += 1;
    }
  }
}
