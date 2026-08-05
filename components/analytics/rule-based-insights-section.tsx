"use client";

import * as React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { RuleBasedInsight } from "@/lib/analytics/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RuleBasedInsightsSectionProps {
  insights: RuleBasedInsight[];
}

export function RuleBasedInsightsSection({ insights }: RuleBasedInsightsSectionProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" /> Điểm Đáng Chú Ý Tuần Này (Factual Insights)
        </CardTitle>
        <CardDescription className="text-xs">
          Tổng hợp tự động từ số liệu thực tế đã ghi nhận trong tuần
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "flex items-start space-x-2.5 p-3 rounded-xl border text-xs leading-relaxed",
              insight.type === "SUCCESS" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
              insight.type === "WARNING" && "bg-amber-500/10 border-amber-500/30 text-amber-300",
              insight.type === "INFO" && "bg-sky-500/10 border-sky-500/30 text-sky-300"
            )}
          >
            {insight.type === "SUCCESS" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
            {insight.type === "WARNING" && <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
            {insight.type === "INFO" && <Info className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>{insight.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
