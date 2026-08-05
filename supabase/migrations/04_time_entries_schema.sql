-- =============================================================================
-- PERSONAL OS — PHASE 8 TIME ENTRIES SCHEMA & RLS MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    description TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'stopped')),
    is_billable BOOLEAN NOT NULL DEFAULT FALSE,
    hourly_rate NUMERIC(10, 2) NULL CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_time_entry_timestamps CHECK (ended_at IS NULL OR ended_at >= started_at),
    CONSTRAINT check_stopped_time_entry_ended_at CHECK (status = 'running' OR status = 'paused' OR ended_at IS NOT NULL)
);

-- PARTIAL UNIQUE INDEX: AT MOST 1 ACTIVE TIMER SESSION (RUNNING OR PAUSED) PER USER AT DATABASE LEVEL
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_time_entry_per_user 
    ON public.time_entries (user_id) WHERE status IN ('running', 'paused');

-- UPDATED_AT TRIGGER
CREATE OR REPLACE TRIGGER trg_time_entries_updated_at 
    BEFORE UPDATE ON public.time_entries 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_time_entries_user_started ON public.time_entries(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_task ON public.time_entries(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_project ON public.time_entries(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_status ON public.time_entries(user_id, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_time_entries" ON public.time_entries 
    FOR ALL USING (auth.uid() = user_id);

-- PUBSUB REALTIME CONFIGURATION
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.time_entries;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
