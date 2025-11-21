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

class LoginManager {
    private form: HTMLFormElement;
    private usernameInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private rememberMeCheckbox: HTMLInputElement;
    private errorMessage: HTMLDivElement;
    private loginButton: HTMLButtonElement;

    constructor() {
        this.form = document.getElementById('loginForm') as HTMLFormElement;
        this.usernameInput = document.getElementById('username') as HTMLInputElement;
        this.passwordInput = document.getElementById('password') as HTMLInputElement;
        this.rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
        this.errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
        this.loginButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;

        this.init();
    }

    private init(): void {
        this.form.addEventListener('submit', (e: Event) => this.handleSubmit(e));
        this.loadSavedUsername();
        this.addInputValidation();
    }

    private addInputValidation(): void {
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

    private validateInput(input: HTMLInputElement): boolean {
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

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        this.hideError();

        const credentials: LoginCredentials = {
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value,
            rememberMe: this.rememberMeCheckbox.checked
        };

        if (!this.validateCredentials(credentials)) {
            return;
        }

        this.setLoading(true);

        try {
            const response = await this.authenticateUser(credentials);

            if (response.success) {
                this.handleLoginSuccess(credentials, response);
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('An error occurred. Please try again later.');
            console.error('Login error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    private validateCredentials(credentials: LoginCredentials): boolean {
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

    private async authenticateUser(credentials: LoginCredentials): Promise<LoginResponse> {
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

        // In production, replace with actual API call:
        // const response = await fetch('/api/login', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(credentials),
        // });
        // return await response.json();
    }

    private handleLoginSuccess(credentials: LoginCredentials, response: LoginResponse): void {
        if (credentials.rememberMe) {
            localStorage.setItem('rememberedUsername', credentials.username);
        } else {
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

    private loadSavedUsername(): void {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            this.usernameInput.value = savedUsername;
            this.rememberMeCheckbox.checked = true;
        }
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'error-message';
        this.errorMessage.style.display = 'block';
    }

    private showSuccess(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'success-message';
        this.errorMessage.style.display = 'block';
    }

    private hideError(): void {
        this.errorMessage.style.display = 'none';
    }

    private setLoading(loading: boolean): void {
        if (loading) {
            this.loginButton.disabled = true;
            this.loginButton.textContent = 'Logging in...';
            this.loginButton.classList.add('loading');
        } else {
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
