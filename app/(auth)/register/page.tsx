"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Đăng ký thất bại",
          description: error.message || "Không thể tạo tài khoản mới.",
        });
      } else {
        toast({
          title: "Đăng ký thành công!",
          description: "Tài khoản của bạn đã được khởi tạo. Đang chuyển hướng...",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Đã có lỗi xảy ra",
        description: err.message || "Lỗi tạo tài khoản.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in-50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Tạo Tài Khoản Mới</CardTitle>
        <CardDescription>
          Khởi tạo trung tâm điều hành công việc Personal OS của riêng bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-accent/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

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
            <label className="text-sm font-medium leading-none text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Mật khẩu
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

          <Button type="submit" disabled={loading} className="w-full gap-2 font-medium">
            <UserPlus className="h-4 w-4" />
            {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản Personal OS"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 py-4">
        <p className="text-xs text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5">
            <ArrowLeft className="h-3 w-3" /> Quay lại Đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
