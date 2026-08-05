"use client";

import * as React from "react";
import { Shield, Key, Plus, Trash2, Smartphone, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

interface PasskeyItem {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string;
}

export default function SecuritySettingsPage() {
  const [passkeys, setPasskeys] = React.useState<PasskeyItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addingPasskey, setAddingPasskey] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const fetchPasskeys = React.useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("user_passkeys")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setPasskeys(data);
        }
      }
    } catch (err) {
      console.error("Error fetching passkeys:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const handleAddPasskey = async () => {
    setAddingPasskey(true);
    try {
      // 1. Fetch registration options from server
      const res = await fetch("/api/auth/passkey/register/options", {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Không thể lấy tùy chọn đăng ký.");
      }

      const options = await res.json();

      // 2. Pass options to browser WebAuthn API via SimpleWebAuthn
      const attResp = await startRegistration({ optionsJSON: options });

      // 3. Send response back to server for verification
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: attResp,
          expectedChallenge: options.challenge,
          deviceName: navigator.userAgent.includes("Mac")
            ? "MacBook / iPhone (Touch ID / Face ID)"
            : navigator.userAgent.includes("Windows")
            ? "Windows Device (Windows Hello)"
            : "Platform Authenticator",
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        toast({
          title: "Thêm Passkey thành công!",
          description: "Giờ đây bạn có thể đăng nhập nhanh chóng bằng Passkey.",
        });
        fetchPasskeys();
      } else {
        throw new Error(verifyData.message || "Không thể đăng ký Passkey.");
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        toast({
          variant: "destructive",
          title: "Đã hủy thao tác",
          description: "Bạn đã hủy quá trình tạo Passkey trên thiết bị.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Không thể thêm Passkey",
          description: err.message || "Đã xảy ra lỗi khi tạo Passkey.",
        });
      }
    } finally {
      setAddingPasskey(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleDeletePasskey = async () => {
    if (!deletingId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_passkeys")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Đã xóa Passkey",
        description: "Thiết bị Passkey đã được gỡ khỏi tài khoản của bạn.",
      });

      setPasskeys((prev) => prev.filter((p) => p.id !== deletingId));
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xóa thất bại",
        description: err.message || "Không thể xóa Passkey.",
      });
    } finally {
      setShowConfirmDelete(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Bảo Mật & Passkeys
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các thiết bị xác thực Passkey không dùng mật khẩu cho Personal OS
        </p>
      </div>

      {/* Main Passkey Card */}
      <Card className="bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Quản Lý Passkeys
            </CardTitle>
            <CardDescription className="mt-1">
              Passkey giúp bạn đăng nhập an toàn tức thì thông qua cảm biến thiết bị mà không lưu bất kỳ dữ liệu sinh trắc học nào trên máy chủ.
            </CardDescription>
          </div>

          <Button onClick={handleAddPasskey} disabled={addingPasskey} className="gap-2 shadow-md">
            {addingPasskey ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Thêm Passkey
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Đang tải danh sách Passkey...
            </div>
          ) : passkeys.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">Chưa có Passkey nào</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thêm Passkey trên thiết bị này để đăng nhập an toàn mà không cần nhập mật khẩu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {passkeys.map((pk) => (
                <div
                  key={pk.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-1.5">
                        {pk.device_name}
                        <span className="inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-normal">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Khả dụng
                        </span>
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Đã thêm:{" "}
                          {new Date(pk.created_at).toLocaleDateString("vi-VN")}
                        </span>
                        {pk.last_used_at && (
                          <span>
                            Dùng lần cuối:{" "}
                            {new Date(pk.last_used_at).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(pk.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 text-xs"
                  >
                    <Trash2 className="h-4 w-4" /> Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Xác Nhận Xóa Passkey
            </DialogTitle>
            <DialogDescription className="pt-2">
              {passkeys.length === 1 ? (
                <span className="text-amber-400 font-medium block">
                  Cảnh báo: Đây là Passkey duy nhất của bạn. Nếu xóa, bạn vẫn có thể đăng nhập bằng Email/Mật khẩu hoặc Google OAuth.
                </span>
              ) : (
                "Bạn có chắc chắn muốn xóa thiết bị Passkey này khỏi tài khoản không?"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Hủy
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePasskey}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Xác Nhận Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
