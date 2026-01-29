import { Flame, Target, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
    {
        label: 'Total Hours',
        value: '142h',
        icon: Flame,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/20',
    },
    {
        label: 'Current Streak',
        value: '12 days',
        icon: Flame,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/20',
    },
    {
        label: 'Lessons Done',
        value: '89',
        icon: Target,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/20',
    },
    {
        label: 'Achievements',
        value: '15',
        icon: Trophy,
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-500/20',
    },
]

export function StatsCards() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                    <div className="flex-1">
                        <p className="text-muted-foreground text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
