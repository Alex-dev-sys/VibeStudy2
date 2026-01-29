import { motion } from 'framer-motion'
import { Trophy, Users, Target } from 'lucide-react'

const stats = [
    { label: 'Completed by', value: '1,234', icon: Users },
    { label: 'Success Rate', value: '67%', icon: Target },
    { label: 'Top Score', value: '98/100', icon: Trophy },
]

export function ChallengeStats() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mt-8"
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-card/50 border border-border/30 rounded-2xl p-4 text-center backdrop-blur-sm"
                >
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
            ))}
        </motion.div>
    )
}
