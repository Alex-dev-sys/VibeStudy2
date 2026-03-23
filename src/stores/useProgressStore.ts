import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import type { CompletedTask, UserProgress } from '../types/database.types';

interface ProgressState {
    courseProgress: Record<string, UserProgress>;
    completedTasks: CompletedTask[];
    isLoading: boolean;
    isSyncing: boolean;
    lastSync: string | null;
    ownerUserId: string | null;

    fetchProgress: (userId: string) => Promise<void>;
    getProgress: (courseId: string) => UserProgress | null;
    getCompletedDays: (courseId: string) => number[];
    isLessonCompleted: (courseId: string, day: number) => boolean;
    isTaskCompleted: (courseId: string, day: number, taskId: number) => boolean;

    completeLesson: (userId: string, courseId: string, day: number) => Promise<void>;
    completeTask: (userId: string, courseId: string, day: number, taskId: number, code?: string) => Promise<number>;
    updateCurrentDay: (userId: string, courseId: string, day: number) => Promise<void>;
    resetAccountProgress: () => Promise<boolean>;
    syncToSupabase: () => Promise<void>;
    resetProgress: () => void;
}

function isAbortError(error: unknown) {
    return error instanceof Error && error.name === 'AbortError';
}

async function hasSession() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
}

const emptyProgressState = {
    courseProgress: {},
    completedTasks: [],
    lastSync: null,
    ownerUserId: null,
};

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            ...emptyProgressState,
            isLoading: false,
            isSyncing: false,

            fetchProgress: async (userId: string) => {
                const currentOwnerUserId = get().ownerUserId;
                if (currentOwnerUserId && currentOwnerUserId !== userId) {
                    set({ ...emptyProgressState, isLoading: false, ownerUserId: userId });
                }

                if (!(await hasSession())) {
                    set({
                        ...emptyProgressState,
                        isLoading: false,
                    });
                    return;
                }

                set({ isLoading: true, ownerUserId: userId });

                try {
                    const { data: progressData, error: progressError } = await supabase
                        .from('user_progress')
                        .select('*')
                        .eq('user_id', userId);

                    if (progressError) throw progressError;

                    const progressMap: Record<string, UserProgress> = {};
                    progressData?.forEach((progress) => {
                        progressMap[progress.course_id] = progress as UserProgress;
                    });

                    const { data: tasksData, error: tasksError } = await supabase
                        .from('completed_tasks')
                        .select('*')
                        .eq('user_id', userId);

                    if (tasksError) throw tasksError;

                    set({
                        courseProgress: progressMap,
                        completedTasks: (tasksData as CompletedTask[]) || [],
                        isLoading: false,
                        lastSync: new Date().toISOString(),
                        ownerUserId: userId,
                    });
                } catch (error) {
                    if (!isAbortError(error)) {
                        console.error('Error fetching progress:', error);
                    }
                    set({ isLoading: false });
                }
            },

            getProgress: (courseId: string) => get().courseProgress[courseId] || null,

            getCompletedDays: (courseId: string) => {
                const progress = get().courseProgress[courseId];
                return progress?.completed_days || [];
            },

            isLessonCompleted: (courseId: string, day: number) => {
                const completedDays = get().getCompletedDays(courseId);
                return completedDays.includes(day);
            },

            isTaskCompleted: (courseId: string, day: number, taskId: number) => {
                return get().completedTasks.some(
                    (task) => task.course_id === courseId && task.day === day && task.task_id === taskId
                );
            },

            completeLesson: async (userId: string, courseId: string, day: number) => {
                if (!(await hasSession())) {
                    return;
                }

                const currentProgress = get().courseProgress[courseId];
                const completedDays = currentProgress?.completed_days || [];

                if (completedDays.includes(day)) return;

                const newCompletedDays = [...completedDays, day].sort((a, b) => a - b);

                try {
                    const { data, error } = await supabase
                        .from('user_progress')
                        .upsert(
                            {
                                user_id: userId,
                                course_id: courseId,
                                current_day: Math.max(day + 1, currentProgress?.current_day || 1),
                                completed_days: newCompletedDays,
                                last_activity: new Date().toISOString(),
                            },
                            {
                                onConflict: 'user_id,course_id',
                            }
                        )
                        .select()
                        .single();

                    if (error) throw error;

                    set((state) => ({
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: data as UserProgress,
                        },
                        ownerUserId: userId,
                    }));
                } catch (error) {
                    if (!isAbortError(error)) {
                        console.error('Error completing lesson:', error);
                    }
                }
            },

            completeTask: async (userId: string, courseId: string, day: number, taskId: number, code?: string) => {
                if (!(await hasSession())) {
                    return 0;
                }

                const alreadyCompleted = get().completedTasks.some(
                    (task) => task.course_id === courseId && task.day === day && task.task_id === taskId
                );

                if (alreadyCompleted) {
                    return 0;
                }

                const xpEarned = 10;

                try {
                    const { data, error } = await supabase
                        .from('completed_tasks')
                        .upsert(
                            {
                                user_id: userId,
                                course_id: courseId,
                                day,
                                task_id: taskId,
                                code: code || null,
                                xp_earned: xpEarned,
                            },
                            {
                                onConflict: 'user_id,course_id,day,task_id',
                            }
                        )
                        .select()
                        .single();

                    if (error) throw error;

                    set((state) => ({
                        completedTasks: [
                            ...state.completedTasks.filter(
                                (task) => !(task.course_id === courseId && task.day === day && task.task_id === taskId)
                            ),
                            data as CompletedTask,
                        ],
                        ownerUserId: userId,
                    }));

                    const authStore = useAuthStore.getState();
                    if (authStore.user?.id === userId) {
                        await authStore.addXP(xpEarned);
                    }

                    return xpEarned;
                } catch (error) {
                    if (!isAbortError(error)) {
                        console.error('Error completing task:', error);
                    }
                    return 0;
                }
            },

            updateCurrentDay: async (userId: string, courseId: string, day: number) => {
                if (!(await hasSession())) {
                    return;
                }

                const currentProgress = get().courseProgress[courseId];
                const nextDay = Math.max(day, currentProgress?.current_day || 1);

                try {
                    const { data, error } = await supabase
                        .from('user_progress')
                        .upsert(
                            {
                                user_id: userId,
                                course_id: courseId,
                                current_day: nextDay,
                                last_activity: new Date().toISOString(),
                            },
                            {
                                onConflict: 'user_id,course_id',
                            }
                        )
                        .select()
                        .single();

                    if (error) throw error;

                    set((state) => ({
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: {
                                ...state.courseProgress[courseId],
                                ...data,
                            } as UserProgress,
                        },
                        ownerUserId: userId,
                    }));
                } catch (error) {
                    if (!isAbortError(error)) {
                        console.error('Error updating current day:', error);
                    }
                }
            },

            resetAccountProgress: async () => {
                if (!(await hasSession())) {
                    return false;
                }

                try {
                    const { error } = await supabase.functions.invoke('reset-user-state', {
                        body: {},
                    });

                    if (error) {
                        throw error;
                    }

                    set({
                        ...emptyProgressState,
                        isLoading: false,
                        isSyncing: false,
                    });

                    return true;
                } catch (error) {
                    if (!isAbortError(error)) {
                        console.error('Error resetting account progress:', error);
                    }
                    return false;
                }
            },

            syncToSupabase: async () => {
                set({ isSyncing: true });
                set({
                    isSyncing: false,
                    lastSync: new Date().toISOString(),
                });
            },

            resetProgress: () => {
                set({
                    ...emptyProgressState,
                    isLoading: false,
                    isSyncing: false,
                });
            },
        }),
        {
            name: 'progress-storage',
            partialize: (state) => ({
                courseProgress: state.courseProgress,
                completedTasks: state.completedTasks,
                lastSync: state.lastSync,
                ownerUserId: state.ownerUserId,
            }),
        }
    )
);
