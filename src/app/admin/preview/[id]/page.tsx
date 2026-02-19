'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ListingForm from '@/components/ListingForm';
import { AdminListing } from '@/lib/admin-mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';

export default function ListingPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<AdminListing | null>(null);
    const [loading, setLoading] = useState(true);

    // We use the ListingForm to handle the "Approve" action (which is essentially a Submit)
    // The form itself handles state, validation, and submission.

    useEffect(() => {
        const fetchListing = async () => {
            if (!params?.id) return;

            try {
                // Fetch all sheets data
                const res = await fetch('/api/admin/fetch-sheets');
                if (!res.ok) throw new Error('Failed to fetch sheets');

                const data = await res.json();
                const found = data.listings.find((l: AdminListing) => l.id === params.id);

                if (found) {
                    setListing(found);
                }
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [params]);

    const handleApproveSubmission = async (formData: any) => {
        console.log('Submit button click');
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                alert('You are not authenticated');
                return;
            }

            // Call the backend API
            const payload = {
                ...formData,
                sheetRowId: listing?.id // Pass the Google Sheet Row ID (e.g., sheet_row_2)
            };

            const response = await fetch('/api/admin/approve-listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to approve listing');
            }

            const result = await response.json();
            console.log('Approval success:', result);

            alert(`Success! ${result.message}\nUser ID: ${result.userId}\nNew User: ${result.isNewUser}`);
            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error('Approval failed:', error);
            alert(`Failed to approve listing: ${error.message}`);
            // Re-throw if you want the form to handle it, but here we handle it.
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <h1 className="text-xl font-semibold mb-4">Listing not found</h1>
                <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
                <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Review Listing</h1>
                    <p className="text-xs text-gray-500">Review and edit before publishing</p>
                </div>
            </div>

            {/* Content: Render the Reusable Form in 'approve' mode */}
            {/* We pass 'listing' as initialData. The Form handles mapping it to fields. */}
            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* 
                       We render the Form's content directly. 
                       Note: ListingForm is designed as a Modal. 
                       We might want to adjust it to be inline, or just open it immediately?
                       
                       Better approach for this UX:
                       The ListingForm component expects 'open' prop for Modal.
                       We can refactor ListingForm to be inline, OR we can just wrap it here.
                       
                       ACTUALLY: The requirement is "Render the merged object in a Preview page using the same UI components".
                       The ListingForm IS the UI component. 
                       Let's assume for now we render it "open" but maybe strip the modal overlay if possible?
                       Or just use it as is - it will look like a modal on top of the page, which is fine for a "Review" action.
                       
                       However, keeping the context of a "Page", maybe we just treat the Page AS the Form container.
                       Let's just pass `open={true}` and disable `onClose` (or route back on close).
                     */}

                    <ListingForm
                        open={true}
                        onClose={() => router.push('/admin/dashboard')}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        initialData={listing as any}
                        onSubmit={handleApproveSubmission}
                        mode="approve"
                    />
                </div>
            </div>
        </div>
    );
}
