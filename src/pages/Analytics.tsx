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
    python: '#3776ab',
    javascript: '#f7df1e',
    go: '#00add8',
    csharp: '#8b5cf6',
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
                day: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date),
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
            name: 'Следующий уровень',
            current: totalXp,
            target: (profile?.level ?? 1) * 1000,
            detail: `${xpToNextLevel} XP осталось`,
        },
        {
            name: 'Задачи за неделю',
            current: weeklyTasks,
            target: 5,
            detail: `${weeklyTasks}/5 выполнено`,
        },
        {
            name: 'Уроки в активных треках',
            current: completedLessons,
            target: Math.max(3, completedLessons + 1),
            detail: `${completedLessons} завершено`,
        },
        {
            name: 'Серия',
            current: streak,
            target: Math.max(1, streak + 1),
            detail: streak > 0 ? `${streak} дней подряд` : 'Начни сегодня',
        },
    ];

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)]" />

            <div className="mx-auto max-w-7xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="mb-1 text-3xl font-bold text-white">Аналитика обучения</h1>
                    <p className="max-w-2xl text-gray-400">
                        Этот экран больше не показывает выдуманные рейтинги и проценты. Здесь собраны только реальные
                        метрики по твоему аккаунту.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    {[
                        {
                            icon: Zap,
                            label: 'Всего XP',
                            value: totalXp.toLocaleString('ru-RU'),
                            detail: `За 7 дней: ${weeklyXp}`,
                        },
                        {
                            icon: Flame,
                            label: 'Серия',
                            value: `${streak}`,
                            detail: streak > 0 ? 'дней подряд' : 'ещё не началась',
                        },
                        {
                            icon: CheckCircle2,
                            label: 'Решено задач',
                            value: `${completedTasks.length}`,
                            detail: `На неделе: ${weeklyTasks}`,
                        },
                        {
                            icon: BookOpen,
                            label: 'Пройдено уроков',
                            value: `${completedLessons}`,
                            detail: `${activeTracks} активных треков`,
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover rounded-[1.75rem] p-6"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vibe-500/20">
                                <stat.icon className="h-6 w-6 text-vibe-300" />
                            </div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                            <p className="mt-1 text-xs text-vibe-300">{stat.detail}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {hasAnyProgress ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass rounded-[2rem] p-6"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                                        <Activity className="h-5 w-5 text-vibe-300" />
                                        Последние 7 дней
                                    </h2>
                                    <span className="text-sm text-gray-400">XP и задачи по фактическим событиям</span>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weeklyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2440" />
                                            <XAxis dataKey="day" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1a1428',
                                                    border: '1px solid #3d3055',
                                                    borderRadius: '12px',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="xp"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                dot={{ fill: '#a855f7', strokeWidth: 2 }}
                                                activeDot={{ r: 8, fill: '#a855f7' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="glass rounded-[2rem] p-6"
                                >
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                        <PieChart className="h-5 w-5 text-vibe-300" />
                                        Распределение по трекам
                                    </h2>
                                    <div className="flex h-56 items-center">
                                        <ResponsiveContainer width="60%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={courseDistributionData}
                                                    innerRadius={40}
                                                    outerRadius={72}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
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
                                                    <span className="text-gray-300">{entry.name}</span>
                                                    <span className="ml-auto text-gray-500">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass rounded-[2rem] p-6"
                                >
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                        <BarChart3 className="h-5 w-5 text-vibe-300" />
                                        Заполнение треков
                                    </h2>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={trackProgressData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2440" horizontal={false} />
                                                <XAxis dataKey="name" stroke="#6b7280" />
                                                <YAxis stroke="#6b7280" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1a1428',
                                                        border: '1px solid #3d3055',
                                                        borderRadius: '12px',
                                                    }}
                                                />
                                                <Bar dataKey="percent" fill="#a855f7" radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                className="glass rounded-[2rem] p-6"
                            >
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <Calendar className="h-5 w-5 text-vibe-300" />
                                    Ближайшие цели
                                </h2>
                                <div className="space-y-4">
                                    {nextGoals.map((goal, index) => {
                                        const progress = Math.min((goal.current / goal.target) * 100, 100);

                                        return (
                                            <motion.div
                                                key={goal.name}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.06 }}
                                            >
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-sm text-gray-300">{goal.name}</span>
                                                    <span className="text-sm text-vibe-300">{goal.detail}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-dark-700">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-vibe-500 to-vibe-400"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                className="glass rounded-[2rem] border border-vibe-500/20 p-6"
                            >
                                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                                    <TrendingUp className="h-5 w-5 text-vibe-300" />
                                    Честный вывод
                                </h2>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    Сейчас аналитика показывает только реальные данные аккаунта. Следующий продуктовый
                                    шаг — добавить воронку от onboarding до checkout, чтобы эта страница стала полезной
                                    и для бизнеса.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-[2rem] border border-vibe-500/20 p-10 text-center"
                    >
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-vibe-500/20">
                            <Target className="h-8 w-8 text-vibe-300" />
                        </div>
                        <h2 className="mb-3 text-2xl font-bold text-white">Аналитика появится после первых действий</h2>
                        <p className="mx-auto max-w-2xl text-gray-400">
                            Как только ты начнёшь урок и решишь хотя бы одну задачу, здесь появятся реальные графики по
                            XP, активности за неделю и прогрессу по трекам.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
