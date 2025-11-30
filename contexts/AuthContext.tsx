'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface UserProfile {
    id: string;
    full_name: string;
    username?: string;
    member_id?: string;
    membership_type: string;
    membership_status: string;
    car_models?: string[];
    role?: string;
    created_at: string;
    phone?: string;
    full_address?: string;
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If profile doesn't exist, we might want to create one or just set null
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                setUser(session?.user ?? null);
                setLoading(false); // Set loading false immediately

                // Fetch profile asynchronously (non-blocking)
                if (session?.user) {
                    fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setUser(null);
                setProfile(null);
                setLoading(false);
                supabase.auth.signOut(); // Don't await
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isAdmin = profile?.role === 'admin' || profile?.membership_type === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
