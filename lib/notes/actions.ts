import { createClient } from "@/lib/supabase/client";
import { NoteItem, NoteFilterOptions } from "@/lib/notes/types";
import { CreateNoteInput, UpdateNoteInput } from "@/lib/notes/schemas";

export async function fetchNotes(filters: NoteFilterOptions = {}): Promise<NoteItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("notes")
    .select(`
      *,
      project:projects(id, name, color),
      task:tasks(id, title)
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (filters.search && filters.search.trim() !== "") {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term}`);
  }

  if (filters.project_id) {
    query = query.eq("project_id", filters.project_id);
  }

  if (filters.task_id) {
    query = query.eq("task_id", filters.task_id);
  }

  if (filters.is_pinned !== undefined) {
    query = query.eq("is_pinned", filters.is_pinned);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Không thể tải danh sách ghi chú.");
  }

  return data || [];
}

export async function fetchNoteById(id: string): Promise<NoteItem | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("notes")
    .select(`
      *,
      project:projects(id, name, color),
      task:tasks(id, title)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return data;
}

export async function createNoteAction(input: CreateNoteInput): Promise<NoteItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...input,
      user_id: user.id, // Strictly server bound to auth user
    })
    .select(`
      *,
      project:projects(id, name, color),
      task:tasks(id, title)
    `)
    .single();

  if (error || !data) {
    console.error("Error creating note:", error);
    throw new Error(error?.message || "Không thể tạo ghi chú mới.");
  }

  return data;
}

export async function updateNoteAction(
  id: string,
  input: UpdateNoteInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("notes")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error updating note:", error);
    throw new Error("Không thể cập nhật ghi chú.");
  }
}

export async function togglePinNoteAction(
  id: string,
  is_pinned: boolean
): Promise<void> {
  await updateNoteAction(id, { is_pinned });
}

export async function deleteNoteAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error("Không thể xóa ghi chú.");
  }
}
