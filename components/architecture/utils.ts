import { NODES, WIRES } from "./data";
import type { Anchor, NodeConfig, WireConfig } from "./types";


export function clipLineToRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rect: { x: number; y: number; w: number; h: number }
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  let tMin = Number.POSITIVE_INFINITY;
  let ix = x2;
  let iy = y2;

  const sides = [
    { x: rect.x, y1: rect.y, y2: rect.y + rect.h }, 
    { x: rect.x + rect.w, y1: rect.y, y2: rect.y + rect.h }, 
    { y: rect.y, x1: rect.x, x2: rect.x + rect.w }, 
    { y: rect.y + rect.h, x1: rect.x, x2: rect.x + rect.w }, 
  ];

  for (const s of sides) {
    if (s?.x) {
      const t = (s.x - x1) / dx;
      const y = y1 + t * dy;
      if (t > 0 && y >= s.y1 && y <= s.y2 && t < tMin) {
        tMin = t;
        ix = s.x;
        iy = y;
      }
    } else if (s?.y) {
      const t = (s.y - y1) / dy;
      const x = x1 + t * dx;
      if (t > 0 && x >= s.x1 && x <= s.x2 && t < tMin) {
        tMin = t;
        ix = x;
        iy = s.y;
      }
    }
  }

  return { x: ix, y: iy };
}

export function getAnchor(node: NodeConfig, anchor?: Anchor) {
  const { x, y, w, h } = node;
  if (!anchor) return { x: x + w / 2, y: y + h / 2 }; // fallback center

  switch (anchor.side) {
    case "left": return { x: x, y: y + (anchor.offset ?? h / 2) };
    case "right": return { x: x + w, y: y + (anchor.offset ?? h / 2) };
    case "top": return { x: x + (anchor.offset ?? w / 2), y: y };
    case "bottom": return { x: x + (anchor.offset ?? w / 2), y: y + h };
  }
}

export function resolvePath(
  from: string,
  to: string,
  wires: WireConfig[],
  nodes: NodeConfig[]
): string[] {
  const junctionIds = new Set(
    nodes.filter((n) => n.type === "junction").map((n) => n.id)
  );
  const visited = new Set<string>();
  let result: string[] = [];

  function dfs(curr: string, target: string, path: string[]): boolean {
    if (curr === target) {
      result = path;
      return true;
    }
    visited.add(curr);
    for (const w of wires.filter((w) => w.from === curr)) {
      if (visited.has(w.to)) continue;
      if (junctionIds.has(w.to)) {
        if (dfs(w.to, target, [...path, w.id])) return true;
      } else if (w.to === target) {
        result = [...path, w.id];
        return true;
      }
    }
    return false;
  }

  dfs(from, to, []);
  return result;
}

export function highlightedConnections(
  logicalWires: { from: string; to: string }[],
): { wires: string[]; junctions: string[] } {
  const junctionIds = new Set(NODES.filter(n => n.type === "junction").map(n => n.id));
  const allWires: string[] = [];
  const allJunctions: string[] = [];

  function dfs(curr: string, target: string, path: string[]) {
    if (curr === target) return true;
    for (const w of WIRES.filter(w => w.from === curr)) {
      if (path.includes(w.id)) continue; // avoid cycles
      if (junctionIds.has(w.to)) {
        if (dfs(w.to, target, [...path, w.id])) {
          allWires.push(w.id);
          allJunctions.push(w.to);
          return true;
        }
      } else if (w.to === target) {
        allWires.push(...path, w.id);
        return true;
      }
    }
    return false;
  }

  for (const lw of logicalWires) {
    dfs(lw.from, lw.to, []);
  }

  return { wires: allWires, junctions: allJunctions };
}

export function directlyConnected(
  id: string,
): { nodes: string[]; wires: string[]; junctions: string[]; } {
  const junctionIds = new Set(
    NODES.filter((n) => n.type === "junction").map((n) => n.id)
  );

  const visitedWires: string[] = [];
  const resultNodes: string[] = [];
  const resultJunctions: string[] = [];

  function follow(from: string) {
    for (const w of WIRES.filter((w) => w.from === from)) {
      visitedWires.push(w.id);

      if (junctionIds.has(w.to)) {
        resultJunctions.push(w.to);
        follow(w.to);
      } else {
        resultNodes.push(w.to);
      }
    }
  }

  follow(id);
  return { nodes: resultNodes, junctions: resultJunctions, wires: visitedWires };
}