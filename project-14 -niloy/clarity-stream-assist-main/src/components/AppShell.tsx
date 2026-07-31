import type { ReactNode } from "react";
import { FloatingDock } from "./FloatingDock";
import { CommandPalette } from "./CommandPalette";
import { AccessibilityPanel } from "./AccessibilityPanel";


export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Global animated gradient tint — unifies every page section under one glass theme */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 gradient-anim opacity-25" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/10 to-background/60" />
      <main className="pb-24 pt-4 px-4">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <FloatingDock />
      
      <CommandPalette />
      <AccessibilityPanel />
    </div>
  );
}

