"use client";

import * as React from "react";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchSettingsData, updateProfileAction } from "@/lib/settings/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function ProfileSettingsForm() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["settings-data"],
    queryFn: fetchSettingsData,
  });

  React.useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.full_name || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (name: string) => updateProfileAction({ full_name: name }),
    onSuccess: () => {
      toast({
        title: "Cập nhật hồ sơ thành công!",
        description: "Hồ sơ cá nhân của bạn đã được cập nhật.",
      });
      queryClient.invalidateQueries({ queryKey: ["settings-data"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật",
        description: msg,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(fullName);
  };

  if (isLoading) {
    return <div className="h-48 rounded-2xl border bg-card/40 animate-pulse" />;
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Thông Tin Cá Nhân
        </CardTitle>
        <CardDescription className="text-xs">
          Quản lý thông tin tài khoản và địa chỉ email của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Địa chỉ Email (Không thể thay đổi)
            </label>
            <input
              type="email"
              value={data?.profile?.email || ""}
              disabled
              className="flex h-10 w-full rounded-lg border border-input bg-accent/20 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-80"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Họ và Tên
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên của bạn..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t">
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="gap-1.5 shadow-md"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
