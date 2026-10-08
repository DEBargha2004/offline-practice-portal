import { useContext } from "react";
import { ModuleContext, type ModuleContextValue } from "@/context/moduleContextDef";

export function useCurrentModule(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useCurrentModule must be used within a ModuleProvider");
  }
  return context;
}

export type { ModuleContextValue };
