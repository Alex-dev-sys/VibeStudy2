import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Flame,
    Bell,
    Zap,
    Trophy,
    Target,
    BookOpen,
    Code2,
    Brain,
    ChevronRight,
    Play,
    Star,
    TrendingUp,
    Calendar,
    Award
} from 'lucide-react';

// Mock data
const stats = [
    { icon: Zap, label: 'Total XP', value: '12,450', trend: '+250 today', color: 'from-yellow-400 to-orange-500' },
    { icon: Flame, label: 'Day Streak', value: '14', trend: 'Personal best!', color: 'from-orange-500 to-red-500' },
    { icon: BookOpen, label: 'Lessons', value: '47', trend: '3 this week', color: 'from-green-400 to-emerald-500' },
    { icon: Trophy, label: 'Global Rank', value: '#1,247', trend: 'Top 5%', color: 'from-vibe-400 to-vibe-600' },
];

const weeklyActivity = [
    { day: 'Mon', value: 80, completed: true },
    { day: 'Tue', value: 100, completed: true },
    { day: 'Wed', value: 60, completed: true },
    { day: 'Thu', value: 90, completed: true },
    { day: 'Fri', value: 40, completed: true },
    { day: 'Sat', value: 70, completed: true },
    { day: 'Sun', value: 0, completed: false },
];

const currentLesson = {
    title: 'Advanced Python: Decorators & Generators',
    language: 'Python',
    progress: 68,
    xp: 150,
    timeLeft: '25 min',
};

const careerPath = {
    title: 'Backend Developer',
    progress: 42,
    milestones: [
        { name: 'Python Basics', completed: true },
        { name: 'Data Structures', completed: true },
        { name: 'APIs & REST', completed: false, active: true },
        { name: 'Databases', completed: false },
        { name: 'DevOps', completed: false },
    ],
};

const dailyChallenge = {
    title: 'Binary Search Tree Traversal',
    difficulty: 'Medium',
    xp: 200,
    language: 'Python',
    timeLimit: '30 min',
};

const recentAchievements = [
    { icon: '🏆', name: 'Speed Demon', desc: 'Solved 5 challenges in 1 hour' },
    { icon: '🔥', name: '2-Week Streak', desc: 'Coded for 14 days straight' },
    { icon: '⭐', name: 'Python Master', desc: 'Completed Python track' },
];

export default function Home() {
    const userName = 'Alex';
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="min-h-screen relative">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            {greeting}, <span className="text-gradient">{userName}</span> 👋
                        </h1>
                        <p className="text-gray-400">Ready to level up your skills today?</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-4 py-2 glass rounded-xl cursor-pointer"
                        >
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-bold text-white">14</span>
                            <span className="text-gray-400 text-sm">day streak</span>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="w-12 h-12 glass rounded-xl flex items-center justify-center relative"
                        >
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-vibe-500 rounded-full" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover p-6 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-xs text-vibe-400">{stat.trend}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Continue Learning Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-vibe-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-vibe-400 text-sm font-medium mb-2 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            Continue Learning
                                        </p>
                                        <h3 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                🐍 {currentLesson.language}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Zap className="w-4 h-4 text-yellow-500" />
                                                {currentLesson.xp} XP
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ⏱️ {currentLesson.timeLeft}
                                            </span>
                                        </div>
                                    </div>
                                    <Link to="/playground">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="btn-neon px-6 py-3 flex items-center gap-2"
                                        >
                                            <Play className="w-5 h-5" />
                                            Continue
                                        </motion.button>
                                    </Link>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-white font-medium">{currentLesson.progress}%</span>
                                    </div>
                                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${currentLesson.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-vibe-500 to-vibe-400 rounded-full relative"
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Weekly Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-vibe-400" />
                                    Weekly Activity
                                </h3>
                                <span className="text-sm text-gray-400">6/7 days completed</span>
                            </div>
                            <div className="grid grid-cols-7 gap-3">
                                {weeklyActivity.map((day, index) => (
                                    <motion.div
                                        key={day.day}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.05 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div
                                            className={`w-full aspect-square rounded-xl flex items-center justify-center mb-2 transition-all ${day.completed
                                                    ? 'bg-gradient-to-br from-vibe-500 to-vibe-600 shadow-neon'
                                                    : 'bg-dark-700 border border-dashed border-gray-600'
                                                }`}
                                            style={{ opacity: day.completed ? 0.4 + (day.value / 100) * 0.6 : 0.5 }}
                                        >
                                            {day.completed && <Zap className="w-5 h-5 text-white" />}
                                        </div>
                                        <span className={`text-xs ${day.completed ? 'text-white' : 'text-gray-500'}`}>
                                            {day.day}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Career Path */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-vibe-400" />
                                        Career Path: {careerPath.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">{careerPath.progress}% complete</p>
                                </div>
                                <Link to="/profile" className="text-vibe-400 hover:text-vibe-300 text-sm flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Milestones */}
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-700 -translate-y-1/2" />
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-vibe-500 to-vibe-400 -translate-y-1/2 transition-all"
                                    style={{ width: `${careerPath.progress}%` }}
                                />
                                {careerPath.milestones.map((milestone, index) => (
                                    <div key={milestone.name} className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${milestone.completed
                                                    ? 'bg-gradient-to-br from-vibe-500 to-vibe-600 shadow-neon'
                                                    : milestone.active
                                                        ? 'bg-vibe-500/30 border-2 border-vibe-500 animate-pulse'
                                                        : 'bg-dark-700 border border-gray-600'
                                                }`}
                                        >
                                            {milestone.completed ? (
                                                <Star className="w-5 h-5 text-white" />
                                            ) : (
                                                <span className="text-xs text-gray-400">{index + 1}</span>
                                            )}
                                        </motion.div>
                                        <span className={`text-xs text-center ${milestone.active ? 'text-vibe-400' : 'text-gray-500'}`}>
                                            {milestone.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Daily Challenge */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6 border border-vibe-500/30 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-vibe-500/20 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-5 h-5 text-vibe-400" />
                                    <span className="text-vibe-400 font-medium">AI Daily Challenge</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-3">{dailyChallenge.title}</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                                        {dailyChallenge.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-vibe-500/20 text-vibe-300 text-xs">
                                        🐍 {dailyChallenge.language}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-dark-600 text-gray-300 text-xs">
                                        ⏱️ {dailyChallenge.timeLimit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Zap className="w-4 h-4" />
                                        <span className="font-bold">{dailyChallenge.xp} XP</span>
                                    </div>
                                    <Link to="/challenges">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="btn-neon px-4 py-2 text-sm"
                                        >
                                            Start Challenge
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Achievements */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-vibe-400" />
                                    Achievements
                                </h3>
                                <Link to="/profile" className="text-vibe-400 hover:text-vibe-300 text-sm">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentAchievements.map((achievement, index) => (
                                    <motion.div
                                        key={achievement.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                                    >
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">{achievement.name}</p>
                                            <p className="text-xs text-gray-500">{achievement.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <Link to="/playground">
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="glass-hover p-4 text-center cursor-pointer"
                                >
                                    <Code2 className="w-6 h-6 text-vibe-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-300">Playground</span>
                                </motion.div>
                            </Link>
                            <Link to="/analytics">
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="glass-hover p-4 text-center cursor-pointer"
                                >
                                    <TrendingUp className="w-6 h-6 text-vibe-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-300">Analytics</span>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
