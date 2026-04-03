import { motion } from 'framer-motion';
import { Bell, Flame, Sparkles, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const routeMeta: Record<string, { title: string; subtitle: string }> = {
    '/home': { title: 'Control Center', subtitle: 'Your daily learning rhythm, focus, and next move.' },
    '/lessons': { title: 'Lessons', subtitle: 'Track-first learning with clear momentum and better context.' },
    '/playground': { title: 'Playground', subtitle: 'An interactive code lab for testing ideas and solutions.' },
    '/challenges': { title: 'Challenges', subtitle: 'Competitive drills, featured tasks, and a sharper feedback loop.' },
    '/analytics': { title: 'Analytics', subtitle: 'Only real account data, visualized like a product should.' },
    '/profile': { title: 'Profile', subtitle: 'Identity, access, and the current state of your account.' },
};

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuthStore();

    const streak = profile?.current_streak ?? 0;
    const totalXp = profile?.total_xp ?? 0;
    const matchedRoute =
        Object.keys(routeMeta).find((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)) ??
        '/home';
    const activeMeta = routeMeta[matchedRoute];

    return (
        <header className="fixed left-72 right-0 top-0 z-40 border-b border-white/8 bg-[rgba(7,10,18,0.72)] backdrop-blur-xl">
            <div className="mx-auto flex h-24 items-center justify-between gap-6 px-8">
                <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                        <Sparkles className="h-3.5 w-3.5 text-[#F8D775]" />
                        Product surface
                    </div>
                    <h2 className="font-headline text-2xl font-bold tracking-tight text-white">{activeMeta.title}</h2>
                    <p className="mt-1 max-w-xl text-sm text-slate-400">{activeMeta.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="metric-chip hidden min-w-[9rem] md:block">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Current streak</p>
                        <div className="mt-2 flex items-center gap-2">
                            <Flame className="h-4 w-4 text-[#F3BA2F]" />
                            <span className="text-sm font-semibold text-white">{streak} days</span>
                        </div>
                    </div>
                    <div className="metric-chip hidden min-w-[9rem] md:block">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Total XP</p>
                        <div className="mt-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-cyan-300" />
                            <span className="text-sm font-semibold text-white">{totalXp.toLocaleString('en-US')}</span>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-[#F3BA2F]/20 hover:bg-[#F3BA2F]/10 hover:text-white"
                    >
                        <Bell className="h-4.5 w-4.5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/profile')}
                        className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(243,186,47,0.24),rgba(7,198,239,0.2))] text-xs font-bold text-white">
                            {profile?.full_name?.[0]?.toUpperCase() ?? 'V'}
                        </div>
                        <div className="hidden text-left lg:block">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Account</p>
                            <p className="text-sm font-semibold text-white">{profile?.full_name || 'View profile'}</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
