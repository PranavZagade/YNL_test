'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Search, User, LogIn, PlusCircle, Quote, Menu, MapPin } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import EmailPasswordSignUp from '@/components/EmailPasswordSignUp';
import { useRouter } from 'next/navigation';

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

const testimonials = [
  {
    avatar: 'https://res.cloudinary.com/demo/image/upload/v1690000003/avatar1.jpg',
    name: 'Priya, NYU',
    quote: 'I found my perfect sublet in just a few days. The chat made it so easy!',
  },
  {
    avatar: 'https://res.cloudinary.com/demo/image/upload/v1690000004/avatar2.jpg',
    name: 'Alex, UCLA',
    quote: 'Listing my room was simple, and I connected with other students fast.',
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
  const { user, loading, signOut } = useAuth();
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
                  className="focus:outline-none"
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  aria-label="Open user menu"
                >
                  <Avatar className="w-9 h-9 border-2 border-red-200 shadow hover:shadow-md transition-all">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-red-100 text-red-600 font-bold">
                      {user.displayName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
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
                    <Avatar className="w-8 h-8 border-2 border-red-200">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-red-100 text-red-600 font-bold">{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">{user.displayName || 'Account'}</span>
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

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white text-center" id="testimonials">
        <h2 className="text-2xl md:text-3xl font-semibold text-red-600 mb-10 tracking-tight">What Students Say</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={i} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }} transition={{ duration: 0.6, delay: i * 0.2 }} viewport={{ once: true }} className="bg-red-50 rounded-2xl shadow p-7 flex-1 flex flex-col items-center border border-red-100">
              <Avatar className="w-16 h-16 mb-3 shadow border-2 border-white">
                <AvatarImage src={t.avatar} alt={t.name} />
                <AvatarFallback className="bg-red-200 text-red-700 font-semibold">{t.name[0]}</AvatarFallback>
              </Avatar>
              <Quote className="w-6 h-6 text-red-600 mb-2" />
              <p className="mb-4 text-gray-700 text-base">“{t.quote}”</p>
              <span className="font-semibold text-gray-900">— {t.name}</span>
            </motion.div>
          ))}
        </div>
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
