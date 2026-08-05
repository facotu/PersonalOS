"use client";

import * as React from "react";
import { Search, Filter, X, DollarSign } from "lucide-react";
import { TimeFilterOptions } from "@/lib/time/types";
import { Button } from "@/components/ui/button";

interface TimeFiltersProps {
  filters: TimeFilterOptions;
  onChange: (newFilters: TimeFilterOptions) => void;
  projects: Array<{ id: string; name: string }>;
}

export function TimeFilters({ filters, onChange, projects }: TimeFiltersProps) {
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

  const toggleBillableOnly = () => {
    onChange({
      ...filters,
      is_billable: filters.is_billable === true ? undefined : true,
    });
  };

  const hasActiveFilters =
    !!filters.search ||
    !!filters.project_id ||
    filters.is_billable !== undefined;

  const handleClear = () => {
    setSearchTerm("");
    onChange({});
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm theo công việc, dự án hoặc mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-8 rounded-lg border bg-accent/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

      {/* Project Selector & Billable Toggle */}
      <div className="flex items-center space-x-2">
        <select
          value={filters.project_id || ""}
          onChange={(e) => onChange({ ...filters, project_id: e.target.value || undefined })}
          className="h-9 rounded-lg border bg-accent/30 text-xs px-2.5 text-foreground outline-none max-w-[160px] truncate"
        >
          <option value="">-- Tất cả dự án --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant={filters.is_billable ? "secondary" : "outline"}
          size="sm"
          onClick={toggleBillableOnly}
          className="h-9 gap-1.5 text-xs font-medium"
        >
          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          {filters.is_billable ? "Đang lọc: Billable" : "Billable"}
        </Button>

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
  );
}
