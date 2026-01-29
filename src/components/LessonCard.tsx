import { Button } from './ui/button'
import { Zap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface LessonCardProps {
    day: number
    isGenerating?: boolean
    onGenerate?: () => void
}

export function LessonCard({ day, isGenerating = false, onGenerate }: LessonCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/30 rounded-2xl p-12 flex flex-col items-center text-center relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Icon */}
            <motion.div
                animate={{
                    boxShadow: isGenerating ? '0 0 80px rgba(168, 85, 247, 0.4)' : '0 0 40px rgba(168, 85, 247, 0.1)',
                    scale: isGenerating ? 1.05 : 1
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 relative z-10"
            >
                {isGenerating ? (
                    <Sparkles className="w-10 h-10 text-white animate-spin" />
                ) : (
                    <Zap className="w-10 h-10 text-white" />
                )}
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                {isGenerating ? 'Generating Lesson...' : `Ready for Day ${day}?`}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground max-w-md mb-8 relative z-10">
                {isGenerating
                    ? 'Analyzing your progress and crafting a personalized curriculum...'
                    : 'Generate a custom lesson combining theory, practical examples, and interactive tasks.'
                }
            </p>

            {/* Generate Button */}
            {!isGenerating && (
                <Button
                    onClick={onGenerate}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-orange-500/30 relative z-10"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Lesson
                </Button>
            )}
        </motion.div>
    )
}
