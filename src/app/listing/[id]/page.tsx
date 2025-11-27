'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Bed, Bath, Wifi, Car, Dumbbell, Shield, Home, MessageCircle, Heart, Share2, CalendarIcon, Search, ArrowLeft, Bookmark, LogOut, User, Building2, Utensils, Bus, Train, Store, Landmark, Phone, Mail, Globe, Clock, DollarSign, FileText, Zap, Map as MapIcon, Target, Users2, UserCheck, CalendarDays, Clock3, Building, HomeIcon, Car as CarIcon, Wifi as WifiIcon, Shield as ShieldIcon, Dumbbell as DumbbellIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import Map, { Marker } from 'react-map-gl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import AuthModal from '@/components/AuthModal';
import VerifiedBadge from '@/components/VerifiedBadge';



const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVhc2x5IiwiYSI6ImNtZGlhZ3Z3MDA2dzAybXByMmJzMGQ4dzUifQ.X6G6tMy9wgr_GgU58fU3mQ';

// Helper function to parse coordinates from Google Maps link
function parseLatLngFromGoogleMapsLink(link: string) {
  if (!link) {
    console.log('No maps link provided');
    return null;
  }
  
  console.log('Parsing link:', link);
  
  // Use the same pattern as search results page (which works correctly)
  const latMatch = link.match(/!3d([\d.\-]+)/);
  const lngMatch = link.match(/!4d([\d.\-]+)/);
  
  if (latMatch && lngMatch) {
    const coords = {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    };
    console.log('Found coordinates using !3d/!4d pattern:', JSON.stringify(coords));
    return coords;
  }
  
  // Fallback patterns if the above doesn't work
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Standard format
    /lat=(-?\d+\.\d+)&lng=(-?\d+\.\d+)/, // Query params format
    /place\/.*?@(-?\d+\.\d+),(-?\d+\.\d+)/, // Place format
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = link.match(pattern);
    if (match) {
      const coords = {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
      console.log(`Found coordinates using fallback pattern ${i}:`, JSON.stringify(coords));
      return coords;
    }
  }
  
  console.log('No coordinates found in link');
  return null;
}

// Helper function to convert Firebase Timestamp to readable date
const formatFirebaseDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleDateString();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  
  return String(timestamp);
};

// Helper function to safely render any field
const safeRender = (value: any): string => {
  if (!value) return 'N/A';
  
  if (typeof value === 'object') {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleDateString();
    }
    if (value.seconds) {
      return new Date(value.seconds * 1000).toLocaleDateString();
    }
    return JSON.stringify(value);
  }
  
  return String(value);
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [lookFor, setLookFor] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [authOpen, setAuthOpen] = useState(false);


  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch listing data from Firebase based on params.id
  useEffect(() => {
    const fetchListing = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
        const listingRef = doc(db, 'listings', listingId);
        const listingSnap = await getDoc(listingRef);
        
        if (listingSnap.exists()) {
          const listingData = {
            id: listingSnap.id,
            ...listingSnap.data()
          } as any;
          console.log('Fetched listing data:', listingData);
          console.log('Maps link:', listingData.mapsLink);
          console.log('Parsed coordinates:', parseLatLngFromGoogleMapsLink(listingData.mapsLink));
          setListing(listingData);
        } else {
          console.log('No listing found with ID:', listingId);
          setListing(null);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchListing();
    }
  }, [params?.id]);

  // Check if listing is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !listing) return;
      
      try {
        const savedRef = doc(db, 'savedListings', `${user.uid}_${listing.id}`);
        const savedSnap = await getDoc(savedRef);
        setIsSaved(savedSnap.exists());
      } catch (error) {
        console.error('Error checking if listing is saved:', error);
      }
    };

    checkIfSaved();
  }, [user, listing]);

  const handleContactHost = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    // Redirect to dashboard messages with listing ID to start chat with host
    router.push(`/dashboard?tab=messages&listingId=${listing.id}&hostId=${listing.userId}`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveListing = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!listing) return;

    setSaving(true);
    try {
      const savedRef = doc(db, 'savedListings', `${user.uid}_${listing.id}`);
      
      if (isSaved) {
        // Unsave the listing
        await deleteDoc(savedRef);
        setIsSaved(false);
        console.log('Listing unsaved');
      } else {
        // Save the listing
        await setDoc(savedRef, {
          userId: user.uid,
          listingId: listing.id,
          savedAt: Timestamp.now(),
          listingData: {
            id: listing.id,
            title: listing.title,
            propertyName: listing.propertyName,
            city: listing.city,
            zipCode: listing.zipCode,
            rent: listing.rent,
            imageUrls: listing.imageUrls,
            description: listing.description,
            userId: listing.userId,
            userDisplayName: listing.userDisplayName,
            ownerVerifiedUniversity: listing.ownerVerifiedUniversity || null
          }
        });
        setIsSaved(true);
        console.log('Listing saved');
      }
    } catch (error) {
      console.error('Error saving/unsaving listing:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
    if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
    if (dateRange?.from) searchParams.set('fromDate', dateRange.from.toISOString());
    if (dateRange?.to) searchParams.set('toDate', dateRange.to.toISOString());
    
    const newUrl = `/search-results?${searchParams.toString()}`;
    router.push(newUrl);
    setSearchModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Listing not found</p>
          <Button onClick={() => router.push('/search-results')} className="bg-red-600 hover:bg-red-700">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center h-24 py-2">
            {/* Logo */}
             <button 
               onClick={() => router.push('/')}
               className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
             >
               <HomeIcon className="w-8 h-8 text-red-600" />
             </button>

            {/* Search Bar - Desktop Only */}
            <div className="flex flex-1 max-w-2xl mx-8">
              <div className="bg-white/95 rounded-3xl shadow-lg p-3 flex flex-row gap-3 items-center border border-gray-100 w-full">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex-1 relative">
                  <select 
                    value={lookFor}
                    onChange={(e) => setLookFor(e.target.value)}
                    className="w-full h-8 appearance-none px-3 py-1.5 text-sm font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-8"
                  >
                    <option value="">Look for</option>
                    <option value="1b1b">1 bed 1 bath</option>
                    <option value="2b2b">2 bed 2 bath</option>
                    <option value="2b1b">2 bed 1 bath</option>
                    <option value="3b2b">3 bed 2 bath</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-56 h-8 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : 'Select dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={handleSearch}
                  className="bg-red-600 text-white rounded-full w-10 h-10 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 flex items-center justify-center transition-all"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-full p-1 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setAuthOpen(true)} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 text-sm">
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex lg:hidden w-full items-center justify-between py-2 sm:py-4 gap-2 sm:gap-4">
            {/* Back Button */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition" 
              aria-label="Back" 
              onClick={() => router.push('/search-results')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Mobile Search Button */}
            <button className="flex-1 mx-2" onClick={() => setSearchModalOpen(true)}>
              <div className="mx-auto bg-red-600 rounded-full px-4 py-1.5 flex flex-col items-center w-full max-w-[220px] shadow-2xl" style={{ boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)' }}>
                <span className="font-extrabold text-base text-white tracking-tight">Apartments nearby</span>
                <span className="text-red-100 text-sm font-medium">Look for · Any date</span>
              </div>
            </button>

            {/* Mobile User Profile */}
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center hover:bg-gray-50 rounded-full p-1 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setAuthOpen(true)} 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50 text-sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              Search
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                <MapPin className="h-4 w-4" />
              </span>
              <Input 
                placeholder="Where to?" 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <select className="w-full h-10 appearance-none px-3 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-10"
                value={lookFor}
                onChange={(e) => setLookFor(e.target.value)}
              >
                <option value="">Look for</option>
                <option value="1b1b">1b1b</option>
                <option value="2b2b">2b2b</option>
                <option value="2b1b">2b1b</option>
                <option value="3b2b">3b2b</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
            <Button className="w-full bg-red-600 text-white hover:bg-red-700" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {/* Hero Section - Image Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                {listing.imageUrls?.map((image: string, index: number) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>

            {/* Listing Info Section */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
             >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  {listing.propertyName && (
                    <div className="text-lg text-gray-600 mb-2 font-medium">{listing.propertyName}</div>
                  )}
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.city}, {listing.zipCode}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {user && user.uid !== listing.userId && (
                    <Button 
                      variant={isSaved ? "default" : "outline"} 
                      size="sm" 
                      onClick={handleSaveListing}
                      disabled={saving}
                      className={isSaved ? "bg-red-600 text-white hover:bg-red-700" : ""}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: listing.title || 'Check out this listing',
                            text: `${listing.title || 'Listing'} - ${listing.propertyName || 'Property'} in ${listing.city || 'City'}`,
                            url: window.location.href
                          });
                        } else {
                          // Fallback for browsers that don't support Web Share API
                          await navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      } catch (error) {
                        // User canceled the share or other error - do nothing
                        console.log('Share was canceled or failed:', error);
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
                 <div className="flex items-baseline">
                   <span className="text-2xl md:text-3xl font-bold text-red-600">${listing.rent}</span>
                   <span className="text-gray-600 ml-1">/month</span>
                 </div>
               </div>

              <p className="text-gray-700 leading-relaxed mb-6">{listing.description || 'No description available'}</p>
              
              {/* Property Details */}
              {(listing.numOccupants || listing.occupancyType || listing.listingType || listing.genderPref || listing.immediate || listing.distance || listing.depositAmount || listing.availableForViewing || listing.preferredRoommateType) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
                  {listing.depositAmount && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <DollarSign className="w-5 h-5 mr-3 text-purple-600" />
                      <div>
                        <span className="font-medium text-gray-900">Deposit Amount</span>
                        <div className="text-gray-600">${listing.depositAmount}</div>
                      </div>
                    </div>
                  )}
                  {listing.availableForViewing && (
                    <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                      <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                      <div>
                        <span className="font-medium text-gray-900">Available for Viewing</span>
                        <div className="text-gray-600">{listing.availableForViewing}</div>
                      </div>
                    </div>
                  )}
                  {listing.preferredRoommateType && (
                    <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                      <UserCheck className="w-5 h-5 mr-3 text-teal-600" />
                      <div>
                        <span className="font-medium text-gray-900">Preferred Roommate</span>
                        <div className="text-gray-600">{listing.preferredRoommateType}</div>
                      </div>
                    </div>
                  )}
                  {listing.numOccupants && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Max Occupants</span>
                        <div className="text-gray-600">{safeRender(listing.numOccupants)}</div>
                      </div>
                    </div>
                  )}
                  {listing.occupancyType && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Occupancy</span>
                        <div className="text-gray-600">{safeRender(listing.occupancyType)}</div>
                      </div>
                    </div>
                  )}
                  {listing.listingType && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Listing Type</span>
                        <div className="text-gray-600">{safeRender(listing.listingType)}</div>
                      </div>
                    </div>
                  )}
                  {listing.genderPref && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Users2 className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Gender Preference</span>
                        <div className="text-gray-600">{safeRender(listing.genderPref)}</div>
                      </div>
                    </div>
                  )}
                  {listing.immediate && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Zap className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Immediate Availability</span>
                        <div className="text-gray-600">{listing.immediate ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  )}
                  {listing.distance && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Target className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Distance</span>
                        <div className="text-gray-600">{safeRender(listing.distance)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lease & Move-in Details */}
              {(listing.apartmentType || listing.roomType || listing.leaseDuration || listing.moveIn || listing.moveOut) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {(listing.apartmentType || listing.roomType) && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <HomeIcon className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <span className="font-medium text-gray-900">Room Type</span>
                        <div className="text-gray-600">{listing.apartmentType || listing.roomType}</div>
                      </div>
                    </div>
                  )}
                  {listing.leaseDuration && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <CalendarDays className="w-5 h-5 mr-3 text-green-600" />
                      <div>
                        <span className="font-medium text-gray-900">Lease Duration</span>
                        <div className="text-gray-600">{safeRender(listing.leaseDuration)}</div>
                      </div>
                    </div>
                  )}
                  {listing.moveIn && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Clock3 className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <span className="font-medium text-gray-900">Move In</span>
                        <div className="text-gray-600">{formatFirebaseDate(listing.moveIn)}</div>
                      </div>
                    </div>
                  )}
                  {listing.moveOut && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                      <div>
                        <span className="font-medium text-gray-900">Move Out</span>
                        <div className="text-gray-600">{formatFirebaseDate(listing.moveOut)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Details & Amenities Section */}
            {(listing.roomAmenities?.length > 0 || listing.whatsIncluded?.length > 0 || listing.communityAmenities?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">What this place offers</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {listing.roomAmenities?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HomeIcon className="w-5 h-5 mr-2 text-red-600" />
                        Room Amenities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.roomAmenities.map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              {amenity === 'WiFi' && <WifiIcon className="w-4 h-4 text-red-600" />}
                              {amenity === 'Parking' && <CarIcon className="w-4 h-4 text-red-600" />}
                              {amenity === 'Gym' && <DumbbellIcon className="w-4 h-4 text-red-600" />}
                              {amenity === 'Security' && <ShieldIcon className="w-4 h-4 text-red-600" />}
                              {amenity === 'AC' && <span className="text-red-600 text-sm font-bold">AC</span>}
                              {amenity === 'Pool' && <span className="text-red-600 text-sm">🏊</span>}
                              {amenity === 'Furnished' && <span className="text-red-600 text-sm">🪑</span>}
                              {amenity === 'Pet Friendly' && <span className="text-red-600 text-sm">🐾</span>}
                              {!['WiFi', 'Parking', 'Gym', 'Security', 'AC', 'Pool', 'Furnished', 'Pet Friendly'].includes(amenity) && (
                                <span className="text-red-600 text-sm">✓</span>
                              )}
                            </div>
                            <span className="text-gray-700 font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.communityAmenities?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        Community Amenities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.communityAmenities.map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-sm font-bold">✓</span>
                            </div>
                            <span className="text-gray-700 font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.whatsIncluded?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Utensils className="w-5 h-5 mr-2 text-green-600" />
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.whatsIncluded.map((item: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 text-sm font-bold">✓</span>
                            </div>
                            <span className="text-gray-700 font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Additional Details Section */}
            {(listing.extraUtilityCost || listing.contacts || listing.contactMethod || listing.hideNumber || listing.languagePref || listing.personality) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Additional Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {listing.extraUtilityCost && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Utility Costs</h3>
                      </div>
                      <p className="text-gray-700">{listing.extraUtilityCost}</p>
                    </div>
                  )}





                  {listing.languagePref && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Globe className="w-5 h-5 mr-2 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Language Preference</h3>
                      </div>
                      <p className="text-gray-700">{listing.languagePref}</p>
                    </div>
                  )}

                  {listing.personality && (
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Heart className="w-5 h-5 mr-2 text-pink-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Personality</h3>
                      </div>
                      <p className="text-gray-700">{listing.personality}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Transportation & Commute Section */}
            {(listing.transit || listing.commute || listing.proximityLandmarks || listing.stores) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Transportation & Nearby</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {listing.transit && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Bus className="w-5 h-5 mr-2 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Public Transit</h3>
                      </div>
                      <p className="text-gray-700">{listing.transit}</p>
                    </div>
                  )}

                  {listing.commute && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Train className="w-5 h-5 mr-2 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Commute Information</h3>
                      </div>
                      <p className="text-gray-700">{listing.commute}</p>
                    </div>
                  )}

                  {listing.proximityLandmarks && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Landmark className="w-5 h-5 mr-2 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Nearby Landmarks</h3>
                      </div>
                      <p className="text-gray-700">{listing.proximityLandmarks}</p>
                    </div>
                  )}

                  {listing.stores && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Store className="w-5 h-5 mr-2 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Nearby Stores</h3>
                      </div>
                      <p className="text-gray-700">{listing.stores}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Map Section */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
             >
                             <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Location</h2>
               <div className="h-64 md:h-80 rounded-xl overflow-hidden">
                {(() => {
                  const mapsLink = listing.mapsLink;
                  console.log('Listing ID:', listing.id);
                  console.log('Maps Link:', mapsLink);
                  
                  const coords = parseLatLngFromGoogleMapsLink(mapsLink || '');
                  console.log('Parsed coordinates:', JSON.stringify(coords));
                  
                  // Use the parsed coordinates or fallback to Tempe
                  const longitude = coords?.lng || -111.9400;
                  const latitude = coords?.lat || 33.4255;
                  
                  console.log('Final map coordinates:', { longitude, latitude });
                  
                  return (
                    <Map
                      initialViewState={{
                        longitude: longitude,
                        latitude: latitude,
                        zoom: 14
                      }}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      attributionControl={false}
                    >
                      <Marker
                        longitude={longitude}
                        latitude={latitude}
                        anchor="bottom"
                      >
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          ${listing.rent}
                        </div>
                      </Marker>
                    </Map>
                  );
                })()}
              </div>
            </motion.div>
          </div>

                     {/* Right Column - Host Info & Booking */}
           <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              {/* Host Info */}
                             <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.5, delay: 0.1 }}
                 className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
               >
                                 <div className="flex items-center mb-4">
                   <div className="relative mr-3 md:mr-4">
                     <Avatar className="h-12 w-12 md:h-16 md:w-16">
                       <AvatarImage src={listing.userDisplayName ? `https://placehold.co/100x100/red/white?text=${listing.userDisplayName[0]}` : undefined} />
                       <AvatarFallback>{listing.userDisplayName?.[0] || 'U'}</AvatarFallback>
                     </Avatar>
                     {listing.ownerVerifiedUniversity?.isVerified && (
                       <div className="absolute -bottom-1 -right-1">
                         <VerifiedBadge university={listing.ownerVerifiedUniversity} size="sm" showTooltip={false} />
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                       {listing.userDisplayName || 'Host'}
                       <VerifiedBadge university={listing.ownerVerifiedUniversity} size="md" />
                     </h3>
                   </div>
                 </div>
                
                {user && user.uid !== listing.userId && (
                  <Button 
                    onClick={() => {
                      if (!user) {
                        setAuthOpen(true);
                      } else {
                        handleContactHost();
                      }
                    }}
                    className="w-full bg-red-600 text-white hover:bg-red-700 mb-3"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                )}
                {!user && (
                  <Button 
                    onClick={() => setAuthOpen(true)}
                    className="w-full bg-red-600 text-white hover:bg-red-700 mb-3"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Login to Contact Host
                  </Button>
                )}
                
                <Button 
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: listing.title || 'Check out this listing',
                          text: `${listing.title || 'Listing'} - ${listing.propertyName || 'Property'} in ${listing.city || 'City'}`,
                          url: window.location.href
                        });
                      } else {
                        // Fallback for browsers that don't support Web Share API
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    } catch (error) {
                      // User canceled the share or other error - do nothing
                      console.log('Share was canceled or failed:', error);
                    }
                  }}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                {/* WhatsApp Community Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => window.open('https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO', '_blank')}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Join Community
                  </Button>
                </div>
              </motion.div>

              
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      


      {/* Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-t-lg rounded-t-2xl flex justify-around items-center py-2 sm:hidden border-t border-gray-100">
        {user ? (
          <button
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
            onClick={() => router.push('/dashboard?tab=saved')}
          >
            <Bookmark className="w-6 h-6 mb-0.5" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        ) : (
          <button
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
            onClick={() => setAuthOpen(true)}
          >
            <Bookmark className="w-6 h-6 mb-0.5" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        )}
        {/* Community Button */}
        <button
          className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
          onClick={() => window.open('https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO', '_blank')}
        >
          <Users className="w-6 h-6 mb-0.5" />
          <span className="text-xs font-medium">Community</span>
        </button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center text-gray-700 hover:text-red-600 transition">
                <Avatar className="w-7 h-7 border-2 border-red-200 shadow">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-red-100 text-red-600 font-bold">
                    {user.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium mt-0.5">Profile</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-48 mb-2">
              <DropdownMenuItem onClick={() => router.push('/dashboard')} className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button 
            onClick={() => setAuthOpen(true)}
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
          >
            <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">?</span>
            <span className="text-xs font-medium mt-0.5">Profile</span>
          </button>
        )}
      </div>
    </div>
  );
} 