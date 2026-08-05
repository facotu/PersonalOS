import * as React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="mb-8 flex items-center space-x-3 text-center z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
          <Layers className="h-6 w-6" />
        </div>
        <div className="text-left">
          <span className="font-bold text-xl tracking-tight leading-none block">
            PERSONAL <span className="text-primary">OS</span>
          </span>
          <span className="text-xs text-muted-foreground">Executive Work Center</span>
        </div>
      </div>

      {/* Auth Form Container Card */}
      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
