import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock3,
    Code2,
    Flame,
} from 'lucide-react';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { courses } from '../data/courses';
import { identifyAnalyticsUser, trackEvent } from '../lib/analytics';
import { useAuthStore } from '../stores/useAuthStore';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import { useProgressStore } from '../stores/useProgressStore';

type TrackSnapshot = {
    id: string;
    name: string;
    description: string;
    completedLessons: number;
    completedTasks: number;
    currentDay: number;
    totalDays: number;
    progressPercent: number;
    href: string;
    started: boolean;
};

const trackDescriptions: Record<string, string> = {
    python: 'Автоматизация, backend и практические скрипты',
    javascript: 'Интерфейсы, браузер и продуктовая разработка',
    go: 'Сервисы, API и производительные системы',
    typescript: 'Надёжный frontend и типизированные приложения',
};

function getGreeting(hour: number) {
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
}

function getFirstName(fullName: string | null | undefined) {
    return fullName?.trim().split(/\s+/)[0] || 'Студент';
}

function getCurrentDate() {
    return new Intl.DateTimeFormat('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Home() {
    const { user, profile, isDemo } = useAuthStore();
    const { courseProgress, completedTasks } = useProgressStore();
    const { completedAt, syncUser } = useOnboardingStore();
    const hasTrackedSignupRef = useRef(false);
    const onboardingCompletedRef = useRef<string | null>(null);

    const totalXp = profile?.total_xp ?? 0;
    const streak = profile?.current_streak ?? 0;
    const level = profile?.level ?? 1;
    const completedLessons = Object.values(courseProgress).reduce(
        (sum, progress) => sum + progress.completed_days.length,
        0
    );
    const activeTracks = Object.keys(courseProgress).length;
    const hasAnyProgress = totalXp > 0 || completedLessons > 0 || completedTasks.length > 0;

    useEffect(() => {
        if (user?.id) syncUser(user.id);
    }, [syncUser, user?.id]);

    useEffect(() => {
        if (!user?.id || isDemo) return;

        identifyAnalyticsUser(user.id, {
            email: user.email ?? null,
            level,
        });

        if (!hasTrackedSignupRef.current) {
            trackEvent('signup_completed', { method: 'supabase_auth' });
            hasTrackedSignupRef.current = true;
        }
    }, [isDemo, level, user?.email, user?.id]);

    useEffect(() => {
        if (!user?.id || !completedAt || onboardingCompletedRef.current === completedAt || isDemo) return;
        onboardingCompletedRef.current = completedAt;
        trackEvent('onboarding_completed', { userId: user.id });
    }, [completedAt, isDemo, user?.id]);

    const trackSnapshots: TrackSnapshot[] = courses.slice(0, 4).map((course) => {
        const progress = courseProgress[course.id];
        const completedCount = progress?.completed_days.length ?? 0;
        const currentDay = Math.min(progress?.current_day ?? 1, course.totalDays);
        const started = Boolean(progress);

        return {
            id: course.id,
            name: course.name,
            description: trackDescriptions[course.id] ?? 'Последовательный трек на 30 дней',
            completedLessons: completedCount,
            completedTasks: completedTasks.filter((task) => task.course_id === course.id).length,
            currentDay,
            totalDays: course.totalDays,
            progressPercent: Math.round((completedCount / course.totalDays) * 100),
            href: started ? `/lessons/${course.id}/${currentDay}` : `/lessons/${course.id}`,
            started,
        };
    });

    const featuredTrack = [...trackSnapshots]
        .filter((track) => track.started)
        .sort((left, right) => right.completedLessons - left.completedLessons)[0] ?? null;

    const shouldShowOnboarding = Boolean(user?.id) && !hasAnyProgress && !completedAt;
    const userName = getFirstName(profile?.full_name);
    const xpToNextLevel = Math.max(0, level * 1000 - totalXp);
    const todayIndex = (new Date().getDay() + 6) % 7;

    if (shouldShowOnboarding) {
        return (
            <div className="home-page">
                <div className="home-page__inner">
                    <OnboardingFlow userId={user!.id} userName={userName} />
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-page__inner">
                <section className="home-intro">
                    <div>
                        <p className="home-intro__date">{getCurrentDate()}</p>
                        <h2>{getGreeting(new Date().getHours())}, {userName}</h2>
                        <p>Продолжи с того места, где остановился. Без лишних целей на сегодня.</p>
                    </div>
                    <div className="home-intro__streak">
                        <Flame className="h-4 w-4" />
                        <span><strong>{streak}</strong> дней подряд</span>
                    </div>
                </section>

                <div className="home-top-grid">
                    <section className="focus-sheet">
                        <div className="focus-sheet__meta">
                            <span>Следующая сессия</span>
                            <span>≈ 24 минуты</span>
                        </div>
                        <div className="focus-sheet__content">
                            <div>
                                <p className="focus-sheet__course">{featuredTrack?.name ?? 'Первый трек'}</p>
                                <h1>
                                    {featuredTrack
                                        ? `День ${featuredTrack.currentDay}. Вернись в рабочий ритм.`
                                        : 'Выбери трек и пройди первый урок.'}
                                </h1>
                                <p>
                                    {featuredTrack?.description ?? 'Короткая теория, практика в редакторе и понятный итог сессии.'}
                                </p>
                            </div>
                            <Link to={featuredTrack?.href ?? '/lessons'} className="primary-action">
                                {featuredTrack ? 'Продолжить урок' : 'Выбрать трек'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="focus-sheet__progress">
                            <span style={{ width: `${featuredTrack?.progressPercent ?? 0}%` }} />
                        </div>
                        <div className="focus-sheet__footer">
                            <span>{featuredTrack?.completedLessons ?? 0} из {featuredTrack?.totalDays ?? 30} уроков</span>
                            <span>{featuredTrack?.completedTasks ?? 0} задач решено</span>
                        </div>
                    </section>

                    <aside className="week-log">
                        <div className="week-log__header">
                            <div>
                                <span>Учебная неделя</span>
                                <strong>{streak > 0 ? `${Math.min(streak, 7)} активных дней` : 'Начни сегодня'}</strong>
                            </div>
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="week-log__days">
                            {weekDays.map((day, index) => {
                                const isToday = index === todayIndex;
                                const isActive = index <= todayIndex && todayIndex - index < Math.min(streak, 7);
                                return (
                                    <div key={day} className={isToday ? 'is-today' : ''}>
                                        <span>{day}</span>
                                        <i className={isActive ? 'is-active' : ''} />
                                    </div>
                                );
                            })}
                        </div>
                        <p>Небольшая сессия каждый день работает лучше редких марафонов.</p>
                    </aside>
                </div>

                <section className="metric-row" aria-label="Сводка прогресса">
                    <div><span>Уровень</span><strong>{level}</strong><small>{xpToNextLevel} XP до следующего</small></div>
                    <div><span>Всего XP</span><strong>{totalXp.toLocaleString('ru-RU')}</strong><small>за всё время</small></div>
                    <div><span>Уроки</span><strong>{completedLessons}</strong><small>{completedTasks.length} задач</small></div>
                    <div><span>Треки</span><strong>{activeTracks}</strong><small>в работе</small></div>
                </section>

                <div className="home-lower-grid">
                    <section className="track-ledger">
                        <div className="section-heading">
                            <div>
                                <span>Треки</span>
                                <h2>Текущая работа</h2>
                            </div>
                            <Link to="/lessons">Все треки <ArrowRight className="h-4 w-4" /></Link>
                        </div>

                        <div className="track-ledger__list">
                            {trackSnapshots.map((track) => (
                                <Link key={track.id} to={track.href} className="track-row">
                                    <div className="track-row__name">
                                        <span>{track.name.slice(0, 2).toUpperCase()}</span>
                                        <div><strong>{track.name}</strong><small>{track.description}</small></div>
                                    </div>
                                    <div className="track-row__status">
                                        <span>{track.started ? `День ${track.currentDay}` : 'Не начат'}</span>
                                        <div><i style={{ width: `${track.progressPercent}%` }} /></div>
                                    </div>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <aside className="session-ledger">
                        <div className="section-heading">
                            <div><span>Формат</span><h2>Одна сессия</h2></div>
                            <Clock3 className="h-5 w-5" />
                        </div>
                        <div className="session-ledger__steps">
                            <div><time>07 мин</time><span><BookOpen className="h-4 w-4" /><strong>Разобрать тему</strong><small>Короткая теория и пример</small></span></div>
                            <div><time>14 мин</time><span><Code2 className="h-4 w-4" /><strong>Написать код</strong><small>Одна задача в редакторе</small></span></div>
                            <div><time>03 мин</time><span><CheckCircle2 className="h-4 w-4" /><strong>Зафиксировать итог</strong><small>Проверка и сохранение</small></span></div>
                        </div>
                        <Link to="/analytics" className="secondary-action">
                            <BarChart3 className="h-4 w-4" /> Посмотреть аналитику
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}