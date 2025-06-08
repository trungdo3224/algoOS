-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS public.video_feedback CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.revision_history CASCADE;
DROP TABLE IF EXISTS public.ssa_sessions CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create tables
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.problems (
    problem_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
    tags JSONB NOT NULL DEFAULT '[]'::JSONB,
    example_input TEXT,
    example_output TEXT,
    constraints TEXT,
    hint TEXT,
    status TEXT CHECK(status IN ('Giải với hint', 'Đã tự giải', 'Giải từ solution', 'Cần ôn tập sớm', 'Đã ôn tập')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.submissions (
    submission_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    idea TEXT NOT NULL,
    grader_score REAL CHECK(grader_score >= 0 AND grader_score <= 10),
    grader_feedback TEXT,
    grader_suggestion TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.ssa_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    current_stage INTEGER CHECK(current_stage >= 1 AND current_stage <= 5),
    session_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.revision_history (
    revision_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    last_attempt DATE NOT NULL,
    times_attempted INTEGER DEFAULT 0,
    last_score REAL,
    reason TEXT,
    UNIQUE(user_id, problem_id)
);

CREATE TABLE public.insights (
    insight_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    avg_score REAL,
    mistakes INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tag)
);

CREATE TABLE public.video_feedback (
    feedback_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    submission_id BIGINT NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON public.submissions(problem_id);
CREATE INDEX idx_ssa_sessions_user_id ON public.ssa_sessions(user_id);
CREATE INDEX idx_revision_history_user_id ON public.revision_history(user_id);
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_video_feedback_user_id ON public.video_feedback(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (uid() = user_id);

CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (uid() = user_id);

CREATE POLICY "Authenticated users can create problems" ON public.problems
    FOR INSERT WITH CHECK (uid() IS NOT NULL);

CREATE POLICY "Problems are readable by authenticated users" ON public.problems
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own submissions" ON public.submissions
    FOR ALL USING (uid() = user_id);

CREATE POLICY "Users can manage their own SSA sessions" ON public.ssa_sessions
    FOR ALL USING (uid() = user_id);

CREATE POLICY "Users can read their revision history" ON public.revision_history
    FOR SELECT USING (uid() = user_id);

CREATE POLICY "Users can read their insights" ON public.insights
    FOR SELECT USING (uid() = user_id);

CREATE POLICY "Users can read their video feedback" ON public.video_feedback
    FOR SELECT USING (uid() = user_id);