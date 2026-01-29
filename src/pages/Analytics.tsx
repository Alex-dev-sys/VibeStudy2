import { motion } from 'framer-motion';
import {
    TrendingUp,
    Clock,
    Target,
    Zap,
    Brain,
    BarChart3,
    PieChart,
    Activity,
    Calendar,
    ChevronUp,
    ChevronDown,
    Lightbulb,
    Award,
    BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const overviewStats = [
    { icon: Clock, label: 'Total Study Time', value: '147h 32m', change: '+12h', positive: true },
    { icon: Target, label: 'Avg. Score', value: '87%', change: '+5%', positive: true },
    { icon: TrendingUp, label: 'Ranking', value: 'Top 5%', change: '+2%', positive: true },
    { icon: Zap, label: 'Weekly XP', value: '2,450', change: '-150', positive: false },
];

const progressData = [
    { day: 'Mon', xp: 180, lessons: 2 },
    { day: 'Tue', xp: 250, lessons: 3 },
    { day: 'Wed', xp: 120, lessons: 1 },
    { day: 'Thu', xp: 380, lessons: 4 },
    { day: 'Fri', xp: 200, lessons: 2 },
    { day: 'Sat', xp: 450, lessons: 5 },
    { day: 'Sun', xp: 320, lessons: 3 },
];

const languageTimeData = [
    { name: 'Python', value: 45, color: '#3776ab' },
    { name: 'JavaScript', value: 25, color: '#f7df1e' },
    { name: 'Go', value: 15, color: '#00add8' },
    { name: 'Rust', value: 10, color: '#dea584' },
    { name: 'Other', value: 5, color: '#6b7280' },
];

const challengesByDifficulty = [
    { difficulty: 'Easy', solved: 28, total: 30 },
    { difficulty: 'Medium', solved: 15, total: 25 },
    { difficulty: 'Hard', solved: 4, total: 15 },
];

const skillRadarData = [
    { subject: 'Backend', A: 85 },
    { subject: 'Frontend', A: 65 },
    { subject: 'DevOps', A: 45 },
    { subject: 'AI/ML', A: 70 },
    { subject: 'Algorithms', A: 80 },
    { subject: 'System Design', A: 55 },
];

const weeklyGoals = [
    { name: 'Complete 5 lessons', current: 4, target: 5 },
    { name: 'Solve 10 challenges', current: 7, target: 10 },
    { name: 'Earn 2000 XP', current: 1850, target: 2000 },
    { name: 'Maintain streak', current: 14, target: 14 },
];

const aiInsights = [
    {
        icon: '🎯',
        title: 'Focus on System Design',
        desc: 'Your weakest area. Consider taking the advanced architecture course.',
    },
    {
        icon: '⚡',
        title: 'Great momentum!',
        desc: 'You\'ve increased study time by 40% this week. Keep it up!',
    },
    {
        icon: '📈',
        title: 'Level up suggestion',
        desc: 'Try Hard difficulty challenges to break through your current plateau.',
    },
];

export default function Analytics() {
    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-1">Learning Analytics</h1>
                    <p className="text-gray-400">Track your progress and optimize your learning journey</p>
                </motion.div>

                {/* Overview Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {overviewStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-vibe-500/20 flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-vibe-400" />
                                </div>
                                <span className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {stat.positive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-vibe-400" />
                                    Weekly Progress
                                </h2>
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-vibe-500" />
                                        XP Earned
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-400">
                                        <div className="w-3 h-3 rounded-full bg-vibe-300" />
                                        Lessons
                                    </span>
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={progressData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2440" />
                                        <XAxis dataKey="day" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1a1428',
                                                border: '1px solid #3d3055',
                                                borderRadius: '8px',
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

                        {/* Two Column Charts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Skill Radar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass p-6"
                            >
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-vibe-400" />
                                    Skill Radar
                                </h2>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={skillRadarData}>
                                            <PolarGrid stroke="#3d3055" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                            <Radar
                                                name="Skills"
                                                dataKey="A"
                                                stroke="#a855f7"
                                                fill="#a855f7"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Language Time */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="glass p-6"
                            >
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-vibe-400" />
                                    Time by Language
                                </h2>
                                <div className="h-56 flex items-center">
                                    <ResponsiveContainer width="60%" height="100%">
                                        <RechartsPie>
                                            <Pie
                                                data={languageTimeData}
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {languageTimeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-2">
                                        {languageTimeData.map((lang) => (
                                            <div key={lang.name} className="flex items-center gap-2 text-sm">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                                                <span className="text-gray-300">{lang.name}</span>
                                                <span className="text-gray-500 ml-auto">{lang.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Challenges by Difficulty */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-6"
                        >
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-vibe-400" />
                                Challenges by Difficulty
                            </h2>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={challengesByDifficulty} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2440" horizontal={false} />
                                        <XAxis type="number" stroke="#6b7280" />
                                        <YAxis dataKey="difficulty" type="category" stroke="#6b7280" width={60} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1a1428',
                                                border: '1px solid #3d3055',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Bar dataKey="total" fill="#3d3055" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="solved" fill="#a855f7" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4 text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[#3d3055]" />
                                    <span className="text-gray-400">Total</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-vibe-500" />
                                    <span className="text-gray-400">Solved</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Weekly Goals */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6"
                        >
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-vibe-400" />
                                Weekly Goals
                            </h2>
                            <div className="space-y-4">
                                {weeklyGoals.map((goal, index) => {
                                    const progress = Math.min((goal.current / goal.target) * 100, 100);
                                    const completed = goal.current >= goal.target;

                                    return (
                                        <motion.div
                                            key={goal.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-300">{goal.name}</span>
                                                <span className={`text-sm ${completed ? 'text-green-400' : 'text-vibe-400'}`}>
                                                    {goal.current}/{goal.target}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                                    className={`h-full rounded-full ${completed
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                            : 'bg-gradient-to-r from-vibe-500 to-vibe-400'
                                                        }`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* AI Insights */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-6 border border-vibe-500/30"
                        >
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-vibe-400" />
                                AI Insights
                            </h2>
                            <div className="space-y-4">
                                {aiInsights.map((insight, index) => (
                                    <motion.div
                                        key={insight.title}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{insight.icon}</span>
                                            <div>
                                                <p className="text-sm font-medium text-white mb-1">{insight.title}</p>
                                                <p className="text-xs text-gray-500">{insight.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                className="w-full mt-4 py-3 rounded-xl bg-vibe-500/20 text-vibe-300 text-sm font-medium hover:bg-vibe-500/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <Lightbulb className="w-4 h-4" />
                                Get Personalized Study Plan
                            </motion.button>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="glass-hover p-4 text-center cursor-pointer"
                            >
                                <BookOpen className="w-6 h-6 text-vibe-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-300">Study History</span>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="glass-hover p-4 text-center cursor-pointer"
                            >
                                <Award className="w-6 h-6 text-vibe-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-300">Certificates</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
