import { Bell, Flame, Route, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const routeMeta: Record<string, { code: string; title: string; subtitle: string }> = {
    '/home': { code: 'OVERVIEW', title: 'Центр обучения', subtitle: 'Фокус, серия и следующий понятный шаг.' },
    '/lessons': { code: 'LEARN', title: 'Уроки', subtitle: 'Короткие ежедневные сессии по выбранному треку.' },
    '/playground': { code: 'BUILD', title: 'Лаборатория', subtitle: 'Среда для экспериментов и быстрых проверок.' },
    '/challenges': { code: 'PRACTICE', title: 'Челленджи', subtitle: 'Задачи, которые превращают теорию в навык.' },
    '/analytics': { code: 'SIGNALS', title: 'Аналитика', subtitle: 'Реальный прогресс без декоративных метрик.' },
    '/profile': { code: 'IDENTITY', title: 'Профиль', subtitle: 'Аккаунт, доступ и состояние обучения.' },
};

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, isDemo } = useAuthStore();

    const matchedRoute = Object.keys(routeMeta).find(
        (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
    ) ?? '/home';
    const activeMeta = routeMeta[matchedRoute];
    const streak = profile?.current_streak ?? 0;
    const totalXp = profile?.total_xp ?? 0;

    return (
        <header className={`workspace-header ${isDemo ? 'workspace-header--demo' : ''}`}>
            <div className="min-w-0">
                <div className="workspace-header__code">
                    <Route className="h-3.5 w-3.5" />
                    {activeMeta.code} / {isDemo ? 'DEMO' : 'LIVE'}
                </div>
                <h1>{activeMeta.title}</h1>
                <p>{activeMeta.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="header-metric hidden sm:flex">
                    <Flame className="h-4 w-4 text-amber-300" />
                    <span><strong>{streak}</strong> дней</span>
                </div>
                <div className="header-metric hidden md:flex">
                    <Zap className="h-4 w-4 text-cyan-300" />
                    <span><strong>{totalXp.toLocaleString('ru-RU')}</strong> XP</span>
                </div>
                <button type="button" className="header-icon-button" aria-label="Уведомления">
                    <Bell className="h-4.5 w-4.5" />
                </button>
                <button type="button" onClick={() => navigate('/profile')} className="header-profile">
                    <span>{profile?.full_name?.[0]?.toUpperCase() ?? 'V'}</span>
                    <span className="hidden xl:block">
                        <small>{isDemo ? 'Демо-профиль' : 'Аккаунт'}</small>
                        <strong>{profile?.full_name || 'Открыть профиль'}</strong>
                    </span>
                </button>
            </div>
        </header>
    );
}