import { Head, Link } from '@inertiajs/react';

export default function Error419() {
    const handleRefreshSession = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            // Try to refresh the session via AJAX
            const response = await fetch('/refresh-session', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Update CSRF token in meta tag if it exists
                const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
                if (csrfMeta && data.csrf_token) {
                    csrfMeta.content = data.csrf_token;
                }

                // Show success message and allow user to continue
                alert('Session refreshed successfully! You can now continue.');

                // Try to go back to the previous page
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '/';
                }
            } else {
                // Fallback to regular link behavior
                window.location.href = '/refresh-session';
            }
        } catch (error) {
            // Fallback to regular link behavior
            window.location.href = '/refresh-session';
        }
    };

    return (
        <>
            <Head title="Page Expired" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
                <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
                    <div className="mb-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.19 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Page Expired</h1>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Your session has expired due to inactivity. Please refresh your session to continue.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleRefreshSession}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-indigo-700"
                        >
                            Refresh Session & Continue
                        </button>

                        <Link
                            href="/"
                            className="inline-block w-full rounded-md bg-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                        >
                            Go to Homepage
                        </Link>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                        <p>Error Code: 419</p>
                        <p>This happens when your security token expires. Clicking "Refresh Session" will fix this issue.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
