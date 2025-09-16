<!DOCTYPE html>
<html>
<head>
    <title>Logout</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 2rem; border: 1px solid #ccc; border-radius: 8px;">
            <h2>Click to Logout</h2>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" style="background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    Logout Now
                </button>
            </form>
        </div>
    </div>
</body>
</html>