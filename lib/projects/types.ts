export type ProjectStatus = 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
export type ProjectPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type ProjectHealthStatus = 'GOOD' | 'RISK' | 'DELAYED' | 'OVERDUE';

export type ProjectViewMode = 'all' | 'active' | 'upcoming' | 'completed' | 'archived';
export type ProjectSortField = 'deadline' | 'priority' | 'progress_pct' | 'name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface ProjectItem {
  id: string;
  user_id: string;
  name: string;
  goal: string | null;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  deadline: string | null;
  progress_pct: number;
  color: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Computed summary metrics
  total_tasks_count?: number;
  completed_tasks_count?: number;
  active_tasks_count?: number;
  overdue_tasks_count?: number;
  health?: ProjectHealthStatus;
}

export interface ProjectFilterOptions {
  view?: ProjectViewMode;
  search?: string;
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  health?: ProjectHealthStatus[];
  sortBy?: ProjectSortField;
  sortOrder?: SortOrder;
}
