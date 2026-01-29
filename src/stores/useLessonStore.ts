import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedTask } from '../types/database.types';

interface GeneratedLesson {
    theory: string;
    tasks: GeneratedTask[];
    generatedAt: string;
}

interface LessonState {
    // Cache of generated lessons
    lessons: Record<string, GeneratedLesson>; // key: `${courseId}-${day}`

    // Actions
    getLesson: (courseId: string, day: number) => GeneratedLesson | null;
    setLesson: (courseId: string, day: number, lesson: { theory: string; tasks: GeneratedTask[] }) => void;
    hasLesson: (courseId: string, day: number) => boolean;
    clearLesson: (courseId: string, day: number) => void;
    clearAllLessons: () => void;

    // Cache management
    getCacheSize: () => number;
    pruneOldLessons: (maxAge: number) => void;
}

const getLessonKey = (courseId: string, day: number) => `${courseId}-${day}`;

export const useLessonStore = create<LessonState>()(
    persist(
        (set, get) => ({
            lessons: {},

            getLesson: (courseId: string, day: number) => {
                const key = getLessonKey(courseId, day);
                return get().lessons[key] || null;
            },

            setLesson: (courseId: string, day: number, lesson) => {
                const key = getLessonKey(courseId, day);
                set((state) => ({
                    lessons: {
                        ...state.lessons,
                        [key]: {
                            ...lesson,
                            generatedAt: new Date().toISOString(),
                        },
                    },
                }));
            },

            hasLesson: (courseId: string, day: number) => {
                const key = getLessonKey(courseId, day);
                return key in get().lessons;
            },

            clearLesson: (courseId: string, day: number) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const { [key]: _, ...rest } = state.lessons;
                    return { lessons: rest };
                });
            },

            clearAllLessons: () => {
                set({ lessons: {} });
            },

            getCacheSize: () => {
                return Object.keys(get().lessons).length;
            },

            pruneOldLessons: (maxAgeMs: number) => {
                const now = Date.now();
                set((state) => {
                    const prunedLessons: Record<string, GeneratedLesson> = {};

                    Object.entries(state.lessons).forEach(([key, lesson]) => {
                        const lessonAge = now - new Date(lesson.generatedAt).getTime();
                        if (lessonAge < maxAgeMs) {
                            prunedLessons[key] = lesson;
                        }
                    });

                    return { lessons: prunedLessons };
                });
            },
        }),
        {
            name: 'lesson-cache',
            partialize: (state) => ({
                lessons: state.lessons,
            }),
        }
    )
);
