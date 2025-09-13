interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface FlashMessagesProps {
    flash?: FlashMessages;
    className?: string;
}

export default function FlashMessages({ flash, className = "mb-4" }: FlashMessagesProps) {
    if (!flash) return null;

    const messages = [
        { type: 'success', message: flash.success, styles: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' },
        { type: 'error', message: flash.error, styles: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' },
        { type: 'warning', message: flash.warning, styles: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800' },
        { type: 'info', message: flash.info, styles: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800' },
    ];

    const activeMessages = messages.filter(({ message }) => message);

    if (activeMessages.length === 0) return null;

    return (
        <div className={className}>
            {activeMessages.map(({ type, message, styles }) => (
                <div key={type} className={`p-4 rounded-md text-sm ${styles}`}>
                    {message}
                </div>
            ))}
        </div>
    );
}