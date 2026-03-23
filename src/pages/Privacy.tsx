import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: '1. Какие данные мы храним',
        body: 'Учетные данные для входа, прогресс по трекам, завершенные задачи, продуктовые события и billing-события, которые нужны для работы подписки и ограничения функций.',
    },
    {
        title: '2. Зачем мы это делаем',
        body: 'Чтобы восстанавливать сессию, сохранять реальный прогресс, показывать честный профиль, защищать AI-функции от злоупотребления и корректно управлять платным доступом.',
    },
    {
        title: '3. Чего здесь нет',
        body: 'Мы не продаем пользовательские данные и не используем их для внешней рекламной перепродажи. Перед публичным запуском этот текст должен быть заменен финальной юридической версией.',
    },
];

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-white">
                        ← Back to VibeStudy
                    </Link>
                    <h1 className="mt-4 text-4xl font-bold text-white">Privacy Policy</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Это launch-draft для soft launch. Структура уже годится для продукта, но перед
                        публичным запуском должна быть заменена юридически выверенной версией.
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
