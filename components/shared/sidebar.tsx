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
  Settings,
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
    title: "Cài đặt",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ className, onNavigate, isCollapsed = false, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r bg-card/60 backdrop-blur-xl text-card-foreground transition-all duration-300 ease-in-out group/sidebar",
        isCollapsed ? "w-16 p-3 hover:w-64 hover:p-4" : "w-64 p-4",
        className
      )}
      {...props}
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center px-1 py-1 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Layers className="h-6 w-6" />
          </div>
          <div
            className={cn(
              "transition-all duration-300 flex flex-col ml-3 origin-left",
              isCollapsed
                ? "opacity-0 w-0 h-0 overflow-hidden group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:h-auto"
                : "w-auto h-auto opacity-100"
            )}
          >
            <h1 className="font-bold tracking-tight text-lg leading-none whitespace-nowrap">
              PERSONAL <span className="text-primary">OS</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
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
                  "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isCollapsed
                    ? "justify-center px-0 group-hover/sidebar:justify-start group-hover/sidebar:px-3"
                    : "justify-start px-3",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                    isCollapsed ? "" : "mr-3"
                  )}
                />
                <span
                  className={cn(
                    "transition-all duration-300 origin-left",
                    isCollapsed
                      ? "opacity-0 w-0 overflow-hidden group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3"
                      : "ml-3 opacity-100"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Status Footer */}
      <div
        className={cn(
          "rounded-xl border bg-accent/40 transition-all duration-300 text-xs space-y-2 overflow-hidden",
          isCollapsed
            ? "w-10 h-10 p-0 flex items-center justify-center border-none bg-transparent group-hover/sidebar:w-full group-hover/sidebar:h-auto group-hover/sidebar:p-3 group-hover/sidebar:border group-hover/sidebar:bg-accent/40"
            : "p-3"
        )}
      >
        {isCollapsed && (
          <div className="group-hover/sidebar:hidden flex items-center justify-center shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}
        <div
          className={cn(
            "transition-all duration-300 space-y-2 origin-left",
            isCollapsed ? "hidden group-hover/sidebar:block w-full" : "block w-full"
          )}
        >
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-foreground whitespace-nowrap">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> System Online
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              v1.0
            </span>
          </div>
          <p className="text-muted-foreground text-[11px] whitespace-nowrap">
            Personal Operating System ready.
          </p>
        </div>
      </div>
    </aside>
  );
}
