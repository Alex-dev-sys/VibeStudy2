import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Gift, Copy, Users } from 'lucide-react'

export function InviteFriends() {
    const referralCode = 'VIBESTUDY2025'

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/20 to-card border border-primary/30 rounded-2xl p-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Invite Friends</h3>
                    <p className="text-sm text-muted-foreground">Get 7 days free Pro</p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-3 mb-4">
                <code className="flex-1 text-sm font-mono text-foreground">{referralCode}</code>
                <Button size="icon-sm" variant="ghost" onClick={copyCode}>
                    <Copy className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>3 friends invited</span>
            </div>
        </motion.div>
    )
}
