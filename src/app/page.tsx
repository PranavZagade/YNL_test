'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Search, User, LogIn, PlusCircle, Menu, MapPin } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import EmailPasswordSignUp from '@/components/EmailPasswordSignUp';
import { useRouter } from 'next/navigation';
import VerifiedBadge from '@/components/VerifiedBadge';

const listings = [
  {
    img: 'https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg',
    title: 'Sunny Room near NYU',
    price: '$950/mo',
    location: 'Manhattan, NY',
    tags: ['WiFi', 'Furnished', 'AC'],
  },
  {
    img: 'https://res.cloudinary.com/demo/image/upload/v1690000001/sample.jpg',
    title: 'Cozy Studio by UCLA',
    price: '$850/mo',
    location: 'Los Angeles, CA',
    tags: ['Private Bath', 'Laundry', 'Pet Friendly'],
  },
  {
    img: 'https://res.cloudinary.com/demo/image/upload/v1690000002/sample.jpg',
    title: 'Shared Loft at UT Austin',
    price: '$600/mo',
    location: 'Austin, TX',
    tags: ['Shared', 'Utilities Incl.', 'Near Campus'],
  },
];


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<null | 'login' | 'signup'>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lookFor, setLookFor] = useState('');
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* NavBar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-200 shadow-md transition-all duration-300 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4 relative">
          <div className="flex items-center gap-2 font-extrabold text-red-600 text-2xl tracking-tight select-none">
            <HomeIcon className="w-8 h-8" /> 
            <span className="hidden md:inline">YourNextLease</span>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-base items-center">
            <button 
              onClick={() => router.push('/search-results')}
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
            >
              Find a Room
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  setAuthOpen('login');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
            >
              List Your Place
            </button>
            <a
              href="https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 hover:underline underline-offset-4 transition-colors"
            >
              Join Community
            </a>
            {!loading && user && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="hover:text-red-600 hover:underline underline-offset-4 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
              >
                Dashboard
              </button>
            )}
            {!loading && user ? (
              <div className="relative">
                <button
                  className="focus:outline-none relative"
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  aria-label="Open user menu"
                >
                  <Avatar className="w-9 h-9 border-2 border-red-200 shadow hover:shadow-md transition-all">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-red-100 text-red-600 font-bold">
                      {user.displayName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Verified badge on avatar */}
                  {userProfile?.verifiedUniversity?.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <VerifiedBadge university={userProfile.verifiedUniversity} size="xs" showTooltip={false} />
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {avatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <button
                        onClick={() => { setAvatarMenuOpen(false); router.push('/dashboard'); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={async () => { setAvatarMenuOpen(false); await signOut(); }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthOpen('login')} className="hover:text-red-600 hover:underline underline-offset-4 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer">Login</button>
                <Button onClick={() => setAuthOpen('signup')} className="bg-red-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-300 font-semibold transition-all text-base">Sign Up</Button>
              </>
            )}
        </div>
          <button className="md:hidden text-2xl text-red-600 p-2 rounded-full hover:bg-red-50 transition" aria-label="Open menu" onClick={() => setMobileMenuOpen(v => !v)}>
            <Menu className="w-7 h-7" />
          </button>
          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col gap-2 p-4 w-48 md:hidden animate-fade-in z-50">
              <button 
                onClick={() => { setMobileMenuOpen(false); router.push('/search-results'); }}
                className="py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full bg-transparent border-none cursor-pointer"
              >
                Find a Room
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!user) {
                    setAuthOpen('login');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full bg-transparent border-none cursor-pointer"
              >
                List Your Place
              </button>
              <a
                href="https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full"
              >
                Join Community
              </a>
              {!loading && user && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }}
                  className="py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full bg-transparent border-none cursor-pointer"
                >
                  Dashboard
                </button>
              )}
              {!loading && user ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 w-full focus:outline-none py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    aria-label="Open user menu"
                  >
                    <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-red-200">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-red-100 text-red-600 font-bold">{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                      {userProfile?.verifiedUniversity?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <VerifiedBadge university={userProfile.verifiedUniversity} size="xs" showTooltip={false} />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{user.displayName || 'Account'}</span>
                    <VerifiedBadge university={userProfile?.verifiedUniversity} size="xs" />
                  </button>
                  <AnimatePresence>
                    {avatarMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                      >
                        <button
                          onClick={() => { setAvatarMenuOpen(false); setMobileMenuOpen(false); router.push('/dashboard'); }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={async () => { setAvatarMenuOpen(false); setMobileMenuOpen(false); await signOut(); }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthOpen('login'); }} className="py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-left">Login</button>
                  <Button onClick={() => { setMobileMenuOpen(false); setAuthOpen('signup'); }} className="bg-red-600 text-white w-full rounded-full shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-300 font-semibold transition-all text-base mt-2">Sign Up</Button>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white py-12 px-4 md:px-8 text-center gap-6 relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-3xl z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight drop-shadow-lg">Find or list your perfect short-term sublease in seconds.</h1>
          <p className="text-lg md:text-xl mb-6 font-semibold text-white/95">Ditch the group chats and get moving.</p>
          <div className="bg-white/95 rounded-xl shadow-lg p-3 flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center mb-5 border border-gray-100 w-full">
            {/* City or University input */}
            <div className="relative w-full md:w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                <MapPin className="h-4 w-4" />
              </span>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 py-2 text-base font-normal rounded-lg border border-gray-200 bg-white text-gray-700 focus:bg-gray-50 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all w-full" 
                placeholder="City Name" 
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
            {/* Date Range Picker */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto min-w-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-36 h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50 min-w-0">
                    <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                    {fromDate ? format(fromDate, 'MMM d, yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-36 h-10 justify-start text-left font-normal bg-white border-gray-200 text-gray-700 hover:bg-gray-50 min-w-0">
                    <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                    {toDate ? format(toDate, 'MMM d, yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              onClick={() => {
                // Basic validation - at least one search criteria should be provided
                if (!searchQuery && !lookFor && !fromDate && !toDate) {
                  // If no criteria provided, show all listings
                  router.push('/search-results');
                  return;
                }
                
                const searchParams = new URLSearchParams();
                if (searchQuery && searchQuery.trim()) searchParams.set('city', searchQuery.trim());
                if (lookFor && lookFor.trim()) searchParams.set('lookFor', lookFor.trim());
                if (fromDate) searchParams.set('fromDate', fromDate.toISOString());
                if (toDate) searchParams.set('toDate', toDate.toISOString());
                
                // Validate date range if both dates are provided
                if (fromDate && toDate && fromDate > toDate) {
                  alert('Start date cannot be after end date');
                  return;
                }
                
                router.push(`/search-results?${searchParams.toString()}`);
              }}
              className="bg-red-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 flex items-center gap-1 transition-all w-full md:w-auto mt-2 md:mt-0"
            >
              <Search className="w-4 h-4" /> Search
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push('/search-results?city=Tempe')}
              className="text-red-600 font-semibold px-6 py-5 md:py-4 rounded-full shadow-md focus:ring-2 focus:ring-red-300 transition-all text-sm bg-white hover:bg-red-50 hover:text-red-700"
            >
              Explore rooms in Tempe
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!user) {
                  setAuthOpen('login');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="text-red-600 font-semibold px-6 py-5 md:py-4 rounded-full shadow-md focus:ring-2 focus:ring-red-300 transition-all text-sm bg-white hover:bg-red-50 hover:text-red-700"
            >
              List Your Place
            </Button>
          </div>
        </motion.div>

        {/* Decorative background shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </section>

      {/* WhatsApp vs YNL Comparison Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white" id="comparison">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              WhatsApp groups bury your listing.
              <br />
              <span className="text-red-600">YNL keeps it visible.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop wasting hours on group chats. Here&apos;s the brutal truth.
            </p>
          </motion.div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* WhatsApp Card - The Pain */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative h-full bg-gray-100 rounded-2xl p-8 border-2 border-gray-200 overflow-hidden">
                {/* Chaotic background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4 w-20 h-20 bg-gray-400 rounded-full blur-xl" />
                  <div className="absolute bottom-8 right-8 w-32 h-32 bg-gray-400 rounded-full blur-xl" />
                  <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gray-400 rounded-full blur-xl" />
                </div>
                
                {/* Header */}
                <div className="relative flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-500">WhatsApp Groups</h3>
                    <p className="text-sm text-gray-400">The old way</p>
                  </div>
                </div>
                
                {/* Pain Points */}
                <ul className="relative space-y-4">
                  {[
                    'Your listing disappears in minutes',
                    'No search, no filters',
                    'Post in 20+ groups manually',
                    'Zero analytics on views',
                    'Time wasters & spam messages',
                    'No credibility or verification',
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      <span className="text-gray-600 font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Faded overlay effect */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* YNL Card - The Solution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative h-full bg-gradient-to-br from-red-50 to-white rounded-2xl p-8 border-2 border-red-200 shadow-xl overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-40" />
                
                {/* Header */}
                <div className="relative flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <HomeIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">YourNextLease</h3>
                    <p className="text-sm text-red-600 font-medium">The smart way</p>
                  </div>
                  {/* Popular badge */}
                  <span className="ml-auto px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
                    BETTER
                  </span>
                </div>
                
                {/* Benefits */}
                <ul className="relative space-y-4">
                  {[
                    'Your listing stays discoverable 24/7',
                    'Smart search with filters',
                    'One-click posting, auto-share to groups',
                    'Dashboard to track views & inquiries',
                    'Real inquiries only, no spam',
                    'ASU verified badges build trust',
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.4 }} 
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-6 text-lg">
              Stop posting in 20 groups. Start with YNL.
            </p>
            <Button 
              onClick={() => {
                if (!user) {
                  setAuthOpen('signup');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="bg-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all text-base font-semibold"
            >
              List Your Place Now — It&apos;s Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white text-center" id="how">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Get started in minutes — here's how it works:
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Just 3 simple steps to find your next home. No technical experience required.
            </p>
          </motion.div>

          {/* Steps Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Wave Lines - Desktop Only */}
            <div className="hidden md:block absolute top-4 left-0 right-0 z-0">
              <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#fecaca', stopOpacity: 0.8}} />
                    <stop offset="25%" style={{stopColor: '#f87171', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#ef4444', stopOpacity: 1}} />
                    <stop offset="75%" style={{stopColor: '#f87171', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#fecaca', stopOpacity: 0.8}} />
                  </linearGradient>
                  <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#fecaca', stopOpacity: 0.4}} />
                    <stop offset="50%" style={{stopColor: '#f87171', stopOpacity: 0.6}} />
                    <stop offset="100%" style={{stopColor: '#fecaca', stopOpacity: 0.4}} />
                  </linearGradient>
                </defs>
                {/* Main wave */}
                <path 
                  d="M0,6 Q20,2 40,6 T80,6 T100,6" 
                  stroke="url(#waveGradient1)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Secondary wave for depth */}
                <path 
                  d="M0,6 Q30,4 60,6 T100,6" 
                  stroke="url(#waveGradient2)" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </div>
            
            {/* Step 1: Sign Up */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} 
              initial={{ opacity: 0, y: 30 }} 
              transition={{ duration: 0.6, delay: 0.1 }} 
              viewport={{ once: true }}
              className="group relative pt-8"
            >
              {/* Step Number */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                1
              </div>
              
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create your free account as a host or home seeker in seconds.
                </p>
                
                {/* Checkmark */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Search Listings */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} 
              initial={{ opacity: 0, y: 30 }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              viewport={{ once: true }}
              className="group relative pt-8"
            >
              {/* Step Number */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                2
              </div>
              
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search Listings</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse verified listings by city, budget, university, and preferences.
                </p>
                
                {/* Checkmark */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Connect & Book */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} 
              initial={{ opacity: 0, y: 30 }} 
              transition={{ duration: 0.6, delay: 0.3 }} 
              viewport={{ once: true }}
              className="group relative pt-8"
            >
              {/* Step Number */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                3
              </div>
              
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">Connect & Book</h3>
                <p className="text-gray-600 leading-relaxed">
                  Message hosts directly, ask questions, and book your next home securely.
                </p>
                
                {/* Checkmark */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.4 }} 
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-6">
              Ready to get started? It only takes a few minutes!
            </p>
            <Button 
              onClick={() => {
                if (!user) {
                  setAuthOpen('signup');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="bg-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all text-base font-semibold"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="py-16 px-4 bg-gray-50" id="community">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              {/* Left side - QR Code */}
              <div className="w-full md:w-2/5 p-8 md:p-10 flex justify-center items-center">
                <div className="relative group cursor-pointer">
                  {/* WhatsApp icon badge */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300 ease-out group-hover:scale-125">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  {/* QR Code Image */}
                  <div 
                    className="bg-white p-3 rounded-2xl border border-gray-100 transition-all duration-300 ease-out group-hover:scale-110"
                    style={{ boxShadow: '0 8px 40px -8px rgba(34, 197, 94, 0.35), 0 4px 16px -4px rgba(0, 0, 0, 0.1)' }}
                  >
                    <img 
                      src="/images/QRCODE.png" 
                      alt="Scan to join YNL WhatsApp Community" 
                      className="w-44 h-44 md:w-52 md:h-52 object-contain"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-3 font-medium">Scan to join</p>
                </div>
              </div>
              
              {/* Right side - Content */}
              <div className="w-full md:w-3/5 p-8 md:p-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Official Community
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Join Our Community
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with ASU students looking for housing. Get instant updates on new listings, 
                  roommate tips, and housing advice from fellow Sun Devils.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <a 
                    href="https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Join WhatsApp Group
                  </a>
                </div>
                
                <div className="mt-6 flex items-center gap-4 justify-center md:justify-start text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free to join
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ASU Students
                  </span>
                </div>
              </div>
            </div>
          </div>
            </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 text-white py-10 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight">Ready to list your space?</h2>
        <Button 
          onClick={() => {
            if (!user) {
              setAuthOpen('login');
            } else {
              router.push('/dashboard');
            }
          }}
          className="bg-white text-red-600 font-semibold px-8 py-3 rounded-full shadow-md hover:bg-red-100 focus:ring-2 focus:ring-red-300 transition-all text-base"
        >
          List Your Space
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-red-700 text-white pt-10 pb-6 px-4 text-center mt-auto border-t border-red-200/30">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-4 text-base font-medium">
          <a href="/privacy" className="hover:underline underline-offset-4 hover:text-red-100 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:underline underline-offset-4 hover:text-red-100 transition-colors">Terms & Conditions</a>
        </div>
        <div className="flex gap-4 justify-center mb-3">
          <a href="#" aria-label="Instagram" className="hover:text-red-200 text-2xl transition-colors">📸</a>
          <a href="#" aria-label="Twitter" className="hover:text-red-200 text-2xl transition-colors">🐦</a>
          <a href="#" aria-label="Facebook" className="hover:text-red-200 text-2xl transition-colors">📘</a>
        </div>
        <div className="flex justify-center items-center gap-2 mt-2 text-xs font-normal opacity-80">
          <HomeIcon className="w-5 h-5 text-white/80" />
          <span>&copy; {new Date().getFullYear()} YourNextLease. All rights reserved.</span>
        </div>
        <div className="mt-3 text-xs font-normal opacity-80">
          <a href="mailto:info@yournextlease.com" className="hover:text-red-100 transition-colors">info@yournextlease.com</a>
        </div>
      </footer>
      <AuthModal open={!!authOpen} onClose={() => setAuthOpen(null)} mode={authOpen || 'login'} key={authOpen || undefined} />
    </div>
  );
}
