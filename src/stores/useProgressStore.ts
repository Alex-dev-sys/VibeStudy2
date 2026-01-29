import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { UserProgress, CompletedTask } from '../types/database.types';

interface ProgressState {
    // Progress data
    courseProgress: Record<string, UserProgress>;
    completedTasks: CompletedTask[];
    isLoading: boolean;
    isSyncing: boolean;
    lastSync: string | null;

    // Actions
    fetchProgress: (userId: string) => Promise<void>;
    getProgress: (courseId: string) => UserProgress | null;
    getCompletedDays: (courseId: string) => number[];
    isLessonCompleted: (courseId: string, day: number) => boolean;
    isTaskCompleted: (courseId: string, day: number, taskId: number) => boolean;

    // Mutations
    completeLesson: (userId: string, courseId: string, day: number) => Promise<void>;
    completeTask: (userId: string, courseId: string, day: number, taskId: number, code?: string) => Promise<number>;
    updateCurrentDay: (userId: string, courseId: string, day: number) => Promise<void>;

    // Sync
    syncToSupabase: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            courseProgress: {},
            completedTasks: [],
            isLoading: false,
            isSyncing: false,
            lastSync: null,

            fetchProgress: async (userId: string) => {
                set({ isLoading: true });

                try {
                    // Fetch course progress
                    const { data: progressData, error: progressError } = await supabase
                        .from('user_progress')
                        .select('*')
                        .eq('user_id', userId);

                    if (progressError) throw progressError;

                    const progressMap: Record<string, UserProgress> = {};
                    progressData?.forEach((p) => {
                        progressMap[p.course_id] = p as UserProgress;
                    });

                    // Fetch completed tasks
                    const { data: tasksData, error: tasksError } = await supabase
                        .from('completed_tasks')
                        .select('*')
                        .eq('user_id', userId);

                    if (tasksError) throw tasksError;

                    set({
                        courseProgress: progressMap,
                        completedTasks: tasksData as CompletedTask[] || [],
                        isLoading: false,
                        lastSync: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error('Error fetching progress:', error);
                    set({ isLoading: false });
                }
            },

            getProgress: (courseId: string) => {
                return get().courseProgress[courseId] || null;
            },

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
                    t => t.course_id === courseId && t.day === day && t.task_id === taskId
                );
            },

            completeLesson: async (userId: string, courseId: string, day: number) => {
                const currentProgress = get().courseProgress[courseId];
                const completedDays = currentProgress?.completed_days || [];

                if (completedDays.includes(day)) return;

                const newCompletedDays = [...completedDays, day].sort((a, b) => a - b);

                try {
                    const { data, error } = await supabase
                        .from('user_progress')
                        .upsert({
                            user_id: userId,
                            course_id: courseId,
                            current_day: Math.max(day + 1, currentProgress?.current_day || 1),
                            completed_days: newCompletedDays,
                            last_activity: new Date().toISOString(),
                        }, {
                            onConflict: 'user_id,course_id'
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    set((state) => ({
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: data as UserProgress,
                        },
                    }));
                } catch (error) {
                    console.error('Error completing lesson:', error);
                }
            },

            completeTask: async (userId: string, courseId: string, day: number, taskId: number, code?: string) => {
                const xpEarned = 10; // Base XP per task

                try {
                    const { data, error } = await supabase
                        .from('completed_tasks')
                        .upsert({
                            user_id: userId,
                            course_id: courseId,
                            day,
                            task_id: taskId,
                            code: code || null,
                            xp_earned: xpEarned,
                        }, {
                            onConflict: 'user_id,course_id,day,task_id'
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    set((state) => ({
                        completedTasks: [
                            ...state.completedTasks.filter(
                                t => !(t.course_id === courseId && t.day === day && t.task_id === taskId)
                            ),
                            data as CompletedTask,
                        ],
                    }));

                    return xpEarned;
                } catch (error) {
                    console.error('Error completing task:', error);
                    return 0;
                }
            },

            updateCurrentDay: async (userId: string, courseId: string, day: number) => {
                try {
                    const { data, error } = await supabase
                        .from('user_progress')
                        .upsert({
                            user_id: userId,
                            course_id: courseId,
                            current_day: day,
                            last_activity: new Date().toISOString(),
                        }, {
                            onConflict: 'user_id,course_id'
                        })
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
                    }));
                } catch (error) {
                    console.error('Error updating current day:', error);
                }
            },

            syncToSupabase: async () => {
                set({ isSyncing: true });
                // Sync logic handled by individual mutations
                set({
                    isSyncing: false,
                    lastSync: new Date().toISOString()
                });
            },
        }),
        {
            name: 'progress-storage',
            partialize: (state) => ({
                courseProgress: state.courseProgress,
                completedTasks: state.completedTasks,
                lastSync: state.lastSync,
            }),
        }
    )
);
