"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/auth/schemas";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Lỗi dữ liệu",
        description: result.error.errors[0]?.message || "Email không hợp lệ.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      // USER ENUMERATION PROTECTION:
      // Always show uniform success message regardless of whether the email exists in DB.
      setSubmitted(true);
      toast({
        title: "Đã xử lý yêu cầu",
        description: "Nếu địa chỉ email tồn tại trong hệ thống, liên kết khôi phục đã được gửi.",
      });
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in-50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Khôi Phục Mật Khẩu</CardTitle>
        <CardDescription>
          Nhập email đăng ký của bạn để nhận liên kết đặt lại mật khẩu
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {submitted ? (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              Nếu địa chỉ email <span className="font-bold text-primary">{email}</span> đã được đăng ký trên Personal OS, liên kết hướng dẫn khôi phục mật khẩu đã được gửi đến hộp thư của bạn.
            </p>
            <p className="text-xs text-muted-foreground">
              Vui lòng kiểm tra hộp thư (bao gồm cả thư rác / Spam).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email đăng ký
              </label>
              <input
                type="email"
                placeholder="nhap-email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-accent/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2 font-medium">
              <Send className="h-4 w-4" />
              {loading ? "Đang xử lý..." : "Gửi Email Khôi Phục"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 py-4">
        <Link href="/login" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
