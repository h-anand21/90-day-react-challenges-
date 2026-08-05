import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { FloatingDock } from "./FloatingDock";
import { CommandPalette } from "./CommandPalette";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { AIChat, AIChatFab } from "./AIChat";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Global Top Navbar with Search & Sun/Moon Theme Toggle */}
      <TopNav />

      {/* Main Container */}
      <main className="pb-28 pt-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <FloatingDock />
      
      <CommandPalette />
      <AccessibilityPanel />
      <AIChatFab />
      <AIChat />
    </div>
  );
}
