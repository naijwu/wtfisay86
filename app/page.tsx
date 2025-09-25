/** biome-ignore-all lint/a11y/noStaticElementInteractions: brother */
"use client";

import { useMemo, useState } from "react";
import { Diagram } from "@/components/architecture/diagram";
import {
  INSTRUCTION_MAP,
  INSTRUCTION_REF,
  type Instruction,
} from "@/components/architecture/instructions";
import { cn } from "@/lib/utils";

export default function Home() {
  const [toggled, setToggled] = useState<Instruction | null>(null);
  const [hovered, setHovered] = useState<Instruction | null>(null);

  const view = useMemo(() => {
    return hovered ?? toggled ?? null;
  }, [toggled, hovered]);

  return (
    <div className="h-full flex flex-col">
      <div className="relative flex w-full text-sm">
        {Object.keys(INSTRUCTION_MAP).map((inst) => (
          <div
            key={inst}
            onMouseEnter={() => setHovered(inst as Instruction)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "p-2 cursor-pointer font-mono",
              view === inst ? "bg-amber-400" : "bg-transparent",
              view === inst && toggled === inst ? "bg-amber-500" : "",
            )}
            onClick={() =>
              setToggled((prev) =>
                prev === inst ? null : (inst as Instruction),
              )
            }
            onKeyDown={() =>
              setToggled((prev) =>
                prev === inst ? null : (inst as Instruction),
              )
            }
          >
            {view === inst ? INSTRUCTION_REF[view].instruction : inst}
          </div>
        ))}
        <div className="absolute top-[100%] p-2">
          {view && (
            <div className="flex flex-col gap-2 items-start">
              <div className="flex gap-4 items-center font-mono ">
                <div className="font-bold">
                  {INSTRUCTION_REF[view].semantics}
                </div>
                <div className="opacity-70">
                  {INSTRUCTION_REF[view].description}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {INSTRUCTION_REF[view].pipeline.map((stage) => (
                  <div
                    key={stage.step + INSTRUCTION_REF[view].instruction}
                    className="flex gap-3"
                  >
                    <div className="text-right pr-2 whitespace-nowrap w-[100px]">
                      {stage.step}
                    </div>
                    <div className="flex flex-col gap-1">
                      {stage.lines.length > 0 ? (
                        stage.lines.map((line) => (
                          <div key={stage.step + line} className="font-mono">
                            {line}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 italic text-xs">—</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <Diagram hovered={view} />
      </div>
    </div>
  );
}
