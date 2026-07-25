import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Chrome,
    Eye,
    Loader2,
    Route,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { useAuthStore } from '../stores/useAuthStore';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

const demoSteps = [
    { code: '01', label: 'Открой готовый учебный профиль' },
    { code: '02', label: 'Посмотри уроки, прогресс и аналитику' },
    { code: '03', label: 'Попробуй код — данные останутся локально' },
];

export default function Auth() {
    const navigate = useNavigate();
    const enterDemo = useAuthStore((state) => state.enterDemo);
    const [email, setEmail] = useState('');
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        trackEvent('auth_viewed');
    }, []);

    const handleDemo = () => {
        enterDemo();
        trackEvent('demo_started');
        navigate('/home', { replace: true });
    };

    const handleMagicLink = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email) return;

        setIsMagicLinkLoading(true);
        setError('');
        trackEvent('magic_link_requested', { provider: 'email' });

        try {
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/home` },
            });
            if (signInError) throw signInError;
            setIsSuccess(true);
        } catch (err) {
            setError(getErrorMessage(err, 'Не удалось отправить ссылку. Попробуйте ещё раз.'));
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
                options: { redirectTo: `${window.location.origin}/home` },
            });
            if (signInError) throw signInError;
        } catch (err) {
            setError(getErrorMessage(err, 'Не удалось начать вход через Google.'));
            setIsGoogleLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-on-surface">
            <div className="app-grid" aria-hidden="true" />
            <Link
                to="/"
                className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 backdrop-blur-xl transition hover:border-primary/30 hover:text-white sm:left-8 sm:top-8"
            >
                <ArrowLeft className="h-4 w-4" /> На главную
            </Link>

            <div className="mx-auto grid min-h-screen max-w-[92rem] lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/8 px-12 py-12 lg:flex xl:px-20 xl:py-16">
                    <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
                    <div className="relative z-10 mt-20">
                        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
                            <Route className="h-4 w-4" /> Learning runtime / ready
                        </div>
                        <h1 className="mt-7 max-w-3xl font-headline text-5xl font-bold leading-[1.05] tracking-[-0.055em] text-white xl:text-7xl">
                            Посмотри продукт.<br />Решение — потом.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Демо открывает готовую траекторию обучения без регистрации, писем и настройки аккаунта.
                        </p>
                    </div>

                    <div className="relative z-10 max-w-xl">
                        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">demo.sequence</div>
                        <div className="relative space-y-3 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-gradient-to-b before:from-primary before:to-primary/10">
                            {demoSteps.map((step) => (
                                <div key={step.code} className="relative flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 backdrop-blur-xl">
                                    <span className="z-10 grid h-10 w-10 flex-none place-items-center rounded-xl bg-[#07101F] font-mono text-xs text-primary ring-1 ring-primary/30">
                                        {step.code}
                                    </span>
                                    <span className="text-sm font-medium text-slate-200">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-5 pb-12 pt-24 sm:px-10 lg:pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[31rem]"
                    >
                        <div className="mb-7">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#B8C5FF]">
                                <Sparkles className="h-3.5 w-3.5" /> access.console
                            </div>
                            <h2 className="mt-5 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">Войти в VibeStudy</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-400">Сначала можно посмотреть всё в демо. Аккаунт понадобится только для синхронизации прогресса.</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDemo}
                            className="group relative mb-5 flex w-full items-center justify-between overflow-hidden rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] p-5 text-left transition hover:border-cyan-300/45 hover:bg-cyan-300/[0.12]"
                        >
                            <span className="flex items-center gap-4">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/12 text-cyan-200"><Eye className="h-5 w-5" /></span>
                                <span>
                                    <strong className="block text-base text-white">Войти без регистрации</strong>
                                    <small className="mt-1 block text-sm text-slate-300">Открыть безопасный демо-профиль</small>
                                </span>
                            </span>
                            <ArrowRight className="h-5 w-5 text-cyan-200 transition-transform group-hover:translate-x-1" />
                        </button>

                        <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                            <span className="h-px flex-1 bg-white/8" /> или сохранить прогресс <span className="h-px flex-1 bg-white/8" />
                        </div>

                        <div className="rounded-[1.4rem] border border-white/9 bg-[#0D1728]/75 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                            {isSuccess ? (
                                <div className="py-6 text-center">
                                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><CheckCircle2 className="h-8 w-8" /></span>
                                    <h3 className="mt-5 font-headline text-xl font-bold text-white">Проверьте почту</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">Ссылка для входа отправлена на <span className="text-slate-200">{email}</span>.</p>
                                    <button type="button" onClick={() => setIsSuccess(false)} className="mt-5 text-sm font-semibold text-primary hover:text-cyan-200">Указать другой email</button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => void handleGoogleLogin()}
                                        disabled={isGoogleLoading || isMagicLinkLoading}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#07101F] transition hover:bg-slate-100 disabled:opacity-60"
                                    >
                                        {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Chrome className="h-5 w-5" /> Продолжить с Google</>}
                                    </button>

                                    {error ? <div className="mt-4 rounded-xl border border-error/25 bg-error/10 p-3 text-sm text-error">{error}</div> : null}

                                    <form onSubmit={handleMagicLink} className="mt-4">
                                        <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-300">Email для magic link</label>
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="name@company.com"
                                            className="input-glass rounded-xl py-3.5"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isMagicLinkLoading || isGoogleLoading}
                                            className="btn-neon mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm disabled:opacity-60"
                                        >
                                            {isMagicLinkLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Получить ссылку <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/7 px-4 py-3 text-xs leading-5 text-slate-500">
                            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
                            Демо не создаёт пользователя в Supabase и не отправляет данные на сервер. Продолжая вход, вы соглашаетесь с <Link to="/terms" className="text-slate-300 hover:text-white">условиями использования</Link> и <Link to="/privacy" className="text-slate-300 hover:text-white">политикой конфиденциальности</Link>.
                        </div>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}