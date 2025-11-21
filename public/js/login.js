"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.errorMessage = document.getElementById('errorMessage');
        this.loginButton = this.form.querySelector('button[type="submit"]');
        this.init();
    }
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadSavedUsername();
        this.addInputValidation();
    }
    addInputValidation() {
        [this.usernameInput, this.passwordInput].forEach(input => {
            input.addEventListener('input', () => {
                this.hideError();
                this.validateInput(input);
            });
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }
    validateInput(input) {
        const value = input.value.trim();
        if (!value) {
            input.classList.add('error');
            return false;
        }
        if (input.id === 'username' && value.length < 3) {
            input.classList.add('error');
            return false;
        }
        if (input.id === 'password' && value.length < 6) {
            input.classList.add('error');
            return false;
        }
        input.classList.remove('error');
        return true;
    }
    handleSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            this.hideError();
            const credentials = {
                username: this.usernameInput.value.trim(),
                password: this.passwordInput.value,
                rememberMe: this.rememberMeCheckbox.checked
            };
            if (!this.validateCredentials(credentials)) {
                return;
            }
            this.setLoading(true);
            try {
                const response = yield this.authenticateUser(credentials);
                if (response.success) {
                    this.handleLoginSuccess(credentials, response);
                }
                else {
                    this.showError(response.message);
                }
            }
            catch (error) {
                this.showError('An error occurred. Please try again later.');
                console.error('Login error:', error);
            }
            finally {
                this.setLoading(false);
            }
        });
    }
    validateCredentials(credentials) {
        if (!credentials.username) {
            this.showError('Please enter your username');
            this.usernameInput.focus();
            return false;
        }
        if (credentials.username.length < 3) {
            this.showError('Username must be at least 3 characters');
            this.usernameInput.focus();
            return false;
        }
        if (!credentials.password) {
            this.showError('Please enter your password');
            this.passwordInput.focus();
            return false;
        }
        if (credentials.password.length < 6) {
            this.showError('Password must be at least 6 characters');
            this.passwordInput.focus();
            return false;
        }
        return true;
    }
    authenticateUser(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else {
                        resolve({
                            success: false,
                            message: 'Invalid username or password'
                        });
                    }
                }, 1000);
            });
            // In production, replace with actual API call:
            // const response = await fetch('/api/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(credentials),
            // });
            // return await response.json();
        });
    }
    handleLoginSuccess(credentials, response) {
        if (credentials.rememberMe) {
            localStorage.setItem('rememberedUsername', credentials.username);
        }
        else {
            localStorage.removeItem('rememberedUsername');
        }
        if (response.token) {
            sessionStorage.setItem('authToken', response.token);
        }
        this.showSuccess('Login successful! Redirecting...');
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    }
    loadSavedUsername() {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            this.usernameInput.value = savedUsername;
            this.rememberMeCheckbox.checked = true;
        }
    }
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'error-message';
        this.errorMessage.style.display = 'block';
    }
    showSuccess(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'success-message';
        this.errorMessage.style.display = 'block';
    }
    hideError() {
        this.errorMessage.style.display = 'none';
    }
    setLoading(loading) {
        if (loading) {
            this.loginButton.disabled = true;
            this.loginButton.textContent = 'Logging in...';
            this.loginButton.classList.add('loading');
        }
        else {
            this.loginButton.disabled = false;
            this.loginButton.textContent = 'Login';
            this.loginButton.classList.remove('loading');
        }
    }
}
// Initialize the login manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
//# sourceMappingURL=login.js.map