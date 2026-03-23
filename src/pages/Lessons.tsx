import { useMemo, useState } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    Clock,
    Loader2,
    Lock,
    RefreshCcw,
    Sparkles,
    Target,
    Zap,
} from 'lucide-react';
import { courses, getCourseById, type DayLesson } from '../data/courses';
import { useAIGeneration } from '../hooks/useAIGeneration';
import LessonMarkdown from '../components/LessonMarkdown';
import Paywall from '../components/billing/Paywall';
import TaskEditor from '../components/TaskEditor';
import { useAuthStore } from '../stores/useAuthStore';
import { useBillingStore } from '../stores/useBillingStore';
import { useProgressStore } from '../stores/useProgressStore';
import { useLessonStore } from '../stores/useLessonStore';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import { FREE_DAILY_HINT_LIMIT, FREE_TRACK_DAY_LIMIT, canAccessLessonDay, canAccessTrack } from '../lib/billing';
import { trackEvent } from '../lib/analytics';
import type { GeneratedTask } from '../types/database.types';

const courseCopy: Record<string, string> = {
    python: 'РўСЂРµРє РґР»СЏ РїРµСЂРІРѕРіРѕ СѓРІРµСЂРµРЅРЅРѕРіРѕ РІС…РѕРґР° РІ РїСЂРѕРіСЂР°РјРјРёСЂРѕРІР°РЅРёРµ, Р°РІС‚РѕРјР°С‚РёР·Р°С†РёРё Рё backend-Р±Р°Р·С‹.',
    javascript: 'РўСЂРµРє РґР»СЏ РІРµР±-СЂР°Р·СЂР°Р±РѕС‚РєРё, РёРЅС‚РµСЂС„РµР№СЃРѕРІ Рё РїСЂРёРєР»Р°РґРЅРѕР№ Р»РѕРіРёРєРё РІ Р±СЂР°СѓР·РµСЂРµ.',
    go: 'РўСЂРµРє РґР»СЏ backend, concurrency Рё Р±С‹СЃС‚СЂС‹С… СЃРµСЂРІРёСЃРѕРІ СЃ РїРѕРЅСЏС‚РЅРѕР№ Р°СЂС…РёС‚РµРєС‚СѓСЂРѕР№.',
    csharp: 'РўСЂРµРє РґР»СЏ .NET-СЌРєРѕСЃРёСЃС‚РµРјС‹, РїСЂРёРєР»Р°РґРЅРѕР№ СЂР°Р·СЂР°Р±РѕС‚РєРё Рё СЃРµСЂРІРµСЂРЅРѕР№ Р»РѕРіРёРєРё.',
};

function getDifficultyLabel(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'Р›РµРіРєРѕ';
    if (difficulty === 'medium') return 'РЎСЂРµРґРЅРµ';
    return 'РЎР»РѕР¶РЅРѕ';
}

function getDifficultyStyles(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'bg-green-500/20 text-green-400';
    if (difficulty === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
}

export default function Lessons() {
    const { courseId, dayParam } = useParams();
    const navigate = useNavigate();

    if (!courseId) {
        return <CourseSelection />;
    }

    const course = getCourseById(courseId);
    if (!course) {
        return <CourseSelection />;
    }

    const currentDay = dayParam ? Number.parseInt(dayParam, 10) : 1;
    const currentLesson = course.lessons.find((lesson) => lesson.day === currentDay);

    if (!currentLesson) {
        return <DaySelection course={course} />;
    }

    return (
        <LessonView
            key={`${course.id}-${currentLesson.day}`}
            course={course}
            lesson={currentLesson}
            onNavigate={(day) => navigate(`/lessons/${courseId}/${day}`)}
            onBack={() => navigate(`/lessons/${courseId}`)}
        />
    );
}

function CourseSelection() {
    const { access } = useBillingStore();
    const { selectedTrack } = useOnboardingStore();

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

            <div className="mx-auto max-w-6xl px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="mb-4 text-4xl font-bold text-white">Р’С‹Р±РµСЂРё С‚СЂРµРє РѕР±СѓС‡РµРЅРёСЏ</h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-400">
                        РљР°Р¶РґС‹Р№ С‚СЂРµРє СЂР°Р·Р±РёС‚ РЅР° РµР¶РµРґРЅРµРІРЅС‹Рµ С€Р°РіРё. РЎРЅР°С‡Р°Р»Р° С‚С‹ РїРѕР»СѓС‡Р°РµС€СЊ С‚РµРѕСЂРёСЋ, Р·Р°С‚РµРј Р·Р°РґР°С‡Рё Рё AI-РїРѕРјРѕС‰СЊ,
                        С‡С‚РѕР±С‹ РЅРµ Р·Р°СЃС‚СЂРµРІР°С‚СЊ РЅР° СЂРѕРІРЅРѕРј РјРµСЃС‚Рµ.
                    </p>
                </motion.div>

                {!access.canAccessPaidFeatures && selectedTrack ? (
                    <div className="mb-8 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-50">
                        В бесплатном режиме сейчас открыт один трек: <span className="font-semibold text-white">{selectedTrack}</span>.
                        Остальные треки доступны после апгрейда на Pro.
                    </div>
                ) : null}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            {(() => {
                                const isLocked = !canAccessTrack(access, selectedTrack, course.id);

                                return (
                                    <Link
                                        to={isLocked ? '#' : `/lessons/${course.id}`}
                                        className={isLocked ? 'pointer-events-none' : ''}
                                    >
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className={`group h-full rounded-[1.75rem] p-6 ${
                                        isLocked ? 'glass border border-amber-300/20 opacity-70' : 'glass-hover cursor-pointer'
                                    }`}
                                >
                                    <div
                                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${course.color}20` }}
                                    >
                                        {course.icon}
                                    </div>
                                    {isLocked ? (
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                                            <Lock className="h-3.5 w-3.5" />
                                            Pro
                                        </div>
                                    ) : null}
                                    <h3 className="mb-2 text-xl font-bold text-white">{course.name}</h3>
                                    <p className="mb-4 text-sm text-gray-400">
                                        {courseCopy[course.id] || 'РџСЂР°РєС‚РёС‡РµСЃРєРёР№ С‚СЂРµРє СЃ РµР¶РµРґРЅРµРІРЅС‹Рј РґРІРёР¶РµРЅРёРµРј РІРїРµСЂС‘Рґ.'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {course.totalDays} РґРЅРµР№
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            {course.totalDays * 100} XP
                                        </span>
                                    </div>
                                </motion.div>
                                    </Link>
                                );
                            })()}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DaySelection({ course }: { course: typeof courses[0] }) {
    const { getCompletedDays } = useProgressStore();
    const { access } = useBillingStore();
    const { selectedTrack } = useOnboardingStore();
    const completedDays = getCompletedDays(course.id);
    const trackLocked = !canAccessTrack(access, selectedTrack, course.id);

    if (trackLocked) {
        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

                <div className="mx-auto max-w-6xl px-6 py-10">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад
                    </button>

                    <Paywall
                        title="Этот трек открыт только в Pro"
                        reason={`В бесплатном режиме доступен один выбранный трек. Сейчас активен ${selectedTrack ?? 'текущий'} трек, а ${course.name} требует апгрейда.`}
                        subtitle="Первую ценность продукт уже отдал: дальше доступ ко всем языкам и долгим траекториям идёт через платный план."
                        compact
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

            <div className="mx-auto max-w-6xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link to="/lessons" className="mb-4 inline-flex items-center gap-2 text-gray-400 hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                        РќР°Р·Р°Рґ Рє С‚СЂРµРєР°Рј
                    </Link>

                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                            style={{ backgroundColor: `${course.color}20` }}
                        >
                            {course.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{course.name}</h1>
                            <p className="text-gray-400">{course.totalDays} С€Р°РіРѕРІ РѕР±СѓС‡РµРЅРёСЏ</p>
                        </div>
                    </div>
                </motion.div>

                {!access.canAccessPaidFeatures ? (
                    <div className="mb-6 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-50">
                        Бесплатный режим открывает первые {FREE_TRACK_DAY_LIMIT} дня трека. Остальные дни помечены как Pro.
                    </div>
                ) : null}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass mb-8 rounded-[1.75rem] p-6"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-gray-400">Прогресс трека</span>
                        <span className="font-bold text-vibe-400">
                            {completedDays.length}/{course.totalDays} дней
                        </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-dark-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedDays.length / course.totalDays) * 100}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-vibe-500 to-vibe-400"
                        />
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5 lg:grid-cols-6">
                    {course.lessons.map((lesson, index) => {
                        const isCompleted = completedDays.includes(lesson.day);
                        const isProgressLocked = lesson.day > completedDays.length + 1;
                        const isPlanLocked = !access.canAccessPaidFeatures && lesson.day > FREE_TRACK_DAY_LIMIT;
                        const isLocked = isProgressLocked || isPlanLocked;
                        const isCurrent = lesson.day === completedDays.length + 1;

                        return (
                            <motion.div
                                key={lesson.day}
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Link
                                    to={isLocked ? '#' : `/lessons/${course.id}/${lesson.day}`}
                                    className={isLocked ? 'cursor-not-allowed' : ''}
                                >
                                    <motion.div
                                        whileHover={!isLocked ? { y: -4, scale: 1.03 } : {}}
                                        className={`rounded-xl p-4 text-center transition-all ${
                                            isLocked
                                                ? 'bg-dark-700/30 opacity-50'
                                                : isCurrent
                                                    ? 'glass border-2 border-vibe-500 shadow-neon'
                                                    : isCompleted
                                                        ? 'glass border border-green-500/30'
                                                        : 'glass-hover'
                                        }`}
                                    >
                                        <div className="mb-2 flex justify-center">
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                                            ) : isLocked ? (
                                                <Lock className="h-6 w-6 text-gray-500" />
                                            ) : (
                                                <Circle className="h-6 w-6 text-vibe-400" />
                                            )}
                                        </div>
                                        <p className="mb-1 text-lg font-bold text-white">День {lesson.day}</p>
                                        <p className="line-clamp-2 text-xs text-gray-400">{lesson.title}</p>
                                        {isPlanLocked ? (
                                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                                                Pro
                                            </p>
                                        ) : null}
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface LessonViewProps {
    course: typeof courses[0];
    lesson: DayLesson;
    onNavigate: (day: number) => void;
    onBack: () => void;
}

function LessonView({ course, lesson, onNavigate, onBack }: LessonViewProps) {
    const { user } = useAuthStore();
    const { access, getFeatureUsage, hydrate: hydrateBilling } = useBillingStore();
    const { selectedTrack } = useOnboardingStore();
    const { completeTask, completeLesson, isTaskCompleted, isLessonCompleted, updateCurrentDay } =
        useProgressStore();
    const {
        getLesson,
        setLesson,
        clearLesson,
        getSession,
        setActiveTask,
        saveTaskDraft,
        saveHint,
        saveReview,
        resetTaskSession,
    } = useLessonStore();
    const {
        generateLesson,
        generateTaskHint,
        generateTaskReview,
        generatedContent,
        isLoading,
        isHintLoading,
        isReviewLoading,
        error,
        hintError,
        reviewError,
        clearContent,
    } = useAIGeneration();

    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const hasTrackedFirstLessonRef = useRef(false);

    const cachedLesson = getLesson(course.id, lesson.day);
    const currentContent = generatedContent ?? cachedLesson;
    const lessonSession = getSession(course.id, lesson.day);
    const userId = user?.id ?? null;
    const trackAllowed = canAccessTrack(access, selectedTrack, course.id);
    const dayAllowed = canAccessLessonDay(access, lesson.day);
    const hintsUsedToday = getFeatureUsage('ai_hint');
    const remainingHints = access.canAccessPaidFeatures ? null : Math.max(0, FREE_DAILY_HINT_LIMIT - hintsUsedToday);
    const hintLocked = !access.canAccessPaidFeatures && (remainingHints ?? 0) <= 0;

    const completedTaskIds = useMemo(() => {
        if (!currentContent) return [];

        return currentContent.tasks
            .filter((task) => isTaskCompleted(course.id, lesson.day, task.id))
            .map((task) => task.id);
    }, [course.id, currentContent, isTaskCompleted, lesson.day]);

    const selectedTask = currentContent?.tasks.find((task) => task.id === selectedTaskId) ?? null;
    const resumeTask =
        currentContent?.tasks.find(
            (task) => task.id === lessonSession.activeTaskId && !completedTaskIds.includes(task.id)
        ) ?? null;

    const selectedTaskCode = selectedTask
        ? lessonSession.codeByTaskId[selectedTask.id] ?? selectedTask.codeTemplate ?? ''
        : '';
    const selectedTaskHint = selectedTask ? lessonSession.hintByTaskId[selectedTask.id] ?? '' : '';
    const selectedTaskReview = selectedTask ? lessonSession.reviewByTaskId[selectedTask.id] ?? '' : '';
    const selectedTaskCanComplete = selectedTask ? lessonSession.readyByTaskId[selectedTask.id] ?? false : false;

    const lessonCompleted = isLessonCompleted(course.id, lesson.day);
    const canCompleteLesson = completedTaskIds.length > 0 && completedTaskIds.length === (currentContent?.tasks.length ?? 0);
    const hasPrev = lesson.day > 1;
    const hasNext = lesson.day < course.totalDays;

    const handleGenerate = async (forceFresh = false) => {
        if (forceFresh) {
            clearLesson(course.id, lesson.day);
            clearContent();
        }

        if (lesson.day === 1 && !hasTrackedFirstLessonRef.current) {
            trackEvent('first_lesson_started', {
                trackId: course.id,
                lessonDay: lesson.day,
            });
            hasTrackedFirstLessonRef.current = true;
        }

        const result = await generateLesson(course.id, course.name, lesson.day, lesson.title, lesson.topics);
        if (result) {
            setLesson(course.id, lesson.day, result);

            if (userId) {
                await updateCurrentDay(userId, course.id, lesson.day);
                await hydrateBilling(userId);
            }
        }
    };
    const handleOpenTask = (task: GeneratedTask) => {
        if (completedTaskIds.includes(task.id)) {
            return;
        }

        setSelectedTaskId(task.id);
        setActiveTask(course.id, lesson.day, task.id);
    };

    const handleCodeChange = (value: string) => {
        if (!selectedTask) return;
        saveTaskDraft(course.id, lesson.day, selectedTask.id, value);
    };

    const handleResetTask = () => {
        if (!selectedTask) return;
        resetTaskSession(course.id, lesson.day, selectedTask.id);
    };

    const handleRequestHint = async () => {
        if (!selectedTask || hintLocked) return;

        const response = await generateTaskHint(
            course.id,
            course.name,
            lesson.day,
            lesson.title,
            selectedTask,
            selectedTaskCode
        );

        saveHint(course.id, lesson.day, selectedTask.id, response.hint);
        if (userId) {
            await hydrateBilling(userId);
        }
    };

    const handleRequestReview = async () => {
        if (!selectedTask) return;

        const response = await generateTaskReview(
            course.id,
            course.name,
            lesson.day,
            lesson.title,
            selectedTask,
            selectedTaskCode
        );

        saveReview(course.id, lesson.day, selectedTask.id, response.review, response.canComplete);
        if (userId) {
            await hydrateBilling(userId);
        }
    };

    const handleTaskComplete = async () => {
        if (!selectedTask || !userId || isSubmittingTask) {
            return;
        }

        setIsSubmittingTask(true);

        try {
            const earnedXp = await completeTask(
                userId,
                course.id,
                lesson.day,
                selectedTask.id,
                selectedTaskCode || undefined
            );

            const nextCompleted = new Set([...completedTaskIds, selectedTask.id]);
            if (earnedXp > 0) {
                trackEvent('task_completed', {
                    trackId: course.id,
                    lessonDay: lesson.day,
                    taskId: selectedTask.id,
                    xpEarned: earnedXp,
                });
            }
            if (earnedXp > 0 && currentContent && nextCompleted.size === currentContent.tasks.length) {
                await completeLesson(userId, course.id, lesson.day);
            }

            setActiveTask(course.id, lesson.day, null);
            setSelectedTaskId(null);
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const handleLessonComplete = async () => {
        if (!userId || !canCompleteLesson || lessonCompleted) {
            return;
        }

        await completeLesson(userId, course.id, lesson.day);
    };

    if (!trackAllowed || !dayAllowed) {
        const reason = !trackAllowed
            ? `В бесплатном режиме открыт один выбранный трек. Сейчас активен ${selectedTrack ?? 'текущий'} трек, а ${course.name} относится к платной зоне.`
            : `В бесплатном режиме доступны только первые ${FREE_TRACK_DAY_LIMIT} дня выбранного трека. День ${lesson.day} уже относится к Pro.`;

        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

                <div className="mx-auto max-w-6xl px-6 py-8">
                    <button
                        onClick={onBack}
                        className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад к дням трека
                    </button>

                    <Paywall
                        title={!trackAllowed ? 'Все треки доступны только в Pro' : 'Следующие дни открываются в Pro'}
                        reason={reason}
                        subtitle="Бесплатный режим специально оставляет первый ощутимый value, а не прячет его за paywall слишком рано."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

            <div className="mx-auto max-w-7xl px-6 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <button
                        onClick={onBack}
                        className="mb-4 inline-flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад к дням трека
                    </button>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <span
                                    className="rounded-full px-3 py-1 text-sm font-medium"
                                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                                >
                                    {course.name}
                                </span>
                                <span className="text-gray-500">
                                    День {lesson.day}/{course.totalDays}
                                </span>
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-white">{lesson.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    20-30 минут
                                </span>
                                <span className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    100 XP за завершение дня
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                onClick={() => hasPrev && onNavigate(lesson.day - 1)}
                                disabled={!hasPrev}
                                className={`btn-neon-outline flex items-center gap-2 px-4 py-2 ${!hasPrev ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Назад
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                onClick={() => hasNext && onNavigate(lesson.day + 1)}
                                disabled={!hasNext}
                                className={`btn-neon flex items-center gap-2 px-4 py-2 ${!hasNext ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                Далее
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!currentContent && !isLoading ? (
                        <motion.div
                            key="generate"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass rounded-[2rem] p-12 text-center"
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700">
                                <Sparkles className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="mb-3 text-2xl font-bold text-white">Урок ещё не подготовлен</h2>
                            <p className="mx-auto mb-8 max-w-md text-gray-400">
                                Сначала сгенерируем теорию и задачи по теме «{lesson.title}», а затем ты сможешь
                                проходить день в своём темпе.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => void handleGenerate()}
                                className="btn-neon mx-auto flex items-center gap-3 px-8 py-4 text-lg"
                            >
                                <Sparkles className="h-5 w-5" />
                                Сгенерировать урок
                            </motion.button>
                        </motion.div>
                    ) : isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass rounded-[2rem] p-12 text-center"
                        >
                            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-vibe-400" />
                            <h2 className="mb-2 text-xl font-bold text-white">Готовим урок</h2>
                            <p className="text-gray-400">
                                AI собирает теорию и практику для этого дня. Обычно это занимает совсем немного времени.
                            </p>
                        </motion.div>
                    ) : currentContent ? (
                        <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-4 space-y-3">
                                {error && (
                                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                                        {error}
                                    </div>
                                )}

                                {currentContent.source === 'demo' && (
                                    <div className="flex flex-col gap-3 rounded-2xl border border-vibe-500/30 bg-vibe-500/10 p-4 text-sm text-vibe-100 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            Сейчас показан demo-урок, чтобы ты не терял время из-за сбоя генерации.
                                            Можно спокойно продолжать, а затем повторить AI-генерацию.
                                        </div>
                                        <button
                                            onClick={() => void handleGenerate(true)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-vibe-400/40 px-4 py-2 text-sm font-medium text-white hover:bg-vibe-500/20"
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                            Повторить AI-генерацию
                                        </button>
                                    </div>
                                )}

                                {!access.canAccessPaidFeatures ? (
                                    <div className="flex flex-col gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            Бесплатный режим: один трек, первые {FREE_TRACK_DAY_LIMIT} дня и до {FREE_DAILY_HINT_LIMIT} AI hints в день.
                                            {remainingHints !== null ? ` Осталось hints сегодня: ${remainingHints}.` : ''}
                                        </div>
                                        <span className="rounded-full border border-amber-200/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                                            Free
                                        </span>
                                    </div>
                                ) : null}

                                {(hintError || reviewError) && (
                                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                                        {[hintError, reviewError].filter(Boolean).join(' ')}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-8 xl:flex-row">
                                <div className="min-w-0 flex-1">
                                    <div className="glass rounded-[2rem] p-8">
                                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                                            <BookOpen className="h-5 w-5 text-vibe-400" />
                                            Теория
                                        </h2>
                                        <div className="prose prose-invert max-w-none">
                                            <LessonMarkdown content={currentContent.theory} />
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                        className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <p className="text-sm text-gray-400">
                                            {lessonCompleted
                                                ? 'Этот день уже завершён.'
                                                : canCompleteLesson
                                                    ? 'Все задачи закрыты. Можно завершить день.'
                                                    : 'Сначала закрой все задачи, затем завершай урок.'}
                                        </p>

                                        <motion.button
                                            whileHover={{ scale: lessonCompleted || !canCompleteLesson ? 1 : 1.05 }}
                                            whileTap={{ scale: lessonCompleted || !canCompleteLesson ? 1 : 0.95 }}
                                            className={`flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-medium ${
                                                lessonCompleted
                                                    ? 'cursor-default bg-green-500/20 text-green-300'
                                                    : canCompleteLesson
                                                        ? 'btn-neon'
                                                        : 'cursor-not-allowed bg-gray-700 text-gray-500'
                                            }`}
                                            onClick={() => void handleLessonComplete()}
                                            disabled={lessonCompleted || !canCompleteLesson}
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            {lessonCompleted ? 'Урок завершён' : 'Завершить урок'}
                                        </motion.button>
                                    </motion.div>
                                </div>

                                <div className="w-full flex-shrink-0 xl:w-96">
                                    <div className="sticky top-8 space-y-4">
                                        {resumeTask && !selectedTask && (
                                            <div className="rounded-2xl border border-vibe-500/30 bg-vibe-500/10 p-4">
                                                <p className="mb-2 text-sm font-semibold text-white">Можно продолжить с того места, где ты остановился</p>
                                                <p className="mb-3 text-sm text-vibe-100">
                                                    Открыт черновик по задаче «{resumeTask.title}».
                                                </p>
                                                <button
                                                    onClick={() => handleOpenTask(resumeTask)}
                                                    className="rounded-xl bg-vibe-500 px-4 py-2 text-sm font-medium text-white hover:bg-vibe-600"
                                                >
                                                    Продолжить задачу
                                                </button>
                                            </div>
                                        )}

                                        <div className="glass rounded-2xl border border-vibe-500/20 p-6">
                                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                                <Target className="h-5 w-5 text-vibe-400" />
                                                Задачи
                                                <span className="ml-auto text-sm font-normal text-gray-400">
                                                    {completedTaskIds.length}/{currentContent.tasks.length}
                                                </span>
                                            </h2>

                                            <div className="mb-4 h-2 overflow-hidden rounded-full bg-dark-700">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${(completedTaskIds.length / currentContent.tasks.length) * 100}%`,
                                                    }}
                                                    className="h-full rounded-full bg-gradient-to-r from-vibe-500 to-vibe-400"
                                                />
                                            </div>

                                            <div className="max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto pr-2">
                                                {currentContent.tasks.map((task, index) => {
                                                    const isCompleted = completedTaskIds.includes(task.id);
                                                    const isActive = selectedTaskId === task.id;

                                                    return (
                                                        <motion.button
                                                            key={task.id}
                                                            type="button"
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.08 }}
                                                            className={`w-full rounded-xl p-4 text-left transition-all ${
                                                                isCompleted
                                                                    ? 'border border-green-500/30 bg-green-500/10'
                                                                    : isActive
                                                                        ? 'border border-vibe-500/40 bg-vibe-500/10'
                                                                        : 'border border-transparent bg-dark-700/50 hover:border-vibe-500/30 hover:bg-dark-700'
                                                            }`}
                                                            onClick={() => handleOpenTask(task)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${
                                                                        isCompleted ? 'bg-green-500/20' : 'bg-vibe-500/20'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-vibe-400">{index + 1}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="mb-1 flex items-center gap-2">
                                                                        <h3 className={`truncate text-sm font-medium ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                                                                            {task.title}
                                                                        </h3>
                                                                        <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${getDifficultyStyles(task.difficulty)}`}>
                                                                            {getDifficultyLabel(task.difficulty)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="line-clamp-2 text-xs text-gray-400">{task.description}</p>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {selectedTask && (
                <TaskEditor
                    key={selectedTask.id}
                    task={selectedTask}
                    language={course.name}
                    code={selectedTaskCode}
                    hint={selectedTaskHint}
                    review={selectedTaskReview}
                    canComplete={selectedTaskCanComplete && !isSubmittingTask}
                    isHintLoading={isHintLoading}
                    isReviewLoading={isReviewLoading || isSubmittingTask}
                    isHintDisabled={hintLocked}
                    hintDisabledReason={
                        hintLocked
                            ? `Лимит бесплатных AI hints на сегодня исчерпан. Завтра он обновится, либо можно открыть Pro и снять лимит.`
                            : undefined
                    }
                    onCodeChange={handleCodeChange}
                    onClose={() => setSelectedTaskId(null)}
                    onReset={handleResetTask}
                    onRequestHint={handleRequestHint}
                    onRequestReview={handleRequestReview}
                    onComplete={handleTaskComplete}
                />
            )}
        </div>
    );
}

