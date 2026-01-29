import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Code2,
    Mail,
    Sparkles,
    ArrowRight,
    Github,
    Chrome,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/home',
                },
            });

            if (error) throw error;
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Что-то пошло не так');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin + '/home',
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Ошибка авторизации');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vibe-900/30 via-transparent to-transparent" />

            {/* Animated code patterns */}
            <div className="fixed inset-0 opacity-5">
                <div className="absolute top-10 left-10 text-vibe-300 font-mono text-xs">
                    {`function learn() {`}<br />
                    {`  while(true) {`}<br />
                    {`    code();`}<br />
                    {`    improve();`}<br />
                    {`  }`}<br />
                    {`}`}
                </div>
                <div className="absolute bottom-10 right-10 text-vibe-300 font-mono text-xs">
                    {`const success = `}<br />
                    {`  passion +`}<br />
                    {`  practice +`}<br />
                    {`  persistence;`}
                </div>
            </div>

            {/* Floating orbs */}
            <motion.div
                className="fixed top-1/4 left-1/4 w-64 h-64 bg-vibe-600/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
                className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-vibe-500/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass p-10 rounded-3xl border border-vibe-500/20 shadow-2xl relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-vibe-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-vibe-600/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        {/* Logo */}
                        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                            <motion.div
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center shadow-neon"
                                whileHover={{ rotate: 10 }}
                            >
                                <Code2 className="w-7 h-7 text-white" />
                            </motion.div>
                            <span className="text-3xl font-bold text-white">VibeStudy</span>
                        </Link>

                        {isSuccess ? (
                            /* Success State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Проверьте почту</h2>
                                <p className="text-gray-400 mb-6">
                                    Мы отправили ссылку на<br />
                                    <span className="text-vibe-300 font-medium">{email}</span>
                                </p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-vibe-400 hover:text-vibe-300 transition-colors"
                                >
                                    Использовать другую почту
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Title */}
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать!</h1>
                                    <p className="text-gray-400">Продолжите обучение</p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Magic Link Form */}
                                <form onSubmit={handleMagicLink} className="mb-6">
                                    <div className="relative mb-4">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Введите email"
                                            className="input-glass pl-16 pr-4 py-4 text-lg w-full"
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-neon w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Войти по ссылке
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Divider */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-dark-800 text-gray-500">или войдите через</span>
                                    </div>
                                </div>

                                {/* Social Login */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <motion.button
                                        onClick={() => handleOAuthLogin('google')}
                                        className="btn-neon-outline py-3 flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Chrome className="w-5 h-5" />
                                        Google
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleOAuthLogin('github')}
                                        className="btn-neon-outline py-3 flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Github className="w-5 h-5" />
                                        GitHub
                                    </motion.button>
                                </div>

                                {/* Sign Up Link */}
                                <p className="text-center text-gray-500">
                                    Нет аккаунта?{' '}
                                    <button className="text-vibe-400 hover:text-vibe-300 font-medium transition-colors">
                                        Зарегистрироваться
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    Продолжая, вы соглашаетесь с{' '}
                    <a href="#" className="text-vibe-500 hover:underline">Условиями использования</a>
                    {' '}и{' '}
                    <a href="#" className="text-vibe-500 hover:underline">Политикой конфиденциальности</a>
                </p>
            </motion.div>
        </div>
    );
}
