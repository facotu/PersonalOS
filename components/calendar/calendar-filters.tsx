"use client";

import * as React from "react";
import { Search, Filter, X, Circle, SquareCheck, Diamond } from "lucide-react";
import { CalendarFilterOptions } from "@/lib/calendar/types";

interface CalendarFiltersProps {
  filters: CalendarFilterOptions;
  onChange: (newFilters: CalendarFilterOptions) => void;
}

export function CalendarFilters({ filters, onChange }: CalendarFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");

  // 300ms Debounce Search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onChange({ ...filters, search: searchTerm });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters, onChange]);

  const toggleFilter = (key: "showEvents" | "showTasks" | "showProjects") => {
    onChange({
      ...filters,
      [key]: filters[key] === false ? true : false,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện, công việc hoặc deadline..."
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

      {/* Item Type Toggles */}
      <div className="flex items-center space-x-2 text-xs font-medium overflow-x-auto pb-1 sm:pb-0">
        <span className="text-muted-foreground flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Hiển thị:
        </span>

        <button
          type="button"
          onClick={() => toggleFilter("showEvents")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            filters.showEvents !== false
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
              : "bg-accent/20 text-muted-foreground border-border opacity-50"
          }`}
        >
          <Circle className="h-2.5 w-2.5 fill-current text-sky-400" />
          Sự kiện
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("showTasks")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            filters.showTasks !== false
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-accent/20 text-muted-foreground border-border opacity-50"
          }`}
        >
          <SquareCheck className="h-3 w-3 text-emerald-400" />
          Công việc
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("showProjects")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            filters.showProjects !== false
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-accent/20 text-muted-foreground border-border opacity-50"
          }`}
        >
          <Diamond className="h-2.5 w-2.5 fill-current text-purple-400" />
          Deadline dự án
        </button>
      </div>
    </div>
  );
}
