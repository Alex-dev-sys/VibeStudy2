import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    Code2,
    Flame,
    Play,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import { courses } from '../data/courses';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/useProgressStore';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { identifyAnalyticsUser, trackEvent } from '../lib/analytics';

type CourseMeta = {
    subtitle: string;
    accent: string;
    ring: string;
    hint: string;
};

type TrackSnapshot = {
    id: string;
    name: string;
    subtitle: string;
    accent: string;
    ring: string;
    completedLessons: number;
    completedTasks: number;
    currentDay: number;
    totalDays: number;
    progressPercent: number;
    href: string;
    started: boolean;
};

const courseMeta: Record<string, CourseMeta> = {
    python: {
        subtitle: 'Автоматизация, backend и рабочие скрипты',
        accent: 'from-sky-500 to-cyan-400',
        ring: 'border-sky-400/30',
        hint: 'Быстрый старт для automation и backend-задач',
    },
    javascript: {
        subtitle: 'Фронтенд, браузер и прикладная логика',
        accent: 'from-amber-400 to-orange-500',
        ring: 'border-amber-400/30',
        hint: 'Сильный выбор, если цель — web и быстрый вход в разработку',
    },
    go: {
        subtitle: 'Сервисы, concurrency и производительность',
        accent: 'from-cyan-500 to-teal-400',
        ring: 'border-cyan-400/30',
        hint: 'Подходит для backend и системного мышления',
    },
    csharp: {
        subtitle: '.NET, backend и прикладная разработка',
        accent: 'from-fuchsia-500 to-violet-500',
        ring: 'border-fuchsia-400/30',
        hint: 'Хороший трек для .NET и прикладных сервисов',
    },
};

function getGreeting(hour: number) {
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
}

function getFirstName(fullName: string | null | undefined) {
    if (!fullName) {
        return 'Разработчик';
    }

    return fullName.trim().split(/\s+/)[0] || 'Разработчик';
}

export default function Home() {
    const { user, profile } = useAuthStore();
    const { courseProgress, completedTasks } = useProgressStore();
    const { completedAt, syncUser } = useOnboardingStore();
    const hasTrackedSignupRef = useRef(false);
    const onboardingCompletedRef = useRef<string | null>(null);

    const totalXp = profile?.total_xp ?? 0;
    const streak = profile?.current_streak ?? 0;
    const level = profile?.level ?? 1;
    const activeTracks = Object.keys(courseProgress).length;
    const completedLessons = Object.values(courseProgress).reduce(
        (sum, progress) => sum + progress.completed_days.length,
        0
    );
    const completedTaskCount = completedTasks.length;
    const hasAnyProgress =
        totalXp > 0 ||
        streak > 0 ||
        activeTracks > 0 ||
        completedLessons > 0 ||
        completedTaskCount > 0;

    useEffect(() => {
        if (user?.id) {
            syncUser(user.id);
        }
    }, [syncUser, user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        identifyAnalyticsUser(user.id, {
            email: user.email ?? null,
            level: profile?.level ?? 1,
        });

        if (!hasTrackedSignupRef.current) {
            trackEvent('signup_completed', {
                method: 'supabase_auth',
            });
            hasTrackedSignupRef.current = true;
        }
    }, [profile?.level, user?.email, user?.id]);

    useEffect(() => {
        if (!user?.id || !completedAt || onboardingCompletedRef.current === completedAt) {
            return;
        }

        onboardingCompletedRef.current = completedAt;
        trackEvent('onboarding_completed', {
            userId: user.id,
        });
    }, [completedAt, user?.id]);

    const shouldShowOnboarding = Boolean(user?.id) && !hasAnyProgress && !completedAt;
    const userName = getFirstName(profile?.full_name);
    const greeting = getGreeting(new Date().getHours());
    const xpToNextLevel = Math.max(0, level * 1000 - totalXp);

    const trackSnapshots: TrackSnapshot[] = courses
        .filter((course) => courseMeta[course.id])
        .slice(0, 4)
        .map((course) => {
            const progress = courseProgress[course.id];
            const completedCount = progress?.completed_days.length ?? 0;
            const started = Boolean(progress);
            const currentDay = Math.min(progress?.current_day ?? 1, course.totalDays);
            const totalCourseTasks = completedTasks.filter((task) => task.course_id === course.id).length;
            const meta = courseMeta[course.id];

            return {
                id: course.id,
                name: course.name,
                subtitle: meta.subtitle,
                accent: meta.accent,
                ring: meta.ring,
                completedLessons: completedCount,
                completedTasks: totalCourseTasks,
                currentDay,
                totalDays: course.totalDays,
                progressPercent: Math.round((completedCount / course.totalDays) * 100),
                href: started ? `/lessons/${course.id}/${currentDay}` : `/lessons/${course.id}`,
                started,
            };
        });

    const featuredTrack =
        [...trackSnapshots]
            .filter((track) => track.started)
            .sort((left, right) => {
                if (right.completedLessons !== left.completedLessons) {
                    return right.completedLessons - left.completedLessons;
                }

                return right.completedTasks - left.completedTasks;
            })[0] ?? null;

    const stats = [
        {
            icon: Zap,
            label: 'Всего XP',
            value: totalXp.toLocaleString('ru-RU'),
            detail: `Уровень ${level}`,
            accent: 'from-yellow-400 to-orange-500',
        },
        {
            icon: Flame,
            label: 'Серия',
            value: `${streak}`,
            detail: streak > 0 ? 'дней подряд' : 'начни сегодня',
            accent: 'from-orange-500 to-rose-500',
        },
        {
            icon: BookOpen,
            label: 'Уроков пройдено',
            value: `${completedLessons}`,
            detail: `${completedTaskCount} задач выполнено`,
            accent: 'from-emerald-400 to-green-500',
        },
        {
            icon: Trophy,
            label: 'Активных треков',
            value: `${activeTracks}`,
            detail: hasAnyProgress ? 'сохранено в аккаунте' : 'пока пусто',
            accent: 'from-vibe-400 to-vibe-600',
        },
    ];

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)]" />

            <div className="mx-auto max-w-7xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
                >
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-vibe-400/20 bg-vibe-500/10 px-3 py-1 text-sm text-vibe-200">
                            <Sparkles className="h-4 w-4" />
                            Домашний экран показывает только реальные данные
                        </p>
                        <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                            {greeting}, <span className="text-gradient">{userName}</span>
                        </h1>
                        <p className="text-base text-gray-300 lg:text-lg">
                            Здесь больше нет выдуманных достижений и ложной активности. Если аккаунт новый, продукт
                            даёт onboarding и честный старт вместо красивой, но пустой витрины.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                            <Flame className="h-5 w-5 text-orange-400" />
                            <div>
                                <p className="text-sm text-gray-400">Серия</p>
                                <p className="font-semibold text-white">{streak} дней подряд</p>
                            </div>
                        </div>
                        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <div>
                                <p className="text-sm text-gray-400">Уровень</p>
                                <p className="font-semibold text-white">{level}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover group relative overflow-hidden rounded-3xl p-5"
                        >
                            <div
                                className={`absolute right-0 top-0 h-28 w-28 bg-gradient-to-br ${stat.accent} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
                            />
                            <div
                                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent}`}
                            >
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                            <p className="mt-1 text-xs text-vibe-300">{stat.detail}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {shouldShowOnboarding ? (
                            <OnboardingFlow userId={user!.id} userName={userName} />
                        ) : (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass relative overflow-hidden rounded-[2rem] p-6 lg:p-8"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_35%)]" />
                                <div className="relative z-10">
                                    {featuredTrack ? (
                                        <>
                                            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="max-w-2xl">
                                                    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-vibe-300">
                                                        <BookOpen className="h-4 w-4" />
                                                        Продолжить обучение
                                                    </p>
                                                    <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">
                                                        {featuredTrack.name}: день {featuredTrack.currentDay}
                                                    </h2>
                                                    <p className="text-gray-300">{featuredTrack.subtitle}</p>
                                                </div>

                                                <Link to={featuredTrack.href}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="btn-neon inline-flex items-center gap-2 px-5 py-3"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Продолжить
                                                    </motion.div>
                                                </Link>
                                            </div>

                                            <div className="mb-6 grid gap-3 md:grid-cols-3">
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Прогресс по треку</p>
                                                    <p className="mt-1 text-xl font-semibold text-white">
                                                        {featuredTrack.completedLessons} / {featuredTrack.totalDays} уроков
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Решено задач</p>
                                                    <p className="mt-1 text-xl font-semibold text-white">
                                                        {featuredTrack.completedTasks}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Следующий шаг</p>
                                                    <p className="mt-1 text-xl font-semibold text-white">
                                                        Урок {featuredTrack.currentDay}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="text-gray-400">Заполнение трека</span>
                                                    <span className="font-medium text-white">
                                                        {featuredTrack.progressPercent}%
                                                    </span>
                                                </div>
                                                <div className="h-3 overflow-hidden rounded-full bg-dark-700">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${featuredTrack.progressPercent}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${featuredTrack.accent}`}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-vibe-300">
                                                <Target className="h-4 w-4" />
                                                Честный старт
                                            </p>
                                            <h2 className="mb-3 text-2xl font-bold text-white lg:text-3xl">
                                                Здесь пока нет начатого трека
                                            </h2>
                                            <p className="max-w-2xl text-gray-300">
                                                Onboarding уже пройден, но фактический прогресс ещё не появился. Как
                                                только начнёшь урок и решишь первую задачу, здесь покажется реальная
                                                динамика по аккаунту.
                                            </p>

                                            <div className="my-6 grid gap-3 md:grid-cols-3">
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Шаг 1</p>
                                                    <p className="mt-1 font-semibold text-white">Открой выбранный трек</p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Шаг 2</p>
                                                    <p className="mt-1 font-semibold text-white">Пройди день 1</p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="text-sm text-gray-400">Шаг 3</p>
                                                    <p className="mt-1 font-semibold text-white">Реши первую задачу</p>
                                                </div>
                                            </div>

                                            <Link to="/lessons">
                                                <motion.div
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="btn-neon inline-flex items-center gap-2 px-5 py-3"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Перейти к урокам
                                                </motion.div>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.section>
                        )}

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Треки для обучения</h3>
                                    <p className="text-sm text-gray-400">
                                        Каждый блок ниже показывает только реальное состояние по твоему аккаунту.
                                    </p>
                                </div>
                                <Link
                                    to="/lessons"
                                    className="inline-flex items-center gap-1 text-sm text-vibe-300 transition-colors hover:text-vibe-200"
                                >
                                    Все уроки <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {trackSnapshots.map((track, index) => (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 + index * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        className={`group rounded-[1.75rem] border ${track.ring} bg-dark-800/60 p-5`}
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <div
                                                    className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${track.accent} px-3 py-1 text-sm font-semibold text-white`}
                                                >
                                                    {track.name}
                                                </div>
                                                <p className="text-sm text-gray-300">{track.subtitle}</p>
                                            </div>
                                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                                                {track.started ? `${track.progressPercent}%` : 'Новый'}
                                            </span>
                                        </div>

                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Уроки</span>
                                                <span className="text-white">
                                                    {track.completedLessons} / {track.totalDays}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-dark-700">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${track.accent}`}
                                                    style={{ width: `${track.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-5 flex items-center justify-between text-sm">
                                            <span className="text-gray-400">
                                                {track.started
                                                    ? `Сейчас открыт день ${track.currentDay}`
                                                    : courseMeta[track.id]?.hint}
                                            </span>
                                            <span className="text-vibe-300">{track.completedTasks} задач</span>
                                        </div>

                                        <Link to={track.href}>
                                            <div className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-vibe-200">
                                                {track.started ? 'Продолжить трек' : 'Начать трек'}
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    <div className="space-y-6">
                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <h3 className="mb-4 text-lg font-bold text-white">Статус аккаунта</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <span className="text-sm text-gray-400">Профиль</span>
                                    <span className="font-medium text-white">
                                        {profile?.full_name ? 'заполнен' : 'минимальный'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <span className="text-sm text-gray-400">XP до следующего уровня</span>
                                    <span className="font-medium text-white">{xpToNextLevel}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <span className="text-sm text-gray-400">Последний реальный результат</span>
                                    <span className="font-medium text-white">
                                        {completedLessons > 0 ? `${completedLessons} уроков` : 'ещё нет'}
                                    </span>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass relative overflow-hidden rounded-[2rem] p-6"
                        >
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-vibe-500/20 blur-3xl" />
                            <div className="relative z-10">
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    {hasAnyProgress ? 'Текущий ритм' : 'Что появится после старта'}
                                </h3>
                                <p className="mb-5 text-sm text-gray-300">
                                    {hasAnyProgress
                                        ? 'Этот блок собирается только из данных аккаунта и помогает понять, куда двигаться дальше.'
                                        : 'Здесь будут показываться твои настоящие результаты, как только ты начнёшь проходить уроки.'}
                                </p>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-sm text-gray-400">
                                            {hasAnyProgress ? 'Следующая цель' : 'Первый XP'}
                                        </p>
                                        <p className="mt-1 font-semibold text-white">
                                            {hasAnyProgress
                                                ? `Добрать ${xpToNextLevel} XP до уровня ${level + 1}`
                                                : 'Реши первую задачу и увидишь первый прогресс'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-sm text-gray-400">
                                            {hasAnyProgress ? 'Текущий темп' : 'Первая серия'}
                                        </p>
                                        <p className="mt-1 font-semibold text-white">
                                            {hasAnyProgress
                                                ? `${completedTaskCount} задач уже сохранено в аккаунте`
                                                : 'После первого дня появится серия и статистика по занятиям'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <Link to="/playground">
                                <motion.div whileHover={{ y: -4 }} className="glass-hover rounded-[1.5rem] p-4 text-center">
                                    <Code2 className="mx-auto mb-2 h-6 w-6 text-vibe-300" />
                                    <span className="text-sm text-gray-300">Песочница</span>
                                </motion.div>
                            </Link>
                            <Link to="/analytics">
                                <motion.div whileHover={{ y: -4 }} className="glass-hover rounded-[1.5rem] p-4 text-center">
                                    <TrendingUp className="mx-auto mb-2 h-6 w-6 text-vibe-300" />
                                    <span className="text-sm text-gray-300">Аналитика</span>
                                </motion.div>
                            </Link>
                        </motion.section>
                    </div>
                </div>
            </div>
        </div>
    );
}
