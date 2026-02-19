'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'yournextlease01@gmail.com';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Determine if we need to run the check
        // If we're already on the login page, we don't strictly need to redirect to login,
        // but the Login page handles its own "if already logged in" logic.
        const isLoginPage = pathname === '/admin/login';

        if (!loading) {
            if (!user) {
                if (!isLoginPage) {
                    router.push('/admin/login');
                }
            } else {
                if (user.email === ADMIN_EMAIL) {
                    setIsAuthorized(true);
                    // If on login page and authorized, the Login Page component will handle the redirect to dashboard
                } else {
                    // Logged in but not admin
                    if (!isLoginPage) {
                        // Optional: Redirect to a custom "Unauthorized" page or just back to home
                        router.push('/');
                        // Or force logout here if strict
                    }
                }
            }
        }
    }, [user, loading, pathname, router]);

    // While checking auth status, show a loader (unless on login page, where we want to show UI faster)
    // However, for security on protected routes, we must NOT show children until authorized.

    const isLoginPage = pathname === '/admin/login';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    // If on login page, render it (it has its own logic)
    if (isLoginPage) {
        return <>{children}</>;
    }

    // If on protected route and not authorized yet, show loader or nothing
    // (Effect will redirect if not authorized)
    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {children}
        </div>
    );
}
