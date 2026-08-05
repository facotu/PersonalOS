"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Key, ShieldCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { loginWithPasskey, isPasskeySupported } from "@/lib/auth/passkey";

export function PasskeyButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [supported, setSupported] = React.useState(true);

  React.useEffect(() => {
    setSupported(isPasskeySupported());
  }, []);

  const handlePasskeyLogin = async () => {
    setLoading(true);
    try {
      const res = await loginWithPasskey();
      if (res.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng quay trở lại Personal OS.",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập bằng Passkey thất bại",
          description: res.message,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Đã có lỗi xảy ra",
        description: err.message || "Không thể thực hiện xác thực Passkey.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handlePasskeyLogin}
      disabled={loading || !supported}
      className="w-full h-11 justify-center gap-2.5 font-medium border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary text-foreground shadow-sm transition-all"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Key className="h-4 w-4 text-primary" />
      )}
      <span>Đăng nhập bằng Passkey</span>
      {supported && (
        <span className="ml-auto inline-flex items-center text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded border border-primary/30">
          <ShieldCheck className="h-3 w-3 mr-0.5" /> Khuyên dùng
        </span>
      )}
    </Button>
  );
}
