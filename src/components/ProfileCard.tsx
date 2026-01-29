import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Edit2, Trophy, Flame, Calendar } from 'lucide-react'

export function ProfileCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden"
        >
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                {/* Avatar */}
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/30">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" />
                        <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <Button size="icon-sm" className="absolute -bottom-1 -right-1 rounded-full bg-primary hover:bg-primary/90">
                        <Edit2 className="w-3 h-3" />
                    </Button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-foreground">Alex Developer</h1>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                            <Trophy className="w-3 h-3 mr-1" />
                            Pro Member
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">@alexdev • Joined January 2025</p>

                    {/* Quick stats */}
                    <div className="flex items-center justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-semibold text-foreground">12</span>
                            <span className="text-muted-foreground text-sm">day streak</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-foreground">89</span>
                            <span className="text-muted-foreground text-sm">lessons</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
