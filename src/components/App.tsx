import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type ViewMode = 'login' | 'register';

export const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('login');

    return (
        <>
            {view === 'login' ? (
                <LoginForm onSwitchToRegister={() => setView('register')} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setView('login')} />
            )}
        </>
    );
};
