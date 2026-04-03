import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CircleUserRound,
    CodeXml,
    House,
    Sparkles,
    Swords,
} from 'lucide-react';

const navItems = [
    { path: '/home', label: 'Home', icon: House },
    { path: '/lessons', label: 'Lessons', icon: BookOpen },
    { path: '/playground', label: 'Playground', icon: CodeXml },
    { path: '/challenges', label: 'Challenges', icon: Swords },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: CircleUserRound },
];

export default function Sidebar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(8,12,20,0.96))] px-5 py-6">
            <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5">
                <Link to="/" className="block">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F3BA2F]/20 bg-[#F3BA2F]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F8D775]">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Coding Coach
                    </div>
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-white">VibeStudy</h1>
                    <p className="mt-2 max-w-[13rem] text-sm leading-6 text-slate-300">
                        A cinematic daily learning space for code, momentum, and real progress.
                    </p>
                </Link>
            </div>

            <nav className="mt-6 flex-1 space-y-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link key={item.path} to={item.path}>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 + index * 0.03 }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group flex items-center gap-3 rounded-[1.25rem] px-4 py-3 transition ${
                                    active
                                        ? 'border border-[#F3BA2F]/18 bg-[#F3BA2F]/10 text-white'
                                        : 'border border-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                                        active
                                            ? 'bg-[#F3BA2F]/14 text-[#F8D775]'
                                            : 'bg-white/[0.04] text-slate-400 group-hover:text-[#F8D775]'
                                    }`}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-xs text-slate-500 group-hover:text-slate-400">
                                        {item.label === 'Home'
                                            ? 'Focus and momentum'
                                            : item.label === 'Lessons'
                                                ? 'Daily learning route'
                                                : item.label === 'Playground'
                                                    ? 'Interactive code lab'
                                                    : item.label === 'Challenges'
                                                        ? 'Competitive drills'
                                                        : item.label === 'Analytics'
                                                            ? 'Real learning signal'
                                                            : 'Account and billing'}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="surface-premium-soft mt-6 overflow-hidden p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    Premium surface
                </div>
                <h2 className="text-lg font-bold text-white">Unlock the full route</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                    Continue through the premium checkout and remove limits across tracks, AI guidance, and advanced flows.
                </p>
                <Link
                    to="/pricing"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#F3BA2F]/25 bg-[#F3BA2F]/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#F3BA2F]/16"
                >
                    Open pricing
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
        </aside>
    );
}
