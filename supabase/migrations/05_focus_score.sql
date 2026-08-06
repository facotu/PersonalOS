-- =============================================================================
-- PERSONAL OS — PHASE 8 BUGFIX: ADD focus_score TO time_entries
-- Thêm trường đánh giá mức độ tập trung (1-10) vào bản ghi thời gian
-- =============================================================================

ALTER TABLE public.time_entries
    ADD COLUMN IF NOT EXISTS focus_score SMALLINT NULL 
    CHECK (focus_score IS NULL OR (focus_score >= 1 AND focus_score <= 10));

COMMENT ON COLUMN public.time_entries.focus_score IS 
    'Điểm tự đánh giá mức độ tập trung trong phiên làm việc (1=rất phân tán, 10=cực kỳ tập trung)';
