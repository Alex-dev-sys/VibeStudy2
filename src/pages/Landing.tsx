import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Code2,
    Brain,
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
        icon: Brain,
        title: 'AI-уроки без хаоса',
        description:
            'Урок генерируется под конкретную тему дня, а не как бесконечный чат. Это помогает держать структуру и двигаться по треку последовательно.',
    },
    {
        icon: Terminal,
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
        <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_30%),linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)]" />

            <div className="fixed left-12 top-24 h-80 w-80 rounded-full bg-vibe-600/10 blur-3xl" />
            <div className="fixed bottom-10 right-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative z-10">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vibe-500 to-vibe-700 shadow-neon">
                            <Code2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-white">VibeStudy</span>
                            <span className="block text-xs text-gray-500">AI daily coding coach</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hidden items-center gap-8 md:flex"
                    >
                        <a href="#how-it-works" className="text-gray-400 transition-colors hover:text-white">
                            Как это работает
                        </a>
                        <a href="#tracks" className="text-gray-400 transition-colors hover:text-white">
                            Треки
                        </a>
                        <a href="#product" className="text-gray-400 transition-colors hover:text-white">
                            Что внутри
                        </a>
                        <Link to="/pricing" className="text-gray-400 transition-colors hover:text-white">
                            Pricing
                        </Link>
                        <Link to="/auth" className="btn-neon px-6 py-2">
                            Войти
                        </Link>
                    </motion.div>
                </nav>

                <section className="mx-auto max-w-7xl px-6 pb-24 pt-20">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6 inline-flex items-center gap-2 rounded-full border border-vibe-500/30 bg-vibe-500/10 px-5 py-2.5"
                            >
                                <Sparkles className="h-4 w-4 text-vibe-300" />
                                <span className="text-sm font-medium text-vibe-200">
                                    Продукт для ежедневного входа в программирование
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
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
                                className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-300"
                            >
                                VibeStudy ведёт тебя по треку, генерирует урок под тему дня, даёт задачи и сохраняет
                                прогресс. Без фейковых достижений, без пустых обещаний и без необходимости настраивать
                                окружение перед первым шагом.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col items-start gap-4 sm:flex-row"
                            >
                                <Link to="/auth">
                                    <motion.div
                                        className="btn-neon flex items-center gap-3 rounded-xl px-8 py-4 text-lg"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Zap className="h-5 w-5" />
                                        Начать бесплатно
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.div>
                                </Link>

                                <a href="#how-it-works">
                                    <motion.div
                                        className="btn-neon-outline flex items-center gap-3 rounded-xl px-8 py-4 text-lg"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Play className="h-5 w-5" />
                                        Посмотреть сценарий
                                    </motion.div>
                                </a>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="glass rounded-[2rem] border border-vibe-500/20 p-6"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Сегодняшний цикл</p>
                                    <h2 className="text-xl font-bold text-white">От входа до первой задачи</h2>
                                </div>
                                <BookOpen className="h-6 w-6 text-vibe-300" />
                            </div>

                            <div className="space-y-3">
                                {dailyFlow.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                                    >
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-vibe-500/20 text-sm font-semibold text-vibe-200">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-relaxed text-gray-200">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-4">
                                <p className="text-sm text-emerald-200">
                                    Запуск сейчас честный: сначала пользователь получает value, а уже потом упирается в
                                    ограничения или подписку.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20">
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
                                className="glass-hover rounded-[1.75rem] p-6 text-center"
                            >
                                <div className="mb-2 text-4xl font-bold text-gradient">{signal.value}</div>
                                <div className="text-sm text-gray-400">{signal.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                <section id="tracks" className="mx-auto max-w-7xl px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-12 text-center"
                    >
                        <h2 className="mb-4 text-4xl font-bold text-white">Стартовые треки</h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-400">
                            На первом запуске продукт сфокусирован на трёх треках. Это лучше, чем распыляться на
                            десятки языков и не доводить ни один до качества.
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
                                className="glass-hover rounded-[2rem] p-6"
                            >
                                <div
                                    className="mb-5 h-3 rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${track.accent} 0%, rgba(255,255,255,0.12) 100%)` }}
                                />
                                <h3 className="mb-2 text-2xl font-bold text-white">{track.name}</h3>
                                <p className="text-gray-400">
                                    Трек рассчитан на ежедневный темп и короткий прогресс-цикл: урок, задача,
                                    сохранённый результат.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section id="product" className="mx-auto max-w-7xl px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-14 text-center"
                    >
                        <h2 className="mb-4 text-4xl font-bold text-white">Что уже есть внутри</h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-400">
                            Эта посадочная страница больше не обещает “10 миллионов пользователей” и “идеальный AI”.
                            Она показывает то, что реально есть в продукте сейчас и что действительно можно монетизировать.
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
                                    className="glass-hover rounded-[2rem] p-8"
                                >
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 shadow-neon">
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold text-white">{feature.title}</h3>
                                    <p className="text-lg leading-relaxed text-gray-400">{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass relative overflow-hidden rounded-[2rem] border border-vibe-500/20 p-12 text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-vibe-600/10 to-transparent" />
                        <div className="relative z-10">
                            <h2 className="mb-4 text-4xl font-bold text-white">Готов попробовать продукт как пользователь?</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
                                На текущем этапе лучший сценарий не “смотреть маркетинг”, а зайти, выбрать трек и пройти
                                первый честный цикл обучения.
                            </p>
                            <Link to="/auth">
                                <motion.div
                                    className="btn-neon inline-flex items-center gap-3 rounded-xl px-10 py-5 text-lg"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    Войти и начать первый урок
                                    <ArrowRight className="h-5 w-5" />
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <footer className="mx-auto max-w-7xl border-t border-white/5 px-6 py-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-vibe-500 to-vibe-700">
                                    <Code2 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">VibeStudy</span>
                            </div>
                            <p className="max-w-md text-sm text-gray-500">
                                AI daily coding coach с честным прогрессом, browser practice и фокусом на платный
                                soft launch, а не на красивые, но пустые обещания.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <Link to="/pricing" className="transition-colors hover:text-vibe-300">
                                Pricing
                            </Link>
                            <Link to="/privacy" className="transition-colors hover:text-vibe-300">
                                Privacy
                            </Link>
                            <Link to="/terms" className="transition-colors hover:text-vibe-300">
                                Terms
                            </Link>
                            <Link to="/support" className="transition-colors hover:text-vibe-300">
                                Support
                            </Link>
                            <a href="#product" className="transition-colors hover:text-vibe-300">
                                Продукт
                            </a>
                            <a href="#tracks" className="transition-colors hover:text-vibe-300">
                                Треки
                            </a>
                            <a href="#how-it-works" className="transition-colors hover:text-vibe-300">
                                Сценарий
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
