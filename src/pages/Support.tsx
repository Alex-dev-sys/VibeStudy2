import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, ShieldAlert } from 'lucide-react';

const supportCards = [
    {
        icon: Mail,
        title: 'Support email',
        body: 'support@vibestudy.app',
    },
    {
        icon: LifeBuoy,
        title: 'С чем сюда писать',
        body: 'Проблемы со входом, потерянный прогресс, ошибки AI-генерации, вопросы по оплате, продлению и возврату.',
    },
    {
        icon: ShieldAlert,
        title: 'Что приложить',
        body: 'Email аккаунта, описание шага, где произошла ошибка, и скриншот или текст сообщения об ошибке.',
    },
];

export default function Support() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)] px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-white">
                        ← Back to VibeStudy
                    </Link>
                    <h1 className="mt-4 text-4xl font-bold text-white">Support</h1>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Для soft launch этого достаточно: у пользователя есть один очевидный канал связи и
                        понятный список того, что нужно приложить, чтобы мы быстро дошли до причины.
                    </p>
                </motion.div>

                <div className="grid gap-4 md:grid-cols-3">
                    {supportCards.map((card) => (
                        <motion.section
                            key={card.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-vibe-500/10 text-vibe-200">
                                <card.icon className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                            <p className="mt-3 leading-7 text-slate-300">{card.body}</p>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    );
}
