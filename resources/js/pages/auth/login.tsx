import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import FlashMessages from '@/components/FlashMessages';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/toast-container';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function Login({ status, flash }: LoginProps) {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpLoading, setOtpLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otp, setOtp] = useState('');
    const { toast, toasts, removeToast } = useToast();

    const sendOtp = async () => {
        if (!userEmail) {
            toast({
                variant: 'error',
                description: 'Please enter your email address'
            });
            return;
        }

        setOtpLoading(true);
        try {
            const response = await fetch('/api/send-login-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email: userEmail }),
            });

            if (response.ok) {
                setIsOtpSent(true);
                toast({
                    variant: 'success',
                    description: 'Login code sent to your email'
                });
            } else {
                const data = await response.json();
                toast({
                    variant: 'error',
                    description: data.message || 'Failed to send login code'
                });
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            toast({
                variant: 'error',
                description: 'Failed to send login code. Please try again.'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email below to receive a login code">
            <Head title="Log in" />

            <FlashMessages flash={flash} />

            <div className="flex flex-col gap-6">
                {!isOtpSent ? (
                    <>
                        {/* Email Step */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <Button
                                onClick={sendOtp}
                                className="w-full"
                                disabled={isOtpLoading || !userEmail}
                            >
                                {isOtpLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Send Login Code
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* OTP Verification Step */}
                        <Form {...AuthenticatedSessionController.store.form()} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="email" value={userEmail} />
                                    <input type="hidden" name="otp" value={otp} />
                                    <input type="hidden" name="passwordless_login" value="1" />

                                    <div className="text-center mb-4">
                                        <Mail className="mx-auto h-12 w-12 text-green-500" />
                                        <h3 className="mt-2 text-lg font-semibold">Check your email</h3>
                                        <p className="text-sm text-muted-foreground">
                                            We sent a login code to <strong>{userEmail}</strong>
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="otp">Login Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                            autoFocus
                                            className="text-center text-lg font-mono"
                                        />
                                        <InputError message={errors.otp} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing || otp.length !== 6}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Log In
                                    </Button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOtpSent(false);
                                                setOtp('');
                                            }}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Use different email
                                        </button>
                                        <span className="mx-2 text-muted-foreground">•</span>
                                        <button
                                            type="button"
                                            onClick={sendOtp}
                                            disabled={isOtpLoading}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Resend code
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    Want to sell on our marketplace?{' '}
                    <TextLink href={`${register()}?role=merchant`}>
                        Register as Merchant
                    </TextLink>
                </div>
            </div>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </AuthLayout>
    );
}
