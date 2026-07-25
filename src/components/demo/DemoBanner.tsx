import { Eye, LogIn, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { useProgressStore } from '../../stores/useProgressStore';

export function DemoBanner() {
    const navigate = useNavigate();
    const isDemo = useAuthStore((state) => state.isDemo);
    const exitDemo = useAuthStore((state) => state.exitDemo);
    const resetProgress = useProgressStore((state) => state.resetProgress);
    const resetOnboarding = useOnboardingStore((state) => state.reset);
    const clearLessons = useLessonStore((state) => state.clearAllLessons);

    if (!isDemo) {
        return null;
    }

    const handleExit = () => {
        exitDemo();
        resetProgress();
        resetOnboarding();
        clearLessons();
        navigate('/auth', { replace: true });
    };

    return (
        <div className="demo-banner" role="status">
            <div className="flex min-w-0 items-center gap-2">
                <span className="demo-banner__icon" aria-hidden="true">
                    <Eye className="h-3.5 w-3.5" />
                </span>
                <p className="truncate text-xs font-semibold text-white sm:text-sm">
                    <strong>Демо-режим</strong>
                    <span className="ml-2 hidden font-normal text-slate-300 md:inline">
                        Все изменения остаются только в этом браузере.
                    </span>
                </p>
            </div>

            <div className="flex items-center gap-1.5">
                <Link
                    to="/auth"
                    onClick={handleExit}
                    className="demo-banner__action hidden sm:inline-flex"
                >
                    <LogIn className="h-3.5 w-3.5" />
                    Создать аккаунт
                </Link>
                <button type="button" onClick={handleExit} className="demo-banner__action" aria-label="Выйти из демо">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Выйти</span>
                </button>
            </div>
        </div>
    );
}
