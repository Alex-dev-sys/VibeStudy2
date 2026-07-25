import { Link, useLocation } from 'react-router-dom';
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CircleUserRound,
    CodeXml,
    House,
    Route,
    Swords,
} from 'lucide-react';

const navItems = [
    { path: '/home', label: 'Главная', shortLabel: 'Дом', hint: 'Фокус на сегодня', icon: House },
    { path: '/lessons', label: 'Уроки', shortLabel: 'Уроки', hint: 'Траектория обучения', icon: BookOpen },
    { path: '/playground', label: 'Лаборатория', shortLabel: 'Код', hint: 'Проверка идей', icon: CodeXml },
    { path: '/challenges', label: 'Челленджи', shortLabel: 'Задачи', hint: 'Практика навыков', icon: Swords },
    { path: '/analytics', label: 'Аналитика', shortLabel: 'Прогресс', hint: 'Честные метрики', icon: BarChart3 },
    { path: '/profile', label: 'Профиль', shortLabel: 'Профиль', hint: 'Аккаунт и доступ', icon: CircleUserRound },
];

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <>
            <aside className="sidebar-rail hidden lg:flex">
                <Link to="/" className="sidebar-brand" aria-label="VibeStudy — на главную">
                    <span className="sidebar-brand__mark"><Route className="h-5 w-5" /></span>
                    <span>
                        <strong>VibeStudy</strong>
                        <small>learning runtime</small>
                    </span>
                </Link>

                <div className="trajectory-label">
                    <span>Траектория</span>
                    <span className="trajectory-label__status">LIVE</span>
                </div>

                <nav className="trajectory-nav" aria-label="Основная навигация">
                    <span className="trajectory-nav__line" aria-hidden="true" />
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-current={active ? 'page' : undefined}
                                className={`trajectory-link ${active ? 'is-active' : ''}`}
                            >
                                <span className="trajectory-link__step">{String(index + 1).padStart(2, '0')}</span>
                                <span className="trajectory-link__icon"><Icon className="h-4 w-4" /></span>
                                <span className="min-w-0">
                                    <strong>{item.label}</strong>
                                    <small>{item.hint}</small>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-upgrade">
                    <span className="sidebar-upgrade__code">PRO / ROUTE</span>
                    <h2>Открой весь маршрут</h2>
                    <p>Все треки, дни и AI-подсказки — в одном учебном ритме.</p>
                    <Link to="/pricing">
                        Тарифы <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </aside>

            <nav className="mobile-dock lg:hidden" aria-label="Мобильная навигация">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            aria-current={active ? 'page' : undefined}
                            className={`mobile-dock__item ${active ? 'is-active' : ''}`}
                        >
                            <Icon className="h-4.5 w-4.5" />
                            <span>{item.shortLabel}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}