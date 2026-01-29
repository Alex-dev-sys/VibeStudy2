import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Code2, Clock, Star, Zap } from 'lucide-react'

export function ChallengeCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden"
        >
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <Badge variant="secondary" className="mb-3">
                        <Star className="w-3 h-3 mr-1" />
                        Featured Challenge
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Build a Weather Dashboard
                    </h2>
                    <p className="text-muted-foreground max-w-lg">
                        Create a responsive weather dashboard that fetches data from an API and displays current conditions and forecasts.
                    </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Code2 className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 relative z-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">~2 hours</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">+150 XP</span>
                </div>
                <Badge variant="outline">Intermediate</Badge>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {['Python', 'API', 'Data Processing', 'Visualization'].map((skill) => (
                    <Badge key={skill} variant="secondary" className="rounded-full">
                        {skill}
                    </Badge>
                ))}
            </div>

            {/* Action */}
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-primary/30 relative z-10">
                <Zap className="w-5 h-5 mr-2" />
                Start Challenge
            </Button>
        </motion.div>
    )
}
