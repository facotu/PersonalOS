"use client";

import * as React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { CommandPalette } from "@/components/shared/command-palette";
import { MobileNav } from "@/components/shared/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar Navigation */}
      <Sidebar className="hidden md:flex md:w-64 md:shrink-0 md:fixed md:inset-y-0 z-30" />

      {/* Main Workspace Layout */}
      <div className="flex flex-col flex-1 md:pl-64">
        <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
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
