import AuthWideLayoutTemplate from '@/layouts/auth/auth-wide-layout';

export default function AuthWideLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <AuthWideLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthWideLayoutTemplate>
    );
}