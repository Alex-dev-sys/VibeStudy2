import { useMemo, useRef, useState } from 'react';
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
    python: 'A confident first track for automation, backend basics, and practical scripting.',
    javascript: 'A product-focused path into interfaces, browser logic, and modern web work.',
    go: 'A clean backend track for concurrency, APIs, and performance-minded services.',
    csharp: 'A practical .NET route for apps, services, and structured backend development.',
};

function formatTrackName(trackId: string | null | undefined) {
    if (!trackId) {
        return 'your selected track';
    }

    return getCourseById(trackId)?.name ?? trackId;
}

function getDifficultyLabel(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'Easy';
    if (difficulty === 'medium') return 'Core';
    return 'Hard';
}

function getDifficultyStyles(difficulty: GeneratedTask['difficulty']) {
    if (difficulty === 'easy') return 'bg-secondary/12 text-cyan-100 border border-secondary/20';
    if (difficulty === 'medium') return 'bg-primary/12 text-primary border border-primary/20';
    return 'bg-rose-400/15 text-rose-200 border border-rose-300/20';
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
    const currentLesson = course.lessons.find((entry) => entry.day === currentDay);

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
    const selectedTrackName = formatTrackName(selectedTrack);

    return (
        <div className="px-8 py-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[130px]" />

                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="eyebrow">Learning tracks</div>
                            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                Daily tracks designed to feel like a premium product, not a content dump.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                Each track moves in short daily steps: theory, coding work, AI support, and a saved
                                session you can return to without losing momentum.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="metric-chip">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    3 launch tracks
                                </span>
                                <span className="metric-chip">
                                    <Clock className="h-4 w-4 text-cyan-300" />
                                    20-30 min sessions
                                </span>
                                <span className="metric-chip">
                                    <Zap className="h-4 w-4 text-secondary" />
                                    AI theory + tasks
                                </span>
                            </div>
                        </div>

                        <div className="surface-premium-soft flex flex-col justify-between p-6">
                            <div>
                                <div className="eyebrow">Access model</div>
                                <p className="mt-4 text-2xl font-semibold text-white">
                                    {access.canAccessPaidFeatures ? 'Pro access is active' : 'Free mode stays honest'}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                    {access.canAccessPaidFeatures
                                        ? 'Every track and every day is open. Use this page like a launchpad and keep moving.'
                                        : `Right now the product keeps one real track open: ${selectedTrackName}. Upgrade when you want the full catalog.`}
                                </p>
                            </div>

                            {!access.canAccessPaidFeatures ? (
                                <div className="mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-slate-100">
                                    Free access opens one chosen track and the first {FREE_TRACK_DAY_LIMIT} days. The
                                    rest is clearly marked, not hidden behind a broken flow.
                                </div>
                            ) : (
                                <div className="mt-6 rounded-[1.4rem] border border-secondary/20 bg-secondary/10 px-4 py-4 text-sm text-cyan-100">
                                    Pro unlocks every track, deeper lesson days, and unlimited AI guidance.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {courses.map((course, index) => {
                        const isLocked = !canAccessTrack(access, selectedTrack, course.id);
                        const isChosenTrack = selectedTrack === course.id;

                        return (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06 }}
                            >
                                <Link
                                    to={isLocked ? '#' : `/lessons/${course.id}`}
                                    className={isLocked ? 'pointer-events-none block' : 'block'}
                                >
                                    <motion.article
                                        whileHover={!isLocked ? { y: -6 } : {}}
                                        className={`relative h-full overflow-hidden rounded-[2rem] border p-6 transition ${
                                            isLocked
                                                ? 'border-primary/15 bg-white/[0.03] opacity-70'
                                                : 'border-white/10 bg-white/[0.045] shadow-[0_18px_60px_rgba(0,0,0,0.28)]'
                                        }`}
                                    >
                                        <div
                                            className="absolute right-0 top-0 h-36 w-36 rounded-full blur-[90px]"
                                            style={{ backgroundColor: `${course.color}30` }}
                                        />

                                        <div className="relative z-10">
                                            <div className="mb-5 flex items-start justify-between gap-4">
                                                <div
                                                    className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-3xl shadow-[0_12px_35px_rgba(0,0,0,0.18)]"
                                                    style={{ backgroundColor: `${course.color}20` }}
                                                >
                                                    {course.icon}
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    {isChosenTrack ? (
                                                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                                            Selected
                                                        </span>
                                                    ) : null}
                                                    {isLocked ? (
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                            <Lock className="h-3.5 w-3.5" />
                                                            Pro
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                                            Open
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-semibold text-white">{course.name}</h2>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                                {courseCopy[course.id] ?? 'A structured daily path with a practical rhythm and saved progress.'}
                                            </p>

                                            <div className="mt-6 grid grid-cols-2 gap-3">
                                                <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Length</p>
                                                    <p className="mt-1 text-sm font-semibold text-white">{course.totalDays} days</p>
                                                </div>
                                                <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Reward</p>
                                                    <p className="mt-1 text-sm font-semibold text-white">{course.totalDays * 100} XP</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            </motion.div>
                        );
                    })}
                </section>
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
    const progressPercent = Math.round((completedDays.length / course.totalDays) * 100);

    if (trackLocked) {
        return (
            <div className="px-8 py-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <Link to="/lessons" className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                        Back to tracks
                    </Link>

                    <Paywall
                        title="This track is part of Pro"
                        reason={`Free mode keeps one track open at a time. ${formatTrackName(selectedTrack)} is active right now, while ${course.name} belongs to the paid catalog.`}
                        subtitle="The product already gave the first real value. Opening every track and the longer learning arcs happens through the Pro upgrade."
                        compact
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 py-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div
                        className="absolute right-0 top-0 h-72 w-72 rounded-full blur-[120px]"
                        style={{ backgroundColor: `${course.color}25` }}
                    />

                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <Link to="/lessons" className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                                Back to tracks
                            </Link>

                            <div className="mt-6 flex items-center gap-4">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-3xl"
                                    style={{ backgroundColor: `${course.color}20` }}
                                >
                                    {course.icon}
                                </div>
                                <div>
                                    <div className="eyebrow">{course.name} track</div>
                                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{course.totalDays}-day journey</h1>
                                </div>
                            </div>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                Move in small daily steps, keep the session state, and unlock the next day only when the
                                track rhythm stays honest.
                            </p>

                            {!access.canAccessPaidFeatures ? (
                                <div className="mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-slate-100">
                                    Free mode opens the first {FREE_TRACK_DAY_LIMIT} days of this track. Later days stay
                                    visible, but clearly marked as Pro.
                                </div>
                            ) : null}
                        </div>

                        <div className="surface-premium-soft p-6">
                            <div className="eyebrow">Track signal</div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Completed</p>
                                    <p className="mt-2 text-3xl font-semibold text-white">{completedDays.length}</p>
                                    <p className="mt-1 text-sm text-slate-300">saved lesson days</p>
                                </div>
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Coverage</p>
                                    <p className="mt-2 text-3xl font-semibold text-white">{progressPercent}%</p>
                                    <p className="mt-1 text-sm text-slate-300">of this track finished</p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="mb-3 flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Track progress</span>
                                    <span className="font-semibold text-white">
                                        {completedDays.length}/{course.totalDays} days
                                    </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(completedDays.length / course.totalDays) * 100}%` }}
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#7C5CFF_0%,#07C6EF_100%)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {course.lessons.map((entry, index) => {
                        const isCompleted = completedDays.includes(entry.day);
                        const isProgressLocked = entry.day > completedDays.length + 1;
                        const isPlanLocked = !access.canAccessPaidFeatures && entry.day > FREE_TRACK_DAY_LIMIT;
                        const isLocked = isProgressLocked || isPlanLocked;
                        const isCurrent = entry.day === completedDays.length + 1;

                        return (
                            <motion.div
                                key={entry.day}
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.025 }}
                            >
                                <Link
                                    to={isLocked ? '#' : `/lessons/${course.id}/${entry.day}`}
                                    className={isLocked ? 'pointer-events-none block' : 'block'}
                                >
                                    <motion.article
                                        whileHover={!isLocked ? { y: -4 } : {}}
                                        className={`h-full rounded-[1.7rem] border p-5 transition ${
                                            isLocked
                                                ? 'border-white/6 bg-white/[0.03] opacity-55'
                                                : isCurrent
                                                    ? 'border-primary/35 bg-primary/10 shadow-[0_18px_50px_rgba(124,92,255,0.14)]'
                                                    : isCompleted
                                                        ? 'border-secondary/20 bg-secondary/10'
                                                        : 'border-white/10 bg-white/[0.045]'
                                        }`}
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Day {entry.day}</span>
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                                            ) : isLocked ? (
                                                <Lock className="h-5 w-5 text-slate-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-primary" />
                                            )}
                                        </div>

                                        <h2 className="text-base font-semibold text-white">{entry.title}</h2>
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{entry.topics.join(' • ')}</p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {isPlanLocked ? (
                                                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                    Pro
                                                </span>
                                            ) : isCurrent ? (
                                                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                    Up next
                                                </span>
                                            ) : isCompleted ? (
                                                <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                                    Done
                                                </span>
                                            ) : null}
                                        </div>
                                    </motion.article>
                                </Link>
                            </motion.div>
                        );
                    })}
                </section>
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
            ? `Free mode keeps one selected track open. ${formatTrackName(selectedTrack)} is active right now, and ${course.name} belongs to the paid catalog.`
            : `Free mode opens only the first ${FREE_TRACK_DAY_LIMIT} days of the selected track. Day ${lesson.day} is already part of Pro.`;

        return (
            <div className="px-8 py-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to track days
                    </button>

                    <Paywall
                        title={!trackAllowed ? 'All tracks are unlocked in Pro' : 'The next lesson days are unlocked in Pro'}
                        reason={reason}
                        subtitle="Free mode is supposed to prove real value first. The longer lesson path opens through a clean premium upgrade."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 py-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div
                        className="absolute right-0 top-0 h-72 w-72 rounded-full blur-[120px]"
                        style={{ backgroundColor: `${course.color}24` }}
                    />
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />

                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <button
                                type="button"
                                onClick={onBack}
                                className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to track days
                            </button>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <span
                                    className="rounded-full px-3 py-1 text-sm font-medium"
                                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                                >
                                    {course.name}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                                    Day {lesson.day}/{course.totalDays}
                                </span>
                                {lessonCompleted ? (
                                    <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm text-cyan-100">
                                        Completed
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white lg:text-5xl">
                                {lesson.title}
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                A premium lesson surface with theory, coding tasks, saved drafts, and a progress loop
                                that stays honest.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="metric-chip">
                                    <Clock className="h-4 w-4 text-cyan-300" />
                                    20-30 min session
                                </span>
                                <span className="metric-chip">
                                    <Zap className="h-4 w-4 text-primary" />
                                    100 XP when the day is complete
                                </span>
                                <span className="metric-chip">
                                    <Target className="h-4 w-4 text-secondary" />
                                    {lesson.topics.length} key topics
                                </span>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {lesson.topics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="surface-premium-soft flex flex-col gap-5 p-6">
                            <div>
                                <div className="eyebrow">Lesson controls</div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4">
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Hints left</p>
                                        <p className="mt-2 text-3xl font-semibold text-white">
                                            {remainingHints === null ? '∞' : remainingHints}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {access.canAccessPaidFeatures ? 'Pro mode' : 'free budget today'}
                                        </p>
                                    </div>
                                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4">
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">State</p>
                                        <p className="mt-2 text-3xl font-semibold text-white">
                                            {currentContent ? completedTaskIds.length : 0}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {currentContent ? `of ${currentContent.tasks.length} tasks done` : 'tasks solved'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row">
                                <motion.button
                                    whileHover={{ scale: hasPrev ? 1.03 : 1 }}
                                    whileTap={{ scale: hasPrev ? 0.97 : 1 }}
                                    onClick={() => hasPrev && onNavigate(lesson.day - 1)}
                                    disabled={!hasPrev}
                                    className={`btn-neon-outline flex flex-1 items-center justify-center gap-2 px-4 py-3 ${
                                        !hasPrev ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: hasNext ? 1.03 : 1 }}
                                    whileTap={{ scale: hasNext ? 0.97 : 1 }}
                                    onClick={() => hasNext && onNavigate(lesson.day + 1)}
                                    disabled={!hasNext}
                                    className={`btn-neon flex flex-1 items-center justify-center gap-2 px-4 py-3 ${
                                        !hasNext ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </motion.button>
                            </div>

                            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-300">
                                {lessonCompleted
                                    ? 'This lesson day is already complete. You can still reopen any task and review the notes.'
                                    : currentContent
                                        ? 'Use theory on the left and tasks on the right. Finish every task before closing the lesson day.'
                                        : 'Generate the lesson first to load theory, tasks, and the session state for this day.'}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    {!currentContent && !isLoading ? (
                        <motion.section
                            key="generate"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -18 }}
                            className="surface-premium overflow-hidden p-10 text-center lg:p-14"
                        >
                            <div className="mx-auto flex max-w-2xl flex-col items-center">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,#7C5CFF_0%,#07C6EF_100%)] shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
                                    <Sparkles className="h-9 w-9 text-white" />
                                </div>
                                <div className="eyebrow">Prepare the lesson</div>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                    Build today&apos;s theory and task session for {lesson.title}.
                                </h2>
                                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                                    The product generates the learning surface first, then keeps your drafts, hints,
                                    and task reviews tied to this day.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => void handleGenerate()}
                                    className="btn-neon mt-8 inline-flex items-center gap-3 px-8 py-4 text-lg"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Generate lesson
                                </motion.button>
                            </div>
                        </motion.section>
                    ) : isLoading ? (
                        <motion.section
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="surface-premium p-12 text-center"
                        >
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                            <h2 className="mt-5 text-2xl font-bold text-white">Building the lesson surface</h2>
                            <p className="mt-3 text-base text-slate-300">
                                AI is preparing theory, tasks, and the session structure for this day.
                            </p>
                        </motion.section>
                    ) : currentContent ? (
                        <motion.div key="content" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="space-y-3">
                                {error ? (
                                    <div className="rounded-[1.4rem] border border-error/20 bg-error/10 px-5 py-4 text-sm text-rose-100">
                                        {error}
                                    </div>
                                ) : null}

                                {currentContent.source === 'demo' ? (
                                    <div className="flex flex-col gap-3 rounded-[1.4rem] border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-50 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            Demo content is on screen so the learning flow does not stall if live
                                            generation fails. You can keep working, then retry AI generation when ready.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => void handleGenerate(true)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 px-4 py-2 font-medium text-white transition hover:bg-white/10"
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                            Retry live AI generation
                                        </button>
                                    </div>
                                ) : null}

                                {!access.canAccessPaidFeatures ? (
                                    <div className="flex flex-col gap-2 rounded-[1.4rem] border border-primary/20 bg-primary/10 px-5 py-4 text-sm text-slate-100 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            Free mode keeps one track, the first {FREE_TRACK_DAY_LIMIT} days, and up to{' '}
                                            {FREE_DAILY_HINT_LIMIT} AI hints per day.
                                            {remainingHints !== null ? ` ${remainingHints} hints left today.` : ''}
                                        </div>
                                        <span className="rounded-full border border-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                            Free
                                        </span>
                                    </div>
                                ) : null}

                                {hintError || reviewError ? (
                                    <div className="rounded-[1.4rem] border border-error/20 bg-error/10 px-5 py-4 text-sm text-rose-100">
                                        {[hintError, reviewError].filter(Boolean).join(' ')}
                                    </div>
                                ) : null}
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
                                <div className="space-y-6">
                                    <article className="surface-premium p-8">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="eyebrow">Theory</div>
                                                <h2 className="mt-2 text-2xl font-semibold text-white">Lesson notes</h2>
                                            </div>
                                        </div>

                                        <div className="prose prose-invert max-w-none">
                                            <LessonMarkdown content={currentContent.theory} />
                                        </div>
                                    </article>

                                    <article className="surface-premium-soft p-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <div className="eyebrow">Completion gate</div>
                                                <p className="mt-3 text-lg font-semibold text-white">
                                                    {lessonCompleted
                                                        ? 'This lesson day is already complete.'
                                                        : canCompleteLesson
                                                            ? 'Every task is done. You can close the day now.'
                                                            : 'Finish every task before you close the lesson day.'}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    XP and lesson completion stay honest: a lesson only closes after the
                                                    full task set is done.
                                                </p>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: lessonCompleted || !canCompleteLesson ? 1 : 1.03 }}
                                                whileTap={{ scale: lessonCompleted || !canCompleteLesson ? 1 : 0.97 }}
                                                onClick={() => void handleLessonComplete()}
                                                disabled={lessonCompleted || !canCompleteLesson}
                                                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold transition ${
                                                    lessonCompleted
                                                        ? 'cursor-default border border-secondary/20 bg-secondary/10 text-cyan-100'
                                                        : canCompleteLesson
                                                            ? 'btn-neon'
                                                            : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
                                                }`}
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                                {lessonCompleted ? 'Lesson complete' : 'Complete lesson day'}
                                            </motion.button>
                                        </div>
                                    </article>
                                </div>
                                <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
                                    {resumeTask && !selectedTask ? (
                                        <div className="rounded-[1.6rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                                            <div className="eyebrow">Resume session</div>
                                            <p className="mt-3 text-base font-semibold text-white">
                                                Pick up exactly where you stopped.
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-cyan-50">
                                                There is already a saved draft for “{resumeTask.title}”.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenTask(resumeTask)}
                                                className="mt-4 rounded-xl border border-cyan-200/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                                            >
                                                Continue task
                                            </button>
                                        </div>
                                    ) : null}

                                    <div className="surface-premium-soft p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                                                <Target className="h-5 w-5 text-cyan-200" />
                                            </div>
                                            <div>
                                                <div className="eyebrow">Tasks</div>
                                                <h2 className="mt-2 text-xl font-semibold text-white">
                                                    {completedTaskIds.length}/{currentContent.tasks.length} complete
                                                </h2>
                                            </div>
                                        </div>

                                        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(completedTaskIds.length / currentContent.tasks.length) * 100}%`,
                                                }}
                                                className="h-full rounded-full bg-[linear-gradient(90deg,#07C6EF_0%,#7C5CFF_100%)]"
                                            />
                                        </div>

                                        <div className="max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto pr-1">
                                            {currentContent.tasks.map((task, index) => {
                                                const isCompleted = completedTaskIds.includes(task.id);
                                                const isActive = selectedTaskId === task.id;

                                                return (
                                                    <motion.button
                                                        key={task.id}
                                                        type="button"
                                                        initial={{ opacity: 0, x: 14 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        onClick={() => handleOpenTask(task)}
                                                        className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                                                            isCompleted
                                                                ? 'border-secondary/20 bg-secondary/10'
                                                                : isActive
                                                                    ? 'border-primary/25 bg-primary/10'
                                                                    : 'border-white/10 bg-black/15 hover:border-cyan-300/20 hover:bg-white/[0.05]'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl ${
                                                                    isCompleted ? 'bg-secondary/12' : 'bg-white/10'
                                                                }`}
                                                            >
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-cyan-100" />
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-white">{index + 1}</span>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <h3 className={`truncate text-sm font-semibold ${isCompleted ? 'text-cyan-100' : 'text-white'}`}>
                                                                        {task.title}
                                                                    </h3>
                                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getDifficultyStyles(task.difficulty)}`}>
                                                                        {getDifficultyLabel(task.difficulty)}
                                                                    </span>
                                                                </div>
                                                                <p className="line-clamp-2 text-xs leading-5 text-slate-300">
                                                                    {task.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {selectedTask ? (
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
                            ? 'The free AI hint budget for today is exhausted. It resets tomorrow, or you can unlock Pro and remove the cap.'
                            : undefined
                    }
                    onCodeChange={handleCodeChange}
                    onClose={() => setSelectedTaskId(null)}
                    onReset={handleResetTask}
                    onRequestHint={handleRequestHint}
                    onRequestReview={handleRequestReview}
                    onComplete={handleTaskComplete}
                />
            ) : null}
        </div>
    );
}
