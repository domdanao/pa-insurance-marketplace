import { User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface AdminLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

export default function AdminLayout({ children, header }: AdminLayoutProps) {
    const { auth } = usePage().props as { auth: { user: User } };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Merchants', href: '/admin/merchants', icon: '🏬' },
        { name: 'Documents', href: '/admin/documents', icon: '📋' },
        { name: 'Providers', href: '/admin/stores', icon: '🏪' },
        { name: 'Orders', href: '/admin/orders', icon: '📦' },
        { name: 'Payments', href: '/admin/payments', icon: '💳' },
        { name: 'Categories', href: '/admin/categories', icon: '📂' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                                Marketplace Admin
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {auth.user.name}</span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="min-h-screen w-64 border-r border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-4">
                        <nav className="space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {header && (
                        <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
