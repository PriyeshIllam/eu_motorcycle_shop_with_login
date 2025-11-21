# EU Motorcycle Shop - Login Application

A React + TypeScript (TSX) authentication application with Supabase backend, SASS styling, and component-based architecture for the EU Motorcycle Shop.

## Features

- Modern, responsive login and registration pages built with React
- **Supabase Authentication** integration for secure user management
- User registration with email confirmation
- Login with email and password
- TypeScript + TSX for type-safe component development
- Component-based architecture for reusability
- SASS for organized and maintainable styles
- Form validation with real-time feedback
- Remember me functionality
- Loading states and error handling
- Beautiful animations and transitions

## Project Structure

```
eu_motorcycle_shop_with_login/
├── src/
│   ├── components/            # React components
│   │   ├── App.tsx           # Main app component with view switching
│   │   ├── LoginForm.tsx     # Login form container
│   │   ├── RegisterForm.tsx  # Registration form container
│   │   ├── FormInput.tsx     # Reusable input component
│   │   └── LoginButton.tsx   # Submit button component
│   ├── lib/
│   │   └── supabase.ts       # Supabase client configuration
│   ├── index.tsx             # Application entry point
│   └── styles/
│       └── login.scss        # SASS styles
├── public/
│   ├── index.html            # HTML template with React root
│   ├── css/                  # Compiled CSS (generated)
│   └── js/                   # Bundled JavaScript (generated)
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment variables template
├── build.js                  # Custom build script with env injection
├── package.json
├── tsconfig.json
└── SUPABASE_SETUP.md         # Supabase configuration guide
```

## Installation

```bash
npm install
```

## Supabase Configuration

**IMPORTANT**: Before running the application, you need to configure your Supabase credentials using environment variables.

### Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase anon key from your project dashboard

3. Update the `.env` file with your actual Supabase anon key:
   ```env
   SUPABASE_URL=https://mpizntvbwkktnzmnjtep.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

4. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

**Security:** The `.env` file is gitignored and will not be committed to version control.

## Build

Build both TypeScript and SASS:

```bash
npm run build
```

Build JavaScript only:

```bash
npm run build:js
```

Build SASS only:

```bash
npm run build:css
```

## Development

Watch for changes and rebuild automatically:

```bash
npm run dev
```

## Running the Application

Start the development server:

```bash
npm start
```

Then open your browser to `http://localhost:8080`

## Authentication Flow

1. **Register**: Create a new account with email and password
   - Fill in your full name, email, and password
   - Confirm your password
   - Submit the registration form
   - Check your email for the confirmation link
   - Click the confirmation link to activate your account

2. **Login**: Sign in with your registered credentials
   - Enter your email and password
   - Optionally check "Remember me" to save your email
   - Submit to login

## Technologies Used

- **React 18.2** - UI framework
- **TypeScript 5.3** (with TSX) - Type-safe development
- **Supabase** - Backend authentication and database
- **SASS 1.69** - CSS preprocessing
- **esbuild** - Fast bundling
- **HTML5**

## Component Structure

- **App.tsx**: Main application component with view switching (login/register)
- **LoginForm.tsx**: Login form with Supabase authentication
- **RegisterForm.tsx**: Registration form with email validation and password confirmation
- **FormInput.tsx**: Reusable input field component with validation and error states
- **LoginButton.tsx**: Generic submit button with loading states
