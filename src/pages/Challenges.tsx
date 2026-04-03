import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Clock3,
    Filter,
    Flame,
    Lock,
    Medal,
    ShieldCheck,
    Swords,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';

const languages = ['All', 'Python', 'JavaScript', 'Go', 'Rust', 'Java', 'C++'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

const featuredChallenge = {
    id: 'featured-1',
    title: 'Real-Time Chat Architecture',
    description: 'Model a production-grade chat system with pub/sub, sockets, and graceful load distribution.',
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
    { rank: 1, name: 'CodeMaster', xp: 45000 },
    { rank: 2, name: 'PyNinja', xp: 42500 },
    { rank: 3, name: 'RustLord', xp: 38900 },
    { rank: 4, name: 'JSWizard', xp: 35200 },
    { rank: 5, name: 'GoGuru', xp: 32100 },
    { rank: 6, name: 'AlgoKing', xp: 29800 },
];

const languageAccent: Record<string, string> = {
    Python: 'from-sky-400 to-cyan-400',
    JavaScript: 'from-cyan-300 to-violet-400',
    Go: 'from-cyan-300 to-teal-400',
    Rust: 'from-orange-300 to-rose-400',
    Java: 'from-red-300 to-orange-400',
    'C++': 'from-violet-300 to-fuchsia-400',
};

const difficultyStyles: Record<string, string> = {
    Easy: 'border-secondary/20 bg-secondary/10 text-cyan-100',
    Medium: 'border-primary/20 bg-primary/10 text-primary',
    Hard: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
};

function getInitials(value: string) {
    return value
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'VS';
}

export default function Challenges() {
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const filteredChallenges = useMemo(() => {
        return challenges.filter((challenge) => {
            const langMatch = selectedLanguage === 'All' || challenge.language === selectedLanguage;
            const diffMatch = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
            return langMatch && diffMatch;
        });
    }, [selectedDifficulty, selectedLanguage]);

    return (
        <div className="min-h-screen px-8 py-8">
            <div className="mx-auto max-w-7xl">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-premium relative overflow-hidden p-8 lg:p-10"
                >
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/8 blur-[120px]" />
                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="eyebrow">
                                <Swords className="h-3.5 w-3.5" />
                                Competitive layer
                            </div>
                            <h1 className="mt-5 max-w-3xl font-headline text-4xl font-bold tracking-tight text-white lg:text-6xl">
                                Challenge mode with more signal and less arcade noise.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                                Featured problems, sharper filtering, clearer reward framing, and a cleaner route into the
                                Playground for actual solving.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to={`/playground?challenge=${featuredChallenge.id}`} className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-sm">
                                    Start featured challenge
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/analytics" className="btn-neon-outline inline-flex items-center gap-2 px-6 py-3 text-sm">
                                    Open rankings insight
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Your current rank</p>
                                <p className="mt-3 text-3xl font-bold text-white">#1,247</p>
                                <p className="mt-2 text-sm text-slate-300">Enough activity to enter the board, still plenty of room to climb.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tonight&apos;s prize</p>
                                <p className="mt-3 text-3xl font-bold text-white">{featuredChallenge.xp} XP</p>
                                <p className="mt-2 text-sm text-slate-300">Featured challenge payout for the current window.</p>
                            </div>
                            <div className="metric-chip sm:col-span-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Featured challenge timing</p>
                                        <p className="mt-3 text-xl font-semibold text-white">Ends in {featuredChallenge.endsIn}</p>
                                        <p className="mt-2 text-sm text-slate-300">
                                            Built for people who want a sharper loop than passive lesson reading.
                                        </p>
                                    </div>
                                    <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] lg:flex">
                                        <Flame className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <div className="eyebrow">Featured challenge</div>
                                    <h2 className="mt-4 text-3xl font-bold text-white">{featuredChallenge.title}</h2>
                                </div>
                                <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                    {featuredChallenge.endsIn} left
                                </span>
                            </div>

                            <p className="max-w-3xl text-sm leading-7 text-slate-300">{featuredChallenge.description}</p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${difficultyStyles[featuredChallenge.difficulty]}`}>
                                    {featuredChallenge.difficulty}
                                </span>
                                <span className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black ${languageAccent[featuredChallenge.language]}`}>
                                    {featuredChallenge.language}
                                </span>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                                    {featuredChallenge.timeLimit}
                                </span>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                                    {featuredChallenge.participants.toLocaleString('en-US')} solvers
                                </span>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <Link to={`/playground?challenge=${featuredChallenge.id}`} className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-sm">
                                    Open in Playground
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                                    <Zap className="h-4 w-4 text-primary" />
                                    {featuredChallenge.xp} XP reward
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="mb-5 flex flex-wrap items-center gap-3">
                                <div className="eyebrow">
                                    <Filter className="h-3.5 w-3.5" />
                                    Filtering
                                </div>
                                <p className="text-sm text-slate-400">Cut through the board and go straight to the right challenge profile.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setSelectedLanguage(lang)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                selectedLanguage === lang
                                                    ? 'border border-primary/20 bg-primary/10 text-white'
                                                    : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {difficulties.map((difficulty) => (
                                        <button
                                            key={difficulty}
                                            type="button"
                                            onClick={() => setSelectedDifficulty(difficulty)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                selectedDifficulty === difficulty
                                                    ? 'border border-cyan-300/20 bg-cyan-300/10 text-white'
                                                    : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            {difficulty}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16 }}
                            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {filteredChallenges.map((challenge, index) => (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.03 }}
                                    className="surface-premium-soft p-5"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black ${languageAccent[challenge.language]}`}>
                                            {challenge.language}
                                        </div>
                                        {challenge.status === 'locked' ? (
                                            <Lock className="h-4.5 w-4.5 text-slate-500" />
                                        ) : challenge.status === 'completed' ? (
                                                <ShieldCheck className="h-4.5 w-4.5 text-secondary" />
                                        ) : null}
                                    </div>

                                    <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${difficultyStyles[challenge.difficulty]}`}>
                                            {challenge.difficulty}
                                        </span>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                                            {challenge.time}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                                        <span className="inline-flex items-center gap-2">
                                            <Clock3 className="h-4 w-4 text-slate-500" />
                                            {challenge.time}
                                        </span>
                                        <span className="inline-flex items-center gap-2 text-primary">
                                            <Zap className="h-4 w-4" />
                                            {challenge.xp} XP
                                        </span>
                                    </div>

                                    {challenge.status === 'available' ? (
                                        <Link to={`/playground?challenge=${challenge.id}`} className="btn-neon-outline mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm">
                                            Start challenge
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-slate-400">
                                            {challenge.status === 'completed' ? 'Already completed' : 'Unlock through more progress'}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.section>
                    </div>

                    <div className="space-y-6">
                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="eyebrow">
                                <Trophy className="h-3.5 w-3.5" />
                                Live board
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-white">Global leaderboard</h2>
                            <div className="mt-5 space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                                        <div className="w-10 text-sm font-semibold text-slate-400">#{entry.rank}</div>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-white">
                                            {getInitials(entry.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-white">{entry.name}</p>
                                            <p className="text-xs text-slate-400">{entry.xp.toLocaleString('en-US')} XP</p>
                                        </div>
                                        {index < 3 ? <Medal className="h-4.5 w-4.5 text-primary" /> : null}
                                    </div>
                                ))}
                            </div>
                            <Link to="/analytics" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                                Open full analytics
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="eyebrow">Why this screen exists</div>
                            <h2 className="mt-4 text-xl font-bold text-white">Challenges should feel sharper than lessons.</h2>
                            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                                <p>
                                    Lessons build consistency. Challenges build edge. This screen now frames urgency, reward,
                                    competitive context, and the path into solving more clearly.
                                </p>
                                <p>
                                    The result is a stronger internal product hierarchy: Home for direction, Lessons for steady
                                    progress, Challenges for pressure, and Playground for execution.
                                </p>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="surface-premium-soft p-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                    <Users className="h-5 w-5 text-cyan-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Competitive signal</p>
                                    <p className="text-sm text-slate-400">Featured and filtered challenge surfaces are now easier to scan and trust.</p>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </div>
        </div>
    );
}
