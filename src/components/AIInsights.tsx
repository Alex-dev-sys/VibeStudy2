import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const insights = [
    "You're 40% more productive in the morning",
    "Python loops are your strongest topic",
    "Try longer study sessions for better retention",
]

export function AIInsights() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/20 to-card border border-primary/30 rounded-2xl p-6 h-full"
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-start gap-3"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-sm text-muted-foreground">{insight}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
