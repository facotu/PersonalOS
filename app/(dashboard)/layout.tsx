"use client";

import * as React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { CommandPalette } from "@/components/shared/command-palette";
import { MobileNav } from "@/components/shared/mobile-nav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar Navigation with hover-slide out capability when collapsed */}
      <Sidebar
        className={cn(
          "hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:z-30 md:transition-all md:duration-300 md:shrink-0",
          isSidebarCollapsed
            ? "md:transform md:-translate-x-[246px] md:hover:translate-x-0 md:shadow-2xl md:border-r md:border-primary/30"
            : "md:translate-x-0"
        )}
      />

      {/* Main Workspace Layout - adjusts spacing based on sidebar state */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isSidebarCollapsed ? "md:pl-4" : "md:pl-64"
        )}
      >
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 p-4 pb-20 md:pb-6 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />

      {/* Command Palette Modal */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
