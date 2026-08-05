"use client";

import * as React from "react";
import { Cpu, CheckCircle2, Play, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function AutomationSettingsCard() {
  const [testing, setTesting] = React.useState(false);
  const [lastRun, setLastRun] = React.useState<string | null>(null);

  const handleRunTest = async () => {
    setTesting(true);
    try {
      // Fetch current timestamp
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Trigger safe test evaluation endpoint
      const res = await fetch("/api/automation/health");
      const data = await res.json();

      if (res.ok) {
        setLastRun(new Date().toLocaleTimeString("vi-VN"));
        toast({
          title: "Kiểm tra Automation thành công!",
          description: "Luồng kết nối n8n Orchestrator & Health Check phản hồi tốt.",
        });
      } else {
        throw new Error(data.error || "Không thể kết nối n8n.");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Kiểm tra thất bại",
        description: err.message || "Luồng Automation tạm thời không khả dụng.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" /> Tự Động Hóa & n8n Orchestration (Phase 13)
        </CardTitle>
        <CardDescription className="text-xs">
          Quản lý trạng thái các tiến trình tự động hóa công việc được điều phối qua n8n Cloud
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* Active Workflows Catalog Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            { name: "WF-01 Daily Reminder Evaluation", desc: "Đánh giá mốc nhắc việc hàng ngày", active: true },
            { name: "WF-02 Daily Digest", desc: "Bản tin tổng hợp công việc mỗi sáng", active: true },
            { name: "WF-03 Deadline Watcher", desc: "Cảnh báo mốc hạn chót quan trọng", active: true },
            { name: "WF-05 Weekly Review Reminder", desc: "Nhắc nhở tổng kết tuần vào Thứ 7", active: true },
            { name: "WF-06 Weekly Analytics Snapshot", desc: "Tự động chốt dữ liệu phân tích tuần", active: true },
          ].map((wf, idx) => (
            <div key={idx} className="p-3 rounded-xl border bg-accent/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground block">{wf.name}</span>
                <span className="text-[11px] text-muted-foreground block">{wf.desc}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
              </span>
            </div>
          ))}
        </div>

        {/* Security & Health Status */}
        <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/30 flex items-center justify-between text-indigo-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Bảo mật: HMAC SHA-256 Signature, Replay Protection & Idempotency Key ACTIVE</span>
          </div>
          {lastRun && (
            <span className="text-[11px] font-mono text-muted-foreground">
              Lần test gần nhất: {lastRun}
            </span>
          )}
        </div>

        {/* Manual Test Button */}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunTest}
            disabled={testing}
            className="gap-1.5 shadow-sm"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-emerald-400" />}
            Chạy kiểm tra Automation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
