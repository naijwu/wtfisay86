/** biome-ignore-all lint/a11y/noStaticElementInteractions: chill bruh */

import type React from "react";
import { useState } from "react";
import { NODES, WIRES } from "./data";
import { INSTRUCTION_MAP, type Instruction } from "./instructions";
import type { NodeConfig, WireConfig } from "./types";
import {
  clipLineToRect,
  directlyConnected,
  getAnchor,
  highlightedConnections,
} from "./utils";

const COLORS: Record<"dark" | "regular" | "light" | "highlight", string> = {
  dark: "#1E40AF",
  regular: "#3C62DE",
  light: "#93C5FD",
  highlight: "#ffb900",
};

type NodeProps = {
  node: NodeConfig;
  highlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const Node: React.FC<NodeProps> = ({
  node,
  highlighted,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isSignal = node.type === "signal";

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        fill={
          highlighted
            ? COLORS.highlight
            : node.type === "main"
              ? COLORS.dark
              : node.type === "sub"
                ? COLORS.regular
                : COLORS.light // "signal"
        }
        rx={isSignal ? node.h / 2 : 2}
        ry={isSignal ? node.h / 2 : 2}
      />
      <text
        x={node.x + node.w / 2}
        y={node.y + node.h / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={11}
        fill={highlighted ? COLORS.dark : isSignal ? COLORS.dark : "white"}
      >
        {node.label}
      </text>
    </g>
  );
};

const Wire: React.FC<{
  wire: WireConfig;
  from: NodeConfig;
  to: NodeConfig;
  highlighted?: boolean;
}> = ({ wire, from, to, highlighted }) => {
  const start = getAnchor(from, wire.fromAnchor);
  const end = getAnchor(to, wire.toAnchor);

  const pts = [start, ...(wire.waypoints || []), end];

  const clippedStart = clipLineToRect(
    pts[1].x,
    pts[1].y,
    pts[0].x,
    pts[0].y,
    from,
  );

  const n = pts.length;
  const clippedEnd = clipLineToRect(
    pts[n - 2].x,
    pts[n - 2].y,
    pts[n - 1].x,
    pts[n - 1].y,
    to,
  );

  const finalPts = [clippedStart, ...pts.slice(1, n - 1), clippedEnd];

  const markerStart =
    wire.arrow === "start" || wire.arrow === "both" ? "url(#arrow)" : undefined;
  const markerEnd =
    wire.arrow === "end" || wire.arrow === "both" ? "url(#arrow)" : undefined;

  return (
    <polyline
      points={finalPts.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={highlighted ? COLORS.highlight : "#6B7280"}
      strokeWidth={1.5}
      markerStart={markerStart}
      markerEnd={markerEnd}
    />
  );
};

export function Diagram({ hovered }: { hovered: Instruction | null }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const findNode = (id: string) => NODES.find((n) => n.id === id) as NodeConfig;

  const direct = hoveredNode
    ? directlyConnected(hoveredNode)
    : { nodes: [], junctions: [], wires: [] };

  const highlightedWireIds = hovered
    ? highlightedConnections(INSTRUCTION_MAP[hovered]?.logicalWires ?? []).wires
    : direct.wires;

  const highlightedJunctions = hovered
    ? highlightedConnections(INSTRUCTION_MAP[hovered]?.logicalWires ?? [])
        .junctions
    : direct.junctions;

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: annoying for interactions
    <svg width={1050} height={650} className="font-mono font-bold">
      <defs>
        <marker
          id="arrow"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 z" fill="context-stroke" />
        </marker>
      </defs>

      {WIRES.map((w) => (
        <Wire
          key={w.id}
          from={findNode(w.from)}
          to={findNode(w.to)}
          wire={w}
          highlighted={
            hovered
              ? highlightedWireIds.includes(w.id)
              : direct.wires.includes(w.id)
          }
        />
      ))}
      {NODES.map((n) =>
        n.type === "junction" ? (
          <circle
            key={n.id}
            cx={n.x + 0.5}
            cy={n.y + 0.5}
            r={2}
            fill={
              highlightedJunctions.includes(n.id) || hoveredNode === n.id
                ? COLORS.highlight
                : "#6B7280"
            }
          />
        ) : (
          <Node
            key={n.id}
            node={n}
            highlighted={
              hovered
                ? INSTRUCTION_MAP[hovered]?.nodes.includes(n.id)
                : direct.nodes.includes(n.id) || hoveredNode === n.id
            }
            onMouseEnter={() => setHoveredNode(n.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
        ),
      )}
    </svg>
  );
}
