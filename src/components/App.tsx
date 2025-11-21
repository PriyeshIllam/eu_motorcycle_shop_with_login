import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { HomePage } from './HomePage';
import { BikerProfile } from './BikerProfile';
import { ServiceDocuments } from './ServiceDocuments';
import { BikerMotorcycle } from '../types/biker-motorcycle';

type ViewMode = 'login' | 'register' | 'home' | 'profile' | 'serviceDocs';

export const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('login');
    const [loading, setLoading] = useState(true);
    const [selectedMotorcycle, setSelectedMotorcycle] = useState<BikerMotorcycle | null>(null);

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setView('home');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setView('home');
            } else if (event === 'SIGNED_OUT') {
                setView('login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setView('login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleLoginSuccess = () => {
        setView('home');
    };

    const handleViewServiceDocuments = (motorcycle: BikerMotorcycle) => {
        setSelectedMotorcycle(motorcycle);
        setView('serviceDocs');
    };

    const handleBackToProfile = () => {
        setSelectedMotorcycle(null);
        setView('profile');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontFamily: 'sans-serif'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <>
            {view === 'serviceDocs' && selectedMotorcycle ? (
                <ServiceDocuments
                    motorcycle={selectedMotorcycle}
                    onBack={handleBackToProfile}
                />
            ) : view === 'profile' ? (
                <BikerProfile
                    onBack={() => setView('home')}
                    onLogout={handleLogout}
                    onViewServiceDocuments={handleViewServiceDocuments}
                />
            ) : view === 'home' ? (
                <HomePage
                    onLogout={handleLogout}
                    onViewProfile={() => setView('profile')}
                />
            ) : view === 'login' ? (
                <LoginForm
                    onSwitchToRegister={() => setView('register')}
                    onLoginSuccess={handleLoginSuccess}
                />
            ) : (
                <RegisterForm onSwitchToLogin={() => setView('login')} />
            )}
        </>
    );
};
