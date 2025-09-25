
export type Anchor = { side: "left" | "right" | "top" | "bottom"; offset?: number };

export type NodeConfig = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: "main" | "sub" | "signal" | "junction" | "decorative";
};

export type WireConfig = {
  id: string;
  from: string;
  to: string;
  arrow?: "start" | "end" | "both";
  waypoints?: { x: number; y: number }[];
  fromAnchor?: Anchor;
  toAnchor?: Anchor;
};