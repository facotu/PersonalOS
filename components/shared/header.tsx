"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Command, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GlobalTimer } from "@/components/timer/global-timer";
import { NotificationPopover } from "@/components/reminders/notification-popover";

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || null);
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearchClick = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Search / Command Palette trigger */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearchClick}
          className="h-9 gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Tìm kiếm...</span>
          <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-block">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Global Timer, Notification Bell & User Actions */}
      <div className="flex items-center space-x-2">
        <GlobalTimer />
        <NotificationPopover />

        {userEmail && (
          <span className="hidden md:inline-block text-xs font-medium text-muted-foreground truncate max-w-[150px] pl-1">
            {userEmail}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
