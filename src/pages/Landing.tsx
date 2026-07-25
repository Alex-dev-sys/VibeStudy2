import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Check,
    Clock3,
    Code2,
    Play,
} from 'lucide-react';

const sessionParts = [
    { time: '07 мин', title: 'Разобрать одну тему', note: 'Теория на примере, без длинной лекции' },
    { time: '14 мин', title: 'Решить задачу', note: 'Код пишется прямо в браузере' },
    { time: '03 мин', title: 'Получить разбор', note: 'Проверка решения и следующий шаг' },
];

const tracks = [
    { name: 'Python', use: 'Автоматизация и backend', lesson: 'День 01 · Переменные' },
    { name: 'JavaScript', use: 'Интерфейсы и браузер', lesson: 'День 01 · Типы данных' },
    { name: 'Go', use: 'Сервисы и API', lesson: 'День 01 · Первая программа' },
];

export default function Landing() {
    return (
        <div className="landing-page">
            <header className="landing-nav">
                <Link to="/" className="landing-logo" aria-label="VibeStudy — главная">
                    <span>VS</span>
                    <strong>VibeStudy</strong>
                </Link>
                <nav aria-label="Навигация по странице">
                    <a href="#method">Как устроено</a>
                    <a href="#tracks">Треки</a>
                    <Link to="/pricing">Тарифы</Link>
                </nav>
                <div className="landing-nav__actions">
                    <Link to="/auth" className="text-action">Войти</Link>
                    <Link to="/demo" className="compact-action">Открыть демо</Link>
                </div>
            </header>

            <main>
                <section className="landing-hero">
                    <div className="landing-hero__copy">
                        <p className="plain-label">Самостоятельное обучение программированию</p>
                        <h1>Учись в ритме, который можно выдержать.</h1>
                        <p className="landing-hero__lead">
                            Один короткий урок в день: понятная теория, задача в редакторе и разбор решения.
                            VibeStudy держит структуру, чтобы тебе оставалось писать код.
                        </p>
                        <div className="landing-hero__actions">
                            <Link to="/demo" className="primary-action">
                                <Play className="h-4 w-4" /> Посмотреть демо
                            </Link>
                            <Link to="/auth" className="secondary-action">
                                Начать бесплатно <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <p className="landing-hero__note">Демо работает без регистрации и не записывает данные на сервер.</p>
                    </div>

                    <div className="study-page" aria-label="Пример учебной сессии">
                        <div className="study-page__binding" aria-hidden="true" />
                        <div className="study-page__header">
                            <span>Сегодня</span>
                            <time>24 минуты</time>
                        </div>
                        <div className="study-page__title">
                            <span>Python · день 08</span>
                            <h2>Функции и область видимости</h2>
                            <p>Цель: вынести повторяющуюся логику в отдельную функцию и проверить результат.</p>
                        </div>
                        <div className="study-page__schedule">
                            {sessionParts.map((part) => (
                                <div key={part.time}>
                                    <time>{part.time}</time>
                                    <span><strong>{part.title}</strong><small>{part.note}</small></span>
                                </div>
                            ))}
                        </div>
                        <div className="study-page__code">
                            <div><i /><i /><i /></div>
                            <code>
                                <span>def</span> calculate_score(tasks):{`\n`}
                                {'    '}completed = len(tasks){`\n`}
                                {'    '}<span>return</span> completed * 10
                            </code>
                        </div>
                        <div className="study-page__footer">
                            <span><Check className="h-4 w-4" /> Черновик сохранён</span>
                            <strong>Урок 8 / 30</strong>
                        </div>
                    </div>
                </section>

                <section className="product-facts" aria-label="Ключевые возможности">
                    <div><strong>30 дней</strong><span>в каждом учебном треке</span></div>
                    <div><strong>В браузере</strong><span>теория, редактор и задачи рядом</span></div>
                    <div><strong>По делу</strong><span>прогресс только за выполненную работу</span></div>
                </section>

                <section id="method" className="method-section">
                    <div className="section-intro">
                        <span>Подход</span>
                        <h2>Не курс на потом.<br />Рабочий ритм на каждый день.</h2>
                    </div>
                    <div className="method-grid">
                        <article>
                            <Clock3 className="h-5 w-5" />
                            <h3>Короткая сессия</h3>
                            <p>Урок рассчитан на 20–30 минут. Достаточно, чтобы продвинуться, и не слишком много, чтобы отложить.</p>
                        </article>
                        <article>
                            <Code2 className="h-5 w-5" />
                            <h3>Код в центре</h3>
                            <p>Каждая тема заканчивается задачей. Теория остаётся контекстом, а результатом становится рабочий код.</p>
                        </article>
                        <article>
                            <BookOpen className="h-5 w-5" />
                            <h3>Понятное продолжение</h3>
                            <p>После сессии видно, что сделано, где остановился и какой урок открывать дальше.</p>
                        </article>
                    </div>
                </section>

                <section id="tracks" className="tracks-section">
                    <div className="section-intro">
                        <span>Стартовые направления</span>
                        <h2>Выбери задачу, а не модный язык.</h2>
                        <p>Трек объясняет, для чего нужен инструмент, и ведёт от основ к небольшому проекту.</p>
                    </div>
                    <div className="track-table">
                        {tracks.map((track) => (
                            <Link key={track.name} to="/demo" className="track-table__row">
                                <strong>{track.name}</strong>
                                <span>{track.use}</span>
                                <small>{track.lesson}</small>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="landing-cta">
                    <div>
                        <span>Без регистрации</span>
                        <h2>Сначала посмотри, подходит ли тебе такой формат.</h2>
                    </div>
                    <Link to="/demo" className="primary-action">Открыть демо <ArrowRight className="h-4 w-4" /></Link>
                </section>
            </main>

            <footer className="landing-footer">
                <div><strong>VibeStudy</strong><span>Ежедневная практика программирования</span></div>
                <nav>
                    <Link to="/pricing" aria-label="Pricing">Тарифы</Link>
                    <Link to="/privacy" aria-label="Privacy">Конфиденциальность</Link>
                    <Link to="/terms" aria-label="Terms">Условия</Link>
                    <Link to="/support" aria-label="Support">Поддержка</Link>
                </nav>
            </footer>
        </div>
    );
}