"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectToSecuritySettings() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/settings?tab=security");
  }, [router]);

  return (
    <div className="flex h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span>Đang chuyển hướng đến cấu hình bảo mật...</span>
    </div>
  );
}
