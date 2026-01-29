import { NavLink } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from './ui/button'

export function ProfileHeader() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <NavLink to="/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </NavLink>

            <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
            </Button>
        </header>
    )
}
