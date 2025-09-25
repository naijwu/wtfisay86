export type Instruction = "addq" | "rmmovq" | "mrmovq";

export const INSTRUCTION_MAP: Record<
  Instruction,
  { nodes: string[]; logicalWires: { from: string; to: string }[] }
> = {
  addq: {
    nodes: ["pc", "regfile", "alu", "aluA", "aluB", "cc", "regfile_E", "valE"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "srcB" },
      { from: "srcA", to: "regfile" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "regfile", to: "valB" },
      { from: "valA", to: "aluA" },
      { from: "valB", to: "aluB" },
      { from: "alu", to: "valE" },
      { from: "alu", to: "cc" },
      { from: "valE", to: "regfile_E" },
    ],
  },

  rmmovq: {
    nodes: ["pc", "regfile", "alu", "mem", "addr", "data"],
    logicalWires: [
      { from: "icode", to: "srcA" },
      { from: "icode", to: "srcB" },
      { from: "srcA", to: "regfile" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "regfile", to: "valB" },
      { from: "valA", to: "data" },
      { from: "valB", to: "aluB" },
      { from: "valC", to: "aluA" },
      { from: "alu", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "data", to: "mem" },
    ],
  },

  mrmovq: {
    nodes: ["pc", "regfile", "alu", "mem", "valM", "regfile_M"],
    logicalWires: [
      { from: "icode", to: "srcB" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "aluB" },
      { from: "valC", to: "aluA" },
      { from: "alu", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "mem", to: "valM" },
      { from: "valM", to: "regfile_M" },
    ],
  },
};

