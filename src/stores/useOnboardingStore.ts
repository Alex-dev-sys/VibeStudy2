import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingGoal = 'career' | 'practice' | 'switch';

interface OnboardingState {
    ownerUserId: string | null;
    goal: OnboardingGoal | null;
    selectedTrack: string | null;
    completedAt: string | null;
    syncUser: (userId: string) => void;
    chooseGoal: (goal: OnboardingGoal) => void;
    chooseTrack: (trackId: string) => void;
    complete: () => void;
    reset: () => void;
}

const emptyOnboardingState = {
    goal: null,
    selectedTrack: null,
    completedAt: null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            ownerUserId: null,
            ...emptyOnboardingState,

            syncUser: (userId) => {
                if (get().ownerUserId && get().ownerUserId !== userId) {
                    set({
                        ownerUserId: userId,
                        ...emptyOnboardingState,
                    });
                    return;
                }

                if (!get().ownerUserId) {
                    set({ ownerUserId: userId });
                }
            },

            chooseGoal: (goal) => {
                set({ goal });
            },

            chooseTrack: (trackId) => {
                set({ selectedTrack: trackId });
            },

            complete: () => {
                set({ completedAt: new Date().toISOString() });
            },

            reset: () => {
                set({
                    ownerUserId: null,
                    ...emptyOnboardingState,
                });
            },
        }),
        {
            name: 'onboarding-storage',
            partialize: (state) => ({
                ownerUserId: state.ownerUserId,
                goal: state.goal,
                selectedTrack: state.selectedTrack,
                completedAt: state.completedAt,
            }),
        }
    )
);
