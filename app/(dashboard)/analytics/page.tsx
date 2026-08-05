"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

import { getWeeklyAnalytics } from "@/lib/analytics/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { WeeklyOverviewKPISection } from "@/components/analytics/weekly-overview-kpi";
import { TaskPerformanceSection } from "@/components/analytics/task-performance-section";
import { TimeAnalysisSection } from "@/components/analytics/time-analysis-section";
import { ProjectPerformanceSection } from "@/components/analytics/project-performance-section";
import { RuleBasedInsightsSection } from "@/components/analytics/rule-based-insights-section";
import { WeeklyReviewEditor } from "@/components/analytics/weekly-review-editor";

export default function AnalyticsPage() {
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["weekly-analytics", currentDate.toISOString().substring(0, 10)],
    queryFn: () => getWeeklyAnalytics(currentDate.toISOString()),
  });

  const handleNavigateWeek = (direction: "prev" | "current" | "next") => {
    if (direction === "current") {
      setCurrentDate(new Date());
      return;
    }
    const next = new Date(currentDate);
    next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in-50">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Không thể tải báo cáo phân tích"
        description="Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại đường truyền."
        actionLabel="Thử lại"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* 1. Header & Week Selector */}
      <AnalyticsHeader period={data.period} onNavigateWeek={handleNavigateWeek} />

      {/* Future Week Empty State */}
      {data.period.isFutureWeek ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
          title="Tuần này ở tương lai"
          description="Chưa có dữ liệu công việc và thời gian được ghi nhận cho tuần này."
          actionLabel="Quay về tuần hiện tại"
          onAction={() => handleNavigateWeek("current")}
        />
      ) : (
        <>
          {/* 2. Weekly Overview KPI Cards */}
          <WeeklyOverviewKPISection overview={data.overview} />

          {/* 3. Rule-Based Insights */}
          <RuleBasedInsightsSection insights={data.insights} />

          {/* 4. Main 2-Column Grid: Task & Time Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Task Performance */}
            <TaskPerformanceSection data={data.taskPerformance} />

            {/* Time Analysis */}
            <TimeAnalysisSection
              totalSeconds={data.timeAnalysis.totalSeconds}
              billableSeconds={data.timeAnalysis.billableSeconds}
              nonBillableSeconds={data.timeAnalysis.nonBillableSeconds}
              byDay={data.timeAnalysis.byDay}
              byProject={data.timeAnalysis.byProject}
              billablePct={data.timeAnalysis.billablePct}
            />
          </div>

          {/* 5. Project & Deadline Performance */}
          <ProjectPerformanceSection
            projects={data.projectPerformance}
            deadlinePerformance={data.deadlinePerformance}
          />

          {/* 6. Weekly Review Form */}
          <WeeklyReviewEditor
            weekNumber={data.period.weekNumber}
            year={data.period.year}
            weekStartIso={data.period.weekStartIso}
            weekEndIso={data.period.weekEndIso}
            existingReview={data.weeklyReview}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["weekly-analytics"] })}
          />
        </>
      )}
    </div>
  );
}
