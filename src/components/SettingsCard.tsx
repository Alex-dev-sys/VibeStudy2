import { motion } from 'framer-motion'
import { Switch } from './ui/switch'
import { Bell, Moon, Globe, Shield } from 'lucide-react'

const settings = [
    { icon: Bell, label: 'Push Notifications', enabled: true },
    { icon: Moon, label: 'Dark Mode', enabled: true },
    { icon: Globe, label: 'Public Profile', enabled: false },
    { icon: Shield, label: 'Two-Factor Auth', enabled: true },
]

export function SettingsCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6"
        >
            <h3 className="font-semibold text-foreground mb-4">Quick Settings</h3>

            <div className="space-y-4">
                {settings.map((setting, index) => (
                    <motion.div
                        key={setting.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <setting.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{setting.label}</span>
                        </div>
                        <Switch defaultChecked={setting.enabled} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
