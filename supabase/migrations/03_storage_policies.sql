-- =============================================================================
-- PERSONAL OS — PHASE 3 SUPABASE STORAGE POLICIES & ISOLATION
-- =============================================================================

-- 1. CREATE ATTACHMENTS BUCKET IF NOT EXISTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  52428800, -- 50 MB Limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- Folder Path Ownership Pattern: attachments/{user_id}/{filename}

DROP POLICY IF EXISTS "Users can upload their own attachments" ON storage.objects;
CREATE POLICY "Users can upload their own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read their own attachments" ON storage.objects;
CREATE POLICY "Users can read their own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own attachments" ON storage.objects;
CREATE POLICY "Users can update their own attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
