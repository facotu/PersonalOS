"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Timer,
  FileText,
  BarChart3,
  Award,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Công việc",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Dự án",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Lịch",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Time Tracking",
    href: "/time-tracking",
    icon: Timer,
  },
  {
    title: "Ghi chú",
    href: "/notes",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Báo cáo tuần",
    href: "/reviews",
    icon: Award,
  },
  {
    title: "Bảo mật & Passkey",
    href: "/settings/security",
    icon: Shield,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r bg-card/60 backdrop-blur-xl p-4 text-card-foreground",
        className
      )}
      {...props}
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg leading-none">
              PERSONAL <span className="text-primary">OS</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Executive Work Center
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Status Footer */}
      <div className="rounded-xl border bg-accent/40 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between font-medium">
          <span className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> System Online
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
            v1.0
          </span>
        </div>
        <p className="text-muted-foreground text-[11px]">
          Personal Operating System ready.
        </p>
      </div>
    </aside>
  );
}
