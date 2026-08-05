import * as React from "react";
import { Award, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReviewsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" /> Báo Cáo Tuần (Weekly Review)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Báo cáo đánh giá hiệu suất tự động sinh từ AI kèm đề xuất cải thiện năng suất
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Sparkles className="h-4 w-4" /> Tạo Báo Cáo Mới
          </Button>
        </div>
      </div>

      <Card className="bg-card/60 backdrop-blur-md">
        <CardContent className="pt-6">
          <EmptyState
            icon={<Award className="h-8 w-8 text-primary" />}
            title="Module Báo Cáo Tuần (Weekly Review Shell)"
            description="Quy trình n8n Cloud tự động thu thập thống kê 7 ngày và sinh báo cáo AI sẽ được phát triển ở Phase 13."
          />
        </CardContent>
      </Card>
    </div>
  );
}
