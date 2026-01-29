import { motion } from 'framer-motion'
import { Badge } from './ui/badge'
import { CheckCircle, Circle, Lock } from 'lucide-react'

const pathSteps = [
    { title: 'Python Basics', status: 'completed', days: '1-15' },
    { title: 'Data Structures', status: 'completed', days: '16-30' },
    { title: 'Object-Oriented Programming', status: 'current', days: '31-45' },
    { title: 'Web Development', status: 'locked', days: '46-60' },
    { title: 'Data Science', status: 'locked', days: '61-75' },
    { title: 'Machine Learning', status: 'locked', days: '76-90' },
]

export function CareerPath() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Career Path</h3>
                <Badge variant="secondary">Python Developer</Badge>
            </div>

            <div className="space-y-4">
                {pathSteps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${step.status === 'current'
                                ? 'bg-primary/10 border-primary/30'
                                : step.status === 'completed'
                                    ? 'bg-secondary/50 border-border/50'
                                    : 'bg-card border-border/30 opacity-60'
                            }`}
                    >
                        {/* Status icon */}
                        {step.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                        ) : step.status === 'current' ? (
                            <Circle className="w-6 h-6 text-primary shrink-0" />
                        ) : (
                            <Lock className="w-6 h-6 text-muted-foreground shrink-0" />
                        )}

                        {/* Content */}
                        <div className="flex-1">
                            <p className={`font-medium ${step.status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                                }`}>
                                {step.title}
                            </p>
                            <p className="text-sm text-muted-foreground">Days {step.days}</p>
                        </div>

                        {/* Status badge */}
                        {step.status === 'current' && (
                            <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
