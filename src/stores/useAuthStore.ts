import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Subscription, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { demoProfile, demoUser } from '../lib/demo';
import type { Profile } from '../types/database.types';

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    isInitialized: boolean;
    isDemo: boolean;

    initialize: () => Promise<void>;
    enterDemo: () => void;
    exitDemo: () => void;
    setSession: (session: Session | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    addXP: (amount: number) => Promise<void>;
    signOut: () => Promise<void>;
}

let authSubscription: Subscription | null = null;
let initializePromise: Promise<void> | null = null;

function isAbortError(error: unknown) {
    return error instanceof Error && error.name === 'AbortError';
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            profile: null,
            isLoading: true,
            isInitialized: false,
            isDemo: false,

            initialize: async () => {
                if (initializePromise) {
                    return initializePromise;
                }

                initializePromise = (async () => {
                    set({ isLoading: true });

                    try {
                        if (get().isDemo) {
                            set({
                                session: null,
                                user: demoUser,
                                profile: get().profile ?? demoProfile,
                                isLoading: false,
                                isInitialized: true,
                            });
                            return;
                        }

                        const { data } = await supabase.auth.getSession();
                        const session = data.session;

                        if (session) {
                            set({
                                session,
                                user: session.user,
                                isLoading: true,
                            });
                            await get().fetchProfile();
                        } else {
                            set({
                                session: null,
                                user: null,
                                profile: null,
                            });
                        }

                        if (!authSubscription) {
                            const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
                                console.log('Auth event:', event);
                                set({
                                    session,
                                    user: session?.user ?? null,
                                });

                                if (session) {
                                    void get().fetchProfile();
                                } else {
                                    set({ profile: null });
                                }
                            });

                            authSubscription = authListener.subscription;
                        }

                        set({ isInitialized: true, isLoading: false });
                    } catch (error) {
                        if (!isAbortError(error)) {
                            console.error('Auth initialization error:', error);
                        }

                        set({
                            session: null,
                            user: null,
                            profile: null,
                            isLoading: false,
                            isInitialized: true,
                        });
                    } finally {
                        initializePromise = null;
                    }
                })();

                return initializePromise;
            },

            setSession: (session) => {
                set({
                    session,
                    user: session?.user ?? null,
                });
            },

            enterDemo: () => {
                set({
                    session: null,
                    user: demoUser,
                    profile: demoProfile,
                    isDemo: true,
                    isLoading: false,
                    isInitialized: true,
                });
            },

            exitDemo: () => {
                set({
                    session: null,
                    user: null,
                    profile: null,
                    isDemo: false,
                });
            },

            fetchProfile: async () => {
                const { user, isDemo } = get();
                if (!user) return;
                if (isDemo) {
                    set({ profile: get().profile ?? demoProfile });
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        if (error.code === 'PGRST116') {
                            const newProfile: { id: string } & Pick<Profile, 'full_name' | 'avatar_url' | 'current_streak' | 'longest_streak' | 'total_xp' | 'level'> = {
                                id: user.id,
                                full_name: user.user_metadata?.full_name || null,
                                avatar_url: user.user_metadata?.avatar_url || null,
                                current_streak: 0,
                                longest_streak: 0,
                                total_xp: 0,
                                level: 1,
                            };

                            const { data: created, error: createError } = await supabase
                                .from('profiles')
                                .insert(newProfile)
                                .select()
                                .single();

                            if (createError) throw createError;
                            set({ profile: created as Profile });
                        } else {
                            throw error;
                        }
                    } else {
                        set({ profile: data as Profile });
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            },

            updateProfile: async (updates) => {
                const { user, profile, isDemo } = get();
                if (!user || !profile) return;

                if (isDemo) {
                    set({
                        profile: {
                            ...profile,
                            ...updates,
                            updated_at: new Date().toISOString(),
                        },
                    });
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .update({ ...updates, updated_at: new Date().toISOString() })
                        .eq('id', user.id)
                        .select()
                        .single();

                    if (error) throw error;
                    set({ profile: data as Profile });
                } catch (error) {
                    console.error('Error updating profile:', error);
                }
            },

            addXP: async (amount) => {
                const { profile } = get();
                if (!profile) return;

                const newXP = profile.total_xp + amount;
                const newLevel = Math.floor(newXP / 1000) + 1;

                await get().updateProfile({
                    total_xp: newXP,
                    level: newLevel,
                });
            },

            signOut: async () => {
                if (!get().isDemo) {
                    await supabase.auth.signOut();
                }
                set({
                    user: null,
                    session: null,
                    profile: null,
                    isDemo: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                profile: state.profile,
                isDemo: state.isDemo,
            }),
        }
    )
);
