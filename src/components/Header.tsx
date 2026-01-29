import { NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
    activePage?: 'dashboard' | 'playground' | 'challenges' | 'analytics' | 'profile'
}

const navItems = [
    { name: 'Dashboard', href: '/home', key: 'dashboard' },
    { name: 'Playground', href: '/playground', key: 'playground' },
    { name: 'Challenges', href: '/challenges', key: 'challenges' },
    { name: 'Analytics', href: '/analytics', key: 'analytics' },
    { name: 'Profile', href: '/profile', key: 'profile' },
]

export function Header({ activePage = 'dashboard' }: HeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-3 bg-card/90 backdrop-blur-sm border border-border/30 rounded-full mx-4 mt-4">
            <div className="flex items-center gap-8">
                <NavLink to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">Vibe Study</span>
                </NavLink>

                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const isActive = activePage === item.key
                        return (
                            <NavLink
                                key={item.key}
                                to={item.href}
                                className={`text-sm transition-all ${isActive
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {item.name}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                    Get Started
                </Button>
            </div>
        </header>
    )
}
