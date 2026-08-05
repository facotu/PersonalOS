import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <h2 className="mt-2 text-xl font-semibold">Trang không tồn tại</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa chỉ khác.
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link href="/dashboard">
          <Home className="h-4 w-4" /> Quay về Dashboard
        </Link>
      </Button>
    </div>
  );
}
