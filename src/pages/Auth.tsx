import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Chrome, Loader2, Sparkles } from 'lucide-react';
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
        trackEvent('magic_link_requested', { provider: 'email' });

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
        trackEvent('oauth_google_started', { provider: 'google' });

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
        <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
            <section className="hidden flex-col justify-center bg-surface-container-low p-16 md:flex">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-headline text-6xl font-bold leading-tight text-on-surface">
                        Начни свой путь <br />
                        в <span className="text-primary">IT.</span>
                    </h1>
                    <p className="mt-6 text-lg text-on-surface-variant">
                        Персонализированные треки обучения, сгенерированные нейросетью.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 rounded-2xl bg-surface-container p-6 font-mono text-sm leading-relaxed text-secondary"
                >
                    <p>
                        <span className="text-tertiary">def</span>{' '}
                        <span className="text-primary">level_up</span>(xp):
                    </p>
                    <p className="pl-4">
                        if xp &gt; 2400:
                        <span className="text-on-surface-variant italic"> # Senior Dev</span>
                    </p>
                    <p className="pl-8">
                        <span className="text-tertiary">return</span>{' '}
                        <span className="text-secondary">"new career"</span>
                    </p>
                </motion.div>
            </section>

            <section className="flex items-center justify-center bg-background p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="glass rounded-2xl bg-surface-container-low p-10">
                        <div className="mb-10 flex gap-8 border-b border-outline-variant/20 pb-4">
                            <button className="font-headline text-sm font-bold text-primary">
                                Вход
                            </button>
                        </div>

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 text-center"
                            >
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                                </div>
                                <h2 className="mb-3 font-headline text-2xl font-bold text-on-surface">
                                    Проверьте почту
                                </h2>
                                <p className="mb-6 text-on-surface-variant">
                                    Мы отправили ссылку на вход на{' '}
                                    <span className="font-medium text-primary">{email}</span>
                                </p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-primary transition-colors hover:text-primary-dim"
                                >
                                    Использовать другой email
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <motion.button
                                    type="button"
                                    onClick={() => void handleGoogleLogin()}
                                    disabled={isGoogleLoading || isMagicLinkLoading}
                                    className="mb-6 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3.5 font-bold text-black transition-opacity hover:bg-white/90 disabled:opacity-70"
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

                                <div className="relative mb-6 flex items-center py-2">
                                    <div className="flex-grow border-t border-outline-variant/30"></div>
                                    <span className="mx-4 text-xs text-on-surface-variant/60">
                                        ИЛИ ВХОД ПО EMAIL
                                    </span>
                                    <div className="flex-grow border-t border-outline-variant/30"></div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-center text-sm text-error"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleMagicLink}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="input-glass mb-4 w-full py-3.5"
                                        required
                                    />
                                    <motion.button
                                        type="submit"
                                        disabled={isMagicLinkLoading || isGoogleLoading}
                                        className="btn-neon flex w-full items-center justify-center gap-2 py-4 disabled:opacity-70"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isMagicLinkLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Получить ссылку
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-on-surface-variant">
                                    GitHub-вход пока отключён. Пока Google-клиент находится в testing
                                    mode, войти смогут только адреса, добавленные в тестовые
                                    пользователи.
                                </div>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-outline">
                        Продолжая, вы соглашаетесь с{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                            условиями использования
                        </Link>{' '}
                        и{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                            политикой конфиденциальности
                        </Link>
                        .
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
