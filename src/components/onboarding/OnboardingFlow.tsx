import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import GoalStep from './GoalStep';
import TrackStep from './TrackStep';
import { useOnboardingStore } from '../../stores/useOnboardingStore';

interface OnboardingFlowProps {
    userId: string;
    userName: string;
}

export default function OnboardingFlow({ userId, userName }: OnboardingFlowProps) {
    const navigate = useNavigate();
    const { goal, selectedTrack, syncUser, chooseGoal, chooseTrack, complete } = useOnboardingStore();

    useEffect(() => {
        syncUser(userId);
    }, [syncUser, userId]);

    const isTrackStep = Boolean(goal);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass relative overflow-hidden rounded-[2rem] p-6 lg:p-8"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_35%)]" />
            <div className="relative z-10">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-vibe-400/20 bg-vibe-500/10 px-3 py-1 text-sm text-vibe-200">
                    <Sparkles className="h-4 w-4" />
                    Onboarding для нового аккаунта
                </p>
                <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">
                    {userName}, давай настроим старт без хаоса
                </h2>
                <p className="mb-6 max-w-2xl text-gray-300">
                    Этот поток заменяет фейковый “прогресс с потолка”. Сначала выбираешь цель, потом стартовый трек, и
                    продукт сразу ведёт тебя в первый реальный урок.
                </p>

                {!isTrackStep ? (
                    <>
                        <div className="mb-5 flex items-center gap-3 text-sm text-gray-400">
                            <span className="rounded-full bg-vibe-500/15 px-3 py-1 text-vibe-200">Шаг 1 из 2</span>
                            Выбери, зачем ты сюда пришёл
                        </div>
                        <GoalStep value={goal} onSelect={chooseGoal} />
                    </>
                ) : (
                    <>
                        <div className="mb-5 flex items-center gap-3 text-sm text-gray-400">
                            <span className="rounded-full bg-vibe-500/15 px-3 py-1 text-vibe-200">Шаг 2 из 2</span>
                            Выбери трек, с которого начнётся твой путь
                        </div>
                        <TrackStep
                            value={selectedTrack}
                            onSelect={chooseTrack}
                            onStart={() => {
                                if (!selectedTrack) {
                                    return;
                                }

                                complete();
                                navigate(`/lessons/${selectedTrack}`);
                            }}
                        />
                    </>
                )}
            </div>
        </motion.section>
    );
}
