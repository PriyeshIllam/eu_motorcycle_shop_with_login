# EU Motorcycle Shop - Login Application

A React + TypeScript (TSX) login application with SASS styling and component-based architecture for the EU Motorcycle Shop.

## Features

- Modern, responsive login page built with React
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
│   ├── components/         # React components
│   │   ├── App.tsx        # Main app component
│   │   ├── LoginForm.tsx  # Login form container
│   │   ├── FormInput.tsx  # Reusable input component
│   │   └── LoginButton.tsx # Submit button component
│   ├── index.tsx          # Application entry point
│   └── styles/
│       └── login.scss     # SASS styles
├── public/
│   ├── index.html         # HTML template with React root
│   ├── css/               # Compiled CSS (generated)
│   └── js/                # Bundled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Installation

```bash
npm install
```

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

## Demo Credentials

For testing purposes, use:
- **Username:** admin
- **Password:** password123

## Technologies Used

- React 18.2
- TypeScript 5.3 (with TSX)
- SASS 1.69
- esbuild (for bundling)
- HTML5

## Component Structure

- **App.tsx**: Main application component
- **LoginForm.tsx**: Container component managing login state and logic
- **FormInput.tsx**: Reusable input field component with validation
- **LoginButton.tsx**: Submit button with loading states
