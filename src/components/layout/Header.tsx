import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Code2,
    Trophy,
    BarChart3,
    User,
    Menu,
    X,
    Sparkles,
    BookOpen,
    Crown,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

const navLinks = [
    { path: '/home', label: 'Главная', icon: Home },
    { path: '/lessons', label: 'Уроки', icon: BookOpen },
    { path: '/playground', label: 'Песочница', icon: Code2 },
    { path: '/challenges', label: 'Задачи', icon: Trophy },
    { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
    { path: '/profile', label: 'Профиль', icon: User },
];

function getDisplayName(fullName: string | null | undefined) {
    if (!fullName) {
        return 'Пользователь';
    }

    return fullName.trim().split(/\s+/)[0] || 'Пользователь';
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { profile, signOut } = useAuthStore();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="fixed left-0 right-0 top-0 z-50">
            <nav className="mx-4 mt-2">
                <div className="glass px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="group flex items-center gap-3">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vibe-500 to-vibe-700 shadow-neon">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-vibe-500 opacity-50 blur-xl transition-opacity group-hover:opacity-75" />
                            </motion.div>
                            <div className="hidden sm:block">
                                <span className="block text-xl font-bold text-gradient">VibeStudy</span>
                                <span className="block text-xs text-gray-500">AI daily coding coach</span>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-1 md:flex">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.path);

                                return (
                                    <Link key={link.path} to={link.path}>
                                        <motion.div
                                            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 transition-colors duration-300 ${
                                                active ? 'text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="navActive"
                                                    className="absolute inset-0 rounded-xl border border-vibe-500/50 bg-vibe-600/30"
                                                    initial={false}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <Icon className="relative z-10 h-4 w-4" />
                                            <span className="relative z-10 text-sm font-medium">{link.label}</span>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            <Link to="/pricing">
                                <motion.div
                                    className="flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Crown className="h-4 w-4" />
                                    Тарифы Pro
                                </motion.div>
                            </Link>

                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                                <p className="text-xs text-gray-500">Аккаунт</p>
                                <p className="text-sm text-gray-200">{getDisplayName(profile?.full_name)}</p>
                            </div>
                            <motion.button
                                className="btn-neon text-sm"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => void signOut()}
                            >
                                Выйти
                            </motion.button>
                        </div>

                        <motion.button
                            className="glass rounded-xl p-2 md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.92 }}
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5 text-white" />
                            ) : (
                                <Menu className="h-5 w-5 text-white" />
                            )}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="mt-4 border-t border-white/10 pt-4 md:hidden"
                            >
                                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-xs text-gray-500">Аккаунт</p>
                                    <p className="text-sm text-gray-200">{getDisplayName(profile?.full_name)}</p>
                                </div>

                                <div className="mb-2">
                                    <Link
                                        to="/pricing"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-amber-100 transition-colors hover:bg-amber-300/20"
                                    >
                                        <Crown className="h-5 w-5" />
                                        <span className="font-medium">Тарифы Pro</span>
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link, index) => {
                                        const Icon = link.icon;
                                        const active = isActive(link.path);

                                        return (
                                            <motion.div
                                                key={link.path}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.04 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                                                        active
                                                            ? 'border border-vibe-500/50 bg-vibe-600/30 text-white'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span className="font-medium">{link.label}</span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}

                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: navLinks.length * 0.04 }}
                                        className="btn-neon mt-2 w-full"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            void signOut();
                                        }}
                                    >
                                        Выйти
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </header>
    );
}
