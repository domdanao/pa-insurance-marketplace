import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';

interface StorefrontLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

export default function StorefrontLayout({ children, header }: StorefrontLayoutProps) {
    const { auth, cartCount } = usePage().props as { auth?: { user: User }; cartCount: number };
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                                Marketplace
                            </Link>
                            <div className="hidden md:flex space-x-6">
                                <Link 
                                    href="/products" 
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                                >
                                    Products
                                </Link>
                                <Link 
                                    href="/stores" 
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                                >
                                    Stores
                                </Link>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {auth?.user ? (
                                <>
                                    <Link 
                                        href="/cart" 
                                        className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center space-x-1"
                                    >
                                        <span>🛒 Cart</span>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <div className="relative" ref={dropdownRef}>
                                        <button 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            {auth.user.name}
                                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                                            <Link 
                                                href="/orders" 
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                My Orders
                                            </Link>
                                            <Link 
                                                href="/logout" 
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                Logout
                                            </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href="/login" 
                                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        href="/register" 
                                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm font-medium rounded-md"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                                Company
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/about" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                                Shop
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/products" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/stores" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        All Stores
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                                Support
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/help" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/returns" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        Returns
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                                Sell
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/register?role=merchant" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        Become a Merchant
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                        <p className="text-base text-gray-400 dark:text-gray-500 text-center">
                            &copy; 2025 Marketplace. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}