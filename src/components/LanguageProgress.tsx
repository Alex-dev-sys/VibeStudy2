import { motion } from 'framer-motion'
import { Progress } from './ui/progress'

const languages = [
    { name: 'Python', progress: 78, color: 'from-blue-500 to-cyan-500' },
    { name: 'JavaScript', progress: 45, color: 'from-yellow-500 to-orange-500' },
    { name: 'SQL', progress: 32, color: 'from-green-500 to-emerald-500' },
]

export function LanguageProgress() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
        >
            <h3 className="text-lg font-semibold text-foreground mb-6">Language Progress</h3>

            <div className="space-y-5">
                {languages.map((lang, index) => (
                    <motion.div
                        key={lang.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{lang.name}</span>
                            <span className="text-sm text-muted-foreground">{lang.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lang.progress}%` }}
                                transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${lang.color} rounded-full`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
