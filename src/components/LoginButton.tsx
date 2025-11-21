import React from 'react';

interface LoginButtonProps {
    loading: boolean;
    disabled?: boolean;
    text?: string;
    loadingText?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
    loading,
    disabled = false,
    text = 'Login',
    loadingText = 'Loading...'
}) => {
    return (
        <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={disabled || loading}
        >
            {loading ? loadingText : text}
        </button>
    );
};
