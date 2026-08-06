"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_MENU_ITEMS = [
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
    title: "Lịch",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Đếm giờ",
    href: "/time-tracking",
    icon: Timer,
  },
  {
    title: "Cài đặt",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/60 px-2 py-1 shadow-2xl flex items-center justify-around safe-bottom">
      {MOBILE_MENU_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 gap-1 text-[10px] font-semibold",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-transform duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="truncate max-w-[64px]">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
