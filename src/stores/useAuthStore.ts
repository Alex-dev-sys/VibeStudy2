import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    setSession: (session: Session | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    addXP: (amount: number) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            profile: null,
            isLoading: true,
            isInitialized: false,

            initialize: async () => {
                try {
                    // Get current session
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session) {
                        set({
                            session,
                            user: session.user,
                            isLoading: true
                        });
                        await get().fetchProfile();
                    }

                    // Listen for auth changes
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        console.log('Auth event:', event);
                        set({ session, user: session?.user ?? null });

                        if (session) {
                            await get().fetchProfile();
                        } else {
                            set({ profile: null });
                        }
                    });

                    set({ isInitialized: true, isLoading: false });
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    set({ isLoading: false, isInitialized: true });
                }
            },

            setSession: (session) => {
                set({
                    session,
                    user: session?.user ?? null
                });
            },

            fetchProfile: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        // Profile doesn't exist, create it
                        if (error.code === 'PGRST116') {
                            const newProfile: Partial<Profile> = {
                                id: user.id,
                                full_name: user.user_metadata?.full_name || null,
                                avatar_url: user.user_metadata?.avatar_url || null,
                                current_streak: 0,
                                longest_streak: 0,
                                total_xp: 0,
                                level: 1,
                            };

                            const { data: created } = await supabase
                                .from('profiles')
                                .insert(newProfile)
                                .select()
                                .single();

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
                const { user, profile } = get();
                if (!user || !profile) return;

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
                await supabase.auth.signOut();
                set({
                    user: null,
                    session: null,
                    profile: null
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // Only persist these fields
                user: state.user,
                profile: state.profile,
            }),
        }
    )
);
