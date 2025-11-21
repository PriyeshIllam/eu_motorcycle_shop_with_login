import React, { useState, FormEvent } from 'react';
import { FormInput } from './FormInput';
import { LoginButton } from './LoginButton';
import { supabase } from '../lib/supabase';

interface RegisterFormProps {
    onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fullNameError, setFullNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): string | null => {
        if (!fullName.trim()) {
            setFullNameError(true);
            return 'Please enter your full name';
        }

        if (fullName.trim().length < 2) {
            setFullNameError(true);
            return 'Full name must be at least 2 characters';
        }

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
            return 'Please enter a password';
        }

        if (password.length < 6) {
            setPasswordError(true);
            return 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            setConfirmPasswordError(true);
            return 'Please confirm your password';
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError(true);
            return 'Passwords do not match';
        }

        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setFullNameError(false);
        setEmailError(false);
        setPasswordError(false);
        setConfirmPasswordError(false);

        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);

        try {
            // Sign up with Supabase
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: fullName.trim(),
                    }
                }
            });

            if (error) {
                setErrorMessage(error.message || 'Registration failed. Please try again.');
            } else if (data.user) {
                setSuccessMessage('Registration successful! Please check your email to confirm your account.');

                // Clear form
                setFullName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');

                // Switch to login after delay
                setTimeout(() => {
                    onSwitchToLogin?.();
                }, 3000);
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFullNameChange = (value: string) => {
        setFullName(value);
        setFullNameError(false);
        setErrorMessage('');
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

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setConfirmPasswordError(false);
        setErrorMessage('');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    <h1>🏍️ EU Motorcycle Shop</h1>
                </div>
                <h2>Create Account</h2>
                <form id="registerForm" className="login-form" onSubmit={handleSubmit}>
                    <FormInput
                        id="fullName"
                        label="Full Name"
                        type="text"
                        value={fullName}
                        onChange={handleFullNameChange}
                        placeholder="Enter your full name"
                        required
                        error={fullNameError}
                        autoComplete="name"
                    />
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
                        autoComplete="new-password"
                    />
                    <FormInput
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Confirm your password"
                        required
                        error={confirmPasswordError}
                        autoComplete="new-password"
                    />
                    <LoginButton loading={loading} text="Register" loadingText="Creating account..." />
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
                    <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>Sign in</a></p>
                </div>
            </div>
        </div>
    );
};
