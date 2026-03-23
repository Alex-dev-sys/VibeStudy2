import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Flame,
    RotateCcw,
    Sparkles,
    Target,
    Trophy,
    Wallet,
    Zap,
} from 'lucide-react';
import { courses } from '../data/courses';
import { MANUAL_PAYMENT_NETWORK_LABEL, MANUAL_PAYMENT_WALLET_ADDRESS } from '../lib/billing';
import { useAuthStore } from '../stores/useAuthStore';
import { useBillingStore } from '../stores/useBillingStore';
import { useProgressStore } from '../stores/useProgressStore';

const courseMeta: Record<string, { accent: string; summary: string }> = {
    python: {
        accent: 'from-sky-500 to-cyan-400',
        summary: 'Good for automation, backend fundamentals, and a strong first track.',
    },
    javascript: {
        accent: 'from-amber-400 to-orange-500',
        summary: 'Best entry point if your main goal is web and interfaces.',
    },
    go: {
        accent: 'from-cyan-500 to-teal-400',
        summary: 'A good path for performant services and backend work.',
    },
    csharp: {
        accent: 'from-fuchsia-500 to-violet-500',
        summary: 'Fits .NET development and practical app-building.',
    },
};

function formatJoinDate(value: string | null | undefined) {
    if (!value) {
        return 'Recently';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
    }).format(new Date(value));
}

function getInitials(fullName: string | null | undefined) {
    if (!fullName) {
        return 'VS';
    }

    const initials = fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

    return initials || 'VS';
}

export default function Profile() {
    const { user, profile, fetchProfile } = useAuthStore();
    const { access, entitlements, subscription, paymentRequests, error: billingError } = useBillingStore();
    const { courseProgress, completedTasks, resetAccountProgress } = useProgressStore();
    const [isResetting, setIsResetting] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [resetMessage, setResetMessage] = useState<string | null>(null);

    const totalXp = profile?.total_xp ?? 0;
    const streak = profile?.current_streak ?? 0;
    const level = profile?.level ?? 1;
    const completedLessons = Object.values(courseProgress).reduce(
        (sum, progress) => sum + progress.completed_days.length,
        0
    );
    const activeTracks = Object.keys(courseProgress).length;
    const hasAnyProgress =
        totalXp > 0 || streak > 0 || completedLessons > 0 || completedTasks.length > 0 || activeTracks > 0;
    const isPro = access.canAccessPaidFeatures;
    const latestPaymentRequest = paymentRequests[0] ?? null;

    const trackRows = useMemo(() => {
        return courses
            .filter((course) => courseMeta[course.id])
            .map((course) => {
                const progress = courseProgress[course.id];
                const completedCount = progress?.completed_days.length ?? 0;
                const currentDay = Math.min(progress?.current_day ?? 1, course.totalDays);
                const progressPercent = Math.round((completedCount / course.totalDays) * 100);
                const taskCount = completedTasks.filter((task) => task.course_id === course.id).length;

                return {
                    id: course.id,
                    name: course.name,
                    currentDay,
                    completedCount,
                    progressPercent,
                    taskCount,
                    totalDays: course.totalDays,
                    href: progress ? `/lessons/${course.id}/${currentDay}` : `/lessons/${course.id}`,
                    started: Boolean(progress),
                    accent: courseMeta[course.id].accent,
                    summary: courseMeta[course.id].summary,
                };
            })
            .slice(0, 4);
    }, [completedTasks, courseProgress]);

    const handleReset = async () => {
        if (!confirmReset) {
            setConfirmReset(true);
            setResetMessage('Click once more to confirm the full reset of account progress.');
            return;
        }

        setIsResetting(true);
        setResetMessage(null);

        const success = await resetAccountProgress();

        if (success) {
            await fetchProfile();
            setResetMessage('Account progress was reset. Home and profile now reflect the empty state.');
            setConfirmReset(false);
        } else {
            setResetMessage('Could not reset progress. Check the connection and try again.');
        }

        setIsResetting(false);
    };

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)]" />

            <div className="mx-auto max-w-7xl px-6 py-8">
                <motion.section
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass relative mb-8 overflow-hidden rounded-[2rem] p-8"
                >
                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-vibe-500/15 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-vibe-500 to-vibe-700 text-3xl font-bold text-white shadow-neon">
                                {getInitials(profile?.full_name)}
                            </div>

                            <div>
                                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-vibe-400/20 bg-vibe-500/10 px-3 py-1 text-sm text-vibe-200">
                                    <Sparkles className="h-4 w-4" />
                                    Profile uses real account data only
                                </p>
                                <h1 className="text-3xl font-bold text-white">
                                    {profile?.full_name || user?.email || 'VibeStudy account'}
                                </h1>
                                <p className="mt-2 text-gray-300">
                                    Level {level} • {user?.email || 'email not found'}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Joined {formatJoinDate(profile?.created_at)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Target className="h-4 w-4" />
                                        {activeTracks} active tracks
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link to="/lessons">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-neon inline-flex items-center gap-2 px-5 py-3"
                            >
                                <BookOpen className="h-4 w-4" />
                                Open lessons
                            </motion.div>
                        </Link>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    {[
                        {
                            icon: Zap,
                            label: 'Total XP',
                            value: totalXp.toLocaleString('en-US'),
                            detail: `${Math.max(0, level * 1000 - totalXp)} XP to next level`,
                            accent: 'from-yellow-400 to-orange-500',
                        },
                        {
                            icon: Flame,
                            label: 'Streak',
                            value: `${streak}`,
                            detail: streak > 0 ? 'days in a row' : 'not started yet',
                            accent: 'from-orange-500 to-rose-500',
                        },
                        {
                            icon: CheckCircle2,
                            label: 'Lessons done',
                            value: `${completedLessons}`,
                            detail: `${completedTasks.length} tasks solved`,
                            accent: 'from-emerald-400 to-green-500',
                        },
                        {
                            icon: Trophy,
                            label: 'Tracks started',
                            value: `${activeTracks}`,
                            detail: hasAnyProgress ? 'saved to the account' : 'new account',
                            accent: 'from-vibe-400 to-vibe-600',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-hover rounded-[1.75rem] p-5"
                        >
                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                            <p className="mt-1 text-xs text-vibe-300">{stat.detail}</p>
                        </motion.div>
                    ))}
                </motion.section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your tracks</h2>
                                    <p className="text-sm text-gray-400">
                                        No fake badges and no invented activity. This page shows only what is really in the account.
                                    </p>
                                </div>
                                <Link
                                    to="/lessons"
                                    className="inline-flex items-center gap-1 text-sm text-vibe-300 transition-colors hover:text-vibe-200"
                                >
                                    Open all <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {trackRows.map((track, index) => (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 + index * 0.05 }}
                                        className="rounded-[1.5rem] border border-white/10 bg-dark-800/60 p-5"
                                    >
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className={`mb-2 inline-flex rounded-full bg-gradient-to-r ${track.accent} px-3 py-1 text-sm font-semibold text-white`}>
                                                    {track.name}
                                                </div>
                                                <p className="text-sm text-gray-300">{track.summary}</p>
                                            </div>
                                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                                                {track.started ? `${track.progressPercent}%` : 'Not started'}
                                            </span>
                                        </div>

                                        <div className="mb-3 flex items-center justify-between text-sm">
                                            <span className="text-gray-400">
                                                {track.started ? `Current day ${track.currentDay}` : 'Ready to start from day 1'}
                                            </span>
                                            <span className="text-white">
                                                {track.completedCount}/{track.totalDays} lessons
                                            </span>
                                        </div>

                                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-dark-700">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${track.accent}`}
                                                style={{ width: `${track.progressPercent}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-vibe-300">{track.taskCount} tasks saved</span>
                                            <Link
                                                to={track.href}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-vibe-200"
                                            >
                                                {track.started ? 'Continue' : 'Start'}
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-vibe-300" />
                                <h2 className="text-xl font-bold text-white">Onboarding</h2>
                            </div>

                            {hasAnyProgress ? (
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                                    <p className="text-sm text-gray-300">
                                        Onboarding is already behind you: the account has real saved progress. The best next step is to continue the active track and keep the streak alive.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <Link to="/home" className="btn-neon px-4 py-2 text-sm">
                                            Back to home
                                        </Link>
                                        <Link to="/lessons" className="btn-neon-outline px-4 py-2 text-sm">
                                            Open lessons
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-[1.5rem] border border-vibe-400/20 bg-vibe-500/10 p-5">
                                    <p className="text-sm text-gray-200">
                                        New accounts start honestly now. No fake achievements, just a clear path: choose a track, open day 1, solve the first task, get the first XP.
                                    </p>
                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-sm text-gray-400">Step 1</p>
                                            <p className="mt-1 font-semibold text-white">Choose a language</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-sm text-gray-400">Step 2</p>
                                            <p className="mt-1 font-semibold text-white">Open the first lesson</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-sm text-gray-400">Step 3</p>
                                            <p className="mt-1 font-semibold text-white">Solve the first task</p>
                                        </div>
                                    </div>
                                    <Link to="/lessons" className="btn-neon mt-5 inline-flex px-5 py-3 text-sm">
                                        Start onboarding
                                    </Link>
                                </div>
                            )}
                        </motion.section>
                    </div>

                    <div className="space-y-6">
                        <motion.section
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-amber-300" />
                                <h2 className="text-lg font-bold text-white">Plan and payment</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">Current plan</p>
                                    <p className="mt-1 font-medium text-white">{isPro ? 'VibeStudy Pro' : 'Free'}</p>
                                </div>
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">Status</p>
                                    <p className="mt-1 font-medium text-white">{subscription?.status ?? 'free'}</p>
                                </div>
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">What is unlocked now</p>
                                    <p className="mt-1 font-medium text-white">
                                        {isPro
                                            ? `${entitlements.length} active entitlement records`
                                            : '1 track, first 3 days, and limited AI hints'}
                                    </p>
                                </div>
                            </div>

                            {!isPro ? (
                                <div className="mt-5 space-y-3 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-4">
                                    <p className="text-sm text-amber-50">
                                        Upgrade uses a direct wallet payment now. Open the pricing page, send the exact USDT amount, and submit the transaction hash for review.
                                    </p>
                                    <Link
                                        to="/pricing"
                                        className="inline-flex rounded-2xl border border-amber-200/25 bg-amber-300/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/25"
                                    >
                                        Open payment page
                                    </Link>

                                    {latestPaymentRequest ? (
                                        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white">
                                            <p className="font-semibold">Latest payment request</p>
                                            <p className="mt-2">Status: {latestPaymentRequest.status}</p>
                                            <p className="mt-2">Plan: {latestPaymentRequest.plan_code}</p>
                                            <p className="mt-2 break-all text-amber-100">
                                                Tx hash: {latestPaymentRequest.tx_hash}
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                        <p className="font-semibold text-white">Wallet</p>
                                        <p className="mt-2 break-all">{MANUAL_PAYMENT_WALLET_ADDRESS}</p>
                                        <p className="mt-2 text-slate-300">Network: {MANUAL_PAYMENT_NETWORK_LABEL}</p>
                                    </div>

                                    {billingError ? (
                                        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                            {billingError}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                                    <p>
                                        Paid access is active. Free-tier limits are removed and the account can use the full learning route.
                                    </p>
                                    <p className="text-emerald-100">
                                        Provider: {subscription?.provider ?? 'manual'} • Status: {subscription?.status ?? 'active'}
                                    </p>
                                    {billingError ? (
                                        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                            {billingError}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="glass rounded-[2rem] p-6"
                        >
                            <h2 className="mb-4 text-lg font-bold text-white">Account state</h2>
                            <div className="space-y-3">
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="mt-1 font-medium text-white">{user?.email || 'Not found'}</p>
                                </div>
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">Latest visible result</p>
                                    <p className="mt-1 font-medium text-white">
                                        {hasAnyProgress ? `${completedLessons} lessons and ${completedTasks.length} tasks` : 'No visible activity yet'}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-dark-700/60 px-4 py-3">
                                    <p className="text-sm text-gray-400">Account mode</p>
                                    <p className="mt-1 font-medium text-white">{hasAnyProgress ? 'Active' : 'New'}</p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="glass rounded-[2rem] border border-red-500/20 p-6"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                <h2 className="text-lg font-bold text-white">Reset progress</h2>
                            </div>

                            <p className="text-sm text-gray-300">
                                This is useful for test accounts and demos. It removes completed lessons, tasks, achievements, and returns XP, level, and streak to the starting state.
                            </p>

                            {resetMessage ? (
                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
                                    {resetMessage}
                                </div>
                            ) : null}

                            <motion.button
                                whileHover={{ scale: isResetting ? 1 : 1.02 }}
                                whileTap={{ scale: isResetting ? 1 : 0.98 }}
                                onClick={() => void handleReset()}
                                disabled={isResetting}
                                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-colors ${
                                    confirmReset
                                        ? 'bg-red-500 text-white hover:bg-red-400'
                                        : 'bg-red-500/15 text-red-200 hover:bg-red-500/25'
                                } ${isResetting ? 'cursor-not-allowed opacity-70' : ''}`}
                            >
                                <RotateCcw className="h-4 w-4" />
                                {isResetting
                                    ? 'Resetting data...'
                                    : confirmReset
                                        ? 'Confirm full reset'
                                        : 'Reset my progress'}
                            </motion.button>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                        >
                            <p className="text-sm font-medium text-white">Service pages</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-vibe-200">
                                <Link to="/pricing" className="transition-colors hover:text-white">
                                    Pricing
                                </Link>
                                <Link to="/privacy" className="transition-colors hover:text-white">
                                    Privacy
                                </Link>
                                <Link to="/terms" className="transition-colors hover:text-white">
                                    Terms
                                </Link>
                                <Link to="/support" className="transition-colors hover:text-white">
                                    Support
                                </Link>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </div>
        </div>
    );
}
