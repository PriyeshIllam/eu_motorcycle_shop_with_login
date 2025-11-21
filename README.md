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
├── vercel.json               # Vercel deployment configuration
├── package.json
├── tsconfig.json
├── SUPABASE_SETUP.md         # Supabase configuration guide
├── VERCEL_DEPLOYMENT.md      # Vercel deployment guide
├── DEPLOYMENT_CHECKLIST.md   # Quick deployment checklist
└── TROUBLESHOOTING.md        # Common issues and solutions
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

## Deployment

### Deploying to Vercel

This application is ready to deploy to Vercel:

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `public`
3. **Add environment variables** (CRITICAL):
   - `SUPABASE_URL` = `https://mpizntvbwkktnzmnjtep.supabase.co`
   - `SUPABASE_ANON_KEY` = Your actual Supabase anon key
4. **Deploy!**

**Important**: Without environment variables, you'll get an empty page on Vercel.

📖 **See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete step-by-step instructions**

✅ **Quick Reference**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Troubleshooting

### Empty Page with Background?

If you see only the gradient background with no login form:

1. **Check browser console** (F12) for errors
2. **Verify `.env` file exists** with your actual Supabase anon key (not the placeholder)
3. **Rebuild the application**: `npm run build`
4. **Restart the server**: `npm start`

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Common Issues

- **"Missing Supabase environment variables"**: Your `.env` file has placeholder values. Update with real credentials.
- **Files not loading**: Run `npm run build` to regenerate bundle.js and CSS files
- **Cached files**: Hard refresh with `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Empty page on Vercel**: Environment variables not set in Vercel dashboard
