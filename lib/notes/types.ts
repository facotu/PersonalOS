export interface NoteItem {
  id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  title: string;
  content: any; // JSONB Tiptap content
  ai_summary: string | null;
  ai_action_items: any[];
  ai_decisions: any[];
  ai_risks: any[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Joined relations
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
}

export interface NoteFilterOptions {
  search?: string;
  project_id?: string;
  task_id?: string;
  is_pinned?: boolean;
}
