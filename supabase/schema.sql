-- ============================================
-- VibeStudy Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Progress table (course progress)
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    course_id TEXT NOT NULL,
    current_day INT DEFAULT 1,
    completed_days INT[] DEFAULT '{}',
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 3. Completed Tasks table
CREATE TABLE public.completed_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    course_id TEXT NOT NULL,
    day INT NOT NULL,
    task_id INT NOT NULL,
    code TEXT,
    xp_earned INT DEFAULT 10,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, day, task_id)
);

-- 4. Achievements table
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type, achievement_name)
);

-- 5. Generated Lessons Cache (optional, for caching AI responses)
CREATE TABLE public.lesson_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL,
    day INT NOT NULL,
    theory TEXT,
    tasks JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, day)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Progress: Users can only access own data
CREATE POLICY "Users can view own progress"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON public.user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Completed Tasks: Users can only access own data
CREATE POLICY "Users can view own completed tasks"
    ON public.completed_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed tasks"
    ON public.completed_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Achievements: Users can only access own data
CREATE POLICY "Users can view own achievements"
    ON public.achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
    ON public.achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Lesson Cache: Public read, authenticated write
CREATE POLICY "Anyone can view cached lessons"
    ON public.lesson_cache FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can cache lessons"
    ON public.lesson_cache FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Triggers for automatic profile creation
-- ============================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_completed_tasks_user_id ON public.completed_tasks(user_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
