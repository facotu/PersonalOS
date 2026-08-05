"use client";

import * as React from "react";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";

import { ProjectFilterOptions, ProjectPriority, ProjectHealthStatus, ProjectSortField, SortOrder } from "@/lib/projects/types";
import { Button } from "@/components/ui/button";

interface ProjectFiltersProps {
  filters: ProjectFilterOptions;
  onChange: (newFilters: ProjectFilterOptions) => void;
}

export function ProjectFilters({ filters, onChange }: ProjectFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");

  // 300ms Search Debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onChange({ ...filters, search: searchTerm });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters, onChange]);

  const handlePriorityToggle = (p: ProjectPriority) => {
    const current = filters.priority || [];
    const next = current.includes(p)
      ? current.filter((item) => item !== p)
      : [...current, p];
    onChange({ ...filters, priority: next });
  };

  const hasActiveFilters =
    !!filters.search ||
    (filters.priority && filters.priority.length > 0) ||
    (filters.status && filters.status.length > 0);

  const handleClear = () => {
    setSearchTerm("");
    onChange({
      view: filters.view,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  return (
    <div className="space-y-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md">
      {/* Search Input & Sort Selector */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án theo tên hoặc mục tiêu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border bg-accent/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <select
            value={`${filters.sortBy || "priority"}_${filters.sortOrder || "asc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("_");
              onChange({
                ...filters,
                sortBy: sortBy as ProjectSortField,
                sortOrder: sortOrder as SortOrder,
              });
            }}
            className="h-9 rounded-lg border bg-accent/30 text-xs px-2.5 text-foreground outline-none"
          >
            <option value="priority_asc">Ưu tiên (Cao → Thấp)</option>
            <option value="deadline_asc">Hạn chót (Gần nhất)</option>
            <option value="progress_pct_desc">Tiến độ (Cao → Thấp)</option>
            <option value="created_at_desc">Mới tạo nhất</option>
            <option value="name_asc">Tên dự án (A → Z)</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" /> Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Quick Priority Filters */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
        <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
          <Filter className="h-3 w-3" /> Ưu tiên:
        </span>
        {(["P0", "P1", "P2", "P3"] as ProjectPriority[]).map((p) => {
          const isSelected = (filters.priority || []).includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePriorityToggle(p)}
              className={`px-2.5 py-1 rounded-md border font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-accent/30 text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
