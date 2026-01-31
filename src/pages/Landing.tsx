import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Code2,
    Brain,
    Rocket,
    ArrowRight,
    Zap,
    Target,
    Trophy,
    Terminal,
    Play
} from 'lucide-react';

const languages = [
    { name: 'Python', icon: '🐍', color: '#3776ab' },
    { name: 'JavaScript', icon: '⚡', color: '#f7df1e' },
    { name: 'Go', icon: '🔷', color: '#00add8' },
    { name: 'Rust', icon: '🦀', color: '#dea584' },
    { name: 'Java', icon: '☕', color: '#ed8b00' },
    { name: 'C++', icon: '⚙️', color: '#00599c' },
    { name: 'Swift', icon: '🍎', color: '#fa7343' },
];

const features = [
    {
        icon: Brain,
        title: 'ИИ-Ассистент',
        description: 'Твой личный репетитор, доступный 24/7. Адаптируется под твой стиль обучения с персональными примерами и объяснениями.',
    },
    {
        icon: Terminal,
        title: 'Браузерная IDE',
        description: 'Начинай кодить мгновенно без настройки. Мощная облачная IDE с умным автодополнением.',
    },
    {
        icon: Target,
        title: 'Карьерные треки',
        description: 'Следуй структурированным планам обучения от экспертов индустрии, чтобы стать готовым к работе.',
    },
    {
        icon: Trophy,
        title: 'Ежедневные задачи',
        description: 'Выработай привычку кодить с помощью геймифицированных задач. Зарабатывай стрики, бейджи и поднимайся в рейтинге.',
    },
];

const stats = [
    { value: '10M+', label: 'Активных учеников' },
    { value: '50+', label: 'Языков и фреймворков' },
    { value: '98%', label: 'Уровень удовлетворенности' },
    { value: '500K+', label: 'Завершенных задач' },
];

export default function Landing() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated background gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vibe-900/20 via-transparent to-transparent" />

            {/* Floating orbs - using CSS animation for performance */}
            <div className="fixed top-20 left-20 w-96 h-96 bg-vibe-600/10 rounded-full blur-3xl floating-orb floating-orb-1" />
            <div className="fixed bottom-20 right-20 w-80 h-80 bg-vibe-500/10 rounded-full blur-3xl floating-orb floating-orb-2" />

            {/* Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center shadow-neon">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">VibeStudy</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden md:flex items-center gap-8"
                        >
                            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Возможности</a>
                            <a href="#languages" className="text-gray-400 hover:text-white transition-colors">Языки</a>
                            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Цены</a>
                            <Link to="/auth" className="btn-neon px-6 py-2">
                                Начать обучение
                            </Link>
                        </motion.div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8 border border-vibe-500/30"
                        >
                            <Sparkles className="w-4 h-4 text-vibe-400" />
                            <span className="text-sm font-medium text-vibe-300">IT-образование с ИИ</span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
                        >
                            <span className="text-white">Vibe</span>
                            <span className="text-gradient">Study</span>
                            <br />
                            <span className="text-4xl md:text-5xl text-gray-300 font-medium">
                                Твой путь в IT с искусственным интеллектом
                            </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            Освой программирование в 10 раз быстрее с персональным ИИ-учебным планом,
                            анализом кода в реальном времени и сообществом будущих лидеров технологий.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/auth">
                                <motion.button
                                    className="btn-neon flex items-center gap-3 text-lg px-10 py-4 rounded-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Rocket className="w-5 h-5" />
                                    Начать бесплатно
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <Link to="/playground">
                                <motion.button
                                    className="btn-neon-outline flex items-center gap-3 text-lg px-10 py-4 rounded-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Play className="w-5 h-5" />
                                    Попробовать песочницу
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="max-w-7xl mx-auto px-6 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-hover p-6 text-center"
                            >
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-gray-400 text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Languages Section */}
                <section id="languages" className="max-w-7xl mx-auto px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Освой 7+ языков программирования
                        </h2>
                        <p className="text-gray-400 text-lg">
                            От новичка до эксперта, в своем темпе
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {languages.map((lang, index) => (
                            <Link to={`/challenges?lang=${lang.name}`} key={lang.name}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    className="glass-hover px-8 py-5 flex items-center gap-4 cursor-pointer group"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{lang.icon}</span>
                                    <span className="font-semibold text-white text-lg">{lang.name}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Почувствуй будущее программирования
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Наша платформа объединяет передовой ИИ с проверенными методиками обучения
                            для ускорения твоего карьерного роста.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-hover p-8 card-hover group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center mb-6 shadow-neon group-hover:shadow-neon-lg transition-shadow">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-7xl mx-auto px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass p-16 text-center relative overflow-hidden rounded-3xl border border-vibe-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-vibe-600/10 to-transparent" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-vibe-500 to-transparent" />

                        <div className="relative z-10">
                            <div
                                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center shadow-neon-lg animate-spin"
                                style={{ animationDuration: '20s' }}
                            >
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Готов кодить?
                            </h2>
                            <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
                                Присоединяйся к тысячам разработчиков, создающих будущее.
                                Начни бесплатное пробное занятие сегодня и открой силу обучения с ИИ.
                            </p>
                            <Link to="/auth">
                                <motion.button
                                    className="btn-neon text-xl px-12 py-5 rounded-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Начать — Это бесплатно
                                </motion.button>
                            </Link>
                            <p className="text-gray-500 mt-4 text-sm">Кредитная карта не требуется</p>
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center">
                                    <Code2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">VibeStudy</span>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Расширяем возможности нового поколения разработчиков с помощью ИИ-инструментов.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Платформа</h4>
                            <ul className="space-y-2 text-gray-500 text-sm">
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Курсы</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Практика</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Цены</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Ресурсы</h4>
                            <ul className="space-y-2 text-gray-500 text-sm">
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Блог</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Шпаргалки</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Сообщество</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Компания</h4>
                            <ul className="space-y-2 text-gray-500 text-sm">
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">О нас</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Карьера</a></li>
                                <li><a href="#" className="hover:text-vibe-400 transition-colors">Контакты</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
                        <p className="text-gray-600 text-sm">© 2025 VibeStudy Inc. Все права защищены.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="text-gray-500 hover:text-vibe-400 transition-colors">Twitter</a>
                            <a href="#" className="text-gray-500 hover:text-vibe-400 transition-colors">GitHub</a>
                            <a href="#" className="text-gray-500 hover:text-vibe-400 transition-colors">Discord</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
