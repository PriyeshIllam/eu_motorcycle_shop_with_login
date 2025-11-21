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
        console.warn(`Warning: Could not load .env file: ${error.message}`);
        return {};
    }
}

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envVars = loadEnv(envPath);

// Create define object for esbuild
const define = {};
Object.keys(envVars).forEach(key => {
    define[`process.env.${key}`] = JSON.stringify(envVars[key]);
});

// Check if watch mode is requested
const isWatch = process.argv.includes('--watch');

// Build configuration
const buildOptions = {
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'public/js/bundle.js',
    sourcemap: true,
    define: define,
    loader: { '.tsx': 'tsx', '.ts': 'ts' }
};

// Build or watch
if (isWatch) {
    esbuild.context(buildOptions).then(ctx => {
        ctx.watch();
        console.log('Watching for changes...');
    }).catch(() => process.exit(1));
} else {
    esbuild.build(buildOptions).catch(() => process.exit(1));
}
