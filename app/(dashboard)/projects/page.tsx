"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus, Clock, CheckCircle2, AlertCircle, Archive, LayoutGrid } from "lucide-react";

import { ProjectItem, ProjectFilterOptions, ProjectViewMode } from "@/lib/projects/types";
import { fetchProjects, archiveProjectAction, deleteProjectAction } from "@/lib/projects/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectFormSheet } from "@/components/projects/project-form-sheet";
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = React.useState<ProjectViewMode>("all");
  const [filters, setFilters] = React.useState<ProjectFilterOptions>({
    view: "all",
    sortBy: "priority",
    sortOrder: "asc",
  });

  // Modal States
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<ProjectItem | null>(null);
  const [deletingProject, setDeletingProject] = React.useState<ProjectItem | null>(null);

  const activeFilters: ProjectFilterOptions = { ...filters, view: viewMode };

  // Query Projects
  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["projects", activeFilters],
    queryFn: () => fetchProjects(activeFilters),
  });

  // Realtime Supabase Subscription Setup
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          // Task changes impact project progress metrics
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (project: ProjectItem) => {
      await archiveProjectAction(project.id);
    },
    onSuccess: () => {
      toast({
        title: "Đã lưu trữ dự án",
        description: "Dự án đã được chuyển vào mục Đã lưu trữ.",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (project: ProjectItem) => {
      await deleteProjectAction(project.id);
    },
    onSuccess: () => {
      toast({
        title: "Đã xóa dự án",
        description: "Dự án đã được gỡ khỏi hệ thống.",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Không thể xóa dự án",
        description: err.message || "Vui lòng thử lại sau.",
      });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-primary" /> Quản Lý Dự Án
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng quan các mục tiêu và công việc đang triển khai
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProject(null);
            setCreateSheetOpen(true);
          }}
          size="sm"
          className="gap-1.5 shadow-md"
        >
          <Plus className="h-4 w-4" /> Tạo Dự Án Mới
        </Button>
      </div>

      {/* View Tabs & Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1 border-b pb-2 overflow-x-auto">
          {[
            { id: "all", label: "Tất cả dự án", icon: LayoutGrid },
            { id: "active", label: "Đang thực hiện", icon: Clock },
            { id: "upcoming", label: "Sắp đến hạn", icon: AlertCircle },
            { id: "completed", label: "Hoàn thành", icon: CheckCircle2 },
            { id: "archived", label: "Đã lưu trữ", icon: Archive },
          ].map((tab) => {
            const isActive = viewMode === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(tab.id as ProjectViewMode)}
                className="gap-1.5 text-xs sm:text-sm font-medium"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <ProjectFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Grid Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách dự án"
          description="Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng kiểm tra đường truyền."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 text-primary" />}
          title={
            viewMode === "active"
              ? "Chưa có dự án nào đang thực hiện"
              : viewMode === "archived"
              ? "Chưa có dự án nào bị lưu trữ"
              : "Bạn chưa tạo dự án nào"
          }
          description="Tạo dự án mới để quản lý tập trung danh sách công việc và mục tiêu."
          actionLabel="+ Tạo dự án mới"
          onAction={() => {
            setEditingProject(null);
            setCreateSheetOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => {
                setEditingProject(p);
                setCreateSheetOpen(true);
              }}
              onArchive={(p) => archiveMutation.mutate(p)}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Sheet */}
      <ProjectFormSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        projectToEdit={editingProject}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
      />

      {/* Delete / Archive Confirmation Dialog */}
      <ProjectDeleteDialog
        project={deletingProject}
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirmArchive={(p) => archiveMutation.mutateAsync(p)}
        onConfirmDelete={(p) => deleteMutation.mutateAsync(p)}
      />
    </div>
  );
}
