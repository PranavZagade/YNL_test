"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Bookmark, MessageCircle, User, Menu, PlusCircle, X, Pencil, Trash2, Smile, Bell, House, Users } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import ProfilePage from './ProfilePage';
import AlertsPage from './AlertsPage';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy, setDoc, getDoc, limit } from 'firebase/firestore';
import { getUserProfile } from '@/lib/user-management';
import { checkListingAlerts, startListingAlertListener, stopListingAlertListener } from '@/lib/listing-alerts';
import { Dialog } from '@/components/ui/dialog';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import VerifiedBadge, { VerifiedBadgeInline } from '@/components/VerifiedBadge';

const navItems = [
  { label: "Add Listing", icon: PlusCircle },
  { label: "My Listings", icon: Home },
  { label: "Saved Listings", icon: Bookmark },
  { label: "Messages", icon: MessageCircle },
  { label: "Alerts", icon: Bell },
  { label: "Profile", icon: User },
  { label: "Home", icon: House },
];

const amenityOptions = [
  'Living Room',
  'Gym / Fitness Center',
  'Swimming Pool(s)',
  'Basketball Court',
  'Tennis Court',
  'Wi-Fi',
  'Laundry',
  'Parking',
  'Kitchen Access',
  'AC / Heating',
];

function AddListingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    Photos: [] as File[],
    Contacts: [''],
    'Hide number': false,
    'Preferred Contact Method': '',
    Description: '',
    Personality: '',
    Terms: false,
    'Custom Community Amenities': [] as string[],
  });
  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
  const [submitting, setSubmitting] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  // Add local state for popover open/close
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [customIncludedInput, setCustomIncludedInput] = useState('');
  const [addingAmenity, setAddingAmenity] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [addingCommunityAmenity, setAddingCommunityAmenity] = useState(false);
  const [customCommunityAmenityInput, setCustomCommunityAmenityInput] = useState('');
  const [addingIncluded, setAddingIncluded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      if (!form['What\'s Included'] || form['What\'s Included'].length === 0) e['What\'s Included'] = 'Select at least one';
      if (!form['Proximity Landmarks']) e['Proximity Landmarks'] = 'Required';
    }
    if (step === 4) {
      if (!form.Contacts[0]) e.Contacts = 'At least one contact required';
      if (!form['Preferred Contact Method']) e['Preferred Contact Method'] = 'Required';
      if (!form.Terms) e.Terms = 'You must accept the terms';
      if (form.Photos.length < 3) e.Photos = 'At least 3 photos required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleAmenityChange(option: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      'Room Amenities': checked ? [...f['Room Amenities'], option] : f['Room Amenities'].filter((a) => a !== option),
    }));
  }

  function handleContactChange(idx: number, value: string) {
    setForm((f) => {
      const contacts = [...f.Contacts];
      contacts[idx] = value;
      return { ...f, Contacts: contacts };
    });
  }

  function addContactField() {
    setForm((f) => ({ ...f, Contacts: [...f.Contacts, ''] }));
  }

  function removeContactField(idx: number) {
    setForm((f) => ({ ...f, Contacts: f.Contacts.filter((_, i) => i !== idx) }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = e.target.files;
      setForm((f) => ({ ...f, photos: Array.from(files) }));
    }
  }

  function handleStudentVerification(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = e.target.files;
      setForm((f) => ({ ...f, studentVerification: files[0] }));
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setPhotoError(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setForm(f => {
      const newPhotos = [...f.Photos, ...files];
      if (newPhotos.length > 7) {
        setPhotoError('You can upload a maximum of 7 photos.');
        return { ...f, Photos: f.Photos };
      }
      if (newPhotos.length < 3) setPhotoError(`${3 - newPhotos.length} more photo${3 - newPhotos.length > 1 ? 's' : ''} required.`);
      return { ...f, Photos: newPhotos };
    });
  }
  function handlePhotoInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setForm(f => {
        const newPhotos = [...f.Photos, ...files];
        if (newPhotos.length > 7) {
          setPhotoError('You can upload a maximum of 7 photos.');
          return { ...f, Photos: f.Photos };
        }
        if (newPhotos.length < 3) setPhotoError(`${3 - newPhotos.length} more photo${3 - newPhotos.length > 1 ? 's' : ''} required.`);
        return { ...f, Photos: newPhotos };
      });
    }
  }
  function removePhoto(idx: number) {
    setForm(f => {
      const newPhotos = f.Photos.filter((_, i) => i !== idx);
      if (newPhotos.length < 3) setPhotoError(`${3 - newPhotos.length} more photo${3 - newPhotos.length > 1 ? 's' : ''} required.`);
      else setPhotoError(null);
      return { ...f, Photos: newPhotos };
    });
  }

  function handleAddCustomIncluded() {
    if (customIncludedInput.trim() && !form['Custom Included'].includes(customIncludedInput.trim())) {
      setForm(f => ({
        ...f,
        'Custom Included': [...f['Custom Included'], customIncludedInput.trim()]
      }));
      setCustomIncludedInput('');
    }
  }

  function handleNext() {
    if (validateStep()) setStep((s) => s + 1);
  }
  function handleBack() {
    setStep((s) => s - 1);
  }

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
    const data = await res.json();
    return data.secure_url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      // Deduplicate and merge included/amenities fields as user entered
      const whatsIncluded = Array.from(new Set([...(form["What's Included"] || []), ...(form["Custom Included"] || [])]));
      const roomAmenities = Array.from(new Set([...(form["Room Amenities"] || []), ...(form["Custom Room Amenities"] || [])]));
      const communityAmenities = Array.from(new Set([...(form["Community Amenities"] || []), ...(form["Custom Community Amenities"] || [])]));

      // Upload images to Cloudinary
      let imageUrls: string[] = [];
      if (form.Photos && form.Photos.length > 0) {
        imageUrls = await Promise.all(form.Photos.map(uploadImageToCloudinary));
      }

      // Prepare Firestore data (exclude Photos, remove furnished)
      const data = {
        title: form['Listing Title'],
        listingType: form['Listing Type'],
        genderPref: form['Gender Preference'],
        moveIn: form['Move-in / Move-out Dates']?.from ? Timestamp.fromDate(new Date(form['Move-in / Move-out Dates'].from)) : null,
        moveOut: form['Move-in / Move-out Dates']?.to ? Timestamp.fromDate(new Date(form['Move-in / Move-out Dates'].to)) : null,

        leaseDuration: form['Lease Duration'] === 'Other' ? form['Lease Duration (Other)'] : form['Lease Duration'],
        occupancyType: form['Occupancy Type'],
        numOccupants: form['Number of Existing Occupants'].toString(),
        languagePref: form['Target Language/Culture Preference'],
        apartmentType: form['Your apartment type'],
        depositAmount: form.depositAmount.toString(),
        availableForViewing: form['Available for Viewing'],
        preferredRoommateType: form['Preferred Roommate Type'],
        propertyName: form['Property Name'],
        address: form.Address,
        city: form.City,
        zipCode: form['Zip Code'].toString(),
        mapsLink: form['Google Maps Link'],
        proximityLandmarks: form['Proximity Landmarks'],
        rent: form['Rent per Person ($)'].toString(),
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
        imageUrls,
        createdAt: Timestamp.now(),
        userId: user?.uid,
        userDisplayName: user?.displayName,
        ownerVerifiedUniversity: userProfile?.verifiedUniversity || null,
      };
      const docRef = await addDoc(collection(db, 'listings'), data);
      setSubmitSuccess(true);
      
      // Real-time listener will automatically check alerts for new listings
      console.log('✅ Listing created successfully. Real-time alert checking is active.');
      
      // Now proceed with form reset and page refresh
      setTimeout(() => {
        setSubmitting(false);
        setSubmitSuccess(false);
        setForm({
          // Step 1
          'Listing Title': '',
          'Listing Type': '',
          'Gender Preference': '',
          'Move-in / Move-out Dates': { from: undefined, to: undefined },
  
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
          "What's Included": [],
          'Custom Included': [],
          'Extra Utility Cost': '',
          // Step 3
          'Room Amenities': [],
          'Custom Room Amenities': [],
          'Community Amenities': [],
          Furnished: '',
          'Custom Community Amenities': [],
          Transit: '',
          Commute: '',
          Distance: '',
          Stores: '',
          // Step 4
          Photos: [],
          Contacts: [''],
          'Hide number': false,
          'Preferred Contact Method': '',
          Description: '',
          Personality: '',
          Terms: false,
        });
        onClose();
        // Refresh the page after successful submission
        window.location.reload();
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      setSubmitError('Failed to add listing. Please try again.');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form
            onSubmit={handleSubmit}
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
            <h2 className="text-2xl font-extrabold text-red-600 text-center mb-2">Add New Listing</h2>
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
                  {form['Google Maps Link'] && (
                    <iframe src={form['Google Maps Link']} className="w-full h-64 mt-2 rounded-lg border" loading="lazy" allowFullScreen />
                  )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's Included *</label>
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    {['WiFi', 'Utilities', 'Furnished', 'Laundry', 'Parking', 'Gym', 'Pool'].map(item => (
                      <Button
                        key={item}
                        type="button"
                        variant={form['What\'s Included'].includes(item) ? 'default' : 'outline'}
                        className={form['What\'s Included'].includes(item) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'}
                        onClick={() => handleChange('What\'s Included', form['What\'s Included'].includes(item) ? form['What\'s Included'].filter(i => i !== item) : [...form['What\'s Included'], item])}
                      >
                        {item}
                      </Button>
                    ))}
                    {form['Custom Included'].map(item => (
                      <Button
                        key={item}
                        type="button"
                        variant={form['What\'s Included'].includes(item) ? 'default' : 'outline'}
                        className={form['What\'s Included'].includes(item) ? 'bg-red-600 text-white' : 'text-red-600 border-red-200'}
                        onClick={() => handleChange('What\'s Included', form['What\'s Included'].includes(item) ? form['What\'s Included'].filter(i => i !== item) : [...form['What\'s Included'], item])}
                      >
                        {item}
                      </Button>
                    ))}
                    {addingIncluded ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={customIncludedInput}
                          onChange={e => setCustomIncludedInput(e.target.value)}
                          className="h-9 w-32"
                          placeholder="Add item"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter' && customIncludedInput.trim()) {
                              if (!form['Custom Included'].includes(customIncludedInput.trim())) {
                                setForm(f => ({ ...f, 'Custom Included': [...f['Custom Included'], customIncludedInput.trim()] }));
                              }
                              setCustomIncludedInput('');
                              setAddingIncluded(false);
                            } else if (e.key === 'Escape') {
                              setAddingIncluded(false);
                              setCustomIncludedInput('');
                            }
                          }}
                        />
                        <Button type="button" size="icon" className="h-9 w-9" onClick={() => {
                          if (customIncludedInput.trim() && !form['Custom Included'].includes(customIncludedInput.trim())) {
                            setForm(f => ({ ...f, 'Custom Included': [...f['Custom Included'], customIncludedInput.trim()] }));
                          }
                          setCustomIncludedInput('');
                          setAddingIncluded(false);
                        }}>
                          ✓
                        </Button>
                        <Button type="button" size="icon" className="h-9 w-9" onClick={() => { setAddingIncluded(false); setCustomIncludedInput(''); }}>✕</Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="border-red-200 text-red-600 h-9 px-3" onClick={() => setAddingIncluded(true)}>+ Add</Button>
                    )}
                  </div>
                  {errors['What\'s Included'] && <div className="text-xs text-red-600 mt-1">{errors['What\'s Included']}</div>}
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
            {/* Step 4: Contact & Media */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos *</label>
                  <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('ring-2', 'ring-red-400'); }}
                    onDragLeave={e => { e.preventDefault(); dropRef.current?.classList.remove('ring-2', 'ring-red-400'); }}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50/40 hover:bg-red-100 transition cursor-pointer text-center"
                    style={{ minHeight: 120 }}
                    onClick={() => dropRef.current?.querySelector('input')?.click()}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoInput}
                    />
                    <span className="text-red-600 font-semibold">Drag & drop or click to upload photos</span>
                    <span className="text-xs text-gray-500 mt-1">At least 3 photos required</span>
                  </div>
                  {photoError && <div className="text-xs text-red-600 mt-1">{photoError}</div>}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.Photos.map((file, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded shadow border" />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full shadow p-1 opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setPreviewIdx(i)} className="absolute bottom-1 left-1 bg-white/80 text-red-600 rounded shadow px-2 py-0.5 text-xs font-semibold opacity-80 hover:opacity-100 transition">Preview</button>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <Button type="button" variant="outline" className="border-red-200 text-red-600" onClick={addContactField}>+ Add Number</Button>
                  {errors.Contacts && <div className="text-xs text-red-600 mt-1">{errors.Contacts}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form['Hide number']} onCheckedChange={v => handleChange('Hide number', v)} />
                  <span className="text-sm">Hide number (chat-only)</span>
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
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox checked={form.Terms} onCheckedChange={v => handleChange('Terms', !!v)} />
                  <span className="text-sm">I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 underline">Terms & Conditions</a> *</span>
                </div>
                {errors.Terms && <div className="text-xs text-red-600 mt-1">{errors.Terms}</div>}
              </div>
            )}
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" className="border-red-200 text-red-600" onClick={handleBack}>Back</Button>
              ) : <span />}
              {step < 4 ? (
                <Button type="button" className="bg-red-600 text-white font-semibold rounded-lg h-10 px-8 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all" onClick={handleNext}>Next</Button>
              ) : (
                <Button type="submit" className="bg-red-600 text-white font-semibold rounded-lg h-10 px-8 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all" disabled={submitting}>{submitting ? 'Saving...' : 'Submit'}</Button>
              )}
            </div>
            {submitting && <div className="text-center text-gray-500 mt-2">Submitting...</div>}
            {submitError && <div className="text-center text-red-600 mt-2">{submitError}</div>}
            {submitSuccess && <div className="text-center text-green-600 mt-2">Listing added successfully!</div>}
          </motion.form>
          {/* Photo Preview Modal */}
          <AnimatePresence>
            {previewIdx !== null && form.Photos[previewIdx] && (
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative bg-white rounded-xl shadow-lg p-4 max-w-full max-h-full flex flex-col items-center">
                  <button onClick={() => setPreviewIdx(null)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold" aria-label="Close"><X className="w-6 h-6" /></button>
                  <img src={URL.createObjectURL(form.Photos[previewIdx])} alt="Preview" className="max-w-[80vw] max-h-[70vh] rounded" />
                  <div className="mt-2 text-xs text-gray-700">{form.Photos[previewIdx].name}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditListingModal({ open, onClose, listing, onUpdated, onDeleted, onRefresh }: { open: boolean, onClose: () => void, listing: any, onUpdated: (updated: any) => void, onDeleted: (id: string) => void, onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState({ ...listing });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    setForm({ ...listing });
    setStep(1);
    setImagesToDelete([]);
    setNewImages([]);
    
    // Initialize date range from listing data
    if (listing.moveIn && listing.moveOut) {
      let moveInDate, moveOutDate;
      if (listing.moveIn?.seconds) moveInDate = new Date(listing.moveIn.seconds * 1000);
      else if (listing.moveIn instanceof Date) moveInDate = listing.moveIn;
      else moveInDate = new Date(listing.moveIn);
      
      if (listing.moveOut?.seconds) moveOutDate = new Date(listing.moveOut.seconds * 1000);
      else if (listing.moveOut instanceof Date) moveOutDate = listing.moveOut;
      else moveOutDate = new Date(listing.moveOut);
      
      setDateRange({ from: moveInDate, to: moveOutDate });
    } else {
      setDateRange(undefined);
    }
  }, [listing]);

  function handleChange(field: string, value: any) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  function handleDateRangeChange(range: DateRange | undefined) {
    setDateRange(range);
    if (range?.from && range?.to) {
      // Update form with Timestamp objects for Firestore
      setForm((f: any) => ({
        ...f,
        moveIn: Timestamp.fromDate(range.from!),
        moveOut: Timestamp.fromDate(range.to!)
      }));
    } else {
      // Clear move dates if no range selected
      setForm((f: any) => ({
        ...f,
        moveIn: null,
        moveOut: null
      }));
    }
  }

  function handleNext() { setStep(s => s + 1); }
  function handleBack() { setStep(s => s - 1); }

  function handleRemoveImage(url: string) {
    setForm((f: any) => ({ ...f, imageUrls: (f.imageUrls || []).filter((img: string) => img !== url) }));
    setImagesToDelete(arr => [...arr, url]);
  }

  function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = e.target.files;
      setNewImages(arr => [...arr, ...Array.from(files)]);
    }
  }

  function getCloudinaryPublicId(url: string) {
    // Get the filename without extension from the URL
    const matches = url.match(/upload\/.*\/([a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/);
    return matches ? matches[1] : null;
  }

  async function deleteFromCloudinary(url: string) {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return;
    await fetch('/api/delete-cloudinary-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
  }

  async function handleUpdate() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      // Remove deleted images from Firestore
      const updatedImageUrls = (form.imageUrls || []).filter((url: string) => !imagesToDelete.includes(url));
      // Upload new images to Cloudinary
      let newImageUrls: string[] = [];
      if (newImages.length > 0) {
        try {
          newImageUrls = await Promise.all(newImages.map(uploadImageToCloudinary));
        } catch (uploadErr) {
          console.error('Cloudinary upload error:', uploadErr);
          setError('Image upload failed. Please try again.');
          setSubmitting(false);
          return;
        }
      }
      // Call backend to delete images from Cloudinary
      for (const url of imagesToDelete) {
        try {
          await deleteFromCloudinary(url);
        } catch (deleteErr) {
          console.error('Cloudinary delete error:', deleteErr);
        }
      }
      // Combine old and new image URLs
      const finalImageUrls = [...updatedImageUrls, ...newImageUrls];
      const docRef = doc(db, 'listings', listing.id);
      
      // Ensure numerical fields are stored as strings
      const updateData = {
        ...form,
        imageUrls: finalImageUrls,
        depositAmount: form.depositAmount?.toString() || '',
        rent: form.rent?.toString() || '',
        extraUtilityCost: form.extraUtilityCost?.toString() || '',
        numOccupants: form.numOccupants?.toString() || '',
        zipCode: form.zipCode?.toString() || '',
      };
      
      try {
        await updateDoc(docRef, updateData);
        
        // Check for matching listing alerts after update
        try {
          const updatedListing = {
            id: listing.id,
            ...updateData
          };
          await checkListingAlerts(updatedListing);
        } catch (error) {
          console.error('Error checking listing alerts after update:', error);
          // Don't fail the listing update if alert checking fails
        }
      } catch (firestoreErr) {
        console.error('Firestore update error:', firestoreErr);
        setError('Failed to update listing in Firestore.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      onUpdated({ ...form, id: listing.id, imageUrls: finalImageUrls });
      setTimeout(() => {
        setSubmitting(false);
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setSubmitting(false);
      setError('Failed to update listing.');
      console.error('Update listing error:', err);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setSubmitting(true);
    setError(null);
    try {
      console.log('Starting deletion process for listing:', listing.id);
      
      // Step 1: Delete all images from Cloudinary
      let cloudinaryDeletions = 0;
      if (Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0) {
        console.log('Deleting', listing.imageUrls.length, 'images from Cloudinary...');
        for (const url of listing.imageUrls) {
          try {
            const matches = url.match(/upload\/.*\/([a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/);
            const publicId = matches ? matches[1] : null;
            if (publicId) {
              console.log('Deleting Cloudinary image with publicId:', publicId);
              const response = await fetch('/api/delete-cloudinary-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId }),
              });
              if (response.ok) {
                cloudinaryDeletions++;
                console.log('Successfully deleted Cloudinary image:', publicId);
              } else {
                console.error('Failed to delete image from Cloudinary:', publicId, 'Status:', response.status);
              }
            }
          } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
          }
        }
        console.log('Cloudinary deletion complete. Deleted', cloudinaryDeletions, 'out of', listing.imageUrls.length, 'images');
      } else {
        console.log('No images to delete from Cloudinary');
      }
      
      // Step 2: Delete from savedListings collection (remove all saves of this listing)
      console.log('Deleting from savedListings collection...');
      const savedListingsQuery = query(collection(db, 'savedListings'), where('listingId', '==', listing.id));
      const savedListingsSnapshot = await getDocs(savedListingsQuery);
      let savedDeletions = 0;
      for (const savedDoc of savedListingsSnapshot.docs) {
        try {
          await deleteDoc(savedDoc.ref);
          savedDeletions++;
          console.log('Deleted saved listing:', savedDoc.id);
        } catch (error) {
          console.error('Error deleting saved listing:', savedDoc.id, error);
        }
      }
      console.log('Saved listings deletion complete. Deleted', savedDeletions, 'saved listings');
      
      // Step 3: Delete listing from Firestore
      console.log('Deleting listing from Firestore...');
      const docRef = doc(db, 'listings', listing.id);
      await deleteDoc(docRef);
      console.log('Successfully deleted listing from Firestore:', listing.id);
      
      onDeleted(listing.id);
      setSubmitting(false);
      onClose();
      
      // Refresh listings from Firestore
      console.log('Refreshing listings from Firestore...');
      await onRefresh();
      console.log('Listings refreshed successfully');
      
      // Show success message with details
      const message = `Listing deleted successfully!\n\nSummary:\n- Cloudinary: ${cloudinaryDeletions} images deleted\n- Saved listings: ${savedDeletions} removed\n- Firestore: Listing deleted`;
      alert(message);
      
    } catch (err) {
      console.error('Error deleting listing:', err);
      setSubmitting(false);
      setError('Failed to delete listing. Please try again.\n\nError: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // --- Add this function here so it's in scope ---
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
    const data = await res.json();
    return data.secure_url;
  }

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
        <div className="p-6 bg-white rounded-xl shadow-xl max-w-2xl w-full z-50 relative overflow-y-auto max-h-[90vh]">
          <div className="text-xl font-bold mb-4">Edit Listing</div>
          <div className="text-xs text-gray-500 text-center mb-2">Step {step} of 4</div>
          {/* No <form> tag! */}
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="w-full border p-2 rounded" value={form.title || ''} onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input className="w-full border p-2 rounded" value={form.propertyName || ''} onChange={e => handleChange('propertyName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <input className="w-full border p-2 rounded" value={form.listingType || ''} onChange={e => handleChange('listingType', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
                <input className="w-full border p-2 rounded" value={form.genderPref || ''} onChange={e => handleChange('genderPref', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Type</label>
                <input className="w-full border p-2 rounded" value={form.occupancyType || ''} onChange={e => handleChange('occupancyType', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment Type</label>
                <input className="w-full border p-2 rounded" value={form.apartmentType || ''} onChange={e => handleChange('apartmentType', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lease Duration</label>
                <input className="w-full border p-2 rounded" value={form.leaseDuration || ''} onChange={e => handleChange('leaseDuration', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Existing Occupants</label>
                <input className="w-full border p-2 rounded" value={form.numOccupants || ''} onChange={e => handleChange('numOccupants', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Language/Culture Preference</label>
                <input className="w-full border p-2 rounded" value={form.languagePref || ''} onChange={e => handleChange('languagePref', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                <input className="w-full border p-2 rounded" value={form.depositAmount || ''} onChange={e => handleChange('depositAmount', e.target.value)} placeholder="e.g. 1000" type="text" pattern="[0-9]*" inputMode="numeric" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available for Viewing</label>
                <select className="w-full border p-2 rounded" value={form.availableForViewing || 'No'} onChange={e => handleChange('availableForViewing', e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roommate Type</label>
                <select className="w-full border p-2 rounded" value={form.preferredRoommateType || 'Anyone'} onChange={e => handleChange('preferredRoommateType', e.target.value)}>
                  <option value="Anyone">Anyone</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-in / Move-out Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                      <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                        : 'Select dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                    <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input className="w-full border p-2 rounded" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} placeholder="Line 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input className="w-full border p-2 rounded" value={form.city || ''} onChange={e => handleChange('city', e.target.value)} placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input className="w-full border p-2 rounded" value={form.zipCode || ''} onChange={e => handleChange('zipCode', e.target.value)} placeholder="Zip Code" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                <input className="w-full border p-2 rounded" value={form.mapsLink || ''} onChange={e => handleChange('mapsLink', e.target.value)} placeholder="Paste Google Maps link here" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proximity Landmarks</label>
                <input className="w-full border p-2 rounded" value={form.proximityLandmarks || ''} onChange={e => handleChange('proximityLandmarks', e.target.value)} placeholder="E.g. Near university, bus stop, grocery store, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent ($)</label>
                <input className="w-full border p-2 rounded" value={form.rent || ''} onChange={e => handleChange('rent', e.target.value)} placeholder="e.g. 900" type="text" pattern="[0-9]*" inputMode="numeric" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extra Utility Cost</label>
                <input className="w-full border p-2 rounded" value={form.extraUtilityCost || ''} onChange={e => handleChange('extraUtilityCost', e.target.value)} placeholder="e.g. $30/month approx." type="text" pattern="[0-9]*" inputMode="numeric" />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What's Included</label>
                <input className="w-full border p-2 rounded" value={form.whatsIncluded ? form.whatsIncluded.join(', ') : ''} onChange={e => handleChange('whatsIncluded', e.target.value.split(',').map((s: string) => s.trim()))} placeholder="WiFi, Utilities, Furnished, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Amenities</label>
                <input className="w-full border p-2 rounded" value={form.roomAmenities ? form.roomAmenities.join(', ') : ''} onChange={e => handleChange('roomAmenities', e.target.value.split(',').map((s: string) => s.trim()))} placeholder="In-house Washer/Dryer, Closet, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Community Amenities</label>
                <input className="w-full border p-2 rounded" value={form.communityAmenities ? form.communityAmenities.join(', ') : ''} onChange={e => handleChange('communityAmenities', e.target.value.split(',').map((s: string) => s.trim()))} placeholder="Pool, Gym, Lounge, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transit & Accessibility</label>
                <input className="w-full border p-2 rounded" value={form.transit || ''} onChange={e => handleChange('transit', e.target.value)} placeholder="e.g. Light Rail proximity, Orbit Bus stops, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commute Options</label>
                <input className="w-full border p-2 rounded" value={form.commute || ''} onChange={e => handleChange('commute', e.target.value)} placeholder="e.g. vanpool, biking, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance from University/Office</label>
                <input className="w-full border p-2 rounded" value={form.distance || ''} onChange={e => handleChange('distance', e.target.value)} placeholder="e.g. 2 miles, 10 min walk" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Stores</label>
                <input className="w-full border p-2 rounded" value={form.stores || ''} onChange={e => handleChange('stores', e.target.value)} placeholder="e.g. Walmart, Trader Joe's, Bharat Bazaar, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border p-2 rounded" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Numbers</label>
                <input className="w-full border p-2 rounded" value={form.contacts ? form.contacts.join(', ') : ''} onChange={e => handleChange('contacts', e.target.value.split(',').map((s: string) => s.trim()))} placeholder="e.g. (555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                <input className="w-full border p-2 rounded" value={form.contactMethod || ''} onChange={e => handleChange('contactMethod', e.target.value)} placeholder="Call, Text, WhatsApp, Platform Chat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hide Number</label>
                <input type="checkbox" checked={form.hideNumber || false} onChange={e => handleChange('hideNumber', e.target.checked)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.imageUrls || []).map((url: string, i: number) => (
                    <div key={url} className="relative group">
                      <img src={url} alt={`Listing image ${i + 1}`} className="w-24 h-24 object-cover rounded shadow border" />
                      <button type="button" onClick={() => handleRemoveImage(url)} className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full shadow p-1 opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple accept="image/*" onChange={handleAddImages} className="mt-2" />
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-24 h-24 object-cover rounded shadow border" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            {step > 1 ? (
              <button type="button" className="border-red-200 text-red-600 btn btn-outline" onClick={handleBack}>Back</button>
            ) : <span />}
            {step < 4 ? (
              <button type="button" className="bg-red-600 text-white font-semibold rounded-lg h-10 px-8 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all" onClick={handleNext}>Next</button>
            ) : (
              <button type="button" className="bg-red-600 text-white font-semibold rounded-lg h-10 px-8 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all" onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" className="border-red-200 text-red-600 btn btn-outline" onClick={handleDelete} disabled={submitting}>Delete</button>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">Listing updated!</div>}
        </div>
      </div>
    )
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState(1); // Default to My Listings
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Add state to control dropdown in sidebar
  const [messagesDropdownOpen, setMessagesDropdownOpen] = useState(true);
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Messaging state
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [hostInfo, setHostInfo] = useState<any>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loadingSavedListings, setLoadingSavedListings] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Track online status
  useEffect(() => {
    if (!user) return;

    // Set user as online when they're active
    const userStatusRef = doc(db, 'userStatus', user.uid);
    
    // Update online status
    const updateOnlineStatus = async () => {
      try {
        await setDoc(userStatusRef, {
          uid: user.uid,
          online: true,
          lastSeen: Timestamp.now(),
          displayName: user.displayName || user.email || 'User'
        }, { merge: true });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // Set user as offline when they leave
    const handleBeforeUnload = () => {
      setDoc(userStatusRef, {
        uid: user.uid,
        online: false,
        lastSeen: Timestamp.now(),
        displayName: user.displayName || user.email || 'User'
      }, { merge: true });
    };

    // Update status immediately
    updateOnlineStatus();

    // Update status every 30 seconds while user is active
    const interval = setInterval(updateOnlineStatus, 30000);

    // Listen for online users
    const onlineUsersRef = collection(db, 'userStatus');
    const onlineQuery = query(onlineUsersRef, where('online', '==', true));
    
    const unsubscribeOnline = onSnapshot(onlineQuery, (snapshot) => {
      const onlineUserIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        onlineUserIds.add(doc.data().uid);
      });
      setOnlineUsers(onlineUserIds);
    });

    // Start real-time listing alert listener
    const alertUnsubscribe = startListingAlertListener();

    // Set up beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      unsubscribeOnline();
      if (alertUnsubscribe) {
        alertUnsubscribe();
      }
      stopListingAlertListener();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set user as offline when component unmounts
      setDoc(userStatusRef, {
        uid: user.uid,
        online: false,
        lastSeen: Timestamp.now(),
        displayName: user.displayName || user.email || 'User'
      }, { merge: true });
    };
  }, [user]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const fetchListings = async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      const q = query(collection(db, 'listings'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      setMyListings(listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  // Handle URL parameters for messaging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      const listingId = urlParams.get('listingId');
      const hostId = urlParams.get('hostId');
      
      if (tab === 'messages' && listingId && hostId) {
        setActive(3); // Switch to messages tab
        handleStartConversation(listingId, hostId);
      }
    }
  }, []);

  // Function to start a conversation with a host
  const handleStartConversation = async (listingId: string, hostId: string) => {
    if (!user) return;
    
    try {
      // Get listing details to get host info
      const listingRef = doc(db, 'listings', listingId);
      const listingSnap = await getDoc(listingRef);
      
      if (listingSnap.exists()) {
        const listingData = listingSnap.data();
        const hostName = listingData.userDisplayName || 'Host';
        
        // Create or get conversation
        const conversationId = [user.uid, hostId].sort().join('_');
        
        // Check if conversation exists
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);
        
        if (!conversationSnap.exists()) {
          // Create new conversation
          await setDoc(conversationRef, {
            participants: [user.uid, hostId],
            listingId: listingId,
            createdAt: Timestamp.now(),
            lastMessage: '',
            lastMessageTime: Timestamp.now()
          });
        }
        
        // Set the other participant's info (not necessarily the host)
        const otherParticipantId = user.uid === hostId ? hostId : hostId; // We'll get the actual other participant ID when loading the conversation
        const otherParticipantName = user.uid === hostId ? 'Guest' : hostName;
        const otherParticipantAvatar = user.uid === hostId ? 'https://placehold.co/100x100/red/white?text=G' : `https://placehold.co/100x100/red/white?text=${hostName[0]}`;
        
        setHostInfo({
          id: otherParticipantId,
          name: otherParticipantName,
          avatar: otherParticipantAvatar,
          listingId: listingId
        });
        
        setSelectedConversation(conversationId);
        loadMessages(conversationId);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

    // Get other participant information
  const getOtherParticipantInfo = async (conversationId: string) => {
    if (!user) return;
    
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (conversationSnap.exists()) {
        const conversationData = conversationSnap.data();
        const otherParticipantId = conversationData.participants.find((id: string) => id !== user.uid);
        
        if (otherParticipantId) {
          // Get the other participant's profile
          const otherParticipantProfile = await getUserProfile(otherParticipantId);
          
          if (otherParticipantProfile) {
            setOtherParticipant({
              id: otherParticipantId,
              name: otherParticipantProfile.displayName,
              email: otherParticipantProfile.email,
              avatar: `https://placehold.co/100x100/red/white?text=${otherParticipantProfile.displayName[0]}`
            });
          } else {
            // Fallback: try to get info from messages
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
            const messagesSnap = await getDocs(messagesQuery);
            
            let participantName = `User ${otherParticipantId.slice(0, 8)}`;
            let participantAvatar = `https://placehold.co/100x100/red/white?text=U`;
            
            for (const messageDoc of messagesSnap.docs) {
              const messageData = messageDoc.data();
              if (messageData.senderId === otherParticipantId && messageData.senderName) {
                participantName = messageData.senderName;
                participantAvatar = `https://placehold.co/100x100/red/white?text=${participantName[0]}`;
                break;
              }
            }
            
            setOtherParticipant({
              id: otherParticipantId,
              name: participantName,
              email: '',
              avatar: participantAvatar
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting other participant info:', error);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!user) return;
    
    setLoadingMessages(true);
    try {
      // Get other participant info first
      await getOtherParticipantInfo(conversationId);
      
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));
        setMessages(messagesData);
        setLoadingMessages(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, messageText: string) => {
    if (!user || !messageText.trim()) return;
    
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email || `User ${user.uid.slice(0, 8)}`,
        text: messageText.trim(),
        timestamp: Timestamp.now()
      });
      
      // Update conversation last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: Timestamp.now()
      });
      
      // Send email notification to the other user
      try {
        // Get conversation data to find the other participant
        const conversationDoc = await getDoc(conversationRef);
        if (conversationDoc.exists()) {
          const conversationData = conversationDoc.data();
          const otherParticipantId = conversationData.participants.find((id: string) => id !== user.uid);
          
          if (otherParticipantId) {
            // Get the other participant's info
            let otherParticipantEmail = '';
            let otherParticipantName = 'User';
            
            // Try to get user info from Firebase Auth (you might need to store user emails in Firestore)
            // For now, we'll use a placeholder - you should store user emails in your user collection
            if (conversationData.listingId) {
              const listingRef = doc(db, 'listings', conversationData.listingId);
              const listingSnap = await getDoc(listingRef);
              if (listingSnap.exists()) {
                const listingData = listingSnap.data();
                if (user.uid === listingData.userId) {
                  // Current user is the host, so the other participant is the guest
                  otherParticipantName = 'Guest';
                  // You should store guest emails in your user collection
                  // For now, we'll skip email notification if we don't have the email
                } else {
                  // Current user is the guest, so the other participant is the host
                  otherParticipantName = listingData.userDisplayName || 'Host';
                  // You should store host emails in your user collection
                  // For now, we'll skip email notification if we don't have the email
                }
              }
            }
            
            // Import the email notification function
            const { sendMessageNotificationToUser } = await import('@/lib/email-notifications');
            
            // Get the other participant's profile to get their email
            const otherParticipantProfile = await getUserProfile(otherParticipantId);
            
            // Check if the other participant is online
            const isRecipientOnline = onlineUsers.has(otherParticipantId);
            
            // Only send email if recipient is offline and has email notifications enabled
            if (otherParticipantProfile && otherParticipantProfile.emailNotifications && !isRecipientOnline) {
              // Get listing title if available
              let listingTitle = undefined;
              if (conversationData.listingId) {
                const listingRef = doc(db, 'listings', conversationData.listingId);
                const listingSnap = await getDoc(listingRef);
                if (listingSnap.exists()) {
                  listingTitle = listingSnap.data().title;
                }
              }
              
              // Send email notification only if recipient is offline
              console.log(`Sending email notification to ${otherParticipantProfile.displayName} (offline)`);
              await sendMessageNotificationToUser(
                otherParticipantProfile.email,
                otherParticipantProfile.displayName,
                user.displayName || user.email || 'User',
                listingTitle,
                messageText.trim()
              );
            } else if (isRecipientOnline) {
              console.log(`Skipping email notification - ${otherParticipantProfile?.displayName || 'User'} is online`);
            } else if (!otherParticipantProfile?.emailNotifications) {
              console.log(`Skipping email notification - ${otherParticipantProfile?.displayName || 'User'} has disabled email notifications`);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the message sending if email fails
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Load conversations for the current user
  const loadConversations = async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, where('participants', 'array-contains', user.uid));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const conversationsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const otherParticipantId = data.participants.find((id: string) => id !== user.uid);
            
            // Get the other participant's info
            let otherParticipantName = 'Unknown';
            let otherParticipantAvatar = 'https://placehold.co/100x100/red/white?text=U';
            
            let otherParticipantVerifiedUniversity = null;
            
            if (otherParticipantId) {
              // First, try to get the other participant's profile from users collection
              const otherParticipantProfile = await getUserProfile(otherParticipantId);
              
              if (otherParticipantProfile) {
                // Use the profile data
                otherParticipantName = otherParticipantProfile.displayName;
                otherParticipantAvatar = `https://placehold.co/100x100/red/white?text=${otherParticipantName[0]}`;
                otherParticipantVerifiedUniversity = otherParticipantProfile.verifiedUniversity || null;
              } else {
                // Fallback: try to get info from messages
                try {
                  const messagesRef = collection(db, 'conversations', docSnapshot.id, 'messages');
                  const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
                  const messagesSnap = await getDocs(messagesQuery);
                  
                  if (!messagesSnap.empty) {
                    // Look through recent messages to find one from the other participant
                    for (const messageDoc of messagesSnap.docs) {
                      const messageData = messageDoc.data();
                      if (messageData.senderId === otherParticipantId && messageData.senderName) {
                        otherParticipantName = messageData.senderName;
                        otherParticipantAvatar = `https://placehold.co/100x100/red/white?text=${otherParticipantName[0]}`;
                        break;
                      }
                    }
                  }
                  
                  // If we still don't have a name, use fallback
                  if (otherParticipantName === 'Unknown') {
                    otherParticipantName = `User ${otherParticipantId.slice(0, 8)}`;
                    otherParticipantAvatar = `https://placehold.co/100x100/red/white?text=U`;
                  }
                } catch (error) {
                  console.error('Error fetching participant info from messages:', error);
                  otherParticipantName = `User ${otherParticipantId.slice(0, 8)}`;
                  otherParticipantAvatar = `https://placehold.co/100x100/red/white?text=U`;
                }
              }
            }
            
            return {
              id: docSnapshot.id,
              name: otherParticipantName,
              avatar: otherParticipantAvatar,
              verifiedUniversity: otherParticipantVerifiedUniversity,
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime,
              unread: 0 // TODO: Implement unread count
            };
          })
        );
        
        setConversations(conversationsData);
        setLoadingConversations(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoadingConversations(false);
    }
  };

  // Load conversations when user changes or messages tab is active
  useEffect(() => {
    if (user && active === 3) {
      loadConversations();
    }
  }, [user, active]);

  // Load saved listings when user changes or saved listings tab is active
  useEffect(() => {
    if (user && active === 2) {
      loadSavedListings();
    }
  }, [user, active]);

  const loadSavedListings = async () => {
    if (!user) return;
    
    setLoadingSavedListings(true);
    try {
      const savedListingsRef = collection(db, 'savedListings');
      const q = query(savedListingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const savedListingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSavedListings(savedListingsData);
    } catch (error) {
      console.error('Error loading saved listings:', error);
    } finally {
      setLoadingSavedListings(false);
    }
  };

  // Refresh saved listings when they change
  useEffect(() => {
    if (user && active === 2) {
      const savedListingsRef = collection(db, 'savedListings');
      const q = query(savedListingsRef, where('userId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const savedListingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedListings(savedListingsData);
      });
      
      return unsubscribe;
    }
  }, [user, active]);

  // Open modal if Add Listing nav is clicked
  function handleNavClick(i: number) {
    if (i === 0) setAddModalOpen(true);
    else if (i === 4) setActive(4); // Alerts tab
    else if (i === 5) setActive(5); // Profile tab
    else if (i === 6) router.push('/'); // Home - redirect to landing page
    else setActive(i);
    setDrawerOpen(false);
  }

  // After: const [active, setActive] = useState(1); // Default to My Listings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'saved') {
        setActive(2); // Saved Listings tab
      }
    }
  }, []);

  // Function to delete a listing directly from the My Listings section
  const deleteListing = async (listing: any) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      // console.log('Starting deletion process for listing:', listing.id);
      
      // Step 1: Delete all images from Cloudinary
      let cloudinaryDeletions = 0;
      let cloudinaryErrors = 0;
      if (Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0) {
        // console.log('Deleting', listing.imageUrls.length, 'images from Cloudinary...');
        for (const url of listing.imageUrls) {
          try {
            const matches = url.match(/upload\/.*\/([a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/);
            const publicId = matches ? matches[1] : null;
            if (publicId) {
              // console.log('Deleting Cloudinary image with publicId:', publicId);
              try {
                const response = await fetch('/api/delete-cloudinary-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ publicId }),
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    cloudinaryDeletions++;
                    // console.log('Successfully deleted Cloudinary image:', publicId);
                  } else {
                    console.error('Cloudinary API returned error for:', publicId, result);
                    cloudinaryErrors++;
                  }
                } else {
                  console.error('Failed to delete image from Cloudinary:', publicId, 'Status:', response.status);
                  cloudinaryErrors++;
                }
              } catch (fetchError) {
                console.error('Fetch error when deleting Cloudinary image:', publicId, fetchError);
                cloudinaryErrors++;
              }
            } else {
              // console.warn('Could not extract publicId from URL:', url);
            }
          } catch (error) {
            console.error('Error processing image URL:', url, error);
            cloudinaryErrors++;
          }
        }
        // console.log('Cloudinary deletion complete. Deleted', cloudinaryDeletions, 'out of', listing.imageUrls.length, 'images. Errors:', cloudinaryErrors);
        
        // If Cloudinary deletion had errors, ask user if they want to continue
        if (cloudinaryErrors > 0) {
          const continueDeletion = window.confirm(
            `Warning: ${cloudinaryErrors} images could not be deleted from Cloudinary.\n\n` +
            `This might be due to:\n` +
            `- Missing Cloudinary configuration\n` +
            `- Network issues\n` +
            `- Invalid image URLs\n\n` +
            `The listing will still be deleted from the database, but some images may remain in Cloudinary.\n\n` +
            `Do you want to continue with the deletion?`
          );
          
          if (!continueDeletion) {
            // console.log('User cancelled deletion due to Cloudinary errors');
            return;
          }
        }
      } else {
        // console.log('No images to delete from Cloudinary');
      }
      
      // Step 2: Delete from savedListings collection (remove all saves of this listing)
      // console.log('Deleting from savedListings collection...');
      let savedDeletions = 0;
      let savedErrors = 0;
      try {
        const savedListingsQuery = query(collection(db, 'savedListings'), where('listingId', '==', listing.id));
        const savedListingsSnapshot = await getDocs(savedListingsQuery);
        for (const savedDoc of savedListingsSnapshot.docs) {
          try {
            await deleteDoc(savedDoc.ref);
            savedDeletions++;
            // console.log('Deleted saved listing:', savedDoc.id);
          } catch (error) {
            console.error('Error deleting saved listing:', savedDoc.id, error);
            savedErrors++;
          }
        }
        // console.log('Saved listings deletion complete. Deleted', savedDeletions, 'saved listings. Errors:', savedErrors);
      } catch (error) {
        console.error('Error querying saved listings:', error);
        savedErrors++;
      }
      
      // Step 3: Delete listing from Firestore
      // console.log('Deleting listing from Firestore...');
      try {
        await deleteDoc(doc(db, 'listings', listing.id));
        // console.log('Successfully deleted listing from Firestore:', listing.id);
      } catch (error) {
        console.error('Error deleting listing from Firestore:', error);
        throw new Error(`Failed to delete listing from database: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Step 4: Refresh listings from Firestore
      // console.log('Refreshing listings from Firestore...');
      try {
        await fetchListings();
        // console.log('Listings refreshed successfully');
      } catch (error) {
        console.error('Error refreshing listings:', error);
        // Don't fail the deletion if refresh fails
      }
      
      // Step 5: Show success message with detailed summary
      alert('Listing deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting listing:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'Failed to delete listing. ';
      if (error instanceof Error && error.message.includes('permission-denied')) {
        errorMessage += 'You do not have permission to delete this listing.';
      } else if (error instanceof Error && error.message.includes('not-found')) {
        errorMessage += 'Listing not found.';
      } else if (error instanceof Error && error.message.includes('unavailable')) {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else {
        errorMessage += `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 py-8 px-4 gap-2 shadow-sm">
        <div className="text-2xl font-extrabold text-red-600 mb-8 tracking-tight select-none">Dashboard</div>
        {navItems.map((item, i) => (
          <div key={item.label}>
            <Button
              variant="ghost"
              className={`justify-start gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full text-left ${active === i ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => handleNavClick(i)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          </div>
        ))}
        {/* Community link - separate div for consistent spacing */}
        <div>
          <Button
            variant="ghost"
            className="justify-start gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full text-left text-gray-700 hover:bg-gray-100"
            onClick={() => window.open('https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO', '_blank')}
          >
            <Users className="w-5 h-5" />
            Join Community
          </Button>
        </div>
      </aside>
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button size="icon" variant="outline" className="rounded-full border-red-200 shadow" onClick={() => setDrawerOpen(true)}>
          <Menu className="w-6 h-6 text-red-600" />
        </Button>
      </div>
      {/* Mobile chat back button under burger */}
      {active === 3 && selectedConversation && (
        <div className="md:hidden fixed top-16 left-4 z-30 sm:hidden">
          <Button size="icon" variant="outline" className="rounded-full border-red-200 shadow" onClick={() => setSelectedConversation(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="sr-only">Back</span>
          </Button>
        </div>
      )}
      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 py-8 px-4 gap-2 shadow-lg z-50 flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="text-2xl font-extrabold text-red-600 mb-8 tracking-tight select-none">Dashboard</div>
              {navItems.map((item, i) => (
                <div key={item.label}>
                  <Button
                    variant="ghost"
                    className={`justify-start gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full ${active === i ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => handleNavClick(i)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </div>
              ))}
              {/* Community link - separate div for consistent spacing */}
              <div>
                <Button
                  variant="ghost"
                  className="justify-start gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all w-full text-gray-700 hover:bg-gray-100"
                  onClick={() => window.open('https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO', '_blank')}
                >
                  <Users className="w-5 h-5" />
                  Join Community
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* Main content */}
      <main className={`flex-1 ${active === 3 ? 'p-0' : 'p-6 md:p-10'}`}>
        {active !== 3 && active !== 4 && active !== 5 && (
          <div className="w-full flex justify-center items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center tracking-tight">
              Welcome{user ? `, ${user.displayName || user.email}` : ''}
            </h1>
          </div>
        )}
        {/* Add Listing Button (only in My Listings) */}
        {active === 1 && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all flex items-center gap-2 px-6 py-2"
            >
              <PlusCircle className="w-5 h-5" /> Add Listing
            </Button>
          </div>
        )}
        {active === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingListings ? (
              <div className="col-span-full flex justify-center items-center py-10">
                <span className="text-gray-500">Loading listings...</span>
              </div>
            ) : myListings.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No listings found.</div>
            ) : (
              myListings.map(listing => (
                <div key={listing.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col gap-2">
                  {/* Swiper carousel for images */}
                  {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 && (
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      spaceBetween={8}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 2500, disableOnInteraction: false }}
                      className="rounded-xl mb-3"
                      style={{ width: '100%', height: 180 }}
                    >
                      {listing.imageUrls.map((url: string, i: number) => (
                        <SwiperSlide key={url}>
                          <img src={url} alt={`Listing image ${i + 1}`} className="w-full h-44 object-cover rounded-xl" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-red-600">{listing.title}</span>
                    <VerifiedBadgeInline university={listing.ownerVerifiedUniversity} size="sm" />
                  </div>
                  <div className="text-gray-700">{listing.propertyName || listing['propertyName'] || listing['Property Name']}</div>
                  {listing.depositAmount && (
                    <div className="text-sm text-gray-600">Deposit: ${listing.depositAmount}</div>
                  )}
                  {listing.rent && (
                    <div className="text-sm text-gray-600">Rent: ${listing.rent}/month</div>
                  )}
                  {listing.availableForViewing && (
                    <div className="text-sm text-gray-600">Available for Viewing: {listing.availableForViewing}</div>
                  )}
                  {listing.preferredRoommateType && (
                    <div className="text-sm text-gray-600">Preferred: {listing.preferredRoommateType}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">Added: {listing.createdAt && listing.createdAt.toDate ? listing.createdAt.toDate().toLocaleDateString() : ''}</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1" size="icon" aria-label="Edit" onClick={() => { setEditingListing(listing); setEditModalOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1" size="icon" aria-label="Delete" onClick={() => deleteListing(listing)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Edit Listing Modal (placeholder) */}
        {editModalOpen && editingListing && (
          <EditListingModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            listing={editingListing}
            onUpdated={updated => {
              setMyListings(listings => listings.map(l => l.id === updated.id ? updated : l));
            }}
            onDeleted={id => {
              setMyListings(listings => listings.filter(l => l.id !== id));
            }}
            onRefresh={fetchListings}
          />
        )}
        {active === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Saved Listings</h2>
            </div>
            
            {loadingSavedListings ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : savedListings.length === 0 ? (
              <div className="text-center py-10">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved listings yet</h3>
                <p className="text-gray-500">When you save listings, they'll appear here for easy access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedListings.map(savedListing => {
                  const listing = savedListing.listingData;
                  return (
                    <div key={savedListing.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col gap-2">
                      {/* Swiper carousel for images */}
                      {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 && (
                        <Swiper
                          modules={[Pagination, Autoplay]}
                          spaceBetween={8}
                          slidesPerView={1}
                          pagination={{ clickable: true }}
                          autoplay={{ delay: 2500, disableOnInteraction: false }}
                          className="rounded-xl mb-3"
                          style={{ width: '100%', height: 180 }}
                        >
                          {listing.imageUrls.map((url: string, i: number) => (
                            <SwiperSlide key={url}>
                              <img src={url} alt={`Listing image ${i + 1}`} className="w-full h-44 object-cover rounded-xl" />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-red-600">{listing.title}</span>
                        <VerifiedBadgeInline university={listing.ownerVerifiedUniversity} size="sm" />
                      </div>
                      <div className="text-gray-700">{listing.propertyName || listing['propertyName'] || listing['Property Name']}</div>
                      {listing.depositAmount && (
                        <div className="text-sm text-gray-600">Deposit: ${listing.depositAmount}</div>
                      )}
                      {listing.rent && (
                        <div className="text-sm text-gray-600">Rent: ${listing.rent}/month</div>
                      )}
                      {listing.availableForViewing && (
                        <div className="text-sm text-gray-600">Available for Viewing: {listing.availableForViewing}</div>
                      )}
                      {listing.preferredRoommateType && (
                        <div className="text-sm text-gray-600">Preferred: {listing.preferredRoommateType}</div>
                      )}
                      <div className="text-sm text-gray-500">{listing.city}, {listing.zipCode}</div>
                      <div className="text-lg font-bold text-red-600">${listing.rent}/month</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Saved: {savedListing.savedAt && savedListing.savedAt.toDate ? savedListing.savedAt.toDate().toLocaleDateString() : ''}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1" 
                          size="sm"
                          onClick={() => router.push(`/listing/${listing.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1" 
                          size="icon"
                          onClick={async () => {
                            if (!window.confirm('Remove this listing from saved?')) return;
                            await deleteDoc(doc(db, 'savedListings', savedListing.id));
                            setSavedListings(listings => listings.filter(l => l.id !== savedListing.id));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {active === 3 && (
          <div className="flex h-screen bg-white shadow border border-gray-100 overflow-hidden w-full">
            {/* Sidebar (desktop) or People List (mobile) */}
            <aside className="hidden sm:flex w-72 bg-gray-50 border-r border-gray-200 flex-col">
              <div className="p-4 border-b border-gray-200 font-bold text-lg text-red-600">Messages</div>
              <div className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50 border-b border-gray-100 ${selectedConversation === conv.id ? 'bg-red-50' : ''}`}
                      onClick={async () => {
                        setSelectedConversation(conv.id);
                        setOtherParticipant(null); // Clear previous participant info
                        await loadMessages(conv.id);
                      }}
                    >
                      <div className="relative">
                        <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover border" />
                        {/* Verified badge on avatar */}
                        {conv.verifiedUniversity?.isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <VerifiedBadge university={conv.verifiedUniversity} size="xs" showTooltip={false} />
                          </div>
                        )}
                        {/* Online indicator */}
                        {!conv.verifiedUniversity?.isVerified && onlineUsers.has(conv.id.split('_').find((id: string) => id !== user?.uid) || '') && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate flex items-center gap-1">
                          {conv.name}
                          <VerifiedBadgeInline university={conv.verifiedUniversity} size="xs" />
                        </div>
                        <div className="text-xs text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</div>
                      </div>
                      {conv.unread > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{conv.unread}</span>}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No conversations yet
                  </div>
                )}
              </div>
            </aside>
            {/* People List (mobile) */}
            {!selectedConversation && (
              <aside className="flex sm:hidden w-full flex-col bg-gray-50">
                {/* Centered header, no burger button here */}
                <div className="flex items-center justify-center p-4 border-b border-gray-200 font-bold text-lg text-red-600">
                  <span>Messages</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingConversations ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : conversations.length > 0 ? (
                                        conversations.map(conv => (
                      <div
                        key={conv.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50 border-b border-gray-100"
                        onClick={async () => {
                          setSelectedConversation(conv.id);
                          setOtherParticipant(null); // Clear previous participant info
                          await loadMessages(conv.id);
                        }}
                      >
                      <div className="relative">
                        <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover border" />
                        {/* Verified badge on avatar */}
                        {conv.verifiedUniversity?.isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <VerifiedBadge university={conv.verifiedUniversity} size="xs" showTooltip={false} />
                          </div>
                        )}
                        {/* Online indicator */}
                        {!conv.verifiedUniversity?.isVerified && onlineUsers.has(conv.id.split('_').find((id: string) => id !== user?.uid) || '') && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate flex items-center gap-1">
                          {conv.name}
                          <VerifiedBadgeInline university={conv.verifiedUniversity} size="xs" />
                        </div>
                        <div className="text-xs text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</div>
                      </div>
                      {conv.unread > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{conv.unread}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  )}
                </div>
              </aside>
            )}
            {/* Main Chat Window */}
            {(selectedConversation || (typeof window !== 'undefined' && window.innerWidth >= 640)) && (
              <section className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden sm:flex' : 'flex'} h-full`}>
                {/* Header */}
                <div className="flex flex-col items-center justify-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white relative">
                  {/* Back button for mobile, under burger button, not in header */}
                  <div className="relative">
                    <img 
                      src={otherParticipant?.avatar || hostInfo?.avatar || conversations.find(c => c.id === selectedConversation)?.avatar} 
                      alt={otherParticipant?.name || hostInfo?.name || conversations.find(c => c.id === selectedConversation)?.name} 
                      className="w-14 h-14 rounded-full object-cover border mx-auto" 
                    />
                    {/* Verified badge on avatar */}
                    {(conversations.find(c => c.id === selectedConversation)?.verifiedUniversity?.isVerified) && (
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <VerifiedBadge 
                          university={conversations.find(c => c.id === selectedConversation)?.verifiedUniversity} 
                          size="sm" 
                          showTooltip={false} 
                        />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-gray-900 text-lg text-center flex items-center gap-2">
                    {otherParticipant?.name || hostInfo?.name || conversations.find(c => c.id === selectedConversation)?.name || (loadingMessages ? 'Loading...' : 'Chat')}
                    <VerifiedBadge 
                      university={conversations.find(c => c.id === selectedConversation)?.verifiedUniversity} 
                      size="md" 
                    />
                  </div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 bg-gray-50 h-0 min-h-0">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-xs rounded-2xl px-4 py-2 shadow ${
                            message.senderId === user?.uid
                              ? 'self-end bg-red-600 text-white'
                              : 'self-start bg-white text-gray-900 border'
                          }`}
                        >
                          <div>{message.text}</div>
                          <div className={`text-xs mt-1 ${
                            message.senderId === user?.uid
                              ? 'text-red-100 text-right'
                              : 'text-gray-400 text-left'
                          }`}>
                            {message.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                            {message.senderId === user?.uid && ' ✓'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
                {/* Input Area */}
                <div className="relative">
                  <form 
                    className="flex items-center gap-2 px-6 py-4 border-t border-gray-200 bg-white"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedConversation && newMessage.trim()) {
                        sendMessage(selectedConversation, newMessage);
                        setShowEmojiPicker(false);
                      }
                    }}
                  >
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Input 
                      className="flex-1 h-10 rounded-full bg-gray-50 border-gray-200" 
                      placeholder="Type a message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      className="bg-red-600 text-white rounded-full px-5 h-10 font-semibold shadow hover:bg-red-700"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </form>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-6 mb-2 z-50 emoji-picker-container">
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                          setNewMessage(prev => prev + emojiObject.emoji);
                        }}
                        width={300}
                        height={400}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
        {active === 4 && (
          <AlertsPage />
        )}
        {active === 5 && (
          <ProfilePage />
        )}
      </main>
      {/* Add Listing Modal */}
      <AddListingModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
} 