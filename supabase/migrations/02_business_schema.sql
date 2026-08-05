-- =============================================================================
-- PERSONAL OS — PHASE 3 COMPLETE DATABASE SCHEMA & RLS MIGRATION
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTION: AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 2. CORE TABLES SCHEMA & CONSTRAINTS
-- -----------------------------------------------------------------------------

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'vi-VN',
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    time_format TEXT NOT NULL DEFAULT '24h',
    theme TEXT NOT NULL DEFAULT 'dark',
    week_starts_on INT NOT NULL DEFAULT 1 CHECK (week_starts_on BETWEEN 0 AND 6),
    default_view TEXT NOT NULL DEFAULT 'dashboard',
    working_hours_start TIME NOT NULL DEFAULT '08:00',
    working_hours_end TIME NOT NULL DEFAULT '17:30',
    daily_brief_time TIME NOT NULL DEFAULT '07:30',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    deadline_24h BOOLEAN NOT NULL DEFAULT TRUE,
    deadline_1h BOOLEAN NOT NULL DEFAULT TRUE,
    overdue BOOLEAN NOT NULL DEFAULT TRUE,
    daily_brief BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_review BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    telegram_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    daily_brief_time TIME NOT NULL DEFAULT '07:30',
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Planning', 'Active', 'Paused', 'Completed', 'Archived')),
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    start_date DATE,
    deadline DATE,
    progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT check_project_dates CHECK (deadline IS NULL OR start_date IS NULL OR deadline >= start_date)
);

-- 5. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'CHUA_LAM' CHECK (status IN ('CHUA_LAM', 'DANG_LAM', 'CHO', 'HOAN_THANH', 'HUY')),
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    start_date TIMESTAMPTZ NULL,
    due_date TIMESTAMPTZ NULL,
    completion_pct INT NOT NULL DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
    estimated_hours NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (estimated_hours >= 0),
    actual_hours NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (actual_hours >= 0),
    energy_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (energy_level IN ('HIGH', 'MEDIUM', 'LOW')),
    sort_order INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT check_task_dates CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);

-- 6. TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#64748b',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_tag_name UNIQUE(user_id, name)
);

-- 7. TASK_TAGS (MANY-TO-MANY RELATIONSHIP)
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 8. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    ai_summary TEXT,
    ai_action_items JSONB DEFAULT '[]'::jsonb,
    ai_decisions JSONB DEFAULT '[]'::jsonb,
    ai_risks JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- 9. TIME_SESSIONS (SERVER SOURCE OF TRUTH FOR TIME TRACKING)
CREATE TABLE IF NOT EXISTS public.time_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'CANCELLED')),
    duration INT NOT NULL DEFAULT 0 CHECK (duration >= 0),
    type TEXT NOT NULL DEFAULT 'TapTrung' CHECK (type IN ('TapTrung', 'Hop', 'HanhChinh', 'Nghi', 'Khac')),
    focus_score INT NULL CHECK (focus_score IS NULL OR focus_score BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_time_session_timestamps CHECK (ended_at IS NULL OR ended_at >= started_at),
    CONSTRAINT check_completed_session_ended_at CHECK (status = 'RUNNING' OR ended_at IS NOT NULL)
);

-- PARTIAL UNIQUE INDEX: ONLY 1 ACTIVE TIMER PER USER AT DATABASE LEVEL
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_running_session_per_user 
    ON public.time_sessions (user_id) WHERE status = 'RUNNING';

-- 10. CALENDAR_EVENTS
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    event_type TEXT NOT NULL DEFAULT 'Meeting' CHECK (event_type IN ('Task', 'Meeting', 'Personal', 'Reminder')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_calendar_event_times CHECK (end_time >= start_time)
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('DEADLINE_24H', 'DEADLINE_1H', 'OVERDUE', 'DAILY_BRIEF', 'WEEKLY_REVIEW', 'SYSTEM')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NULL,
    sent_at TIMESTAMPTZ NULL,
    read_at TIMESTAMPTZ NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. WEEKLY_REVIEWS
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 53),
    year INT NOT NULL CHECK (year >= 2024),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    completed_tasks_count INT NOT NULL DEFAULT 0 CHECK (completed_tasks_count >= 0),
    overdue_tasks_count INT NOT NULL DEFAULT 0 CHECK (overdue_tasks_count >= 0),
    total_hours_worked NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (total_hours_worked >= 0),
    focus_hours NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (focus_hours >= 0),
    avg_focus_score NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (avg_focus_score BETWEEN 0 AND 10),
    performance_score INT NOT NULL DEFAULT 0 CHECK (performance_score BETWEEN 0 AND 100),
    highlights TEXT[],
    at_risk_projects TEXT[],
    ai_recommendations TEXT,
    next_week_priorities TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_weekly_review UNIQUE(user_id, year, week_number)
);

-- 13. AUTOMATION_JOBS
CREATE TABLE IF NOT EXISTS public.automation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    error TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AI_USAGE_LOGS
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'gemini',
    model TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('summarizeNote', 'extractActions', 'analyzeRisk', 'generateDailyBrief', 'generateWeeklyReview')),
    input_tokens INT NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
    output_tokens INT NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
    estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
    latency INT NOT NULL DEFAULT 0 CHECK (latency >= 0),
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'TIMEOUT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ATTACHMENTS (SUPABASE STORAGE METADATA)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    file_size INT NOT NULL CHECK (file_size > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. ACTIVITY_LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. USER_PASSKEYS
CREATE TABLE IF NOT EXISTS public.user_passkeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INT NOT NULL DEFAULT 0 CHECK (counter >= 0),
    transports TEXT[] DEFAULT ARRAY['internal'],
    device_name TEXT DEFAULT 'Platform Authenticator',
    backed_up BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. ATTACH UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_time_sessions_updated_at BEFORE UPDATE ON public.time_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_weekly_reviews_updated_at BEFORE UPDATE ON public.weekly_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_automation_jobs_updated_at BEFORE UPDATE ON public.automation_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_project ON public.tasks(user_id, project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON public.tags(user_id, name);
CREATE INDEX IF NOT EXISTS idx_notes_user_project ON public.notes(user_id, project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_start ON public.time_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON public.calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON public.activity_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_idempotency ON public.automation_jobs(idempotency_key);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES — 100% COVERAGE
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- Generic Ownership Policies
CREATE POLICY "user_own_profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "user_own_user_settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_notification_preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_own_projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- CHAIN OWNERSHIP FOR TASKS: User owns task AND (if attached) owns the project
CREATE POLICY "user_own_tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_own_tasks_insert" ON public.tasks FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (project_id IS NULL OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()))
);
CREATE POLICY "user_own_tasks_update" ON public.tasks FOR UPDATE USING (
    auth.uid() = user_id AND 
    (project_id IS NULL OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()))
);
CREATE POLICY "user_own_tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- TAGS
CREATE POLICY "user_own_tags" ON public.tags FOR ALL USING (auth.uid() = user_id);

-- CHAIN OWNERSHIP FOR TASK_TAGS: User must own both the task AND the tag
CREATE POLICY "user_own_task_tags" ON public.task_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM public.tags WHERE id = tag_id AND user_id = auth.uid())
);

-- NOTES
CREATE POLICY "user_own_notes" ON public.notes FOR ALL USING (auth.uid() = user_id);

-- TIME_SESSIONS
CREATE POLICY "user_own_time_sessions" ON public.time_sessions FOR ALL USING (auth.uid() = user_id);

-- CALENDAR_EVENTS
CREATE POLICY "user_own_calendar_events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "user_own_notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- WEEKLY_REVIEWS
CREATE POLICY "user_own_weekly_reviews" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- AUTOMATION_JOBS
CREATE POLICY "user_own_automation_jobs" ON public.automation_jobs FOR ALL USING (auth.uid() = user_id);

-- AI_USAGE_LOGS
CREATE POLICY "user_own_ai_usage_logs" ON public.ai_usage_logs FOR ALL USING (auth.uid() = user_id);

-- ATTACHMENTS: User owns attachment AND owns attached entities
CREATE POLICY "user_own_attachments" ON public.attachments FOR ALL USING (
    auth.uid() = user_id AND
    (project_id IS NULL OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())) AND
    (task_id IS NULL OR EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid())) AND
    (note_id IS NULL OR EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid()))
);

-- ACTIVITY_LOGS: INSERT & SELECT ONLY (AUDIT TRAIL IMMUTABILITY)
CREATE POLICY "user_select_activity_logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert_activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER_PASSKEYS
CREATE POLICY "user_own_user_passkeys" ON public.user_passkeys FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. SELECTIVE REALTIME PUBSUB CONFIGURATION
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.time_sessions;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
