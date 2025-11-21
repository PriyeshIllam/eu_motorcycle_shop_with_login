#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env file
function loadEnv(filePath) {
    try {
        const envFile = fs.readFileSync(filePath, 'utf8');
        const envVars = {};

        envFile.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (line.trim() === '' || line.trim().startsWith('#')) {
                return;
            }

            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                envVars[key.trim()] = value;
            }
        });

        return envVars;
    } catch (error) {
        console.warn(`⚠️  Warning: Could not load .env file: ${error.message}`);
        console.warn('📝 Make sure you have created a .env file with your Supabase credentials');
        return {};
    }
}

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envVars = loadEnv(envPath);

// Log loaded environment variables (without showing values)
console.log('🔧 Building application...');
console.log('📦 Environment variables loaded:', Object.keys(envVars).length > 0 ? Object.keys(envVars).join(', ') : 'None');

// Create define object for esbuild
const define = {};
Object.keys(envVars).forEach(key => {
    define[`process.env.${key}`] = JSON.stringify(envVars[key]);
});

// Log if critical variables are missing
if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Warning: Missing Supabase environment variables!');
    console.warn('   - SUPABASE_URL:', envVars.SUPABASE_URL ? '✓' : '✗');
    console.warn('   - SUPABASE_ANON_KEY:', envVars.SUPABASE_ANON_KEY ? '✓' : '✗');
    console.warn('📝 Please update your .env file. See SUPABASE_SETUP.md for instructions.');
}

// Check if watch mode is requested
const isWatch = process.argv.includes('--watch');

// Build configuration
const buildOptions = {
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'public/js/bundle.js',
    sourcemap: true,
    define: define,
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    logLevel: 'info'
};

// Build or watch
if (isWatch) {
    console.log('👀 Watch mode enabled');
    esbuild.context(buildOptions).then(ctx => {
        ctx.watch();
        console.log('✅ Watching for changes...');
    }).catch((error) => {
        console.error('❌ Build failed:', error);
        process.exit(1);
    });
} else {
    esbuild.build(buildOptions).then(() => {
        console.log('✅ Build completed successfully!');
    }).catch((error) => {
        console.error('❌ Build failed:', error);
        process.exit(1);
    });
}
