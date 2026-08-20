-- Career DNA (AI Career Twin) - Database Schema
-- Run this in your Supabase SQL Editor to set up all tables and security policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    target_role TEXT,
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    parsed_json JSONB DEFAULT '{}'::jsonb,
    completeness_score NUMERIC(5,2) DEFAULT 0.00,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GitHub Profiles Table
CREATE TABLE IF NOT EXISTS public.github_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    repo_stats_json JSONB DEFAULT '{}'::jsonb,
    project_quality_score NUMERIC(5,2) DEFAULT 0.00,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Skill Graph Table
CREATE TABLE IF NOT EXISTS public.skill_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    source TEXT CHECK (source IN ('resume', 'github', 'self_reported')),
    confidence_score NUMERIC(3,2) DEFAULT 1.00,
    UNIQUE(student_id, skill_name, source)
);

-- 5. Reference Occupations Table
CREATE TABLE IF NOT EXISTS public.reference_occupations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    required_skills_json JSONB NOT NULL,
    source TEXT CHECK (source IN ('onet', 'manual')) DEFAULT 'manual'
);

-- 6. Reference Courses Table
CREATE TABLE IF NOT EXISTS public.reference_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    skills_covered_json JSONB NOT NULL,
    url TEXT NOT NULL
);

-- 7. Roadmap Items Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    priority_rank INT NOT NULL,
    reasoning_text TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending'
);

-- 8. Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_courses ENABLE ROW LEVEL SECURITY;

-- Policies for student data (Access strictly scoped to own user_id)
DROP POLICY IF EXISTS "Students manage own profile" ON public.students;
CREATE POLICY "Students manage own profile" ON public.students FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students manage own resumes" ON public.resumes;
CREATE POLICY "Students manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students manage own github" ON public.github_profiles;
CREATE POLICY "Students manage own github" ON public.github_profiles FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students manage own skills" ON public.skill_graph;
CREATE POLICY "Students manage own skills" ON public.skill_graph FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students manage own roadmap" ON public.roadmap_items;
CREATE POLICY "Students manage own roadmap" ON public.roadmap_items FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students manage own chat history" ON public.chat_history;
CREATE POLICY "Students manage own chat history" ON public.chat_history FOR ALL USING (auth.uid() = student_id);

-- Policies for reference datasets (Public read access)
DROP POLICY IF EXISTS "Public read reference_occupations" ON public.reference_occupations;
CREATE POLICY "Public read reference_occupations" ON public.reference_occupations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read reference_courses" ON public.reference_courses;
CREATE POLICY "Public read reference_courses" ON public.reference_courses FOR SELECT USING (true);
