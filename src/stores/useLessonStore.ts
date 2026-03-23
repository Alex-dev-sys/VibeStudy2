import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedTask } from '../types/database.types';

export type LessonContentSource = 'ai' | 'demo';

export interface GeneratedLesson {
    theory: string;
    tasks: GeneratedTask[];
    generatedAt: string;
    source: LessonContentSource;
}

export interface LessonSession {
    activeTaskId: number | null;
    codeByTaskId: Record<number, string>;
    hintByTaskId: Record<number, string>;
    reviewByTaskId: Record<number, string>;
    readyByTaskId: Record<number, boolean>;
    updatedAt: string | null;
}

interface LessonState {
    lessons: Record<string, GeneratedLesson>; // key: `${courseId}-${day}`
    sessions: Record<string, LessonSession>;

    getLesson: (courseId: string, day: number) => GeneratedLesson | null;
    setLesson: (
        courseId: string,
        day: number,
        lesson: { theory: string; tasks: GeneratedTask[]; source: LessonContentSource }
    ) => void;
    hasLesson: (courseId: string, day: number) => boolean;
    clearLesson: (courseId: string, day: number) => void;
    clearAllLessons: () => void;

    getSession: (courseId: string, day: number) => LessonSession;
    setActiveTask: (courseId: string, day: number, taskId: number | null) => void;
    saveTaskDraft: (courseId: string, day: number, taskId: number, code: string) => void;
    saveHint: (courseId: string, day: number, taskId: number, hint: string) => void;
    saveReview: (courseId: string, day: number, taskId: number, review: string, isReady: boolean) => void;
    resetTaskSession: (courseId: string, day: number, taskId: number) => void;
    clearSession: (courseId: string, day: number) => void;

    getCacheSize: () => number;
    pruneOldLessons: (maxAge: number) => void;
}

const getLessonKey = (courseId: string, day: number) => `${courseId}-${day}`;

function createEmptySession(): LessonSession {
    return {
        activeTaskId: null,
        codeByTaskId: {},
        hintByTaskId: {},
        reviewByTaskId: {},
        readyByTaskId: {},
        updatedAt: null,
    };
}

function touchSession(session: LessonSession): LessonSession {
    return {
        ...session,
        updatedAt: new Date().toISOString(),
    };
}

export const useLessonStore = create<LessonState>()(
    persist(
        (set, get) => ({
            lessons: {},
            sessions: {},

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
                    const { [key]: removedLesson, ...rest } = state.lessons;
                    void removedLesson;
                    return { lessons: rest };
                });
            },

            clearAllLessons: () => {
                set({ lessons: {}, sessions: {} });
            },

            getSession: (courseId: string, day: number) => {
                const key = getLessonKey(courseId, day);
                return get().sessions[key] || createEmptySession();
            },

            setActiveTask: (courseId: string, day: number, taskId: number | null) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const session = state.sessions[key] || createEmptySession();
                    return {
                        sessions: {
                            ...state.sessions,
                            [key]: touchSession({
                                ...session,
                                activeTaskId: taskId,
                            }),
                        },
                    };
                });
            },

            saveTaskDraft: (courseId: string, day: number, taskId: number, code: string) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const session = state.sessions[key] || createEmptySession();
                    const nextReviewByTaskId = { ...session.reviewByTaskId };
                    const nextReadyByTaskId = { ...session.readyByTaskId };

                    delete nextReviewByTaskId[taskId];
                    delete nextReadyByTaskId[taskId];

                    return {
                        sessions: {
                            ...state.sessions,
                            [key]: touchSession({
                                ...session,
                                activeTaskId: taskId,
                                codeByTaskId: {
                                    ...session.codeByTaskId,
                                    [taskId]: code,
                                },
                                reviewByTaskId: nextReviewByTaskId,
                                readyByTaskId: nextReadyByTaskId,
                            }),
                        },
                    };
                });
            },

            saveHint: (courseId: string, day: number, taskId: number, hint: string) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const session = state.sessions[key] || createEmptySession();
                    return {
                        sessions: {
                            ...state.sessions,
                            [key]: touchSession({
                                ...session,
                                hintByTaskId: {
                                    ...session.hintByTaskId,
                                    [taskId]: hint,
                                },
                            }),
                        },
                    };
                });
            },

            saveReview: (courseId: string, day: number, taskId: number, review: string, isReady: boolean) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const session = state.sessions[key] || createEmptySession();
                    return {
                        sessions: {
                            ...state.sessions,
                            [key]: touchSession({
                                ...session,
                                reviewByTaskId: {
                                    ...session.reviewByTaskId,
                                    [taskId]: review,
                                },
                                readyByTaskId: {
                                    ...session.readyByTaskId,
                                    [taskId]: isReady,
                                },
                            }),
                        },
                    };
                });
            },

            resetTaskSession: (courseId: string, day: number, taskId: number) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const session = state.sessions[key] || createEmptySession();
                    const nextCodeByTaskId = { ...session.codeByTaskId };
                    const nextHintByTaskId = { ...session.hintByTaskId };
                    const nextReviewByTaskId = { ...session.reviewByTaskId };
                    const nextReadyByTaskId = { ...session.readyByTaskId };

                    delete nextCodeByTaskId[taskId];
                    delete nextHintByTaskId[taskId];
                    delete nextReviewByTaskId[taskId];
                    delete nextReadyByTaskId[taskId];

                    return {
                        sessions: {
                            ...state.sessions,
                            [key]: touchSession({
                                ...session,
                                activeTaskId: session.activeTaskId === taskId ? null : session.activeTaskId,
                                codeByTaskId: nextCodeByTaskId,
                                hintByTaskId: nextHintByTaskId,
                                reviewByTaskId: nextReviewByTaskId,
                                readyByTaskId: nextReadyByTaskId,
                            }),
                        },
                    };
                });
            },

            clearSession: (courseId: string, day: number) => {
                const key = getLessonKey(courseId, day);
                set((state) => {
                    const { [key]: removedSession, ...rest } = state.sessions;
                    void removedSession;
                    return { sessions: rest };
                });
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
                sessions: state.sessions,
            }),
        }
    )
);
