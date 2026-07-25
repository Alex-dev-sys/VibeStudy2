import { Link, useLocation } from 'react-router-dom';
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CircleUserRound,
    Code2,
    House,
    Swords,
} from 'lucide-react';

const navItems = [
    { path: '/home', label: 'Главная', shortLabel: 'Дом', icon: House },
    { path: '/lessons', label: 'Уроки', shortLabel: 'Уроки', icon: BookOpen },
    { path: '/playground', label: 'Редактор', shortLabel: 'Код', icon: Code2 },
    { path: '/challenges', label: 'Задачи', shortLabel: 'Задачи', icon: Swords },
    { path: '/analytics', label: 'Прогресс', shortLabel: 'Прогресс', icon: BarChart3 },
    { path: '/profile', label: 'Профиль', shortLabel: 'Профиль', icon: CircleUserRound },
];

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <>
            <aside className="workspace-sidebar hidden lg:flex">
                <Link to="/" className="workspace-sidebar__brand" aria-label="VibeStudy — на главную">
                    <span>VS</span>
                    <strong>VibeStudy</strong>
                </Link>

                <nav className="workspace-sidebar__nav" aria-label="Основная навигация">
                    <p>Обучение</p>
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
                                <Icon className="h-4 w-4" /><span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <p>Аккаунт</p>
                    {navItems.slice(4).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
                                <Icon className="h-4 w-4" /><span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="workspace-sidebar__plan">
                    <span>Бесплатный план</span>
                    <p>Один трек и первые учебные дни.</p>
                    <Link to="/pricing">Сравнить тарифы <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
            </aside>

            <nav className="mobile-dock lg:hidden" aria-label="Мобильная навигация">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link key={item.path} to={item.path} className={`mobile-dock__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                            <Icon className="h-[18px] w-[18px]" /><span>{item.shortLabel}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}