import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: '1. Что получает пользователь',
        body: 'Доступ к AI-урокам, задачам, профилю прогресса и платным возможностям в рамках активного плана. Конкретный объем функций зависит от free/pro-entitlement.',
    },
    {
        title: '2. Что нельзя делать',
        body: 'Нельзя обходить ограничения free-тарифа, злоупотреблять AI-функциями, пытаться получать доступ к чужим данным или мешать работе сервиса автоматизированным спамом.',
    },
    {
        title: '3. Подписка и отмена',
        body: 'Подписка управляется по правилам платежного провайдера. Для публичного запуска эта страница должна быть заменена финальной офертой с условиями продления, отмены и возврата.',
    },
];

export default function Terms() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-white">
                        ← Back to VibeStudy
                    </Link>
                    <h1 className="mt-4 text-4xl font-bold text-white">Terms of Use</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Это продуктовый placeholder для soft launch. Он уже прозрачно объясняет базовые
                        правила сервиса, но перед публичным запуском должен быть заменен полной офертой.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <motion.section
                            key={section.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
                        >
                            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                            <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    );
}
