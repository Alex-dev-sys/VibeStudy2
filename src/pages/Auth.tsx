import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Chrome,
    Eye,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

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
        <main className="auth-page">
            <Link to="/" className="auth-back"><ArrowLeft className="h-4 w-4" /> На главную</Link>

            <section className="auth-preview">
                <div className="auth-preview__brand"><span>VS</span><strong>VibeStudy</strong></div>
                <div className="auth-preview__content">
                    <p className="plain-label">Перед регистрацией</p>
                    <h1>Посмотри продукт на готовом учебном профиле.</h1>
                    <p>Демо покажет уроки, редактор и аналитику. Оно не создаёт аккаунт и не отправляет учебные данные на сервер.</p>

                    <div className="auth-preview__session">
                        <div><span>Сегодня</span><time>24 мин</time></div>
                        <h2>Python · функции</h2>
                        <ul>
                            <li><Check className="h-4 w-4" /> 7 минут теории</li>
                            <li><Check className="h-4 w-4" /> 1 задача в редакторе</li>
                            <li><Check className="h-4 w-4" /> разбор решения</li>
                        </ul>
                    </div>
                </div>
                <p className="auth-preview__foot">Прогресс в демо сохраняется только в текущем браузере.</p>
            </section>

            <section className="auth-panel">
                <div className="auth-panel__inner">
                    <div className="auth-panel__heading">
                        <span>Вход</span>
                        <h2>Продолжить обучение</h2>
                        <p>Для первого знакомства аккаунт не нужен.</p>
                    </div>

                    <button type="button" onClick={handleDemo} className="demo-entry">
                        <span><Eye className="h-5 w-5" /></span>
                        <span><strong>Войти без регистрации</strong><small>Открыть демо-профиль</small></span>
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="auth-divider"><span>или сохранить прогресс</span></div>

                    {isSuccess ? (
                        <div className="auth-success">
                            <CheckCircle2 className="h-9 w-9" />
                            <h3>Проверьте почту</h3>
                            <p>Ссылка для входа отправлена на <strong>{email}</strong>.</p>
                            <button type="button" onClick={() => setIsSuccess(false)}>Указать другой email</button>
                        </div>
                    ) : (
                        <div className="auth-form-block">
                            <button
                                type="button"
                                onClick={() => void handleGoogleLogin()}
                                disabled={isGoogleLoading || isMagicLinkLoading}
                                className="google-action"
                            >
                                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
                                Продолжить с Google
                            </button>

                            {error ? <div className="auth-error">{error}</div> : null}

                            <form onSubmit={handleMagicLink}>
                                <label htmlFor="email">Email для ссылки на вход</label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="name@company.com"
                                    required
                                />
                                <button type="submit" disabled={isMagicLinkLoading || isGoogleLoading} className="primary-action">
                                    {isMagicLinkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Получить ссылку <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="auth-legal">
                        <ShieldCheck className="h-4 w-4" />
                        <p>
                            Продолжая вход, вы соглашаетесь с <Link to="/terms">условиями использования</Link> и{' '}
                            <Link to="/privacy">политикой конфиденциальности</Link>.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}