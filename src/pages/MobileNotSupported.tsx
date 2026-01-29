import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';

export default function MobileNotSupported() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-6">
            {/* Background effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vibe-900/20 via-transparent to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 glass p-10 rounded-3xl border border-vibe-500/20 max-w-md text-center"
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center shadow-neon-lg"
                        >
                            <Monitor className="w-10 h-10 text-white" />
                        </motion.div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-dark-800 border border-vibe-500/30 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    Откройте на компьютере
                </h1>

                {/* Description */}
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    Для лучшего опыта обучения и работы с кодом, пожалуйста, откройте
                    <span className="text-vibe-400 font-semibold"> VibeStudy </span>
                    на компьютере или ноутбуке.
                </p>

                {/* Features list */}
                <div className="text-left space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-vibe-500" />
                        <span>Полноценная IDE для написания кода</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-vibe-500" />
                        <span>Удобная навигация по урокам</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-vibe-500" />
                        <span>Интерактивные задания</span>
                    </div>
                </div>

                {/* URL hint */}
                <div className="glass px-4 py-3 rounded-xl border border-white/10">
                    <p className="text-gray-500 text-sm">Скопируйте ссылку:</p>
                    <p className="text-vibe-400 font-mono text-sm mt-1">vibestudy.app</p>
                </div>
            </motion.div>
        </div>
    );
}
