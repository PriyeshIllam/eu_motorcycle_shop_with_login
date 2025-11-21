import React, { useState, useEffect, FormEvent } from 'react';
import { FormInput } from './FormInput';
import { LoginButton } from './LoginButton';

interface LoginCredentials {
    username: string;
    password: string;
    rememberMe: boolean;
}

interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
}

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        // Load saved username on mount
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const validateCredentials = (credentials: LoginCredentials): string | null => {
        if (!credentials.username) {
            setUsernameError(true);
            return 'Please enter your username';
        }

        if (credentials.username.length < 3) {
            setUsernameError(true);
            return 'Username must be at least 3 characters';
        }

        if (!credentials.password) {
            setPasswordError(true);
            return 'Please enter your password';
        }

        if (credentials.password.length < 6) {
            setPasswordError(true);
            return 'Password must be at least 6 characters';
        }

        return null;
    };

    const authenticateUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo credentials for testing
                if (credentials.username === 'admin' && credentials.password === 'password123') {
                    resolve({
                        success: true,
                        message: 'Login successful',
                        token: 'demo-jwt-token-' + Date.now()
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }
            }, 1000);
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setUsernameError(false);
        setPasswordError(false);

        const credentials: LoginCredentials = {
            username: username.trim(),
            password,
            rememberMe
        };

        const validationError = validateCredentials(credentials);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await authenticateUser(credentials);

            if (response.success) {
                if (credentials.rememberMe) {
                    localStorage.setItem('rememberedUsername', credentials.username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }

                if (response.token) {
                    sessionStorage.setItem('authToken', response.token);
                }

                setSuccessMessage('Login successful! Redirecting...');

                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            } else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        setUsernameError(false);
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
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Enter your username"
                        required
                        error={usernameError}
                        autoComplete="username"
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
                    <p>Don't have an account? <a href="#">Sign up</a></p>
                </div>
            </div>
        </div>
    );
};
