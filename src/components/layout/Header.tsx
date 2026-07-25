import { Bell, Flame } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const routeMeta: Record<string, { title: string; subtitle: string }> = {
    '/home': { title: 'Главная', subtitle: 'Следующая сессия и текущий прогресс' },
    '/lessons': { title: 'Уроки', subtitle: 'Треки и учебные дни' },
    '/playground': { title: 'Редактор', subtitle: 'Черновики и эксперименты с кодом' },
    '/challenges': { title: 'Задачи', subtitle: 'Практика отдельных навыков' },
    '/analytics': { title: 'Прогресс', subtitle: 'Результаты и регулярность занятий' },
    '/profile': { title: 'Профиль', subtitle: 'Аккаунт, настройки и доступ' },
};

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, isDemo } = useAuthStore();
    const matchedRoute = Object.keys(routeMeta).find(
        (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
    ) ?? '/home';
    const activeMeta = routeMeta[matchedRoute];

    return (
        <header className={`workspace-topbar ${isDemo ? 'workspace-topbar--demo' : ''}`}>
            <div className="workspace-topbar__title">
                <h1>{activeMeta.title}</h1>
                <p>{activeMeta.subtitle}</p>
            </div>
            <div className="workspace-topbar__actions">
                <div className="workspace-topbar__streak">
                    <Flame className="h-4 w-4" />
                    <span>{profile?.current_streak ?? 0} дней</span>
                </div>
                <button type="button" className="workspace-topbar__icon" aria-label="Уведомления">
                    <Bell className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigate('/profile')} className="workspace-topbar__profile">
                    <span>{profile?.full_name?.[0]?.toUpperCase() ?? 'V'}</span>
                    <div className="hidden sm:block"><strong>{profile?.full_name || 'Профиль'}</strong><small>{isDemo ? 'Демо' : `Уровень ${profile?.level ?? 1}`}</small></div>
                </button>
            </div>
        </header>
    );
}