'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, FileSpreadsheet, Settings } from 'lucide-react';
import PendingListingsTable from '@/components/admin/PendingListingsTable';

export default function AdminDashboardPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/admin/login');
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6" />
                        Admin Panel
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <FileSpreadsheet className="w-5 h-5" />
                        Google Sheets Import
                        <span className="ml-auto text-xs bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full">Soon</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-red-600">Admin Panel</h2>
                    <button onClick={handleSignOut} className="p-2 text-gray-600 hover:text-red-600">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}</p>
                    </div>

                    {/* Stats Grid Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {['Total Listings', 'Pending Approval', 'Total Users'].map((label) => (
                            <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Pending Approvals Section */}
                    <PendingListingsTable />
                </div>
            </main>
        </div>
    );
}
