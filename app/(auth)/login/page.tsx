"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PasskeyButton } from "@/components/auth/passkey-button";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập email và mật khẩu của bạn.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: error.message || "Email hoặc mật khẩu không chính xác.",
        });
      } else {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại Personal OS.",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Đã có lỗi xảy ra",
        description: err.message || "Không thể kết nối máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Đăng nhập Google thất bại",
        description: err.message || "Không thể khởi động Google OAuth.",
      });
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in-50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng Nhập Hệ Thống</CardTitle>
        <CardDescription>
          Chọn phương thức xác thực an toàn để truy cập Personal OS
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Preferred Passkey Login Button */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Phương Thức Ưu Tiên
          </label>
          <PasskeyButton />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">
              Hoặc dùng phương thức dự phòng
            </span>
          </div>
        </div>

        {/* Fallback Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Mật khẩu
              </label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-accent/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2 font-medium">
            <LogIn className="h-4 w-4" />
            {loading ? "Đang xác thực..." : "Đăng Nhập Email"}
          </Button>
        </form>

        {/* Google OAuth Fallback Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          className="w-full gap-2 border bg-accent/40 hover:bg-accent text-foreground font-medium"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Đăng Nhập Bằng Google
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 py-4">
        <p className="text-xs text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5">
            Đăng ký ngay <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
