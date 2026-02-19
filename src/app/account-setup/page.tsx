
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

import { Suspense } from 'react';

function AccountSetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const oobCode = searchParams?.get('oobCode');

    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verifying, setVerifying] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Verify Code on Mount
    useEffect(() => {
        if (!oobCode) {
            setError('Invalid or missing setup code.');
            setVerifying(false);
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                setEmail(email);
                setVerifying(false);
            })
            .catch((error) => {
                console.error(error);
                setError('This link has expired or is invalid.');
                setVerifying(false);
            });
    }, [oobCode]);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!oobCode) return;

        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
            toast.success('Account setup successful!');

            // Redirect after delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to set password');
        } finally {
            setSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error && !success) { // Show error if verification failed and we haven't just succeeded
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md shadow-xl border-gray-100 rounded-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <Lock className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-red-600 text-xl">Link Expired or Invalid</CardTitle>
                        <CardDescription className="text-gray-500 pt-2">
                            {error} <br />
                            Please try requesting a new password reset link or contact support.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pt-4">
                        <Button onClick={() => router.push('/')} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                            Go Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md shadow-xl border-gray-100 rounded-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-green-600 text-xl">All Set!</CardTitle>
                        <CardDescription className="text-gray-600 pt-2">
                            Your password has been set successfully. <br />
                            Redirecting you to the dashboard...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="mb-8 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 mb-2 shadow-lg shadow-red-200">
                    <span className="text-white font-bold text-xl">Y</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">YourNextLease</h1>
                <p className="text-gray-500 text-sm font-medium">SECURE ACCOUNT SETUP</p>
            </div>

            <Card className="w-full max-w-md shadow-xl border-gray-100 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 pb-6">
                    <CardTitle className="text-xl text-center text-gray-800">Set Your Password</CardTitle>
                    <CardDescription className="text-center pt-2">
                        Create a secure password for <br />
                        <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSetup} className="space-y-5">
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-xl"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-xl"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 rounded-xl transition-all duration-200"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting Password...
                                </>
                            ) : (
                                'Set Password & Login'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} YourNextLease. All rights reserved.
            </p>
        </div>
    );
}

export default function AccountSetupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        }>
            <AccountSetupContent />
        </Suspense>
    );
}
