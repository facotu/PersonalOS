"use client";

import * as React from "react";
import { Search, Pin, X } from "lucide-react";
import { NoteFilterOptions } from "@/lib/notes/types";
import { Button } from "@/components/ui/button";

interface NoteFiltersProps {
  filters: NoteFilterOptions;
  onChange: (newFilters: NoteFilterOptions) => void;
}

export function NoteFilters({ filters, onChange }: NoteFiltersProps) {
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

  const togglePinnedOnly = () => {
    onChange({
      ...filters,
      is_pinned: filters.is_pinned === true ? undefined : true,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm ghi chú theo tiêu đề..."
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

      {/* Pin Filter Button */}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant={filters.is_pinned ? "secondary" : "outline"}
          size="sm"
          onClick={togglePinnedOnly}
          className="h-9 gap-1.5 text-xs font-medium"
        >
          <Pin className="h-3.5 w-3.5 text-amber-400" />
          {filters.is_pinned ? "Đang lọc: Ghi chú đã ghim" : "Lọc ghi chú đã ghim"}
        </Button>
      </div>
    </div>
  );
}
