import React from 'react';

interface LoginButtonProps {
    loading: boolean;
    disabled?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ loading, disabled = false }) => {
    return (
        <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={disabled || loading}
        >
            {loading ? 'Logging in...' : 'Login'}
        </button>
    );
};
