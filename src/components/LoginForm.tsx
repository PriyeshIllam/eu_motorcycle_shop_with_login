import React, { useState, useEffect, FormEvent } from 'react';
import { FormInput } from './FormInput';
import { LoginButton } from './LoginButton';
import { supabase } from '../lib/supabase';

interface LoginFormProps {
    onSwitchToRegister?: () => void;
    onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        // Load saved email on mount
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateCredentials = (email: string, password: string): string | null => {
        if (!email) {
            setEmailError(true);
            return 'Please enter your email';
        }

        if (!validateEmail(email)) {
            setEmailError(true);
            return 'Please enter a valid email address';
        }

        if (!password) {
            setPasswordError(true);
            return 'Please enter your password';
        }

        if (password.length < 6) {
            setPasswordError(true);
            return 'Password must be at least 6 characters';
        }

        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setEmailError(false);
        setPasswordError(false);

        const validationError = validateCredentials(email.trim(), password);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);

        try {
            // Sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                setErrorMessage(error.message || 'Invalid email or password');
            } else if (data.user) {
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email.trim());
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setSuccessMessage('Login successful!');

                // Call the success callback if provided, otherwise redirect
                if (onLoginSuccess) {
                    setTimeout(() => {
                        onLoginSuccess();
                    }, 500);
                } else {
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 1500);
                }
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError(false);
        setErrorMessage('');
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError(false);
        setErrorMessage('');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    <h1>🏍️ EU Motorcycle Shop</h1>
                </div>
                <h2>Login</h2>
                <form id="loginForm" className="login-form" onSubmit={handleSubmit}>
                    <FormInput
                        id="email"
                        label="Email"
                        type="text"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email"
                        required
                        error={emailError}
                        autoComplete="email"
                    />
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        required
                        error={passwordError}
                        autoComplete="current-password"
                    />
                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>
                    <LoginButton loading={loading} />
                    {errorMessage && (
                        <div className="error-message" style={{ display: 'block' }}>
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className="success-message" style={{ display: 'block' }}>
                            {successMessage}
                        </div>
                    )}
                </form>
                <div className="signup-link">
                    <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister?.(); }}>Sign up</a></p>
                </div>
            </div>
        </div>
    );
};
