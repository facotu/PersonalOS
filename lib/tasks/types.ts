export type TaskStatus = 'CHUA_LAM' | 'DANG_LAM' | 'CHO' | 'HOAN_THANH' | 'HUY';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskViewMode = 'all' | 'today' | 'week' | 'overdue' | 'completed';
export type TaskSortField = 'due_date' | 'priority' | 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TaskItem {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  completion_pct: number;
  estimated_hours: number;
  actual_hours: number;
  energy_level: EnergyLevel;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Joined relation metadata
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface TaskFilterOptions {
  view?: TaskViewMode;
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  project_id?: string;
  tag_id?: string;
  energy_level?: EnergyLevel[];
  sortBy?: TaskSortField;
  sortOrder?: SortOrder;
}
