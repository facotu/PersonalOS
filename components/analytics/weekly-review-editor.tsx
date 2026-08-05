"use client";

import * as React from "react";
import { Edit3, Save, Loader2, CheckCircle2 } from "lucide-react";
import { WeeklyReviewRecord } from "@/lib/analytics/types";
import { saveWeeklyReviewAction } from "@/lib/analytics/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface WeeklyReviewEditorProps {
  weekNumber: number;
  year: number;
  weekStartIso: string;
  weekEndIso: string;
  existingReview: WeeklyReviewRecord | null;
  onSuccess: () => void;
}

export function WeeklyReviewEditor({
  weekNumber,
  year,
  weekStartIso,
  weekEndIso,
  existingReview,
  onSuccess,
}: WeeklyReviewEditorProps) {
  const [highlightsText, setHighlightsText] = React.useState("");
  const [challengesText, setChallengesText] = React.useState("");
  const [prioritiesText, setPrioritiesText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (existingReview) {
      setHighlightsText((existingReview.highlights || []).join("\n"));
      setChallengesText((existingReview.challenges || []).join("\n"));
      setPrioritiesText((existingReview.next_week_priorities || []).join("\n"));
    } else {
      setHighlightsText("");
      setChallengesText("");
      setPrioritiesText("");
    }
  }, [existingReview]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const highlights = highlightsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const challenges = challengesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const next_week_priorities = prioritiesText.split("\n").map((s) => s.trim()).filter(Boolean);

    setLoading(true);
    try {
      await saveWeeklyReviewAction({
        week_number: weekNumber,
        year,
        week_start: weekStartIso.substring(0, 10),
        week_end: weekEndIso.substring(0, 10),
        highlights,
        challenges,
        next_week_priorities,
      });

      toast({
        title: "Đã lưu tổng kết tuần!",
        description: "Bản tổng kết tuần đã được ghi nhận thành công.",
      });
      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể lưu tổng kết",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-primary" /> Tổng Kết Tuần (Weekly Review)
        </CardTitle>
        <CardDescription className="text-xs">
          Tự ghi nhận đánh giá cá nhân về điểm nổi bật, vấn đề và mục tiêu cho tuần tới
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Highlights */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Điểm nổi bật tuần này (Mỗi dòng 1 ý)
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Hoàn thành nâng cấp Phase 9 Executive Dashboard đúng hạn..."
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full rounded-xl border border-input bg-accent/30 p-3 text-xs focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
            />
          </div>

          {/* Challenges / Vấn đề */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Việc chưa hoàn thành / Vấn đề cần xử lý (Mỗi dòng 1 ý)
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Cần tối ưu lại thời gian họp đầu tuần..."
              value={challengesText}
              onChange={(e) => setChallengesText(e.target.value)}
              className="w-full rounded-xl border border-input bg-accent/30 p-3 text-xs focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
            />
          </div>

          {/* Next Week Priorities */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ưu tiên cho tuần tới (Mỗi dòng 1 ý)
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Tập trung hoàn thiện Phase 10 Analytics..."
              value={prioritiesText}
              onChange={(e) => setPrioritiesText(e.target.value)}
              className="w-full rounded-xl border border-input bg-accent/30 p-3 text-xs focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 shadow-md">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu Tổng Kết Tuần
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
