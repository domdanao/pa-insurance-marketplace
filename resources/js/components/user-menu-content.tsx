import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import { LogOut, Settings, ShoppingBag } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleMyOrders = () => {
        console.log('My Orders clicked');
        cleanup();
        let ordersUrl = '/orders'; // Default fallback

        if (user.role === 'merchant') {
            ordersUrl = '/merchant/orders';
        } else if (user.role === 'admin') {
            ordersUrl = '/admin/orders';
        } else {
            ordersUrl = '/buyer/orders';
        }

        console.log('Navigating to:', ordersUrl);
        router.visit(ordersUrl);
    };

    const handleSettings = () => {
        console.log('Settings clicked');
        cleanup();
        router.visit('/profile');
    };

    const handleLogout = () => {
        console.log('Logout clicked');
        cleanup();
        router.post('/logout');
    };

    return (
        <div className="min-w-48 p-2 bg-red-100 border-2 border-red-500">
            <div className="text-red-800 font-bold mb-2">DROPDOWN TEST - CAN YOU SEE THIS?</div>

            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <button
                type="button"
                className="w-full bg-blue-500 text-white p-3 mb-2 hover:bg-blue-700"
                onClick={() => {
                    alert('My Orders clicked!');
                    console.log('My Orders clicked');
                    handleMyOrders();
                }}
                onMouseEnter={() => console.log('My Orders hover')}
            >
                🛒 My Orders (CLICK ME)
            </button>

            <button
                type="button"
                className="w-full bg-green-500 text-white p-3 mb-2 hover:bg-green-700"
                onClick={() => {
                    alert('Settings clicked!');
                    console.log('Settings clicked');
                    handleSettings();
                }}
                onMouseEnter={() => console.log('Settings hover')}
            >
                ⚙️ Settings (CLICK ME)
            </button>

            <button
                type="button"
                className="w-full bg-red-500 text-white p-3 hover:bg-red-700"
                onClick={() => {
                    alert('Logout clicked!');
                    console.log('Logout clicked');
                    handleLogout();
                }}
                onMouseEnter={() => console.log('Logout hover')}
            >
                🚪 Log out (CLICK ME)
            </button>
        </div>
    );
}
