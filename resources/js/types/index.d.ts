import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: string;
    created_at: string;
    updated_at: string;
    merchant?: Merchant;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Merchant {
    id: string;
    user_id: number;
    business_name: string;
    business_type: string;
    tax_id: string;
    business_description: string;
    phone: string;
    website?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    bank_account_holder: string;
    bank_account_number: string;
    bank_routing_number: string;
    bank_name: string;
    status: string;
    kyb_completed: boolean;
    kyb_completed_at?: string;
    officers?: any[];
    beneficial_owners?: any[];
    documents: any[];
    created_at: string;
    updated_at: string;
    user: User;
    approved_by?: User;
    last_reviewed_by?: User;
    last_reviewed_at?: string;
}

export interface MerchantDocument {
    id: string;
    merchant_id: string;
    document_type: string;
    document_name: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    file_hash: string;
    status: string;
    expiry_date?: string;
    rejection_reason?: string;
    review_notes?: string;
    last_reviewed_at?: string;
    reviewed_by?: User;
    created_at: string;
    updated_at: string;
    merchant: Merchant;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
