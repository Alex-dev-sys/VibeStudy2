import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Flame,
    Clock,
    Zap,
    Filter,
    Star,
    Lock,
    CheckCircle2,
    ChevronRight,
    Timer,
    Users,
    Target
} from 'lucide-react';

const languages = ['All', 'Python', 'JavaScript', 'Go', 'Rust', 'Java', 'C++'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

const featuredChallenge = {
    id: 'featured-1',
    title: 'Build a Real-Time Chat System',
    description: 'Design and implement a scalable WebSocket-based chat application',
    difficulty: 'Hard',
    language: 'Python',
    xp: 500,
    timeLimit: '45 min',
    participants: 1247,
    endsIn: '2h 34m',
};

const challenges = [
    { id: '1', title: 'Two Sum', difficulty: 'Easy', language: 'Python', xp: 50, time: '15 min', status: 'completed' },
    { id: '2', title: 'Reverse Linked List', difficulty: 'Easy', language: 'Python', xp: 75, time: '20 min', status: 'completed' },
    { id: '3', title: 'Binary Search Tree', difficulty: 'Medium', language: 'JavaScript', xp: 150, time: '30 min', status: 'available' },
    { id: '4', title: 'Graph Traversal', difficulty: 'Medium', language: 'Python', xp: 175, time: '35 min', status: 'available' },
    { id: '5', title: 'Dynamic Programming', difficulty: 'Hard', language: 'Go', xp: 300, time: '45 min', status: 'locked' },
    { id: '6', title: 'System Design', difficulty: 'Hard', language: 'Rust', xp: 400, time: '60 min', status: 'locked' },
    { id: '7', title: 'String Manipulation', difficulty: 'Easy', language: 'JavaScript', xp: 60, time: '15 min', status: 'available' },
    { id: '8', title: 'Tree Balancing', difficulty: 'Medium', language: 'Java', xp: 200, time: '40 min', status: 'available' },
    { id: '9', title: 'Concurrency Patterns', difficulty: 'Hard', language: 'Go', xp: 350, time: '50 min', status: 'locked' },
];

const leaderboard = [
    { rank: 1, name: 'CodeMaster', xp: 45000, avatar: '👨‍💻' },
    { rank: 2, name: 'PyNinja', xp: 42500, avatar: '🥷' },
    { rank: 3, name: 'RustLord', xp: 38900, avatar: '🦀' },
    { rank: 4, name: 'JSWizard', xp: 35200, avatar: '⚡' },
    { rank: 5, name: 'GoGuru', xp: 32100, avatar: '🔷' },
    { rank: 6, name: 'AlgoKing', xp: 29800, avatar: '👑' },
    { rank: 7, name: 'DataDev', xp: 27500, avatar: '📊' },
    { rank: 8, name: 'ByteHero', xp: 25200, avatar: '🦸' },
];

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'Easy': return 'text-green-400 bg-green-500/20';
        case 'Medium': return 'text-orange-400 bg-orange-500/20';
        case 'Hard': return 'text-red-400 bg-red-500/20';
        default: return 'text-gray-400 bg-gray-500/20';
    }
};

const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
        Python: '🐍',
        JavaScript: '⚡',
        Go: '🔷',
        Rust: '🦀',
        Java: '☕',
        'C++': '⚙️',
    };
    return icons[lang] || '💻';
};

export default function Challenges() {
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const filteredChallenges = challenges.filter((c) => {
        const langMatch = selectedLanguage === 'All' || c.language === selectedLanguage;
        const diffMatch = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
        return langMatch && diffMatch;
    });

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Daily Challenges</h1>
                        <p className="text-gray-400">Sharpen your skills with AI-generated problems</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-white font-medium">Rank #1,247</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Featured Challenge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 relative overflow-hidden border border-vibe-500/30"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-vibe-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-vibe-600/20 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    <span className="text-orange-400 font-medium">Featured Challenge</span>
                                    <span className="ml-auto flex items-center gap-1 text-vibe-400">
                                        <Timer className="w-4 h-4" />
                                        Ends in {featuredChallenge.endsIn}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-3">{featuredChallenge.title}</h2>
                                <p className="text-gray-400 mb-6 max-w-2xl">{featuredChallenge.description}</p>

                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getDifficultyColor(featuredChallenge.difficulty)}`}>
                                        {featuredChallenge.difficulty}
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-300">
                                        {getLanguageIcon(featuredChallenge.language)} {featuredChallenge.language}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <Clock className="w-4 h-4" /> {featuredChallenge.timeLimit}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <Users className="w-4 h-4" /> {featuredChallenge.participants.toLocaleString()} solving
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link to={`/playground?challenge=${featuredChallenge.id}`}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="btn-neon px-8 py-3 text-lg flex items-center gap-2"
                                        >
                                            <Target className="w-5 h-5" />
                                            Start Challenge
                                        </motion.button>
                                    </Link>
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <Zap className="w-6 h-6" />
                                        <span className="text-2xl font-bold">{featuredChallenge.xp}</span>
                                        <span className="text-yellow-400/60">XP</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400 text-sm">Filter:</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {languages.map((lang) => (
                                    <motion.button
                                        key={lang}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedLanguage(lang)}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedLanguage === lang
                                                ? 'bg-vibe-500 text-white shadow-neon'
                                                : 'glass text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {lang !== 'All' && <span className="mr-1">{getLanguageIcon(lang)}</span>}
                                        {lang}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {difficulties.map((diff) => (
                                    <motion.button
                                        key={diff}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedDifficulty === diff
                                                ? 'bg-vibe-500 text-white shadow-neon'
                                                : 'glass text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {diff}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Challenges Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredChallenges.map((challenge, index) => (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    className={`glass-hover p-5 relative ${challenge.status === 'locked' ? 'opacity-60' : ''
                                        }`}
                                >
                                    {challenge.status === 'completed' && (
                                        <div className="absolute top-4 right-4">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                    )}
                                    {challenge.status === 'locked' && (
                                        <div className="absolute top-4 right-4">
                                            <Lock className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">{getLanguageIcon(challenge.language)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {challenge.time}
                                        </span>
                                        <span className="text-yellow-500 flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> {challenge.xp} XP
                                        </span>
                                    </div>

                                    {challenge.status === 'available' && (
                                        <Link to={`/playground?challenge=${challenge.id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="btn-neon-outline w-full mt-4 py-2 text-sm"
                                            >
                                                Start
                                            </motion.button>
                                        </Link>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Leaderboard Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass p-6 h-fit sticky top-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Global Leaderboard
                        </h3>

                        <div className="space-y-3">
                            {leaderboard.map((user, index) => (
                                <motion.div
                                    key={user.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${index < 3 ? 'bg-vibe-500/10' : 'hover:bg-dark-700/50'
                                        }`}
                                >
                                    <span className={`w-6 text-center font-bold ${index === 0 ? 'text-yellow-400' :
                                            index === 1 ? 'text-gray-300' :
                                                index === 2 ? 'text-orange-400' :
                                                    'text-gray-500'
                                        }`}>
                                        #{user.rank}
                                    </span>
                                    <span className="text-xl">{user.avatar}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.xp.toLocaleString()} XP</p>
                                    </div>
                                    {index < 3 && (
                                        <Star className={`w-4 h-4 ${index === 0 ? 'text-yellow-400' :
                                                index === 1 ? 'text-gray-300' :
                                                    'text-orange-400'
                                            }`} />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <Link to="/analytics">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                className="w-full mt-4 py-2 text-sm text-vibe-400 hover:text-vibe-300 flex items-center justify-center gap-1"
                            >
                                View Full Rankings <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
