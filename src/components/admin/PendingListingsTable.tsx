'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, Loader2, Pencil, RefreshCw } from "lucide-react";
import { AdminListing } from '@/lib/admin-mock-data';

export default function PendingListingsTable() {
    const router = useRouter();
    const [listings, setListings] = useState<AdminListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/fetch-sheets');
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setListings(data.listings || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load listings from Google Sheets check Console for errors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleView = (id: string) => {
        router.push(`/admin/preview/${id}`);
    };

    const handleEdit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        alert(`Edit functionality for ${id} coming soon!`);
    };

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessingId(id);

        // TODO: Implement actual approval endpoint
        console.log(`Approving listing ${id}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        setListings(prev => prev.filter(l => l.id !== id));
        setProcessingId(null);
        alert(`Listing ${id} approved!`);
    };

    const handleReject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to reject this listing?')) return;

        setProcessingId(id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setListings(prev => prev.filter(l => l.id !== id));
        setProcessingId(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
                <p className="text-gray-500">Syncing with Google Sheets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-red-100">
                <div className="text-red-500 mb-2 font-medium">{error}</div>
                <Button onClick={fetchListings} variant="outline">Try Again</Button>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                <p className="text-gray-500 mb-4">No pending listings found in the sheet.</p>
                <Button onClick={fetchListings} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">Pending Approvals From Google Sheets</h3>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={fetchListings} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                        {listings.length} Pending
                    </span>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead>Listing Details</TableHead>
                        <TableHead>User / Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listings.map((listing) => (
                        <TableRow key={listing.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleView(listing.id)}>
                            <TableCell className="font-medium text-gray-500 text-xs">
                                {listing.submissionDate}
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold text-gray-900">{listing.title}</div>
                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{listing.listingType}</span>
                                    {listing.propertyName && <span className="text-gray-600 font-medium">{listing.propertyName}</span>}
                                    {listing.leaseDuration && <span className="text-gray-500">• {listing.leaseDuration}</span>}
                                    {listing.apartmentType && <span className="text-gray-500">• {listing.apartmentType}</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                                <div className="text-xs text-gray-500">{listing.email}</div>
                                {listing.contacts && <div className="text-xs text-gray-500 mt-0.5">{listing.contacts}</div>}
                                {listing.contactMethod && <div className="text-[10px] text-gray-400 uppercase mt-0.5">{listing.contactMethod}</div>}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                                <div>{listing.address}</div>
                                <div className="text-xs text-gray-500">{listing.city} {listing.zipCode}</div>
                                {listing.mapsLink && (
                                    <a href={listing.mapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline" onClick={e => e.stopPropagation()}>
                                        View Map
                                    </a>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-gray-900">
                                <div>${listing.rent}</div>
                                {listing.extraUtilityCost && <div className="text-xs text-gray-500 font-normal">+ {listing.extraUtilityCost} utils</div>}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => { e.stopPropagation(); handleView(listing.id); }}
                                    >
                                        <Eye className="w-4 h-4 text-gray-600" />
                                        <span className="sr-only">View</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-blue-50"
                                        onClick={(e) => handleEdit(listing.id, e)}
                                    >
                                        <Pencil className="w-4 h-4 text-blue-600" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-700"
                                        onClick={(e) => handleApprove(listing.id, e)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
                                        <span className="sr-only">Approve</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={(e) => handleReject(listing.id, e)}
                                        disabled={!!processingId}
                                    >
                                        <X className="w-4 h-4 text-red-600" />
                                        <span className="sr-only">Reject</span>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
