export type Instruction =
  | "rrmovq"
  | "cmovXX"
  | "irmovq"
  | "rmmovq"
  | "mrmovq"
  | "OPq"
  | "jmp"
  | "jXX"
  | "call"
  | "ret"
  | "pushq"
  | "popq";

type PipelineSteps =
  | "FETCH"
  | "DECODE"
  | "EXECUTE"
  | "MEMORY"
  | "WRITEBACK"
  | "PCUPDATE";

export const INSTRUCTION_REF: Record<
  Instruction,
  {
    instruction: string;
    semantics: string;
    pipeline: {
      step: PipelineSteps;
      lines: string[];
    }[];
  }
> = {
  rrmovq: {
    instruction: "rrmovq %rs, %rd",
    semantics: "r[rd] <- r[rs]",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "rA:rB = M1[PC + 1]", "valP = PC + 2"],
      },
      {
        step: "DECODE",
        lines: ["valA = R[rA]"],
      },
      {
        step: "EXECUTE",
        lines: ["valE = valA + 0", "Cnd = cond(CC, ifun)"],
      },
      {
        step: "MEMORY",
        lines: [],
      },
      {
        step: "WRITEBACK",
        lines: ["if (Cnd) R[rB] = valE"],
      },
      {
        step: "PCUPDATE",
        lines: ["PC = valP"],
      },
    ],
  },
  cmovXX: {
    instruction: "cmovXX %rs, %rd",
    semantics: "r[rd] <- r[rs] if last ALU XX 0",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "rA:rB = M1[PC + 1]", "valP = PC + 2"],
      },
      {
        step: "DECODE",
        lines: ["valA = R[rA]"],
      },
      {
        step: "EXECUTE",
        lines: ["valE = valA + 0", "Cnd = cond(CC, ifun)"],
      },
      {
        step: "MEMORY",
        lines: [],
      },
      {
        step: "WRITEBACK",
        lines: ["if (Cnd) R[rB] = valE"],
      },
      {
        step: "PCUPDATE",
        lines: ["PC = valP"],
      },
    ],
  },
  irmovq: {
    instruction: "irmovq $i, %rd",
    semantics: "r[rd] <- i",
    pipeline: [
      {
        step: "FETCH",
        lines: [
          "icode:ifun = M1[PC]",
          "rA:rB = M1[PC + 1]",
          "valC = M2[PC + 2]",
          "valP = PC + 10",
        ],
      },
      {
        step: "DECODE",
        lines: ["valA = R[rA]"],
      },
      {
        step: "EXECUTE",
        lines: ["valE = valC + 0"],
      },
      {
        step: "MEMORY",
        lines: [],
      },
      {
        step: "WRITEBACK",
        lines: ["R[rB] = valE"],
      },
      {
        step: "PCUPDATE",
        lines: ["PC = valP"],
      },
    ],
  },
  rmmovq: {
    instruction: "rmmovq %rs, D(%rd)",
    semantics: "m[D + r[rd]] <- r[rs]",
    pipeline: [
      {
        step: "FETCH",
        lines: [
          "icode:ifun = M1[PC]",
          "rA:rB = M1[PC + 1]",
          "valC = M8[PC + 2]",
          "valP = PC + 10",
        ],
      },
      { step: "DECODE", lines: ["valA = R[rA]", "valB = R[rB]"] },
      { step: "EXECUTE", lines: ["valE = valC + valB"] },
      { step: "MEMORY", lines: ["M[valE] = valA"] },
      { step: "WRITEBACK", lines: [] },
      { step: "PCUPDATE", lines: ["PC = valP"] },
    ],
  },
  mrmovq: {
    instruction: "mrmovq D(%rs), %rd",
    semantics: "r[rd] <- m[D + r[rs]]",
    pipeline: [
      {
        step: "FETCH",
        lines: [
          "icode:ifun = M1[PC]",
          "rA:rB = M1[PC + 1]",
          "valC = M8[PC + 2]",
          "valP = PC + 10",
        ],
      },
      { step: "DECODE", lines: ["valA = R[rA]", "valB = R[rB]"] },
      { step: "EXECUTE", lines: ["valE = valC + valB"] },
      { step: "MEMORY", lines: ["valM = M8[valE]"] },
      { step: "WRITEBACK", lines: ["R[rA] = valM"] },
      { step: "PCUPDATE", lines: ["PC = valP"] },
    ],
  },
  OPq: {
    instruction: "OPq %rs, %rd",
    semantics: "r[rd] <- r[rd] OP r[rs]",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "rA:rB = M1[PC + 1]", "valP = PC + 2"],
      },
      { step: "DECODE", lines: ["valA = R[rA]", "valB = R[rB]"] },
      {
        step: "EXECUTE",
        lines: ["valE = valB <ifun> valA", "<update CC based on valE>"],
      },
      { step: "MEMORY", lines: [] },
      { step: "WRITEBACK", lines: ["R[rB] = valE"] },
      { step: "PCUPDATE", lines: ["PC = valP"] },
    ],
  },
  jmp: {
    instruction: "jmp D",
    semantics: "goto D",
    pipeline: [
      { step: "FETCH", lines: ["icode:ifun = M1[PC]", "valC = M8[PC + 1]"] },
      { step: "DECODE", lines: [] },
      { step: "EXECUTE", lines: [] },
      { step: "MEMORY", lines: [] },
      { step: "WRITEBACK", lines: [] },
      { step: "PCUPDATE", lines: ["PC = valC"] },
    ],
  },
  jXX: {
    instruction: "jXX D",
    semantics: "goto D if last ALU XX 0",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "valC = M8[PC + 1]", "valP = PC + 9"],
      },
      { step: "DECODE", lines: [] },
      { step: "EXECUTE", lines: ["Cnd = Cond(ifun, CC)"] },
      { step: "MEMORY", lines: [] },
      { step: "WRITEBACK", lines: [] },
      { step: "PCUPDATE", lines: ["if Cnd PC = valC else PC = valP"] },
    ],
  },
  call: {
    instruction: "call D",
    semantics: "pushq PC; jmp D",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "valC = M8[PC + 1]", "valP = PC + 9"],
      },
      { step: "DECODE", lines: ["valB = R[%rsp]"] },
      { step: "EXECUTE", lines: ["valE = valB - 8"] },
      { step: "MEMORY", lines: ["M[valE] = valP"] },
      { step: "WRITEBACK", lines: ["R[%rsp] = valE"] },
      { step: "PCUPDATE", lines: ["PC = valC"] },
    ],
  },
  pushq: {
    instruction: "pushq %rs",
    semantics: "m[r[rsp] - 8] <- r[rs]; r[rsp] = r[rsp] - 8",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "rA:rB = M1[PC + 1]", "valP = PC + 2"],
      },
      { step: "DECODE", lines: ["valA = R[rA]", "valB = R[%rsp]"] },
      { step: "EXECUTE", lines: ["valE = valB - 8"] },
      { step: "MEMORY", lines: ["M[valE] = valA"] },
      { step: "WRITEBACK", lines: ["R[%rsp] = valE"] },
      { step: "PCUPDATE", lines: ["PC = valP"] },
    ],
  },
  ret: {
    instruction: "ret",
    semantics: "popq PC",
    pipeline: [
      { step: "FETCH", lines: ["icode:ifun = M1[PC]", "valP = PC + 1"] },
      { step: "DECODE", lines: ["valB = R[%rsp]"] },
      { step: "EXECUTE", lines: ["valE = valB + 8"] },
      { step: "MEMORY", lines: ["valM = M8[valB]"] },
      { step: "WRITEBACK", lines: ["R[%rsp] = valE"] },
      { step: "PCUPDATE", lines: ["PC = valM"] },
    ],
  },
  popq: {
    instruction: "popq %rd",
    semantics: "r[rd] <- m[r[rsp]]; r[rsp] = r[rsp] + 8",
    pipeline: [
      {
        step: "FETCH",
        lines: ["icode:ifun = M1[PC]", "rA:rB = M1[PC + 1]", "valP = PC + 2"],
      },
      { step: "DECODE", lines: ["valB = R[%rsp]"] },
      { step: "EXECUTE", lines: ["valE = valB + 8"] },
      { step: "MEMORY", lines: ["valM = M8[valB]"] },
      { step: "WRITEBACK", lines: ["R[rA] = valM", "R[%rsp] = valE"] },
      { step: "PCUPDATE", lines: ["PC = valP"] },
    ],
  },
};
export const INSTRUCTION_MAP: Record<
  Instruction,
  { nodes: string[]; logicalWires: { from: string; to: string }[] }
> = {
  // rrmovq: r[rd] <- r[rs]
  rrmovq: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valA",
      "valE",
      "regfile_E",
      "dstE",
      "cond",
      "cc",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "dstE" },
      { from: "srcA", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "valA", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valE", to: "regfile_E" },
      { from: "dstE", to: "regfile_E" },
    ],
  },

  // cmovXX: conditional move
  cmovXX: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valA",
      "valE",
      "regfile_E",
      "dstE",
      "cc",
      "cond",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "dstE" },
      { from: "srcA", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "valA", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "alu", to: "cc" },
      { from: "cc", to: "cond" },
      { from: "cond", to: "regfile_E" },
      { from: "valE", to: "regfile_E" },
      { from: "dstE", to: "regfile_E" },
    ],
  },

  // irmovq: immediate -> reg
  irmovq: {
    nodes: ["pc", "alu", "valC", "valE", "regfile_E", "dstE"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "dstE" },
      { from: "valC", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valE", to: "regfile_E" },
      { from: "dstE", to: "regfile_E" },
    ],
  },

  // rmmovq: reg -> mem
  rmmovq: {
    nodes: ["pc", "regfile", "alu", "mem", "valA", "valB", "addr", "data"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "srcB" },
      { from: "srcA", to: "regfile" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "regfile", to: "valB" },
      { from: "valA", to: "data" },
      { from: "valB", to: "alu" },
      { from: "valC", to: "alu" },
      { from: "alu", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "data", to: "mem" },
    ],
  },

  // mrmovq: mem -> reg
  mrmovq: {
    nodes: ["pc", "regfile", "alu", "mem", "valB", "valM", "regfile_M", "dstM"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcB" },
      { from: "icode", to: "dstM" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "alu" },
      { from: "valC", to: "alu" },
      { from: "alu", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "mem", to: "valM" },
      { from: "valM", to: "regfile_M" },
      { from: "dstM", to: "regfile_M" },
    ],
  },

  // OPq
  OPq: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valA",
      "valB",
      "valE",
      "regfile_E",
      "dstE",
      "cc",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "srcB" },
      { from: "icode", to: "dstE" },
      { from: "srcA", to: "regfile" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "regfile", to: "valB" },
      { from: "valA", to: "alu" },
      { from: "valB", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "alu", to: "cc" },
      { from: "valE", to: "regfile_E" },
      { from: "dstE", to: "regfile_E" },
    ],
  },

  // jmp
  jmp: {
    nodes: ["pc", "valC", "nextPC"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "valC", to: "nextPC" },
    ],
  },

  // jXX
  jXX: {
    nodes: ["pc", "valC", "nextPC", "cc", "cond"],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "valC", to: "nextPC" },
      { from: "cc", to: "cond" },
      { from: "cond", to: "nextPC" },
    ],
  },

  // call
  call: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valB",
      "valE",
      "mem",
      "addr",
      "data",
      "valP",
      "nextPC",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcB" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valE", to: "addr" },
      { from: "valP", to: "data" },
      { from: "addr", to: "mem" },
      { from: "data", to: "mem" },
      { from: "valC", to: "nextPC" },
    ],
  },

  // ret
  ret: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valB",
      "valE",
      "mem",
      "addr",
      "valM",
      "nextPC",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valB", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "mem", to: "valM" },
      { from: "valM", to: "nextPC" },
    ],
  },

  // pushq
  pushq: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valA",
      "valB",
      "valE",
      "mem",
      "addr",
      "data",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "srcB" },
      { from: "srcA", to: "regfile" },
      { from: "srcB", to: "regfile" },
      { from: "regfile", to: "valA" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valE", to: "addr" },
      { from: "valA", to: "data" },
      { from: "addr", to: "mem" },
      { from: "data", to: "mem" },
    ],
  },

  // popq
  popq: {
    nodes: [
      "pc",
      "regfile",
      "alu",
      "valB",
      "valE",
      "mem",
      "addr",
      "valM",
      "regfile_E",
      "regfile_M",
      "dstE",
      "dstM",
    ],
    logicalWires: [
      { from: "pc", to: "icode" },
      { from: "icode", to: "srcA" },
      { from: "icode", to: "dstE" },
      { from: "icode", to: "dstM" },
      { from: "srcA", to: "regfile" },
      { from: "regfile", to: "valB" },
      { from: "valB", to: "alu" },
      { from: "alu", to: "valE" },
      { from: "valB", to: "addr" },
      { from: "addr", to: "mem" },
      { from: "mem", to: "valM" },
      { from: "valM", to: "regfile_M" },
      { from: "dstM", to: "regfile_M" },
      { from: "valE", to: "regfile_E" },
      { from: "dstE", to: "regfile_E" },
    ],
  },
};
