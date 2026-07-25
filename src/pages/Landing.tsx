import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    ArrowRight,
    Zap,
    Target,
    Terminal,
    Play,
    ShieldCheck,
    BookOpen,
} from 'lucide-react';

const productSignals = [
    { value: '3', label: 'стартовых трека' },
    { value: '30', label: 'дней в каждом треке' },
    { value: 'AI', label: 'генерация уроков и задач' },
    { value: 'Web', label: 'редактор и прогресс в браузере' },
];

const tracks = [
    { name: 'Python', accent: '#3776ab' },
    { name: 'JavaScript', accent: '#f7df1e' },
    { name: 'Go', accent: '#00add8' },
];

const features = [
    {
        icon: Terminal,
        title: 'AI-уроки без хаоса',
        description:
            'Урок генерируется под конкретную тему дня, а не как бесконечный чат. Это помогает держать структуру и двигаться по треку последовательно.',
    },
    {
        icon: Zap,
        title: 'Практика прямо в браузере',
        description:
            'Не нужно поднимать окружение, чтобы начать. Теория, задачи и код находятся в одном потоке, без переключения между пятью сервисами.',
    },
    {
        icon: Target,
        title: 'Честный прогресс',
        description:
            'Аккаунт показывает только реальные XP, streak и завершённые уроки. Если ты новый пользователь, продукт не притворяется, что у тебя уже есть достижения.',
    },
    {
        icon: ShieldCheck,
        title: 'Backend-first логика',
        description:
            'Генерация уроков и критичные сценарии вынесены на серверную сторону. Это делает продукт ближе к реальному коммерческому запуску, а не к простой демке.',
    },
];

const dailyFlow = [
    'Выбери трек и цель обучения.',
    'Открой урок дня и получи AI-теорию.',
    'Реши задачу в браузере и сохрани прогресс.',
    'Вернись завтра и продолжи streak.',
];

export default function Landing() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.15),_transparent_30%)]" />
            <div className="fixed left-12 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="fixed bottom-10 right-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative z-10">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12 py-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="font-headline text-2xl font-black tracking-tighter text-primary">
                            VibeStudy
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-on-surface-variant">
                            Neo-Academy
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hidden items-center gap-8 md:flex"
                    >
                        <a
                            href="#how-it-works"
                            className="text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            Как это работает
                        </a>
                        <a
                            href="#tracks"
                            className="text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            Треки
                        </a>
                        <a
                            href="#product"
                            className="text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            Что внутри
                        </a>
                        <Link
                            to="/pricing"
                            className="text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            Тарифы
                        </Link>
                        <Link to="/demo" className="text-on-surface-variant transition-colors hover:text-cyan-200">
                            Демо
                        </Link>
                        <Link to="/auth">
                            <motion.div
                                className="btn-neon px-6 py-2 text-sm"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Войти
                            </motion.div>
                        </Link>
                    </motion.div>
                </nav>

                <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-24 pt-20">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5"
                            >
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Продукт для ежедневного входа в программирование
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="font-headline text-5xl font-black leading-tight tracking-tight text-on-surface md:text-7xl"
                            >
                                Изучай код
                                <span className="text-gradient"> каждый день</span>,
                                <br />
                                а не рывками
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-10 max-w-2xl text-lg leading-relaxed text-on-surface-variant"
                            >
                                VibeStudy ведёт тебя по треку, генерирует урок под тему дня, даёт
                                задачи и сохраняет прогресс. Без фейковых достижений, без пустых
                                обещаний и без необходимости настраивать окружение перед первым шагом.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col items-start gap-4 sm:flex-row"
                            >
                                <Link to="/auth">
                                    <motion.div
                                        className="btn-neon flex items-center gap-3 rounded-full px-8 py-4 text-lg"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Zap className="h-5 w-5" />
                                        Начать бесплатно
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.div>
                                </Link>

                                <Link to="/demo">
                                    <motion.div
                                        className="btn-neon-outline flex items-center gap-3 rounded-full px-8 py-4 text-lg"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Play className="h-5 w-5" />
                                        Открыть демо
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="glass rounded-2xl border border-primary/10 p-6"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                                        Сегодняшний цикл
                                    </p>
                                    <h2 className="font-headline text-xl font-bold text-on-surface">
                                        От входа до первой задачи
                                    </h2>
                                </div>
                                <BookOpen className="h-6 w-6 text-secondary" />
                            </div>

                            <div className="space-y-3">
                                {dailyFlow.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex items-start gap-3 rounded-2xl border border-white/5 bg-surface-container-lowest px-4 py-4"
                                    >
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-relaxed text-on-surface-variant">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-500/10 px-4 py-4">
                                <p className="text-sm text-emerald-200">
                                    Запуск сейчас честный: сначала пользователь получает value, а уже
                                    потом упирается в ограничения или подписку.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4 md:grid-cols-4"
                    >
                        {productSignals.map((signal, index) => (
                            <motion.div
                                key={signal.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-hover rounded-2xl p-6 text-center"
                            >
                                <div className="mb-2 font-headline text-4xl font-bold text-gradient">
                                    {signal.value}
                                </div>
                                <div className="text-sm text-on-surface-variant">{signal.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                <section id="tracks" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-12 text-center"
                    >
                        <h2 className="font-headline text-4xl font-bold text-on-surface">
                            Стартовые треки
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
                            На первом запуске продукт сфокусирован на трёх треках. Это лучше, чем
                            распыляться на десятки языков и не доводить ни один до качества.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {tracks.map((track, index) => (
                            <motion.div
                                key={track.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                className="glass-hover rounded-2xl p-6"
                            >
                                <div
                                    className="mb-5 h-3 rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, ${track.accent} 0%, rgba(255,255,255,0.08) 100%)`,
                                    }}
                                />
                                <h3 className="font-headline text-2xl font-bold text-on-surface">
                                    {track.name}
                                </h3>
                                <p className="mt-2 text-on-surface-variant">
                                    Трек рассчитан на ежедневный темп и короткий прогресс-цикл: урок,
                                    задача, сохранённый результат.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section id="product" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-14 text-center"
                    >
                        <h2 className="font-headline text-4xl font-bold text-on-surface">
                            Что уже есть внутри
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
                            Показываем то, что реально есть в продукте сейчас и что действительно
                            можно монетизировать.
                        </p>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 }}
                                    className="glass-hover rounded-2xl p-8"
                                >
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dim shadow-neon">
                                        <Icon className="h-7 w-7 text-black" />
                                    </div>
                                    <h3 className="font-headline text-2xl font-bold text-on-surface">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <section id="how-it-works" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass relative overflow-hidden rounded-2xl border border-primary/10 p-12 text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                        <div className="relative z-10">
                            <h2 className="font-headline text-4xl font-bold text-on-surface">
                                Готов попробовать продукт?
                            </h2>
                            <p className="mx-auto mt-4 mb-8 max-w-2xl text-lg text-on-surface-variant">
                                На текущем этапе лучший сценарий — зайти, выбрать трек и пройти первый
                                честный цикл обучения.
                            </p>
                            <Link to="/demo">
                                <motion.div
                                    className="btn-neon inline-flex items-center gap-3 rounded-full px-10 py-5 text-lg"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    Открыть демо без регистрации
                                    <ArrowRight className="h-5 w-5" />
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <footer className="mx-auto max-w-7xl border-t border-white/5 px-5 sm:px-8 lg:px-12 py-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <span className="font-headline text-lg font-bold text-primary">
                                VibeStudy
                            </span>
                            <p className="mt-2 max-w-md text-sm text-on-surface-variant">
                                AI daily coding coach с честным прогрессом, browser practice и фокусом
                                на платный soft launch.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                            <Link to="/pricing" aria-label="Pricing" className="transition-colors hover:text-primary">
                                Тарифы
                            </Link>
                            <Link to="/privacy" aria-label="Privacy" className="transition-colors hover:text-primary">
                                Конфиденциальность
                            </Link>
                            <Link to="/terms" aria-label="Terms" className="transition-colors hover:text-primary">
                                Условия
                            </Link>
                            <Link to="/support" aria-label="Support" className="transition-colors hover:text-primary">
                                Поддержка
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
