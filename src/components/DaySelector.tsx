import { useRef } from 'react'
import { motion } from 'framer-motion'

interface DaySelectorProps {
    currentDay: number
    totalDays: number
    onDayChange?: (day: number) => void
}

export function DaySelector({ currentDay, totalDays, onDayChange }: DaySelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const visibleDays = 14

    return (
        <div className="mb-8">
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {Array.from({ length: visibleDays }, (_, i) => {
                    const day = i + 1
                    const isActive = day === currentDay
                    const isCompleted = day < currentDay
                    const isLocked = day > currentDay

                    return (
                        <motion.button
                            key={day}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => !isLocked && onDayChange?.(day)}
                            disabled={isLocked}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-b from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                                    : isCompleted
                                        ? 'bg-secondary text-foreground hover:bg-secondary/80'
                                        : 'bg-card text-muted-foreground border border-border/30 hover:border-border opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <span className="text-xs opacity-80">Day</span>
                            <span className="text-lg font-bold">{day}</span>
                        </motion.button>
                    )
                })}

                {/* Fade indicator for more days */}
                <div className="flex-shrink-0 w-14 h-16 rounded-xl bg-gradient-to-r from-card to-transparent flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">...</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentDay / totalDays) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
                />
            </div>
        </div>
    )
}
