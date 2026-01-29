import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    User,
    Trophy,
    Flame,
    Zap,
    Star,
    Award,
    Target,
    Calendar,
    Settings,
    Bell,
    Moon,
    Shield,
    ChevronRight,
    Edit3,
    Github,
    Twitter,
    Globe
} from 'lucide-react';

const userData = {
    name: 'Alex Dev',
    username: '@alex_dev',
    avatar: '👨‍💻',
    rank: 'Senior Architect',
    joinDate: 'January 2024',
    bio: 'Full-stack developer passionate about AI and clean code',
    stats: {
        xp: 12450,
        streak: 14,
        challenges: 47,
        globalRank: 1247,
    },
};

const achievements = [
    { icon: '🏆', name: 'Speed Demon', desc: 'Solved 5 in 1 hour', rarity: 'gold' },
    { icon: '🔥', name: '2-Week Streak', desc: '14 days coding', rarity: 'gold' },
    { icon: '⭐', name: 'Python Master', desc: 'Completed track', rarity: 'gold' },
    { icon: '🎯', name: 'Perfect Score', desc: '100% on 10 tests', rarity: 'silver' },
    { icon: '🚀', name: 'Early Bird', desc: 'Code before 6 AM', rarity: 'silver' },
    { icon: '💡', name: 'Problem Solver', desc: '100 challenges', rarity: 'bronze' },
    { icon: '🤝', name: 'Helpful Hero', desc: 'Helped 50 users', rarity: 'bronze' },
    { icon: '📚', name: 'Knowledge Seeker', desc: '20 lessons/week', rarity: 'bronze' },
];

const languageSkills = [
    { name: 'Python', level: 85, icon: '🐍' },
    { name: 'JavaScript', level: 72, icon: '⚡' },
    { name: 'Go', level: 45, icon: '🔷' },
    { name: 'Rust', level: 30, icon: '🦀' },
    { name: 'Java', level: 55, icon: '☕' },
];

const activityData = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
);

const getRarityStyles = (rarity: string) => {
    switch (rarity) {
        case 'gold': return 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-500/30';
        case 'silver': return 'bg-gradient-to-br from-gray-300/20 to-gray-500/20 border-gray-400/30';
        case 'bronze': return 'bg-gradient-to-br from-orange-300/20 to-orange-600/20 border-orange-500/30';
        default: return 'bg-dark-700';
    }
};

export default function Profile() {
    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-vibe-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center text-6xl shadow-neon-lg ring-4 ring-vibe-500/30">
                                {userData.avatar}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-vibe-500 flex items-center justify-center shadow-lg"
                            >
                                <Edit3 className="w-4 h-4 text-white" />
                            </motion.button>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-vibe-500 to-vibe-600 text-white text-sm font-medium">
                                    {userData.rank}
                                </span>
                            </div>
                            <p className="text-gray-400 mb-2">{userData.username}</p>
                            <p className="text-gray-300 mb-4 max-w-lg">{userData.bio}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {userData.joinDate}
                                </span>
                                <a href="#" className="flex items-center gap-1 hover:text-vibe-400">
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </a>
                                <a href="#" className="flex items-center gap-1 hover:text-vibe-400">
                                    <Twitter className="w-4 h-4" />
                                    Twitter
                                </a>
                                <a href="#" className="flex items-center gap-1 hover:text-vibe-400">
                                    <Globe className="w-4 h-4" />
                                    Portfolio
                                </a>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-neon-outline px-6 py-2 hidden md:flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Edit Profile
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { icon: Zap, label: 'Total XP', value: userData.stats.xp.toLocaleString(), color: 'from-yellow-400 to-orange-500' },
                        { icon: Flame, label: 'Day Streak', value: userData.stats.streak, color: 'from-orange-500 to-red-500' },
                        { icon: Target, label: 'Challenges', value: userData.stats.challenges, color: 'from-green-400 to-emerald-500' },
                        { icon: Trophy, label: 'Global Rank', value: `#${userData.stats.globalRank}`, color: 'from-vibe-400 to-vibe-600' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover p-6 text-center"
                        >
                            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Achievements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-vibe-400" />
                                    Achievements
                                </h2>
                                <span className="text-sm text-gray-400">{achievements.length} badges</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {achievements.map((badge, index) => (
                                    <motion.div
                                        key={badge.name}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                        className={`p-4 rounded-xl border text-center ${getRarityStyles(badge.rarity)}`}
                                    >
                                        <span className="text-3xl block mb-2">{badge.icon}</span>
                                        <p className="text-sm font-medium text-white">{badge.name}</p>
                                        <p className="text-xs text-gray-500">{badge.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Activity Heatmap */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-vibe-400" />
                                Contribution Activity
                            </h2>
                            <div className="overflow-x-auto">
                                <div className="flex gap-1 min-w-max">
                                    {activityData.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-1">
                                            {week.map((day, dayIndex) => (
                                                <motion.div
                                                    key={dayIndex}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 + weekIndex * 0.01 }}
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{
                                                        backgroundColor: day === 0
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : `rgba(168, 85, 247, ${0.2 + day * 0.2})`,
                                                    }}
                                                    title={`${day} contributions`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                                <span>Less</span>
                                {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                                    <div
                                        key={opacity}
                                        className="w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: `rgba(168, 85, 247, ${opacity})` }}
                                    />
                                ))}
                                <span>More</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Language Skills */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6"
                        >
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-vibe-400" />
                                Language Proficiency
                            </h2>
                            <div className="space-y-4">
                                {languageSkills.map((lang, index) => (
                                    <motion.div
                                        key={lang.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="flex items-center gap-2 text-sm text-white">
                                                <span>{lang.icon}</span>
                                                {lang.name}
                                            </span>
                                            <span className="text-sm text-vibe-400">{lang.level}%</span>
                                        </div>
                                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${lang.level}%` }}
                                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                                className="h-full bg-gradient-to-r from-vibe-500 to-vibe-400 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Settings Quick Access */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-6"
                        >
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-vibe-400" />
                                Settings
                            </h2>
                            <div className="space-y-2">
                                {[
                                    { icon: Moon, label: 'Dark Mode', enabled: true },
                                    { icon: Bell, label: 'Notifications', enabled: true },
                                    { icon: Shield, label: 'Privacy', enabled: false },
                                ].map((setting) => (
                                    <div
                                        key={setting.label}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-700/50 transition-colors cursor-pointer"
                                    >
                                        <span className="flex items-center gap-3 text-sm text-gray-300">
                                            <setting.icon className="w-4 h-4 text-gray-500" />
                                            {setting.label}
                                        </span>
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${setting.enabled ? 'bg-vibe-500' : 'bg-dark-600'
                                            }`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.enabled ? 'right-1' : 'left-1'
                                                }`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* View Analytics */}
                        <Link to="/analytics">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="glass-hover p-4 flex items-center justify-between cursor-pointer"
                            >
                                <span className="text-white font-medium">View Detailed Analytics</span>
                                <ChevronRight className="w-5 h-5 text-vibe-400" />
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
