import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle2,
    Flame,
    PieChart,
    Target,
    TrendingUp,
    Zap,
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { courses } from '../data/courses';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/useProgressStore';

const courseColors: Record<string, string> = {
    python: '#38bdf8',
    javascript: '#facc15',
    go: '#22d3ee',
    csharp: '#c084fc',
};

function startOfDay(value: Date) {
    const normalized = new Date(value);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

export default function Analytics() {
    const { profile } = useAuthStore();
    const { courseProgress, completedTasks } = useProgressStore();

    const totalXp = profile?.total_xp ?? 0;
    const streak = profile?.current_streak ?? 0;
    const completedLessons = Object.values(courseProgress).reduce(
        (sum, progress) => sum + progress.completed_days.length,
        0
    );
    const activeTracks = Object.keys(courseProgress).length;
    const hasAnyProgress = totalXp > 0 || streak > 0 || completedLessons > 0 || completedTasks.length > 0;

    const weeklyProgressData = useMemo(() => {
        const today = startOfDay(new Date());

        return Array.from({ length: 7 }, (_, offset) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - offset));

            const tasksForDay = completedTasks.filter((task) => {
                const taskDate = startOfDay(new Date(task.completed_at));
                return taskDate.getTime() === date.getTime();
            });

            const xp = tasksForDay.reduce((sum, task) => sum + task.xp_earned, 0);
            const lessons = Object.values(courseProgress).filter((progress) =>
                progress.completed_days.length > 0 &&
                startOfDay(new Date(progress.last_activity)).getTime() === date.getTime()
            ).length;

            return {
                day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
                xp,
                tasks: tasksForDay.length,
                lessons,
            };
        });
    }, [completedTasks, courseProgress]);

    const courseDistributionData = useMemo(() => {
        return Object.entries(courseProgress)
            .map(([courseId, progress]) => {
                const course = courses.find((item) => item.id === courseId);
                if (!course) {
                    return null;
                }

                return {
                    name: course.name,
                    value: progress.completed_days.length || 1,
                    color: courseColors[courseId] || '#6b7280',
                };
            })
            .filter((item): item is { name: string; value: number; color: string } => Boolean(item));
    }, [courseProgress]);

    const trackProgressData = useMemo(() => {
        return Object.entries(courseProgress)
            .map(([courseId, progress]) => {
                const course = courses.find((item) => item.id === courseId);
                if (!course) {
                    return null;
                }

                return {
                    name: course.name,
                    completed: progress.completed_days.length,
                    total: course.totalDays,
                    percent: Math.round((progress.completed_days.length / course.totalDays) * 100),
                };
            })
            .filter((item): item is { name: string; completed: number; total: number; percent: number } => Boolean(item));
    }, [courseProgress]);

    const weeklyXp = weeklyProgressData.reduce((sum, item) => sum + item.xp, 0);
    const weeklyTasks = weeklyProgressData.reduce((sum, item) => sum + item.tasks, 0);
    const xpToNextLevel = Math.max(0, (profile?.level ?? 1) * 1000 - totalXp);

    const nextGoals = [
        {
            name: 'Next level',
            current: totalXp,
            target: (profile?.level ?? 1) * 1000,
            detail: `${xpToNextLevel} XP left`,
        },
        {
            name: 'Tasks this week',
            current: weeklyTasks,
            target: 5,
            detail: `${weeklyTasks}/5 completed`,
        },
        {
            name: 'Lessons shipped',
            current: completedLessons,
            target: Math.max(3, completedLessons + 1),
            detail: `${completedLessons} done`,
        },
        {
            name: 'Streak length',
            current: streak,
            target: Math.max(1, streak + 1),
            detail: streak > 0 ? `${streak} day streak` : 'Start today',
        },
    ];

    return (
        <div className="min-h-screen px-8 py-8">
            <div className="mx-auto max-w-7xl">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#F3BA2F]/8 blur-[120px]" />
                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="eyebrow">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Learning intelligence
                            </div>
                            <h1 className="mt-5 max-w-3xl font-headline text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                Real account analytics with product-grade clarity.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                This screen no longer pretends. Every chart and every metric is driven by actual account
                                activity, not by fake engagement placeholders.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Weekly XP</p>
                                <p className="mt-3 text-3xl font-bold text-white">{weeklyXp.toLocaleString('en-US')}</p>
                                <p className="mt-2 text-sm text-slate-300">XP generated by actual completed tasks across the last 7 days.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tasks solved</p>
                                <p className="mt-3 text-3xl font-bold text-white">{completedTasks.length}</p>
                                <p className="mt-2 text-sm text-slate-300">The cleanest leading indicator of real effort so far.</p>
                            </div>
                            <div className="metric-chip sm:col-span-2">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Operating note</p>
                                <p className="mt-3 text-lg font-semibold text-white">
                                    {hasAnyProgress
                                        ? 'You have enough real learning signal to read the trendline.'
                                        : 'The dashboard will become meaningful after the first lesson and task.'}
                                </p>
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
                    {[
                        {
                            icon: Zap,
                            label: 'Total XP',
                            value: totalXp.toLocaleString('en-US'),
                            detail: `7-day XP: ${weeklyXp.toLocaleString('en-US')}`,
                        },
                        {
                            icon: Flame,
                            label: 'Streak',
                            value: `${streak}`,
                            detail: streak > 0 ? 'days in a row' : 'not started yet',
                        },
                        {
                            icon: CheckCircle2,
                            label: 'Solved tasks',
                            value: `${completedTasks.length}`,
                            detail: `This week: ${weeklyTasks}`,
                        },
                        {
                            icon: BookOpen,
                            label: 'Lessons done',
                            value: `${completedLessons}`,
                            detail: `${activeTracks} active tracks`,
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="surface-premium-soft p-5">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                <stat.icon className="h-5 w-5 text-[#F3BA2F]" />
                            </div>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                            <p className="mt-2 text-sm text-slate-300">{stat.detail}</p>
                        </div>
                    ))}
                </motion.section>

                {hasAnyProgress ? (
                    <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-6">
                            <motion.section
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="surface-premium-soft p-6"
                            >
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div>
                                        <div className="eyebrow">
                                            <Activity className="h-3.5 w-3.5" />
                                            7-day line
                                        </div>
                                        <h2 className="mt-4 text-2xl font-bold text-white">Recent momentum</h2>
                                    </div>
                                    <p className="max-w-sm text-right text-sm text-slate-400">
                                        XP curve and lesson touches across the last seven days.
                                    </p>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weeklyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2734" />
                                            <XAxis dataKey="day" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f131d',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '16px',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="xp"
                                                stroke="#F3BA2F"
                                                strokeWidth={3}
                                                dot={{ fill: '#F3BA2F', strokeWidth: 2 }}
                                                activeDot={{ r: 8, fill: '#F3BA2F' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <motion.section
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.14 }}
                                    className="surface-premium-soft p-6"
                                >
                                    <div className="eyebrow">
                                        <PieChart className="h-3.5 w-3.5" />
                                        Distribution
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-white">Track share</h2>
                                    <div className="mt-5 flex h-56 items-center">
                                        <ResponsiveContainer width="60%" height="100%">
                                            <RechartsPieChart>
                                                <Pie data={courseDistributionData} innerRadius={42} outerRadius={74} paddingAngle={4} dataKey="value">
                                                    {courseDistributionData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                        <div className="flex-1 space-y-2">
                                            {courseDistributionData.map((entry) => (
                                                <div key={entry.name} className="flex items-center gap-2 text-sm">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-slate-300">{entry.name}</span>
                                                    <span className="ml-auto text-slate-400">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>

                                <motion.section
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                    className="surface-premium-soft p-6"
                                >
                                    <div className="eyebrow">
                                        <BarChart3 className="h-3.5 w-3.5" />
                                        Completion
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-white">Track progress</h2>
                                    <div className="mt-5 h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={trackProgressData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e2734" horizontal={false} />
                                                <XAxis dataKey="name" stroke="#6b7280" />
                                                <YAxis stroke="#6b7280" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#0f131d',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '16px',
                                                    }}
                                                />
                                                <Bar dataKey="percent" fill="#22d3ee" radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.section>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <motion.section
                                initial={{ opacity: 0, x: 18 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.16 }}
                                className="surface-premium-soft p-6"
                            >
                                <div className="eyebrow">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Near-term targets
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-white">Next operational goals</h2>
                                <div className="mt-5 space-y-4">
                                    {nextGoals.map((goal, index) => {
                                        const progress = Math.min((goal.current / goal.target) * 100, 100);

                                        return (
                                            <motion.div
                                                key={goal.name}
                                                initial={{ opacity: 0, x: 16 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + index * 0.04 }}
                                                className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4"
                                            >
                                                <div className="mb-2 flex items-center justify-between gap-4">
                                                    <span className="text-sm text-slate-300">{goal.name}</span>
                                                    <span className="text-sm font-semibold text-[#F8D775]">{goal.detail}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-white/6">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#F3BA2F] to-cyan-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>

                            <motion.section
                                initial={{ opacity: 0, x: 18 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="surface-premium-soft p-6"
                            >
                                <div className="eyebrow">
                                    <Target className="h-3.5 w-3.5" />
                                    Why this matters
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-white">A dashboard should tell the truth.</h2>
                                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                                    <p>
                                        This analytics layer is useful because it reflects only real account activity: completed
                                        tasks, lesson touches, XP, streak, and active route depth.
                                    </p>
                                    <p>
                                        The next business step later is to add funnel and billing signal here. For now, the page
                                        finally serves the learning product honestly.
                                    </p>
                                </div>
                            </motion.section>
                        </div>
                    </div>
                ) : (
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="surface-premium-soft mt-8 p-10 text-center"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                            <Target className="h-8 w-8 text-[#F3BA2F]" />
                        </div>
                        <h2 className="mt-5 text-3xl font-bold text-white">Analytics starts after the first real action.</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            Complete the first lesson and solve the first task. After that, this screen will start showing a real
                            XP curve, weekly activity, and progress across tracks.
                        </p>
                    </motion.section>
                )}
            </div>
        </div>
    );
}
