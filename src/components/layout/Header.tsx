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
    BookOpen
} from 'lucide-react';

const navLinks = [
    { path: '/home', label: 'Dashboard', icon: Home },
    { path: '/lessons', label: 'Lessons', icon: BookOpen },
    { path: '/playground', label: 'Playground', icon: Code2 },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="mx-4 mt-2">
                <div className="glass px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center shadow-neon">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-vibe-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            </motion.div>
                            <span className="text-xl font-bold text-gradient hidden sm:block">
                                Vibe Study
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.path);

                                return (
                                    <Link key={link.path} to={link.path}>
                                        <motion.div
                                            className={`
                        relative px-4 py-2 rounded-xl flex items-center gap-2
                        transition-colors duration-300
                        ${active
                                                    ? 'text-white'
                                                    : 'text-gray-400 hover:text-white'
                                                }
                      `}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="navActive"
                                                    className="absolute inset-0 bg-vibe-600/30 rounded-xl border border-vibe-500/50"
                                                    initial={false}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <Icon className="w-4 h-4 relative z-10" />
                                            <span className="text-sm font-medium relative z-10">
                                                {link.label}
                                            </span>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth Button (Desktop) */}
                        <div className="hidden md:block">
                            <Link to="/auth">
                                <motion.button
                                    className="btn-neon text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started
                                </motion.button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            className="md:hidden p-2 rounded-xl glass"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-white" />
                            ) : (
                                <Menu className="w-5 h-5 text-white" />
                            )}
                        </motion.button>
                    </div>

                    {/* Mobile Navigation */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="md:hidden mt-4 pt-4 border-t border-white/10"
                            >
                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link, index) => {
                                        const Icon = link.icon;
                                        const active = isActive(link.path);

                                        return (
                                            <motion.div
                                                key={link.path}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            transition-all duration-300
                            ${active
                                                            ? 'bg-vibe-600/30 text-white border border-vibe-500/50'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }
                          `}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{link.label}</span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: navLinks.length * 0.05 }}
                                        className="mt-2"
                                    >
                                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                                            <button className="btn-neon w-full">
                                                Get Started
                                            </button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </header>
    );
}
