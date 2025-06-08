-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Rest of the migration file remains unchanged...