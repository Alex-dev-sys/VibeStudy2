import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const midnight = new Date()
            midnight.setHours(24, 0, 0, 0)
            const diff = midnight.getTime() - now.getTime()

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft({ hours, minutes, seconds })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 justify-center"
        >
            {[
                { value: timeLeft.hours, label: 'h' },
                { value: timeLeft.minutes, label: 'm' },
                { value: timeLeft.seconds, label: 's' },
            ].map((item, index) => (
                <div key={item.label} className="flex items-center">
                    <div className="bg-card border border-border rounded-xl px-4 py-2">
                        <span className="text-2xl font-bold text-foreground font-mono">
                            {formatNumber(item.value)}
                        </span>
                        <span className="text-muted-foreground ml-1">{item.label}</span>
                    </div>
                    {index < 2 && <span className="text-muted-foreground mx-1">:</span>}
                </div>
            ))}
        </motion.div>
    )
}
