import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Chrome,
    Code2,
    Loader2,
    Mail,
    Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export default function Auth() {
    const [email, setEmail] = useState('');
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        trackEvent('auth_viewed');
    }, []);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsMagicLinkLoading(true);
        setError('');
        trackEvent('magic_link_requested', {
            provider: 'email',
        });

        try {
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/home`,
                },
            });

            if (signInError) throw signInError;
            setIsSuccess(true);
        } catch (err) {
            setError(getErrorMessage(err, 'Что-то пошло не так. Попробуйте ещё раз.'));
        } finally {
            setIsMagicLinkLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsGoogleLoading(true);
        trackEvent('oauth_google_started', {
            provider: 'google',
        });

        try {
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/home`,
                },
            });

            if (signInError) throw signInError;
        } catch (err) {
            setError(getErrorMessage(err, 'Не удалось начать вход через Google.'));
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vibe-900/30 via-transparent to-transparent" />

            <motion.div
                className="fixed left-1/4 top-1/4 h-64 w-64 rounded-full bg-vibe-600/20 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
                className="fixed bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-vibe-500/20 blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mx-4 w-full max-w-md"
            >
                <div className="glass relative overflow-hidden rounded-3xl border border-vibe-500/20 p-10 shadow-2xl">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-vibe-500/30 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-vibe-600/20 blur-3xl" />

                    <div className="relative z-10">
                        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
                            <motion.div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 shadow-neon"
                                whileHover={{ rotate: 10 }}
                            >
                                <Code2 className="h-7 w-7 text-white" />
                            </motion.div>
                            <span className="text-3xl font-bold text-white">VibeStudy</span>
                        </Link>

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 text-center"
                            >
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-white">Проверьте почту</h2>
                                <p className="mb-6 text-gray-400">
                                    Мы отправили ссылку на вход на
                                    <br />
                                    <span className="font-medium text-vibe-300">{email}</span>
                                </p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-vibe-400 transition-colors hover:text-vibe-300"
                                >
                                    Использовать другой email
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-8 text-center">
                                    <h1 className="mb-2 text-3xl font-bold text-white">Вход в аккаунт</h1>
                                    <p className="text-gray-400">
                                        Сейчас доступны вход через Google и magic link по email.
                                    </p>
                                </div>

                                <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm text-vibe-200">
                                    <Link to="/pricing" className="transition-colors hover:text-white">
                                        Тарифы
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

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="button"
                                    onClick={() => void handleGoogleLogin()}
                                    disabled={isGoogleLoading || isMagicLinkLoading}
                                    className="btn-neon-outline mb-6 flex w-full items-center justify-center gap-2 py-4 text-lg disabled:opacity-70"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isGoogleLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Chrome className="h-5 w-5" />
                                            Войти через Google
                                        </>
                                    )}
                                </motion.button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-dark-800 px-4 text-gray-500">
                                            или получите ссылку на вход
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleMagicLink} className="mb-6">
                                    <div className="relative mb-4">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Введите email"
                                            className="input-glass w-full py-4 pl-12 pr-4 text-lg"
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        disabled={isMagicLinkLoading || isGoogleLoading}
                                        className="btn-neon flex w-full items-center justify-center gap-2 py-4 text-lg disabled:opacity-70"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isMagicLinkLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Получить ссылку для входа
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <div className="rounded-2xl border border-vibe-500/20 bg-vibe-500/10 p-4 text-sm text-vibe-100">
                                    GitHub-вход пока отключён. Пока Google-клиент находится в testing mode,
                                    войти смогут только адреса, добавленные в тестовые пользователи в Google
                                    Cloud.
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-600">
                    Продолжая, вы соглашаетесь с{' '}
                    <Link to="/terms" className="text-vibe-500 hover:underline">
                        условиями использования
                    </Link>{' '}
                    и{' '}
                    <Link to="/privacy" className="text-vibe-500 hover:underline">
                        политикой конфиденциальности
                    </Link>
                    .
                </p>
            </motion.div>
        </div>
    );
}
