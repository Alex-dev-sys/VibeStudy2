import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Code2,
    Flame,
    Sparkles,
    Target,
    Trophy,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { courses } from '../data/courses';
import { useAuthStore } from '../stores/useAuthStore';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import { useProgressStore } from '../stores/useProgressStore';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { identifyAnalyticsUser, trackEvent } from '../lib/analytics';

type CourseMeta = {
    subtitle: string;
    accent: string;
    recommendation: string;
};

type TrackSnapshot = {
    id: string;
    name: string;
    subtitle: string;
    accent: string;
    recommendation: string;
    completedУроки: number;
    completedTasks: number;
    currentDay: number;
    totalDays: number;
    progressPercent: number;
    href: string;
    started: boolean;
};

const courseMeta: Record<string, CourseMeta> = {
    python: {
        subtitle: 'Автоматизация, основы backend и практические скрипты.',
        accent: 'from-sky-400 via-cyan-300 to-cyan-500',
        recommendation: 'Сильный первый трек с быстрым видимым результатом.',
    },
    javascript: {
        subtitle: 'Веб-интерфейсы, логика браузера и продуктовый код.',
        accent: 'from-cyan-300 via-sky-300 to-violet-400',
        recommendation: 'Самый быстрый маршрут во frontend и создание продуктов.',
    },
    go: {
        subtitle: 'Производительность, сервисы и чистая backend-архитектура.',
        accent: 'from-cyan-400 via-cyan-300 to-teal-400',
        recommendation: 'Подходит тем, кому интересны системы и API.',
    },
    csharp: {
        subtitle: '.NET, приложения, backend и реальные сервисные сценарии.',
        accent: 'from-fuchsia-400 via-violet-400 to-purple-500',
        recommendation: 'Практичный выбор для .NET и enterprise-разработки.',
    },
};

function getGreeting(hour: number) {
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
}

function getFirstName(fullName: string | null | undefined) {
    if (!fullName) {
        return 'Студент';
    }

    return fullName.trim().split(/\s+/)[0] || 'Студент';
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
    const completedУроки = Object.values(courseProgress).reduce(
        (sum, progress) => sum + progress.completed_days.length,
        0
    );
    const completedTaskCount = completedTasks.length;
    const hasAnyProgress =
        totalXp > 0 ||
        streak > 0 ||
        activeTracks > 0 ||
        completedУроки > 0 ||
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
                recommendation: meta.recommendation,
                completedУроки: completedCount,
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
                if (right.completedУроки !== left.completedУроки) {
                    return right.completedУроки - left.completedУроки;
                }

                return right.completedTasks - left.completedTasks;
            })[0] ?? null;

    const stats = [
        {
            icon: Zap,
            label: 'Всего XP',
            value: totalXp.toLocaleString('en-US'),
            detail: `Уровень ${level}`,
        },
        {
            icon: Flame,
            label: 'Текущая серия',
            value: `${streak}`,
            detail: streak > 0 ? 'дней подряд' : 'начни сегодня',
        },
        {
            icon: BookOpen,
            label: 'Уроков пройдено',
            value: `${completedУроки}`,
            detail: `${completedTaskCount} задач решено`,
        },
        {
            icon: Trophy,
            label: 'Активных треков',
            value: `${activeTracks}`,
            detail: hasAnyProgress ? 'сохранено в профиле' : 'чистый старт',
        },
    ];

    return (
        <div className="relative min-h-screen px-8 py-8">
            <div className="mx-auto max-w-7xl">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[130px]" />
                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <div className="eyebrow">
                                <Sparkles className="h-3.5 w-3.5" />
                                Учебный ритм на сегодня
                            </div>
                            <h1 className="mt-5 max-w-3xl font-headline text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                {greeting}, {userName}. Продолжай ритм, который превращается в навык.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                Здесь собраны уроки, серия, ближайшая цель по XP и самый короткий путь обратно
                                к сосредоточенной практике.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to={featuredTrack ? featuredTrack.href : '/lessons'}
                                    className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-sm"
                                >
                                    {featuredTrack ? 'Продолжить урок' : 'Начать маршрут'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/analytics" className="btn-neon-outline inline-flex items-center gap-2 px-6 py-3 text-sm">
                                    Открыть аналитику
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">XP до следующего уровня</p>
                                <p className="mt-3 text-3xl font-bold text-white">{xpToNextLevel.toLocaleString('en-US')}</p>
                                <p className="mt-2 text-sm text-slate-300">Сохраняй ритм — следующий уровень придёт естественно.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Главный фокус</p>
                                <p className="mt-3 text-xl font-semibold text-white">
                                    {featuredTrack ? `${featuredTrack.name} день ${featuredTrack.currentDay}` : 'Первый трек'}
                                </p>
                                <p className="mt-2 text-sm text-slate-300">
                                    {featuredTrack ? featuredTrack.subtitle : 'Выбери язык и пройди первый полный учебный цикл.'}
                                </p>
                            </div>
                            <div className="metric-chip sm:col-span-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Состояние прогресса</p>
                                        <p className="mt-3 text-lg font-semibold text-white">
                                            {hasAnyProgress
                                                ? 'Экран отражает только реальную активность этого профиля.'
                                                : 'Чистый старт: без выдуманного прогресса и достижений.'}
                                        </p>
                                    </div>
                                    <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] lg:flex">
                                        <Target className="h-6 w-6 text-cyan-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mt-8 grid gap-4 lg:grid-cols-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + index * 0.04 }}
                            className="surface-premium-soft p-5"
                        >
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                            <p className="mt-2 text-sm text-slate-300">{stat.detail}</p>
                        </motion.div>
                    ))}
                </motion.section>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        {shouldShowOnboarding ? (
                            <div className="surface-premium-soft p-6">
                                <div className="mb-5">
                                    <div className="eyebrow">Первая сессия</div>
                                    <h2 className="mt-4 text-2xl font-bold text-white">Начни с короткой настройки учебного маршрута.</h2>
                                </div>
                                <OnboardingFlow userId={user!.id} userName={userName} />
                            </div>
                        ) : (
                            <motion.section
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className="surface-premium-soft p-6"
                            >
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <div className="eyebrow">Фокус на сегодня</div>
                                        <h2 className="mt-4 text-2xl font-bold text-white">
                                            {featuredTrack ? 'Продолжи самый активный трек.' : 'Открой первый урок.'}
                                        </h2>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                            {featuredTrack
                                                ? `${featuredTrack.name} сейчас ведёт по прогрессу. Сохрани серию, набери XP и двигай маршрут дальше.`
                                                : 'Всё готово. Выбери трек и реши первую задачу — экран начнёт отражать реальные действия.'}
                                        </p>
                                    </div>

                                    <Link
                                        to={featuredTrack ? featuredTrack.href : '/lessons'}
                                        className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-sm"
                                    >
                                        {featuredTrack ? 'Продолжить урок' : 'Открыть уроки'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                {featuredTrack ? (
                                    <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{featuredTrack.name}</p>
                                                <p className="mt-1 text-sm text-slate-300">{featuredTrack.subtitle}</p>
                                            </div>
                                            <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                день {featuredTrack.currentDay}
                                            </span>
                                        </div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Прогресс трека</span>
                                            <span className="text-white">{featuredTrack.progressPercent}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/6">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${featuredTrack.accent}`}
                                                style={{ width: `${featuredTrack.progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </motion.section>
                        )}

                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <div className="eyebrow">Карта треков</div>
                                    <h2 className="mt-4 text-2xl font-bold text-white">Твои учебные маршруты</h2>
                                </div>
                                <Link to="/lessons" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                                    Все уроки
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {trackSnapshots.map((track, index) => (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.22 + index * 0.05 }}
                                        className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <div className={`mb-3 inline-flex rounded-full bg-gradient-to-r ${track.accent} px-3 py-1 text-sm font-semibold text-black`}>
                                                    {track.name}
                                                </div>
                                                <p className="text-sm text-slate-300">{track.subtitle}</p>
                                            </div>
                                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                                {track.started ? `${track.progressPercent}%` : 'новый'}
                                            </span>
                                        </div>

                                        <div className="mb-3 flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Уроки</span>
                                            <span className="text-white">
                                                {track.completedУроки}/{track.totalDays}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/6">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${track.accent}`}
                                                style={{ width: `${track.progressPercent}%` }}
                                            />
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-slate-300">
                                            {track.started
                                                ? `You are currently on день ${track.currentDay}, with ${track.completedTasks} сохранённых задач в этом треке.`
                                                : track.recommendation}
                                        </p>
                                        <Link
                                            to={track.href}
                                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-secondary"
                                        >
                                            {track.started ? 'Продолжить трек' : 'Начать трек'}
                                            <ArrowRight className="h-4 w-4" />
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
                            transition={{ delay: 0.16 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="eyebrow">Состояние прогресса</div>
                            <h2 className="mt-4 text-xl font-bold text-white">Что важно дальше</h2>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        label: 'Ближайшая цель по XP',
                                        value: `${xpToNextLevel.toLocaleString('en-US')} XP left`,
                                    },
                                    {
                                        label: 'Текущее состояние',
                                        value: hasAnyProgress ? `${completedУроки} уроков пройдено` : 'Fresh account with no synthetic data',
                                    },
                                    {
                                        label: 'Лучший следующий шаг',
                                        value: featuredTrack ? `${featuredTrack.name} день ${featuredTrack.currentDay}` : 'Открыть первый день в уроках',
                                    },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                                        <p className="text-sm text-slate-400">{item.label}</p>
                                        <p className="mt-1 font-semibold text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.22 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="eyebrow">Быстрый переход</div>
                            <h2 className="mt-4 text-xl font-bold text-white">Перейди к нужному инструменту</h2>
                            <div className="mt-5 grid gap-3">
                                {[
                                    {
                                        to: '/playground',
                                        icon: Code2,
                                        title: 'Лаборатория',
                                        body: 'Проверяй фрагменты кода и быстро тестируй идеи.',
                                    },
                                    {
                                        to: '/analytics',
                                        icon: TrendingUp,
                                        title: 'Аналитика',
                                        body: 'Посмотри динамику текущего профиля без декоративных метрик.',
                                    },
                                ].map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/18 hover:bg-primary/08"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                                <item.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-300">{item.body}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    </div>
                </div>
            </div>
        </div>
    );
}
