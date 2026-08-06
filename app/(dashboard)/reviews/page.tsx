"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Sparkles,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Target,
  Calendar,
  Loader2,
} from "lucide-react";

import { WeeklyReviewRecord } from "@/lib/analytics/types";
import { fetchAllWeeklyReviews } from "@/lib/analytics/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const fmt = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${fmt(start)} — ${fmt(end)}`;
}

function ReviewCard({ review }: { review: WeeklyReviewRecord }) {
  const hasContent =
    review.highlights.length > 0 ||
    review.challenges.length > 0 ||
    review.next_week_priorities.length > 0;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/60 hover:border-primary/30 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Tuần {review.week_number}, {review.year}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatWeekRange(review.week_start, review.week_end)}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
            W{review.week_number}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!hasContent ? (
          <p className="text-xs text-muted-foreground italic">Chưa có nội dung ghi nhận.</p>
        ) : (
          <>
            {/* Highlights */}
            {review.highlights.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Điểm nổi bật
                </h4>
                <ul className="space-y-1">
                  {review.highlights.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                      <span className="line-clamp-2">{item}</span>
                    </li>
                  ))}
                  {review.highlights.length > 3 && (
                    <li className="text-[11px] text-muted-foreground">
                      +{review.highlights.length - 3} điểm nổi bật khác
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {review.challenges.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Thách thức gặp phải
                </h4>
                <ul className="space-y-1">
                  {review.challenges.slice(0, 2).map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                      <span className="line-clamp-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Week Priorities */}
            {review.next_week_priorities.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> Ưu tiên tuần tới
                </h4>
                <ul className="space-y-1">
                  {review.next_week_priorities.slice(0, 2).map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5 shrink-0">→</span>
                      <span className="line-clamp-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const router = useRouter();

  const { data: reviews = [], isLoading, isError, refetch } = useQuery<WeeklyReviewRecord[]>({
    queryKey: ["weekly-reviews-all"],
    queryFn: () => fetchAllWeeklyReviews(),
  });

  const handleExportLatest = async () => {
    if (reviews.length === 0) {
      toast({
        variant: "destructive",
        title: "Chưa có báo cáo nào",
        description: "Tạo ít nhất một Tổng Kết Tuần trước khi xuất file.",
      });
      return;
    }
    const latest = reviews[0];
    const url = `/api/export?resource=analytics&format=pdf&targetWeekIso=${latest.week_start}`;
    window.open(url, "_blank");
  };

  const handleGoCreateReview = () => {
    // Chuyển đến trang Analytics để tạo mới Weekly Review
    router.push("/analytics");
    toast({
      title: "Đang chuyển đến Analytics",
      description: "Cuộn xuống cuối trang để điền Tổng Kết Tuần.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" /> Báo Cáo Tuần (Weekly Reviews)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lịch sử tổng kết hiệu suất và kế hoạch cải thiện năng suất hàng tuần
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleExportLatest}
            disabled={reviews.length === 0}
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            onClick={handleGoCreateReview}
          >
            <Sparkles className="h-4 w-4" /> Tạo Báo Cáo Mới
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {!isLoading && reviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border bg-card/60 text-center">
            <div className="text-2xl font-bold text-primary">{reviews.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Tuần đã tổng kết</div>
          </div>
          <div className="p-3 rounded-xl border bg-card/60 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {reviews.reduce((acc, r) => acc + r.highlights.length, 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Điểm nổi bật ghi nhận</div>
          </div>
          <div className="p-3 rounded-xl border bg-card/60 text-center">
            <div className="text-2xl font-bold text-sky-400">
              {reviews.reduce((acc, r) => acc + r.next_week_priorities.length, 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Ưu tiên đã lên kế hoạch</div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách Báo Cáo Tuần"
          description="Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại đường truyền."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Award className="h-8 w-8 text-primary" />}
          title="Chưa có Báo Cáo Tuần nào"
          description="Đến trang Analytics, hoàn thành tuần làm việc và điền Tổng Kết Tuần để lưu báo cáo đầu tiên của bạn."
          actionLabel="Đến trang Analytics"
          onAction={handleGoCreateReview}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Lịch sử {reviews.length} tuần tổng kết
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-primary"
              onClick={handleGoCreateReview}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Thêm tuần mới
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id ?? `${review.year}-${review.week_number}`} review={review} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
