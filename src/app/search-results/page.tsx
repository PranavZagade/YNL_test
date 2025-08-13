'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Search, MapPin, Filter, ArrowLeft, Bookmark, HomeIcon, User, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Map, { Marker } from 'react-map-gl';
import AuthModal from '@/components/AuthModal';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const mockListings = [
  {
    id: 1,
    images: [
      'https://placehold.co/400x300/FFB6C1/000?text=1',
      'https://placehold.co/400x300/87CEFA/000?text=2',
    ],
    title: 'Hotel in Scottsdale',
    location: 'Scottsdale, AZ',
    price: 415,
    rating: 4.89,
    reviews: 9,
    description: 'Mountain View Stay | Villa. Pool',
    tags: ['2 beds', 'Aug 1–6'],
    featured: true,
    googleMapsLink: 'https://www.google.com/maps/place/Estates+on+Frankford/@32.9985704,-96.772376,17z/data=!4m6!3m5!1s0x864c223d0dcfa69b:0x9d8a429bfbc9f1cd!8m2!3d32.9985704!4d-96.7698011!16s%2Fg%2F1pp2t_xck?entry=ttu',
  },
  {
    id: 2,
    images: [
      'https://placehold.co/400x300/FFD700/000?text=1',
      'https://placehold.co/400x300/20B2AA/000?text=2',
    ],
    title: 'Home in Mesa',
    location: 'Mesa, AZ',
    price: 862,
    rating: 5.0,
    reviews: 37,
    description: 'Serene Mountain Retreat Casita',
    tags: ['2 beds', 'Aug 1–6'],
    featured: false,
  },
  {
    id: 3,
    images: [
      'https://placehold.co/400x300/90EE90/000?text=1',
      'https://placehold.co/400x300/FFB347/000?text=2',
    ],
    title: 'Studio in Tempe',
    location: 'Tempe, AZ',
    price: 650,
    rating: 4.7,
    reviews: 21,
    description: 'Cozy studio near campus',
    tags: ['Studio', 'Aug 10–15'],
    featured: true,
  },
  {
    id: 4,
    images: [
      'https://placehold.co/400x300/6495ED/000?text=1',
      'https://placehold.co/400x300/FF69B4/000?text=2',
    ],
    title: 'Shared Room in Phoenix',
    location: 'Phoenix, AZ',
    price: 320,
    rating: 4.5,
    reviews: 12,
    description: 'Affordable shared room',
    tags: ['Shared', 'Aug 5–12'],
    featured: false,
  },
  {
    id: 5,
    images: [
      'https://placehold.co/400x300/FFA07A/000?text=1',
      'https://placehold.co/400x300/20B2AA/000?text=2',
    ],
    title: 'Private Room in Chandler',
    location: 'Chandler, AZ',
    price: 480,
    rating: 4.8,
    reviews: 18,
    description: 'Private room with amenities',
    tags: ['Private', 'Aug 3–8'],
    featured: false,
  },
  {
    id: 6,
    images: [
      'https://placehold.co/400x300/8A2BE2/000?text=1',
      'https://placehold.co/400x300/FFD700/000?text=2',
    ],
    title: 'Furnished Studio in Gilbert',
    location: 'Gilbert, AZ',
    price: 700,
    rating: 4.9,
    reviews: 25,
    description: 'Modern furnished studio',
    tags: ['Furnished', 'Aug 15–20'],
    featured: true,
  },
];

// Helper to parse lat/lng from Google Maps link
function parseLatLngFromGoogleMapsLink(link: string) {
  const latMatch = link.match(/!3d([\d.\-]+)/);
  const lngMatch = link.match(/!4d([\d.\-]+)/);
  if (latMatch && lngMatch) {
    return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
  }
  return null;
}

function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [sort, setSort] = useState('price');
  const { user, loading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([400, 1200]);
  const [roomType, setRoomType] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>();
  const [amenities, setAmenities] = useState({
    washerDryer: false,
    gym: false,
    parking: false,
    pool: false,
    security: false,
    furnished: false,
    pet: false,
    internet: false,
    utilities: false,
  });
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('city') || '');
  const [lookFor, setLookFor] = useState(searchParams?.get('lookFor') || '');
  const [fromDate, setFromDate] = useState(searchParams?.get('fromDate') ? new Date(searchParams.get('fromDate')!) : undefined);
  const [toDate, setToDate] = useState(searchParams?.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined);
  
  // Update fromDate and toDate when dateRange changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFromDate(range?.from);
    setToDate(range?.to);
  };
  
  // Initialize dateRange from URL parameters
  useEffect(() => {
    if (fromDate && toDate) {
      setDateRange({ from: fromDate, to: toDate });
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const minPrice = urlParams.get('minPrice') ? parseInt(urlParams.get('minPrice')!) : 50;
    const maxPrice = urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPrice')!) : 10000;
    setPriceRange([minPrice, maxPrice]);
  }, [typeof window !== 'undefined' ? window.location.search : '']);

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const startY = useRef(0);
  const startHeight = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleListingClick = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const handleMarkerClick = (listingId: string) => {
    setSelectedListingId(listingId);
    // Scroll to the listing card
    const listingElement = document.getElementById(`listing-${listingId}`);
    if (listingElement) {
      listingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleListingCardClick = (listingId: string) => {
    setSelectedListingId(listingId);
  };

  // Generate search summary
  const generateSearchSummary = () => {
    const filters = [];
    if (searchQuery && searchQuery.trim()) filters.push(`City: ${searchQuery.trim()}`);
    if (lookFor && lookFor.trim()) filters.push(`Type: ${lookFor.trim()}`);
    if (fromDate && toDate) {
      filters.push(`Dates: ${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`);
    } else if (fromDate) {
      filters.push(`From: ${format(fromDate, 'MMM d, yyyy')}`);
    }
    return filters.length > 0 ? filters.join(' • ') : 'All listings';
  };

  // Fetch listings from Firebase based on search parameters
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        
        // Start with a simple query to get all listings
        let q = query(listingsRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        let fetchedListings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        // Parse filter params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const minPrice = urlParams.get('minPrice') ? parseInt(urlParams.get('minPrice')!) : undefined;
        const maxPrice = urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPrice')!) : undefined;
        const filterRoomType = urlParams.get('roomType') || '';
        const filterAmenities = urlParams.get('amenities') ? urlParams.get('amenities')!.split(',') : [];
        const filterFromDateStr = urlParams.get('filterFromDate');
        const filterToDateStr = urlParams.get('filterToDate');
        const filterFromDate = filterFromDateStr ? new Date(filterFromDateStr) : undefined;
        const filterToDate = filterToDateStr ? new Date(filterToDateStr) : undefined;
        
        // Apply comprehensive filters in memory
        let filteredListings = fetchedListings;
        
        // 1. Filter by City Name (case-insensitive)
        if (searchQuery && searchQuery.trim()) {
          const cityQuery = searchQuery.toLowerCase().trim();
          filteredListings = filteredListings.filter(listing => 
            listing.city?.toLowerCase().includes(cityQuery)
          );
        }
        
        // 2. Filter by Property Type (room type)
        if (lookFor && lookFor.trim()) {
          filteredListings = filteredListings.filter(listing => {
            const listingRoomType = listing.roomType || listing.propertyType || listing.apartmentType;
            return listingRoomType && listingRoomType.toLowerCase() === lookFor.toLowerCase();
          });
        }
        // 2b. Filter by filterRoomType (from filter modal)
        if (filterRoomType && filterRoomType.trim()) {
          filteredListings = filteredListings.filter(listing => {
            const listingRoomType = listing.roomType || listing.propertyType || listing.apartmentType;
            return listingRoomType && listingRoomType.toLowerCase() === filterRoomType.toLowerCase();
          });
        }
        // 3. Filter by Date Range (full coverage - listing must be available for entire user stay period)
        if (fromDate && toDate) {
          filteredListings = filteredListings.filter(listing => {
            const listingMoveIn = listing.moveIn;
            const listingMoveOut = listing.moveOut;
            if (!listingMoveIn || !listingMoveOut) return true;
            let moveInDate, moveOutDate;
            if (listingMoveIn?.seconds) moveInDate = new Date(listingMoveIn.seconds * 1000);
            else if (listingMoveIn instanceof Date) moveInDate = listingMoveIn;
            else moveInDate = new Date(listingMoveIn);
            if (listingMoveOut?.seconds) moveOutDate = new Date(listingMoveOut.seconds * 1000);
            else if (listingMoveOut instanceof Date) moveOutDate = listingMoveOut;
            else moveOutDate = new Date(listingMoveOut);
            // Ensure listing is available for the ENTIRE user stay period
            return moveInDate <= fromDate && moveOutDate >= toDate;
          });
        }
        // 3b. Filter by filterDateRange (from filter modal - full coverage)
        if (filterFromDate && filterToDate) {
          filteredListings = filteredListings.filter(listing => {
            const listingMoveIn = listing.moveIn;
            const listingMoveOut = listing.moveOut;
            if (!listingMoveIn || !listingMoveOut) return true;
            let moveInDate, moveOutDate;
            if (listingMoveIn?.seconds) moveInDate = new Date(listingMoveIn.seconds * 1000);
            else if (listingMoveIn instanceof Date) moveInDate = listingMoveIn;
            else moveInDate = new Date(listingMoveIn);
            if (listingMoveOut?.seconds) moveOutDate = new Date(listingMoveOut.seconds * 1000);
            else if (listingMoveOut instanceof Date) moveOutDate = listingMoveOut;
            else moveOutDate = new Date(listingMoveOut);
            // Ensure listing is available for the ENTIRE user stay period
            return moveInDate <= filterFromDate && moveOutDate >= filterToDate;
          });
        }
        // 4. Filter by Price Range
        if (minPrice !== undefined || maxPrice !== undefined) {
          filteredListings = filteredListings.filter(listing => {
            const rent = Number(listing.rent);
            if (minPrice !== undefined && !isNaN(minPrice) && rent < minPrice) return false;
            if (maxPrice !== undefined && !isNaN(maxPrice) && rent > maxPrice) return false;
            return true;
          });
        }
        // 5. Filter by Amenities
        if (filterAmenities.length > 0) {
          filteredListings = filteredListings.filter(listing => {
            // Try to match all selected amenities
            // Assume listing.amenities is an array of strings or listing has boolean fields for each amenity
            const listingAmenitiesArr = Array.isArray(listing.amenities) ? listing.amenities : [];
            // Also check for boolean fields
            return filterAmenities.every(a => listingAmenitiesArr.includes(a) || listing[a]);
          });
        }
        setListings(filteredListings);
        setSearchSummary(generateSearchSummary());
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Fallback to mock data if Firebase fails
        setListings(mockListings);
        setSearchSummary('Showing sample listings');
      }
    };

    fetchListings();
  }, [searchQuery, lookFor, fromDate, toDate, typeof window !== 'undefined' ? window.location.search : '']);

  // Drag handlers for mobile bottom sheet
  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    startHeight.current = sheetRef.current?.getBoundingClientRect().height || 0;
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!sheetRef.current) return;
    const delta = startY.current - e.touches[0].clientY;
    let newHeight = startHeight.current + delta;
    const minHeight = 80;
    const maxHeight = window.innerHeight * 0.85;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    sheetRef.current.style.height = `${newHeight}px`;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!sheetRef.current) return;
    const currentHeight = sheetRef.current.getBoundingClientRect().height;
    const collapsedHeight = window.innerHeight * 0.32;
    const expandedHeight = window.innerHeight * 0.8;
    // If dragged below collapsed threshold, collapse; if above expanded threshold, expand; else snap to closest
    if (currentHeight < (collapsedHeight + expandedHeight) / 2) {
      setSheetOpen(false);
    } else {
      setSheetOpen(true);
    }
    sheetRef.current.style.height = '';
  }

  // Mapbox access token
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVhc2x5IiwiYSI6ImNtZGlhZ3Z3MDA2dzAybXByMmJzMGQ4dzUifQ.X6G6tMy9wgr_GgU58fU3mQ';
  // Center map on first property or fallback to Tempe, AZ
  const firstCoords = parseLatLngFromGoogleMapsLink(listings[0]?.mapsLink || '') || { lat: 33.4255, lng: -111.9400 };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Mobile header: pill summary bar and modal */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-center px-3 sm:px-8 py-2 sm:py-4 gap-2 sm:gap-4 shadow-sm">
        {/* Brand name for desktop */}
        <div 
          className="hidden sm:flex items-center gap-2 font-extrabold text-red-600 text-2xl tracking-tight select-none mr-6 cursor-pointer hover:text-red-700 transition-colors"
          onClick={() => router.push('/')}
        >
          <HomeIcon className="w-8 h-8" />
        </div>
        {/* Mobile: pill summary bar */}
        <div className="flex w-full items-center justify-between sm:hidden">
          <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Back" onClick={() => router.push('/') }>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="flex-1 mx-2" onClick={() => setSearchModalOpen(true)}>
            <div className="mx-auto bg-red-600 rounded-full px-4 py-1.5 flex flex-col items-center w-full max-w-[220px] shadow-2xl" style={{ boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)' }}>
              <span className="font-extrabold text-base text-white tracking-tight">Apartments nearby</span>
              <span className="text-red-100 text-sm font-medium">Look for · Any date</span>
            </div>
          </button>
          <button className="p-3 rounded-full bg-white text-red-600 hover:bg-gray-100 transition" aria-label="Filters" onClick={() => setFilterModalOpen(true)}>
            <Filter className="w-6 h-6 text-red-600" />
          </button>
        </div>
        {/* Desktop: full search bar and profile */}
        <div className="hidden sm:flex flex-1 w-full sm:w-auto justify-center">
          <div className="bg-white/95 rounded-3xl shadow-lg p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center border border-gray-100 w-full max-w-full sm:max-w-2xl">
            <div className="flex flex-col w-full gap-3 md:flex-row md:gap-4 md:items-center">
              {/* City or University input */}
              <div className="relative w-full md:w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Trigger search by updating URL parameters
                      const searchParams = new URLSearchParams();
                      if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
                      if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
                      if (fromDate) searchParams.set('fromDate', fromDate.toISOString());
                      if (toDate) searchParams.set('toDate', toDate.toISOString());
                      
                      // Update URL without page reload
                      const newUrl = `/search-results?${searchParams.toString()}`;
                      router.push(newUrl);
                    }
                  }}
                  className="h-10 pl-10 pr-4 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all w-full" 
                  placeholder="City or University" 
                />
              </div>
              {/* Dropdown for 'Look for' */}
              <div className="relative w-full md:w-36">
                <select 
                  value={lookFor}
                  onChange={(e) => setLookFor(e.target.value)}
                  className="w-full h-10 appearance-none px-4 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-10"
                >
                  <option value="">Look for...</option>
                  <option value="1b1b">1b1b</option>
                  <option value="2b2b">2b2b</option>
                  <option value="2b1b">2b1b</option>
                  <option value="3b2b">3b2b</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
              {/* Date Range Picker (single) */}
              <div className="w-full md:w-auto min-w-0 md:mr-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-56 h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50 min-w-0">
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
              <div className="flex gap-4 w-full md:w-auto mt-2 md:mt-0 items-center">
                <Button 
                  onClick={() => {
                    // Trigger search by updating URL parameters
                    const searchParams = new URLSearchParams();
                    if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
                    if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
                    if (fromDate) searchParams.set('fromDate', fromDate.toISOString());
                    if (toDate) searchParams.set('toDate', toDate.toISOString());
                    
                    // Update URL without page reload
                    const newUrl = `/search-results?${searchParams.toString()}`;
                    router.push(newUrl);
                  }}
                  className="bg-red-600 text-white rounded-full w-12 h-12 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 flex items-center justify-center transition-all"
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button type="button" onClick={() => setFilterModalOpen(true)} className="bg-white border border-gray-200 text-red-600 font-medium w-12 h-12 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-300 flex items-center justify-center transition-all">
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 ml-0 sm:ml-auto mt-2 sm:mt-0">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-9 h-9 border-2 border-red-200 shadow">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-red-100 text-red-600 font-bold">
                    {user.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => await signOut(auth)} className="flex items-center space-x-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow hover:bg-red-700 transition font-semibold" onClick={() => setAuthOpen(true)}>Login</button>
          )}
        </div>
        

        
        {/* Mobile: search modal */}
        <HeadlessDialog open={searchModalOpen} onClose={() => setSearchModalOpen(false)} className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" onClick={() => setSearchModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto p-6 z-50 flex flex-col gap-4">
            <div className="flex items-center mb-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition" onClick={() => setSearchModalOpen(false)} aria-label="Back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="flex-1 text-center font-semibold text-lg">Search</span>
            </div>
            {/* Full search form (reuse desktop code) */}
            <div className="flex flex-col w-full gap-3">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Trigger search by updating URL parameters
                      const searchParams = new URLSearchParams();
                      if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
                      if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
                      if (fromDate) searchParams.set('fromDate', fromDate.toISOString());
                      if (toDate) searchParams.set('toDate', toDate.toISOString());
                      
                      // Update URL and close modal
                      const newUrl = `/search-results?${searchParams.toString()}`;
                      router.push(newUrl);
                      setSearchModalOpen(false);
                    }
                  }}
                  className="h-10 pl-10 pr-4 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all w-full" 
                  placeholder="City or University" 
                />
              </div>
              <div className="relative w-full">
                <select 
                  value={lookFor}
                  onChange={(e) => setLookFor(e.target.value)}
                  className="w-full h-10 appearance-none px-4 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-10"
                >
                  <option value="">Look for...</option>
                  <option value="1b1b">1b1b</option>
                  <option value="2b2b">2b2b</option>
                  <option value="2b1b">2b1b</option>
                  <option value="3b2b">3b2b</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
              <div className="w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50 min-w-0">
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
              <Button 
                onClick={() => {
                  // Trigger search by updating URL parameters
                  const searchParams = new URLSearchParams();
                  if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
                  if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
                  if (fromDate) searchParams.set('fromDate', fromDate.toISOString());
                  if (toDate) searchParams.set('toDate', toDate.toISOString());
                  
                  // Update URL and close modal
                  const newUrl = `/search-results?${searchParams.toString()}`;
                  router.push(newUrl);
                  setSearchModalOpen(false);
                }}
                className="bg-red-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 flex items-center justify-center transition-all w-full mt-2"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </HeadlessDialog>
      </header>
      {/* Filter Modal (mobile) */}
      <Transition appear show={filterModalOpen} as={Fragment}>
        <HeadlessDialog as="div" className="relative z-50" onClose={() => setFilterModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <HeadlessDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col gap-4">
                  <div className="flex items-center mb-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition" onClick={() => setFilterModalOpen(false)} aria-label="Close">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="flex-1 text-center font-semibold text-lg">Filters</span>
                  </div>
                  {(priceRange[0] !== 50 || priceRange[1] !== 2000 || roomType !== '' || Object.values(amenities).some(Boolean) || filterDateRange?.from || filterDateRange?.to) && (
                    <button
                      type="button"
                      className="mb-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium transition"
                      onClick={() => {
                        setPriceRange([50, 2000]);
                        setRoomType('');
                        setAmenities({
                          washerDryer: false,
                          gym: false,
                          parking: false,
                          pool: false,
                          security: false,
                          furnished: false,
                          pet: false,
                          internet: false,
                          utilities: false,
                        });
                        setFilterDateRange(undefined);
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                  {/* Price Range Slider - Airbnb style */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="space-y-4">
                        {/* Min Price */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Minimum Price</span>
                            <span className="text-sm font-medium">${priceRange[0]}</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={10000}
                            step={50}
                            value={priceRange[0]}
                            onChange={e => {
                              let val = Math.max(50, Math.min(+e.target.value, priceRange[1] - 50));
                              setPriceRange([val, priceRange[1]]);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        {/* Max Price */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Maximum Price</span>
                            <span className="text-sm font-medium">${priceRange[1]}</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={10000}
                            step={50}
                            value={priceRange[1]}
                            onChange={e => {
                              let val = Math.max(priceRange[0] + 50, Math.min(+e.target.value, 10000));
                              setPriceRange([priceRange[0], val]);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Room Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <div className="flex gap-2">
                      {['Private', 'Shared', 'Entire Apartment'].map(type => (
                        <button key={type} type="button" className={`px-3 py-1 rounded-full border text-sm font-medium ${roomType === type ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200'}`} onClick={() => setRoomType(type)}>{type}</button>
                      ))}
                    </div>
                  </div>
                  {/* Move-in Date Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                          <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                          {filterDateRange?.from && filterDateRange?.to
                            ? `${format(filterDateRange.from, 'MMM d, yyyy')} - ${format(filterDateRange.to, 'MMM d, yyyy')}`
                            : 'Select date range'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                        <Calendar mode="range" selected={filterDateRange} onSelect={setFilterDateRange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Amenities Accordion */}
                  <div>
                    <button type="button" className="w-full flex justify-between items-center py-2 px-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-medium" onClick={() => setAmenitiesOpen(o => !o)}>
                      Amenities
                      <span>{amenitiesOpen ? '−' : '+'}</span>
                    </button>
                    {amenitiesOpen && (
                      <div className="mt-2 flex flex-col gap-2 px-2">
                        {[
                          { key: 'washerDryer', label: 'In-unit Washer/Dryer' },
                          { key: 'gym', label: 'Gym Access' },
                          { key: 'parking', label: 'Parking' },
                          { key: 'pool', label: 'Pool' },
                          { key: 'security', label: 'Security/Gated' },
                          { key: 'furnished', label: 'Furnished Room' },
                          { key: 'pet', label: 'Pet Friendly' },
                          { key: 'internet', label: 'Internet Included' },
                          { key: 'utilities', label: 'Utilities Included' },
                        ].map(a => (
                          <label key={a.key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={amenities[a.key as keyof typeof amenities]} onChange={e => setAmenities({ ...amenities, [a.key]: e.target.checked })} className="accent-red-600" />
                            {a.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button className="bg-red-600 text-white font-semibold w-full mt-4"
                    onClick={() => {
                      const searchParams = new URLSearchParams(window.location.search);
                      // Price range
                      searchParams.set('minPrice', priceRange[0].toString());
                      searchParams.set('maxPrice', priceRange[1].toString());
                      // Room type
                      if (roomType) {
                        searchParams.set('roomType', roomType);
                      } else {
                        searchParams.delete('roomType');
                      }
                      // Amenities
                      const enabledAmenities = Object.keys(amenities).filter(key => (amenities as any)[key]);
                      if (enabledAmenities.length > 0) {
                        searchParams.set('amenities', enabledAmenities.join(','));
                      } else {
                        searchParams.delete('amenities');
                      }
                      // Filter date range
                      if (filterDateRange?.from) {
                        searchParams.set('filterFromDate', filterDateRange.from.toISOString());
                      } else {
                        searchParams.delete('filterFromDate');
                      }
                      if (filterDateRange?.to) {
                        searchParams.set('filterToDate', filterDateRange.to.toISOString());
                      } else {
                        searchParams.delete('filterToDate');
                      }
                      // Update URL and close modal
                      const newUrl = `/search-results?${searchParams.toString()}`;
                      window.location.replace(newUrl);
                      setFilterModalOpen(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </HeadlessDialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
      {/* Filters/Sort */}
      {/* Optionally, keep only the sort dropdown if needed */}
      {/* Search Summary */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">Search Results</span>
          {searchQuery && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {searchQuery}
            </span>
          )}
          {lookFor && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              {lookFor}
            </span>
          )}
          {fromDate && toDate && (
            <span className="text-gray-500">
              {format(fromDate, 'MMM d')} - {format(toDate, 'MMM d, yyyy')}
            </span>
          )}
          <span className="text-gray-400">• {listings.length} listings found</span>
        </div>
      </div>
      
      {/* Main Content: 50/50 split */}
      {/* Desktop: split view, Mobile: map bg + bottom sheet */}
      <div className="hidden md:flex flex-row md:h-[calc(100vh-120px)] h-auto">
        {/* Left: Apartment Cards (desktop) */}
        <div className="w-full md:w-1/2 max-w-2xl px-4 py-4 md:px-6 md:py-6 overflow-y-auto bg-white scrollbar-none" style={{ minWidth: 0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.length > 0 ? listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                id={`listing-${listing.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white rounded-2xl shadow-lg border p-0 flex flex-col transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-105 ${
                  selectedListingId === listing.id 
                    ? 'border-red-500 shadow-xl scale-105 ring-2 ring-red-200' 
                    : 'border-gray-100'
                }`}
                onClick={() => {
                  handleListingCardClick(listing.id);
                  router.push(`/listing/${listing.id}`);
                }}
              >
                <img src={listing.imageUrls?.[0] || 'https://placehold.co/400x300/FFB6C1/000?text=No+Image'} alt={listing.title} className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="font-semibold text-lg mb-1 text-gray-900">{listing.title}</div>
                  {listing.propertyName && (
                    <div className="text-sm text-gray-600 mb-1 font-medium">{listing.propertyName}</div>
                  )}
                  <div className="text-red-600 font-semibold mb-1">${listing.rent}/month</div>
                  <div className="text-xs text-gray-500 mb-2">{listing.city}</div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {listing.tags && listing.tags.map((tag: string, j: number) => (
                      <span key={j} className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">No listings found</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
              </div>
            )}
          </div>
        </div>
        {/* Right: Map View in a rounded, boxed layout (desktop) */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-4 md:px-6 md:py-6 bg-white">
          <div className="w-full h-full flex-1 bg-white rounded-2xl shadow flex items-center justify-center overflow-hidden">
            <Map
              initialViewState={{
                longitude: firstCoords.lng,
                latitude: firstCoords.lat,
                zoom: 13,
              }}
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
              attributionControl={false}
            >
              {listings.map((listing) => {
                // Try to get coordinates from mapsLink field
                const coords = parseLatLngFromGoogleMapsLink(listing.mapsLink || '');
                if (!coords) return null;
                return (
                  <Marker 
                    key={listing.id} 
                    longitude={coords.lng} 
                    latitude={coords.lat} 
                    anchor="bottom"
                    onClick={() => handleMarkerClick(listing.id)}
                  >
                    <div className={`marker-label cursor-pointer transition-all duration-200 ${
                      selectedListingId === listing.id ? 'bg-red-700 scale-110' : ''
                    }`}>
                      ${listing.rent}
                    </div>
                  </Marker>
                );
              })}
            </Map>
          </div>
        </div>
      </div>
      {/* Mobile: map bg, floating bottom sheet for cards */}
      <div className="md:hidden relative min-h-screen w-full">
        {/* Mobile Search Summary */}
        <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {searchQuery && (
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4" />
                  {searchQuery}
                </span>
              )}
              {lookFor && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  {lookFor}
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{listings.length} listings</span>
          </div>
        </div>
        {/* Map as background */}
        <div className="fixed inset-0 z-0">
          <Map
            initialViewState={{
              longitude: firstCoords.lng,
              latitude: firstCoords.lat,
              zoom: 13,
            }}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            style={{ width: '100vw', height: '100vh' }}
            attributionControl={false}
          >
            {listings.map((listing) => {
              // Try to get coordinates from mapsLink field
              const coords = parseLatLngFromGoogleMapsLink(listing.mapsLink || '');
              if (!coords) return null;
              return (
                <Marker 
                  key={listing.id} 
                  longitude={coords.lng} 
                  latitude={coords.lat} 
                  anchor="bottom"
                  onClick={() => handleMarkerClick(listing.id)}
                >
                  <div className={`marker-label cursor-pointer transition-all duration-200 ${
                    selectedListingId === listing.id ? 'bg-red-700 scale-110' : ''
                  }`}>
                    ${listing.rent}
                  </div>
                </Marker>
              );
            })}
          </Map>
        </div>
        {/* Bottom sheet for cards */}
        <div
          ref={sheetRef}
          className={`fixed left-0 right-0 z-10 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 flex flex-col ${sheetOpen ? 'bottom-0 h-[80vh] min-h-[120px] max-h-[90vh]' : 'bottom-0 h-[32vh] min-h-[120px] max-h-[90vh]'} overflow-hidden`}
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="flex justify-center items-center py-2 cursor-pointer" onClick={() => setSheetOpen(o => !o)}>
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>
          {/* Cards scrollable area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 scrollbar-none">
            <div className="grid grid-cols-1 gap-3">
              {listings.length > 0 ? listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  id={`mobile-listing-${listing.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-white rounded-2xl shadow-lg border p-0 flex flex-col transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-105 ${
                    selectedListingId === listing.id 
                      ? 'border-red-500 shadow-xl scale-105 ring-2 ring-red-200' 
                      : 'border-gray-100'
                  }`}
                  onClick={() => {
                    handleListingCardClick(listing.id);
                    router.push(`/listing/${listing.id}`);
                  }}
                >
                  <img src={listing.imageUrls?.[0] || 'https://placehold.co/400x300/FFB6C1/000?text=No+Image'} alt={listing.title} className="w-full h-40 object-cover rounded-t-2xl" />
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="font-semibold text-base mb-1 text-gray-900">{listing.title}</div>
                    {listing.propertyName && (
                      <div className="text-sm text-gray-600 mb-1 font-medium">{listing.propertyName}</div>
                    )}
                    <div className="text-red-600 font-semibold mb-1">${listing.rent}/month</div>
                    <div className="text-xs text-gray-500 mb-2">{listing.city}</div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {listing.tags && listing.tags.map((tag: string, j: number) => (
                        <span key={j} className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-base">No listings found</div>
                  <div className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Hide scrollbar utility for browsers */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #F43F5E;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          cursor: pointer;
          margin-top: -8px;
          transition: border 0.2s;
        }
        input[type='range']:focus::-webkit-slider-thumb {
          border: 2.5px solid #F43F5E;
        }
        input[type='range']::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #F43F5E;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          cursor: pointer;
        }
        input[type='range']:focus::-moz-range-thumb {
          border: 2.5px solid #F43F5E;
        }
        input[type='range']::-ms-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #F43F5E;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          cursor: pointer;
        }
        input[type='range'] {
          outline: none;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          background: transparent;
        }
        input[type='range']::-ms-fill-lower {
          background: transparent;
        }
        input[type='range']::-ms-fill-upper {
          background: transparent;
        }
        .marker-label {
          background: #F43F5E;
          border-radius: 9999px;
          padding: 4px 12px;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          font-weight: bold;
        }
      `}</style>
      {/* Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-t-lg rounded-t-2xl flex justify-around items-center py-2 sm:hidden border-t border-gray-100">
        {user ? (
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
          >
            <Bookmark className="w-6 h-6 mb-0.5" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        ) : (
          <button 
            onClick={() => setAuthOpen(true)}
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
          >
            <Bookmark className="w-6 h-6 mb-0.5" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        )}
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
              <DropdownMenuItem onClick={async () => await signOut(auth)} className="flex items-center space-x-2 text-red-600">
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
      {/* Auth Modal - rendered at the end to ensure it appears above everything */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

// Wrapper component that uses useSearchParams
function SearchResultsWithParams() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}

// Export the wrapped component
export default SearchResultsWithParams; 