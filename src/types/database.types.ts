// Database types for Supabase tables

export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    current_streak: number;
    longest_streak: number;
    total_xp: number;
    level: number;
    created_at: string;
    updated_at: string;
}

export interface UserProgress {
    id: string;
    user_id: string;
    course_id: string;
    current_day: number;
    completed_days: number[];
    last_activity: string;
    created_at: string;
}

export interface CompletedTask {
    id: string;
    user_id: string;
    course_id: string;
    day: number;
    task_id: number;
    code: string | null;
    xp_earned: number;
    completed_at: string;
}

export interface Achievement {
    id: string;
    user_id: string;
    achievement_type: string;
    achievement_name: string;
    achieved_at: string;
}

export interface LessonCache {
    id: string;
    course_id: string;
    day: number;
    theory: string | null;
    tasks: GeneratedTask[] | null;
    created_at: string;
}

export interface GeneratedTask {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    codeTemplate?: string;
}

// Supabase Database type
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile> & { id: string };
                Update: Partial<Profile>;
            };
            user_progress: {
                Row: UserProgress;
                Insert: Omit<UserProgress, 'id' | 'created_at'>;
                Update: Partial<UserProgress>;
            };
            completed_tasks: {
                Row: CompletedTask;
                Insert: Omit<CompletedTask, 'id' | 'completed_at'>;
                Update: Partial<CompletedTask>;
            };
            achievements: {
                Row: Achievement;
                Insert: Omit<Achievement, 'id' | 'achieved_at'>;
                Update: Partial<Achievement>;
            };
            lesson_cache: {
                Row: LessonCache;
                Insert: Omit<LessonCache, 'id' | 'created_at'>;
                Update: Partial<LessonCache>;
            };
        };
    };
}
