"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Define a flexible interface for incoming data to avoid 'any'
interface ListingData {
    title?: string;
    listingType?: string;
    genderPref?: string;
    moveIn?: unknown; // Timestamp or Date or string
    moveOut?: unknown;
    leaseDuration?: string;
    occupancyType?: string;
    numOccupants?: string | number;
    apartmentType?: string;
    depositAmount?: string | number;
    availableForViewing?: string;
    preferredRoommateType?: string;
    propertyName?: string;
    address?: string;
    city?: string;
    zipCode?: string | number;
    mapsLink?: string;
    proximityLandmarks?: string;
    rent?: string | number;
    whatsIncluded?: string[];
    extraUtilityCost?: string | number;
    roomAmenities?: string[];
    communityAmenities?: string[];
    imageUrls?: string[];
    contacts?: string[] | string;
    hideNumber?: boolean;
    contactMethod?: string;
    description?: string;
    personality?: string;
    terms?: boolean;
    [key: string]: unknown; // Allow other fields
}

interface ListingFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: ListingData; // Typed instead of any
    onSubmit?: (data: Record<string, unknown>) => Promise<void>;
    mode?: 'create' | 'edit' | 'approve';
}

export default function ListingForm({ open, onClose, initialData, onSubmit, mode = 'create' }: ListingFormProps) {
    const { user, userProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        // Step 1
        'Listing Title': '',
        'Listing Type': '',
        'Gender Preference': '',
        'Move-in / Move-out Dates': { from: undefined as Date | undefined, to: undefined as Date | undefined },
        'Lease Duration': '',
        'Lease Duration (Other)': '',
        'Occupancy Type': '',
        'Number of Existing Occupants': '',
        'Target Language/Culture Preference': '',
        'Your apartment type': '',
        depositAmount: '',
        'Available for Viewing': 'No',
        'Preferred Roommate Type': 'Anyone',
        // Step 2
        'Property Name': '',
        Address: '',
        City: '',
        'Zip Code': '',
        'Google Maps Link': '',
        'Proximity Landmarks': '',
        'Rent per Person ($)': '',
        "What's Included": [] as string[],
        'Custom Included': [] as string[],
        'Extra Utility Cost': '',
        // Step 3
        'Room Amenities': [] as string[],
        'Custom Room Amenities': [] as string[],
        'Community Amenities': [] as string[],
        Furnished: '',
        Transit: '',
        Commute: '',
        Distance: '',
        Stores: '',
        // Step 4
        Photos: [] as File[], // File objects for new uploads
        existingImageUrls: [] as string[], // URL strings for existing/pre-filled images
        Contacts: [''],
        'Hide number': false,
        'Preferred Contact Method': '',
        Description: '',
        Personality: '',
        Terms: false,
        'Custom Community Amenities': [] as string[],
        email: '',
        name: ''

    });

    // Effect to populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            // Map Firebase/Sheet schema back to Form State keys
            // This mapping logic is critical for the "Edit" feature
            setForm(prev => ({
                ...prev,
                ...mapInitialDataToForm(initialData)
            }));
        }
    }, [initialData]);

    const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
    const [submitting, setSubmitting] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [previewIdx, setPreviewIdx] = useState<number | null>(null);
    const [dateRangeOpen, setDateRangeOpen] = useState(false);

    const [addingAmenity, setAddingAmenity] = useState(false);
    const [customAmenityInput, setCustomAmenityInput] = useState('');
    const [addingCommunityAmenity, setAddingCommunityAmenity] = useState(false);
    const [customCommunityAmenityInput, setCustomCommunityAmenityInput] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // --- Helper to map initialData to Form State ---
    function mapInitialDataToForm(data: ListingData) {
        // Basic mapping - expand as needed based on strict schema
        return {
            'Listing Title': data.title || '',
            'Listing Type': data.listingType || '',
            'Gender Preference': data.genderPref || '',
            'Move-in / Move-out Dates': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                from: data.moveIn ? ((data.moveIn as any).toDate ? (data.moveIn as any).toDate() : new Date(data.moveIn as string | number | Date)) : undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to: data.moveOut ? ((data.moveOut as any).toDate ? (data.moveOut as any).toDate() : new Date(data.moveOut as string | number | Date)) : undefined
            },
            'Lease Duration': ['6 months', '9 months', '12 months', 'Flexible'].includes(data.leaseDuration || '') ? (data.leaseDuration || '') : 'Other',
            'Lease Duration (Other)': ['6 months', '9 months', '12 months', 'Flexible'].includes(data.leaseDuration || '') ? '' : (data.leaseDuration || ''),
            'Occupancy Type': data.occupancyType || '',
            'Number of Existing Occupants': (data.numOccupants || '').toString(),
            'Your apartment type': data.apartmentType || '',
            depositAmount: (data.depositAmount || '').toString(),
            'Available for Viewing': data.availableForViewing || 'No',
            'Preferred Roommate Type': data.preferredRoommateType || 'Anyone',
            'Property Name': data.propertyName || '',
            Address: data.address || '',
            City: data.city || '',
            'Zip Code': (data.zipCode || '').toString(),
            'Google Maps Link': data.mapsLink || '',
            'Proximity Landmarks': data.proximityLandmarks || '',
            'Rent per Person ($)': (data.rent || '').toString(),
            "What's Included": data.whatsIncluded || [],
            'Extra Utility Cost': (data.extraUtilityCost || '').toString(),
            'Room Amenities': data.roomAmenities || [],
            'Community Amenities': data.communityAmenities || [],
            existingImageUrls: data.imageUrls || [], // Store existing URLs separately
            Contacts: data.contacts ? (Array.isArray(data.contacts) ? data.contacts : [data.contacts]) : [''],
            'Hide number': data.hideNumber || false,
            'Preferred Contact Method': data.contactMethod || '',
            Description: data.description || '',
            Personality: data.personality || '',
            Terms: data.terms || false,
            'Custom Room Amenities': [], // Should be populated if mapped from DB but complex logic needed if DB doesn't distinguish
            'Custom Community Amenities': [], // Fixed: Removed references to unused Custom Included
            email: (data.email as string) || '',
            name: (data.name as string) || ''
        };
    }


    function validateStep() {
        const e: { [k: string]: string } = {};
        if (step === 1) {
            if (!form['Listing Title']) e['Listing Title'] = 'Required';
            if (!form['Listing Type']) e['Listing Type'] = 'Required';
            if (!form['Gender Preference']) e['Gender Preference'] = 'Required';
            if (!form['Move-in / Move-out Dates']?.from || !form['Move-in / Move-out Dates']?.to) e['Move-in / Move-out Dates'] = 'Required';
            if (!form['Lease Duration']) e['Lease Duration'] = 'Required';
            if (form['Lease Duration'] === 'Other' && !form['Lease Duration (Other)']) e['Lease Duration (Other)'] = 'Please specify duration in months';
            if (!form['Occupancy Type']) e['Occupancy Type'] = 'Required';
            if (!form['Your apartment type']) e['Your apartment type'] = 'Required';
            if (!form.depositAmount) e.depositAmount = 'Required';
            if (!form['Available for Viewing']) e['Available for Viewing'] = 'Required';
            if (!form['Preferred Roommate Type']) e['Preferred Roommate Type'] = 'Required';
        }
        if (step === 2) {
            if (!form['Property Name']) e['Property Name'] = 'Required';
            if (!form.Address) e.Address = 'Required';
            if (!form.City) e.City = 'Required';
            if (!form['Zip Code']) e['Zip Code'] = 'Required';
            if (!form['Google Maps Link']) e['Google Maps Link'] = 'Required';
            if (!form['Rent per Person ($)']) e['Rent per Person ($)'] = 'Required';
            if ((!form['What\'s Included'] || form['What\'s Included'].length === 0) && (!form['Custom Included'] || form['Custom Included'].length === 0)) e['What\'s Included'] = 'Select at least one';
            if (!form['Proximity Landmarks']) e['Proximity Landmarks'] = 'Required';
        }
        if (step === 4) {
            if (!form.Contacts[0]) e.Contacts = 'At least one contact required';
            if (!form['Preferred Contact Method']) e['Preferred Contact Method'] = 'Required';
            if (!form.Terms) e.Terms = 'You must accept the terms';
            if (form.Photos.length + form.existingImageUrls.length < 3) e.Photos = 'At least 3 photos required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleChange(field: string, value: unknown) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    }

    function handlePhotoInput(e: React.ChangeEvent<HTMLInputElement>) {
        setPhotoError(null);
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setForm(f => {
                const newPhotos = [...f.Photos, ...files];
                // Logic for max/min photos should consider existing URLs too
                if (newPhotos.length + f.existingImageUrls.length > 7) {
                    setPhotoError('You can upload a maximum of 7 photos.');
                    return f;
                }
                return { ...f, Photos: newPhotos };
            });
        }
    }

    function removePhoto(idx: number, isExisting: boolean) {
        if (isExisting) {
            setForm(f => ({ ...f, existingImageUrls: f.existingImageUrls.filter((_, i) => i !== idx) }));
        } else {
            setForm(f => ({ ...f, Photos: f.Photos.filter((_, i) => i !== idx) }));
        }
    }

    function handleContactChange(index: number, value: string) {
        setForm(f => {
            const newContacts = [...f.Contacts];
            newContacts[index] = value;
            return { ...f, Contacts: newContacts };
        });
    }

    function addContactField() {
        setForm(f => ({ ...f, Contacts: [...f.Contacts, ''] }));
    }

    function removeContactField(index: number) {
        setForm(f => ({ ...f, Contacts: f.Contacts.filter((_, i) => i !== index) }));
    }

    // --- Submission Logic ---
    async function uploadImageToCloudinary(file: File): Promise<string> {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddbcva4qu';
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned-listings';

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data: { secure_url: string } = await res.json();
        return data.secure_url;
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!validateStep()) return;
        setSubmitting(true);

        try {
            // 1. Prepare Data
            const whatsIncluded = Array.from(new Set([...(form["What's Included"] || []), ...(form["Custom Included"] || [])]));
            const roomAmenities = Array.from(new Set([...(form["Room Amenities"] || []), ...(form["Custom Room Amenities"] || [])]));
            const communityAmenities = Array.from(new Set([...(form["Community Amenities"] || []), ...(form["Custom Community Amenities"] || [])]));

            // 2. Upload New Images (Local Files)
            let newHostedUrls: string[] = [];
            if (form.Photos && form.Photos.length > 0) {
                newHostedUrls = await Promise.all(form.Photos.map(uploadImageToCloudinary));
            }

            // 3. Migrate Existing Google Drive Images to Cloudinary
            const migratedExistingUrls = await Promise.all(form.existingImageUrls.map(async (url) => {
                // Check if it's a proxy URL (starts with /api/admin/proxy-image)
                if (url.startsWith('/api/admin/proxy-image')) {
                    try {
                        // Fetch the image blob from our own proxy
                        const res = await fetch(url);
                        if (!res.ok) throw new Error('Failed to fetch from proxy');
                        const blob = await res.blob();
                        console.log('Migrating image:', url, 'Size:', blob.size, 'Type:', blob.type);

                        const ext = blob.type.split('/')[1] || 'jpg';
                        const file = new File([blob], `migrated-image.${ext}`, { type: blob.type });

                        // Upload to Cloudinary
                        return await uploadImageToCloudinary(file);
                    } catch (e) {
                        console.error('Failed to migrate image:', url, e);
                        // Fallback: keep the original proxy URL (user needs to know)
                        // Or maybe return null and filter it out?
                        // For now, let's keep it so data isn't lost, but log error.
                        return url;
                    }
                }
                // If it's already a cloudinary link or other external link, keep it
                return url;
            }));

            // Combine all hosted URLs
            const finalImageUrls = [...migratedExistingUrls, ...newHostedUrls];
            console.log('Images were uploaded to cloudinary:', finalImageUrls);

            // Helper to clean numeric strings
            const cleanNumber = (val: unknown) => {
                if (!val) return '0';
                return String(val).replace(/[^0-9.]/g, '');
            };

            // 3. Construct Payload
            const data = {
                title: form['Listing Title'],
                listingType: form['Listing Type'],
                genderPref: form['Gender Preference'],
                moveIn: form['Move-in / Move-out Dates']?.from ? Timestamp.fromDate(new Date(form['Move-in / Move-out Dates'].from)) : null,
                moveOut: form['Move-in / Move-out Dates']?.to ? Timestamp.fromDate(new Date(form['Move-in / Move-out Dates'].to)) : null,
                leaseDuration: form['Lease Duration'] === 'Other' ? form['Lease Duration (Other)'] : form['Lease Duration'],
                occupancyType: form['Occupancy Type'],
                numOccupants: cleanNumber(form['Number of Existing Occupants']),
                languagePref: form['Target Language/Culture Preference'],
                apartmentType: form['Your apartment type'],
                depositAmount: cleanNumber(form.depositAmount),
                availableForViewing: form['Available for Viewing'],
                preferredRoommateType: form['Preferred Roommate Type'],
                propertyName: form['Property Name'],
                address: form.Address,
                city: form.City,
                zipCode: cleanNumber(form['Zip Code']),
                mapsLink: form['Google Maps Link'],
                proximityLandmarks: form['Proximity Landmarks'],
                rent: cleanNumber(form['Rent per Person ($)']),
                whatsIncluded,
                extraUtilityCost: form['Extra Utility Cost'].toString(),
                roomAmenities,
                communityAmenities,
                transit: form.Transit,
                commute: form.Commute,
                distance: form.Distance,
                stores: form.Stores,
                contacts: form.Contacts,
                hideNumber: form['Hide number'],
                contactMethod: form['Preferred Contact Method'],
                description: form.Description,
                personality: form.Personality,
                terms: form.Terms,
                customIncluded: form['Custom Included'],
                customRoomAmenities: form['Custom Room Amenities'],
                customCommunityAmenities: form['Custom Community Amenities'],
                // Preserve User Info for Linking
                email: form.email,
                name: form.name,
                imageUrls: finalImageUrls,

                // Meta
                updatedAt: Timestamp.now(),
                // Only add these if creating new (or pass via initialData if preserving)
                ...(mode === 'create' ? {
                    createdAt: Timestamp.now(),
                    userId: user?.uid,
                    userDisplayName: user?.displayName,
                    ownerVerifiedUniversity: userProfile?.verifiedUniversity || null,
                } : {}),
            };

            // 4. Submit
            console.log('Submitting form data:', data);
            if (onSubmit) {
                // Use custom handler (e.g. for Approval)
                await onSubmit(data);
            } else {
                // Default Create behavior
                await addDoc(collection(db, 'listings'), data);
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                onClose();
                if (mode === 'create') window.location.reload();
            }, 1500);

        } catch (err: unknown) {
            console.error(err);
            setSubmitError((err as Error).message || 'Failed to submit listing.');
        } finally {
            setSubmitting(false);
        }
    }

    // --- Render ---
    return (
        <AnimatePresence>
            {open && (
                <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.form
                        onSubmit={handleFormSubmit}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-lg mx-2 sm:mx-4 p-4 sm:p-8 relative flex flex-col gap-6 overflow-y-auto"
                        style={{ maxHeight: '95vh' }}
                    >
                        <button onClick={onClose} type="button" className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl font-bold" aria-label="Close">
                            <X className="w-6 h-6" />
                        </button>
                        <div className="text-xs text-gray-500 text-center mb-2">Step {step} of 4</div>
                        <h2 className="text-2xl font-extrabold text-red-600 text-center mb-2">
                            {mode === 'approve' ? 'Review & Approve Listing' : mode === 'edit' ? 'Edit Listing' : 'Add New Listing'}
                        </h2>

                        {/* Step 1: Basic Listing Info */}
                        {step === 1 && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title *</label>
                                    <Input value={form['Listing Title']} onChange={e => handleChange('Listing Title', e.target.value)} className="rounded-lg h-10" placeholder="e.g. Private Room in 3B2B | Female Only | Aug 12 Move-in" />
                                    {errors['Listing Title'] && <div className="text-xs text-red-600 mt-1">{errors['Listing Title']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Permanent', 'Temporary', 'Sublease', 'New Lease (roommate search)'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Listing Type'] === opt ? 'default' : 'outline'} className={form['Listing Type'] === opt ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Listing Type', opt)}>{opt}</Button>
                                        ))}
                                    </div>
                                    {errors['Listing Type'] && <div className="text-xs text-red-600 mt-1">{errors['Listing Type']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Female', 'Male', 'Any'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Gender Preference'] === opt ? 'default' : 'outline'} className={form['Gender Preference'] === opt ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Gender Preference', opt)}>{opt}</Button>
                                        ))}
                                    </div>
                                    {errors['Gender Preference'] && <div className="text-xs text-red-600 mt-1">{errors['Gender Preference']}</div>}
                                </div>
                                {/* Move-in/Move-out Date Range Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-in / Move-out Dates *</label>
                                    <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                                                {form['Move-in / Move-out Dates']?.from && form['Move-in / Move-out Dates']?.to
                                                    ? `${format(form['Move-in / Move-out Dates'].from, 'MMM d, yyyy')} – ${format(form['Move-in / Move-out Dates'].to, 'MMM d, yyyy')}`
                                                    : 'Select dates'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                                            <Calendar
                                                mode="range"
                                                selected={form['Move-in / Move-out Dates'] || undefined}
                                                onSelect={range => handleChange('Move-in / Move-out Dates', range)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors['Move-in / Move-out Dates'] && <div className="text-xs text-red-600 mt-1">{errors['Move-in / Move-out Dates']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lease Duration *</label>
                                    <select value={form['Lease Duration']} onChange={e => handleChange('Lease Duration', e.target.value)} className="rounded-lg h-10 w-full border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all">
                                        <option value="" disabled>Select duration</option>
                                        <option value="6 months">6 months</option>
                                        <option value="9 months">9 months</option>
                                        <option value="12 months">12 months</option>
                                        <option value="Flexible">Flexible</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors['Lease Duration'] && <div className="text-xs text-red-600 mt-1">{errors['Lease Duration']}</div>}
                                    {form['Lease Duration'] === 'Other' && (
                                        <div className="mt-2">
                                            <Input value={form['Lease Duration (Other)']} onChange={e => handleChange('Lease Duration (Other)', e.target.value)} className="rounded-lg h-10" placeholder="Please specify (in months)" type="text" pattern="[0-9]*" inputMode="numeric" />
                                            {errors['Lease Duration (Other)'] && <div className="text-xs text-red-600 mt-1">{errors['Lease Duration (Other)']}</div>}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Type *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Private Room', 'Shared Room', 'Entire Unit'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Occupancy Type'] === opt ? 'default' : 'outline'} className={form['Occupancy Type'] === opt ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Occupancy Type', opt)}>{opt}</Button>
                                        ))}
                                    </div>
                                    {errors['Occupancy Type'] && <div className="text-xs text-red-600 mt-1">{errors['Occupancy Type']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your apartment type *</label>
                                    <select value={form['Your apartment type']} onChange={e => handleChange('Your apartment type', e.target.value)} className="rounded-lg h-10 w-full border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all">
                                        <option value="" disabled>Select apartment type</option>
                                        <option value="1b1b">1b1b</option>
                                        <option value="2b2b">2b2b</option>
                                        <option value="2b1b">2b1b</option>
                                        <option value="3b2b">3b2b</option>
                                    </select>
                                    {errors['Your apartment type'] && <div className="text-xs text-red-600 mt-1">{errors['Your apartment type']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Existing Occupants <span className="text-xs text-gray-400">(optional)</span></label>
                                    <Input value={form['Number of Existing Occupants']} onChange={e => handleChange('Number of Existing Occupants', e.target.value)} className="rounded-lg h-10" placeholder="e.g. 2" type="text" pattern="[0-9]*" inputMode="numeric" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Language/Culture Preference <span className="text-xs text-gray-400">(optional)</span></label>
                                    <Input value={form['Target Language/Culture Preference']} onChange={e => handleChange('Target Language/Culture Preference', e.target.value)} className="rounded-lg h-10" placeholder="e.g. Marathi, Hindi-speaking preferred" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount *</label>
                                    <input className="w-full border p-2 rounded" value={form.depositAmount || ''} onChange={e => handleChange('depositAmount', e.target.value)} placeholder="e.g. 1000" type="text" pattern="[0-9]*" inputMode="numeric" />
                                    {errors.depositAmount && <div className="text-xs text-red-600 mt-1">{errors.depositAmount}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available for Viewing *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Yes', 'No'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Available for Viewing'] === opt ? 'default' : 'outline'} className={form['Available for Viewing'] === opt ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Available for Viewing', opt)}>{opt}</Button>
                                        ))}
                                    </div>
                                    {errors['Available for Viewing'] && <div className="text-xs text-red-600 mt-1">{errors['Available for Viewing']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roommate Type *</label>
                                    <select value={form['Preferred Roommate Type']} onChange={e => handleChange('Preferred Roommate Type', e.target.value)} className="rounded-lg h-10 w-full border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all">
                                        <option value="Anyone">Anyone</option>
                                        <option value="Student">Student</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                    {errors['Preferred Roommate Type'] && <div className="text-xs text-red-600 mt-1">{errors['Preferred Roommate Type']}</div>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location & Price */}
                        {step === 2 && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                                    <Input value={form['Property Name']} onChange={e => handleChange('Property Name', e.target.value)} className="rounded-lg h-10" placeholder="e.g. The Hyve, Nexa, DPV, San Marbeya" />
                                    {errors['Property Name'] && <div className="text-xs text-red-600 mt-1">{errors['Property Name']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                    <Input value={form.Address} onChange={e => handleChange('Address', e.target.value)} className="rounded-lg h-10" placeholder="Line 1" />
                                    {errors.Address && <div className="text-xs text-red-600 mt-1">{errors.Address}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <Input value={form.City} onChange={e => handleChange('City', e.target.value)} className="rounded-lg h-10" placeholder="City" />
                                    {errors.City && <div className="text-xs text-red-600 mt-1">{errors.City}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                                    <Input value={form['Zip Code']} onChange={e => handleChange('Zip Code', e.target.value)} className="rounded-lg h-10" placeholder="Zip Code" />
                                    {errors['Zip Code'] && <div className="text-xs text-red-600 mt-1">{errors['Zip Code']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link *</label>
                                    <Input value={form['Google Maps Link']} onChange={e => handleChange('Google Maps Link', e.target.value)} className="rounded-lg h-10" placeholder="Paste Google Maps link here" />
                                    {errors['Google Maps Link'] && <div className="text-xs text-red-600 mt-1">{errors['Google Maps Link']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proximity Landmarks *</label>
                                    <Textarea
                                        value={form['Proximity Landmarks']}
                                        onChange={e => handleChange('Proximity Landmarks', e.target.value)}
                                        className="rounded-lg w-full border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all min-h-[60px]"
                                        placeholder="E.g. Near university, bus stop, grocery store, etc."
                                    />
                                    {errors['Proximity Landmarks'] && <div className="text-xs text-red-600 mt-1">{errors['Proximity Landmarks']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent ($) *</label>
                                    <Input value={form['Rent per Person ($)']} onChange={e => handleChange('Rent per Person ($)', e.target.value)} className="rounded-lg h-10" placeholder="e.g. 900" type="text" pattern="[0-9]*" inputMode="numeric" />
                                    {errors['Rent per Person ($)'] && <div className="text-xs text-red-600 mt-1">{errors['Rent per Person ($)']}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Extra Utility Cost <span className="text-xs text-gray-400">(optional)</span></label>
                                    <Input value={form['Extra Utility Cost']} onChange={e => handleChange('Extra Utility Cost', e.target.value)} className="rounded-lg h-10" placeholder="e.g. $30/month approx." type="text" pattern="[0-9]*" inputMode="numeric" />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amenities & Features */}
                        {step === 3 && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Amenities</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {['In-house Washer/Dryer', 'Attached Bathroom', 'Closet', 'Furnished', 'Unfurnished'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Room Amenities'].includes(opt) ? 'default' : 'outline'} className={form['Room Amenities'].includes(opt) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Room Amenities', form['Room Amenities'].includes(opt) ? form['Room Amenities'].filter(i => i !== opt) : [...form['Room Amenities'], opt])}>{opt}</Button>
                                        ))}
                                        {form['Custom Room Amenities'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Room Amenities'].includes(opt) ? 'default' : 'outline'} className={form['Room Amenities'].includes(opt) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Room Amenities', form['Room Amenities'].includes(opt) ? form['Room Amenities'].filter(i => i !== opt) : [...form['Room Amenities'], opt])}>{opt}</Button>
                                        ))}
                                        {addingAmenity ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    value={customAmenityInput}
                                                    onChange={e => setCustomAmenityInput(e.target.value)}
                                                    className="h-9 w-32"
                                                    placeholder="Add amenity"
                                                    autoFocus
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && customAmenityInput.trim()) {
                                                            if (!form['Custom Room Amenities'].includes(customAmenityInput.trim())) {
                                                                setForm(f => ({ ...f, 'Custom Room Amenities': [...f['Custom Room Amenities'], customAmenityInput.trim()] }));
                                                                // Also add to selected amenities
                                                                setForm(f => ({ ...f, 'Room Amenities': [...f['Room Amenities'], customAmenityInput.trim()] }));
                                                            }
                                                            setCustomAmenityInput('');
                                                            setAddingAmenity(false);
                                                        } else if (e.key === 'Escape') {
                                                            setAddingAmenity(false);
                                                            setCustomAmenityInput('');
                                                        }
                                                    }}
                                                />
                                                <Button type="button" size="icon" className="h-9 w-9" onClick={() => {
                                                    if (customAmenityInput.trim() && !form['Custom Room Amenities'].includes(customAmenityInput.trim())) {
                                                        setForm(f => ({ ...f, 'Custom Room Amenities': [...f['Custom Room Amenities'], customAmenityInput.trim()] }));
                                                        setForm(f => ({ ...f, 'Room Amenities': [...f['Room Amenities'], customAmenityInput.trim()] }));
                                                    }
                                                    setCustomAmenityInput('');
                                                    setAddingAmenity(false);
                                                }}>
                                                    ✓
                                                </Button>
                                                <Button type="button" size="icon" className="h-9 w-9" onClick={() => { setAddingAmenity(false); setCustomAmenityInput(''); }}>✕</Button>
                                            </div>
                                        ) : (
                                            <Button type="button" variant="outline" className="border-red-200 text-red-600 h-9 px-3" onClick={() => setAddingAmenity(true)}>+ Add</Button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Community Amenities</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {['Pool', 'Gym', 'Lounge', 'Study Room', 'Spa', 'Hot Tub', 'Game Room', 'Gated/Security', 'Parking', 'Trash Pickup'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Community Amenities'].includes(opt) ? 'default' : 'outline'} className={form['Community Amenities'].includes(opt) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Community Amenities', form['Community Amenities'].includes(opt) ? form['Community Amenities'].filter(i => i !== opt) : [...form['Community Amenities'], opt])}>{opt}</Button>
                                        ))}
                                        {form['Custom Community Amenities'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Community Amenities'].includes(opt) ? 'default' : 'outline'} className={form['Community Amenities'].includes(opt) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Community Amenities', form['Community Amenities'].includes(opt) ? form['Community Amenities'].filter(i => i !== opt) : [...form['Community Amenities'], opt])}>{opt}</Button>
                                        ))}
                                        {addingCommunityAmenity ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    value={customCommunityAmenityInput}
                                                    onChange={e => setCustomCommunityAmenityInput(e.target.value)}
                                                    className="h-9 w-32"
                                                    placeholder="Add amenity"
                                                    autoFocus
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && customCommunityAmenityInput.trim()) {
                                                            if (!form['Custom Community Amenities'].includes(customCommunityAmenityInput.trim())) {
                                                                setForm(f => ({ ...f, 'Custom Community Amenities': [...f['Custom Community Amenities'], customCommunityAmenityInput.trim()] }));
                                                                setForm(f => ({ ...f, 'Community Amenities': [...f['Community Amenities'], customCommunityAmenityInput.trim()] }));
                                                            }
                                                            setCustomCommunityAmenityInput('');
                                                            setAddingCommunityAmenity(false);
                                                        } else if (e.key === 'Escape') {
                                                            setAddingCommunityAmenity(false);
                                                            setCustomCommunityAmenityInput('');
                                                        }
                                                    }}
                                                />
                                                <Button type="button" size="icon" className="h-9 w-9" onClick={() => {
                                                    if (customCommunityAmenityInput.trim() && !form['Custom Community Amenities'].includes(customCommunityAmenityInput.trim())) {
                                                        setForm(f => ({ ...f, 'Custom Community Amenities': [...f['Custom Community Amenities'], customCommunityAmenityInput.trim()] }));
                                                        setForm(f => ({ ...f, 'Community Amenities': [...f['Community Amenities'], customCommunityAmenityInput.trim()] }));
                                                    }
                                                    setCustomCommunityAmenityInput('');
                                                    setAddingCommunityAmenity(false);
                                                }}>
                                                    ✓
                                                </Button>
                                                <Button type="button" size="icon" className="h-9 w-9" onClick={() => { setAddingCommunityAmenity(false); setCustomCommunityAmenityInput(''); }}>✕</Button>
                                            </div>
                                        ) : (
                                            <Button type="button" variant="outline" className="border-red-200 text-red-600 h-9 px-3" onClick={() => setAddingCommunityAmenity(true)}>+ Add</Button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transit & Accessibility</label>
                                    <Input value={form.Transit} onChange={e => handleChange('Transit', e.target.value)} className="rounded-lg h-10" placeholder="e.g. Light Rail proximity, Orbit Bus stops, etc." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commute Options</label>
                                    <Input value={form.Commute} onChange={e => handleChange('Commute', e.target.value)} className="rounded-lg h-10" placeholder="e.g. vanpool, biking, etc." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance from University/Office</label>
                                    <Input value={form.Distance} onChange={e => handleChange('Distance', e.target.value)} className="rounded-lg h-10" placeholder="e.g. 2 miles, 10 min walk" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Stores</label>
                                    <Input value={form.Stores} onChange={e => handleChange('Stores', e.target.value)} className="rounded-lg h-10" placeholder="e.g. Walmart, Trader Joe's, Bharat Bazaar, etc." />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Contact & Photos */}
                        {step === 4 && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos *</label>
                                    <div
                                        ref={dropRef}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50/40 text-center cursor-pointer mb-4"
                                    >
                                        <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoInput} />
                                        <span className="text-red-600 font-semibold">Upload Photos</span>
                                        <div className="text-xs text-gray-500">Min 3 photos required</div>
                                    </div>
                                    {photoError && <div className="text-xs text-red-600 mt-1">{photoError}</div>}

                                    {/* Image Carousel */}
                                    {(form.existingImageUrls.length > 0 || form.Photos.length > 0) && (
                                        <div className="flex flex-col gap-2">
                                            {/* Main Preview */}
                                            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                                                {(() => {
                                                    const allImages = [...form.existingImageUrls, ...form.Photos.map(f => URL.createObjectURL(f))];
                                                    const currentIdx = previewIdx ?? 0;
                                                    const currentSrc = allImages[currentIdx];
                                                    return currentSrc ? (
                                                        <div className="relative w-full h-full">
                                                            <Image src={currentSrc} alt="Preview" fill className="object-contain" unoptimized />
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400">No image selected</div>
                                                    );
                                                })()}

                                                {/* Navigation Arrows */}
                                                {([...form.existingImageUrls, ...form.Photos]).length > 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const total = [...form.existingImageUrls, ...form.Photos].length;
                                                                setPreviewIdx(prev => (prev === null || prev === 0) ? total - 1 : prev - 1);
                                                            }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
                                                        >
                                                            ←
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const total = [...form.existingImageUrls, ...form.Photos].length;
                                                                setPreviewIdx(prev => (prev === null || prev === total - 1) ? 0 : (prev || 0) + 1);
                                                            }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
                                                        >
                                                            →
                                                        </button>
                                                    </>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const currentIdx = previewIdx ?? 0;
                                                        const isExisting = currentIdx < form.existingImageUrls.length;
                                                        if (isExisting) {
                                                            removePhoto(currentIdx, true);
                                                        } else {
                                                            removePhoto(currentIdx - form.existingImageUrls.length, false);
                                                        }
                                                        setPreviewIdx(0);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 z-10"
                                                    title="Remove this photo"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Thumbnails */}
                                            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                                                {form.existingImageUrls.map((url, i) => (
                                                    <div
                                                        key={`existing-${i}`}
                                                        className={`relative flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden w-16 h-16 transition-all ${((previewIdx ?? 0) === i) ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                        onClick={() => setPreviewIdx(i)}
                                                    >
                                                        <Image src={url} alt="Thumbnail" fill className="object-cover" unoptimized />
                                                    </div>
                                                ))}
                                                {form.Photos.map((file, i) => (
                                                    <div
                                                        key={`new-${i}`}
                                                        className={`relative flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden w-16 h-16 transition-all ${((previewIdx ?? 0) === (form.existingImageUrls.length + i)) ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                        onClick={() => setPreviewIdx(form.existingImageUrls.length + i)}
                                                    >
                                                        <Image src={URL.createObjectURL(file)} alt="New Thumbnail" fill className="object-cover" unoptimized />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Contact & Additional Info */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number(s) *</label>
                                    {form.Contacts.map((c, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <Input value={c} onChange={e => handleContactChange(i, e.target.value)} className="rounded-lg h-10" placeholder="e.g. (555) 123-4567" />
                                            {form.Contacts.length > 1 && (
                                                <Button type="button" variant="outline" className="border-red-200 text-red-600" onClick={() => removeContactField(i)}>-</Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="border-red-200 text-red-600 mb-4" onClick={addContactField}>+ Add Number</Button>
                                    {errors.Contacts && <div className="text-xs text-red-600 mt-1">{errors.Contacts}</div>}

                                    {/* Owner Details (Visible in Approve Mode) */}
                                    {mode === 'approve' && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <h4 className="font-semibold text-blue-900 mb-3">Owner Details (Required for User Creation)</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-800 mb-1">Owner Name</label>
                                                    <Input
                                                        value={form.name}
                                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                        className="bg-white"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-800 mb-1">Owner Email</label>
                                                    <Input
                                                        value={form.email}
                                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                        className="bg-white"
                                                        placeholder="john@example.com"
                                                    />
                                                    <p className="text-xs text-blue-600 mt-1">This email will be used to create the user account and link the listing.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="hide-number"
                                            checked={form['Hide number']}
                                            onChange={e => handleChange('Hide number', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor="hide-number" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Hide number (chat-only)
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Call', 'Text', 'WhatsApp', 'Platform Chat'].map(opt => (
                                            <Button key={opt} type="button" variant={form['Preferred Contact Method'] === opt ? 'default' : 'outline'} className={form['Preferred Contact Method'] === opt ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'} onClick={() => handleChange('Preferred Contact Method', opt)}>{opt}</Button>
                                        ))}
                                    </div>
                                    {errors['Preferred Contact Method'] && <div className="text-xs text-red-600 mt-1">{errors['Preferred Contact Method']}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Optional Description Box</label>
                                    <Textarea value={form.Description} onChange={e => handleChange('Description', e.target.value)} className="rounded-lg" placeholder="Freeform description like 'Luxurious and peaceful stay'" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Personality Match/Expectations/Notes</label>
                                    <Textarea value={form.Personality} onChange={e => handleChange('Personality', e.target.value)} className="rounded-lg" placeholder="Pest-free, quiet hours, roommate expectations, etc." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms *</label>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={form.Terms} onChange={e => handleChange('Terms', e.target.checked)} />
                                        <span className="text-sm">I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 underline">Terms & Conditions</a></span>
                                    </div>
                                    {errors.Terms && <div className="text-xs text-red-600 mt-1">{errors.Terms}</div>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-4">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
                            )}
                            {step < 4 ? (
                                <Button type="button" className="ml-auto bg-red-600 text-white" onClick={() => { if (validateStep()) setStep(s => s + 1); }}>Next</Button>
                            ) : (
                                <Button type="submit" disabled={submitting} className="ml-auto bg-green-600 text-white">
                                    {submitting ? 'Submitting...' : (mode === 'approve' ? 'Approve & Publish' : 'Submit Listing')}
                                </Button>
                            )}
                        </div>
                        {submitError && <div className="text-red-500 text-sm mt-2 text-center">{submitError}</div>}
                        {submitSuccess && <div className="text-green-600 text-sm mt-2 text-center">Success!</div>}
                    </motion.form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
