/** biome-ignore-all lint/a11y/noStaticElementInteractions: brother */
"use client";

import { useState } from "react";
import { Diagram } from "@/components/architecture/diagram";
import {
  INSTRUCTION_MAP,
  type Instruction,
} from "@/components/architecture/instructions";
import { cn } from "@/lib/utils";

export default function Home() {
  const [hovered, setHovered] = useState<Instruction | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex w-full font-normal text-sm">
        {Object.keys(INSTRUCTION_MAP).map((inst) => (
          <div
            key={inst}
            onMouseEnter={() => setHovered(inst as Instruction)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "py-2 px-2 cursor-pointer",
              hovered === inst ? "bg-amber-400" : "bg-transparent",
            )}
          >
            {inst}
          </div>
        ))}
      </div>
      <div className="flex-grow flex items-center justify-center">
        <Diagram hovered={hovered} />
      </div>
    </div>
  );
}
