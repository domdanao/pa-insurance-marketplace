import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Handle HTTP errors globally including 419 CSRF token expiration
router.on('exception', (event) => {
    // Check if this is a 419 error (CSRF token mismatch)
    if (event.detail?.response?.status === 419) {
        // Show a user-friendly message and provide refresh option
        if (confirm('Your session has expired. Would you like to refresh your session and try again?')) {
            // Refresh the session and then retry the last request
            window.location.href = '/refresh-session';
        }
    }
});

// This will set light / dark mode on load...
initializeTheme();
