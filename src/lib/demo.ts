import type { User } from '@supabase/supabase-js';
import type { CompletedTask, Profile, UserProgress } from '../types/database.types';

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000042';

const now = new Date().toISOString();

export const demoUser = {
    id: DEMO_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@vibestudy.app',
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'demo', providers: ['demo'] },
    user_metadata: { full_name: 'Алекс Демо' },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: true,
} as User;

export const demoProfile: Profile = {
    id: DEMO_USER_ID,
    username: 'demo-builder',
    full_name: 'Алекс Демо',
    avatar_url: null,
    current_streak: 6,
    longest_streak: 11,
    total_xp: 1280,
    level: 2,
    created_at: now,
    updated_at: now,
};

function daysAgo(days: number) {
    const value = new Date();
    value.setDate(value.getDate() - days);
    return value.toISOString();
}

export function createDemoProgress(): {
    courseProgress: Record<string, UserProgress>;
    completedTasks: CompletedTask[];
} {
    return {
        courseProgress: {
            python: {
                id: 'demo-progress-python',
                user_id: DEMO_USER_ID,
                course_id: 'python',
                current_day: 8,
                completed_days: [1, 2, 3, 4, 5, 6, 7],
                last_activity: daysAgo(0),
                created_at: daysAgo(12),
            },
            javascript: {
                id: 'demo-progress-javascript',
                user_id: DEMO_USER_ID,
                course_id: 'javascript',
                current_day: 4,
                completed_days: [1, 2, 3],
                last_activity: daysAgo(2),
                created_at: daysAgo(8),
            },
        },
        completedTasks: Array.from({ length: 18 }, (_, index) => {
            const isPython = index < 13;
            const courseId = isPython ? 'python' : 'javascript';
            const day = isPython ? Math.floor(index / 2) + 1 : Math.floor((index - 13) / 2) + 1;

            return {
                id: `demo-task-${index + 1}`,
                user_id: DEMO_USER_ID,
                course_id: courseId,
                day,
                task_id: (index % 2) + 1,
                code: null,
                xp_earned: 10,
                completed_at: daysAgo(Math.min(6, 17 - index)),
            };
        }),
    };
}
