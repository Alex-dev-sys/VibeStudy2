import { motion } from 'framer-motion'

// Generate sample heatmap data for the last 12 weeks
const generateHeatmapData = () => {
    const weeks = 12
    const days = 7
    const data: { intensity: number; date: string }[][] = []

    for (let w = 0; w < weeks; w++) {
        const week: { intensity: number; date: string }[] = []
        for (let d = 0; d < days; d++) {
            const intensity = Math.floor(Math.random() * 5)
            const date = new Date()
            date.setDate(date.getDate() - ((weeks - w - 1) * 7 + (days - d - 1)))
            week.push({
                intensity,
                date: date.toISOString().split('T')[0],
            })
        }
        data.push(week)
    }
    return data
}

const heatmapData = generateHeatmapData()

const intensityColors = [
    'bg-secondary',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary',
]

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ActivityHeatmap() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Activity Heatmap</h3>
                <span className="text-sm text-muted-foreground">Last 12 weeks</span>
            </div>

            <div className="flex gap-4">
                {/* Day labels */}
                <div className="flex flex-col gap-1">
                    {dayLabels.map((day) => (
                        <div key={day} className="h-4 text-xs text-muted-foreground flex items-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1 flex-1">
                    {heatmapData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1 flex-1">
                            {week.map((day, dayIndex) => (
                                <motion.div
                                    key={`${weekIndex}-${dayIndex}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                                    className={`h-4 rounded-sm ${intensityColors[day.intensity]} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
                                    title={`${day.date}: ${day.intensity} activities`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-muted-foreground">Less</span>
                {intensityColors.map((color, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${color}`}
                    />
                ))}
                <span className="text-xs text-muted-foreground">More</span>
            </div>
        </motion.div>
    )
}
