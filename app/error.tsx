"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center animate-in fade-in-50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Đã có lỗi xảy ra!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Hệ thống gặp sự cố ngoài dự kiến. Hãy thử tải lại trang hoặc liên hệ quản trị viên.
      </p>
      <div className="mt-6 flex items-center space-x-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Thử lại
        </Button>
      </div>
    </div>
  );
}
