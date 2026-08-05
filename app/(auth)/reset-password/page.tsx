"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/auth/schemas";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Lỗi mật khẩu",
        description: result.error.errors[0]?.message || "Mật khẩu không hợp lệ.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Không thể cập nhật mật khẩu",
          description: "Phiên khôi phục đã hết hạn hoặc không hợp lệ.",
        });
      } else {
        toast({
          title: "Cập nhật mật khẩu thành công!",
          description: "Đã cập nhật mật khẩu mới. Đang chuyển hướng sang Đăng nhập...",
        });
        router.push("/login");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Không thể xử lý yêu cầu lúc này.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in-50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Đặt Mật Khẩu Mới</CardTitle>
        <CardDescription>
          Vui lòng nhập mật khẩu mới cho tài khoản Personal OS của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-accent/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-accent/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2 font-medium">
            <KeyRound className="h-4 w-4" />
            {loading ? "Đang cập nhật..." : "Lưu Mật Khẩu Mới"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
