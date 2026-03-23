import { motion } from 'framer-motion';
import { Briefcase, Compass, RefreshCcw } from 'lucide-react';
import type { OnboardingGoal } from '../../stores/useOnboardingStore';

const goals: Array<{
    id: OnboardingGoal;
    title: string;
    description: string;
    icon: typeof Briefcase;
}> = [
    {
        id: 'career',
        title: 'Первая работа',
        description: 'Хочу быстро собрать сильный фундамент и выйти к собеседованиям.',
        icon: Briefcase,
    },
    {
        id: 'practice',
        title: 'Для себя',
        description: 'Хочу выстроить ежедневную практику и учиться без хаоса.',
        icon: Compass,
    },
    {
        id: 'switch',
        title: 'Смена стека',
        description: 'Уже кодил, но хочу зайти в новый язык и не начинать вслепую.',
        icon: RefreshCcw,
    },
];

interface GoalStepProps {
    value: OnboardingGoal | null;
    onSelect: (goal: OnboardingGoal) => void;
}

export default function GoalStep({ value, onSelect }: GoalStepProps) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            {goals.map((goal, index) => {
                const Icon = goal.icon;
                const selected = value === goal.id;

                return (
                    <motion.button
                        key={goal.id}
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        onClick={() => onSelect(goal.id)}
                        className={`rounded-[1.5rem] border p-5 text-left transition-all ${
                            selected
                                ? 'border-vibe-400/50 bg-vibe-500/15'
                                : 'border-white/10 bg-white/5 hover:border-vibe-400/25 hover:bg-white/10'
                        }`}
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-vibe-500/20">
                            <Icon className="h-5 w-5 text-vibe-200" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">{goal.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-300">{goal.description}</p>
                    </motion.button>
                );
            })}
        </div>
    );
}
