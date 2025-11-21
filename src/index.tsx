import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

// Error boundary fallback
const ErrorFallback = ({ error }: { error: Error }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'sans-serif'
    }}>
        <div style={{
            maxWidth: '600px',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>⚠️ Application Error</h2>
            <p style={{ marginBottom: '20px' }}>Something went wrong while loading the application.</p>
            <details style={{ marginBottom: '20px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
                <pre style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto'
                }}>
                    {error.message}
                    {error.stack}
                </pre>
            </details>
            <p style={{ fontSize: '14px', color: '#666' }}>
                💡 Check the browser console for more details.
            </p>
        </div>
    </div>
);

// Initialize app with error handling
try {
    const container = document.getElementById('root');
    if (!container) {
        throw new Error('Root element not found. Make sure the HTML file has a div with id="root"');
    }

    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

    console.log('✅ Application initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize application:', error);

    // Fallback rendering if React fails
    const container = document.getElementById('root');
    if (container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; font-family: sans-serif;">
                <div style="max-width: 600px; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c; margin-bottom: 10px;">⚠️ Application Error</h2>
                    <p style="margin-bottom: 20px;">Failed to initialize the application.</p>
                    <p style="font-size: 14px; color: #666;">Check the browser console for details.</p>
                </div>
            </div>
        `;
    }
}
