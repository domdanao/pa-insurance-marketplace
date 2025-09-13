<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Expired</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <div class="mb-4">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg class="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.19 2.5 1.732 2.5z" />
                </svg>
            </div>
        </div>
        
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Page Expired</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
            Your session has expired due to inactivity. Please refresh your session to continue.
        </p>
        
        <div class="space-y-3">
            <a href="{{ route('refresh-session') }}" 
               class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 inline-block">
                Refresh Session & Continue
            </a>
            
            <a href="{{ route('home') }}" 
               class="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors duration-200 inline-block">
                Go to Homepage
            </a>
        </div>
        
        <div class="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>Error Code: 419</p>
            <p>This happens when your security token expires. Clicking "Refresh Session" will fix this issue.</p>
        </div>
    </div>

    <script>
        // Auto-refresh functionality for AJAX requests
        if (window.history.length > 1) {
            document.querySelector('a[href*="refresh-session"]').addEventListener('click', function(e) {
                e.preventDefault();
                
                // Try to refresh the session via AJAX first
                fetch('{{ route("refresh-session") }}', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Update CSRF token in meta tag if it exists
                    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                    if (csrfMeta && data.csrf_token) {
                        csrfMeta.setAttribute('content', data.csrf_token);
                    }
                    
                    // Try to go back to the previous page
                    window.history.back();
                })
                .catch(error => {
                    // Fallback to regular link behavior
                    window.location.href = this.href;
                });
            });
        }
    </script>
</body>
</html>