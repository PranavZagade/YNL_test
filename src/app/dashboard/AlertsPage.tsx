'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Bell, Search, MapPin, Calendar as CalendarIcon, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface Alert {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
  actionText?: string;
}

interface ListingAlert {
  id: string;
  userId: string;
  city: string;
  apartmentType: string;
  moveInDate: Timestamp;
  moveOutDate: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [listingAlert, setListingAlert] = useState<ListingAlert | null>(null);
  const [loadingListingAlert, setLoadingListingAlert] = useState(true);
  const [showListingAlertForm, setShowListingAlertForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newListingAlert, setNewListingAlert] = useState({
    city: '',
    apartmentType: '',
    moveInDate: undefined as Date | undefined,
    moveOutDate: undefined as Date | undefined
  });

  // Debug: Log user authentication status
  useEffect(() => {
    console.log('🔐 AlertsPage - User auth status:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      userEmail: user?.email
    });
  }, [user]);

  // Load general alerts
  useEffect(() => {
    if (!user) return;

    const alertsRef = collection(db, 'alerts');
    const alertsQuery = query(alertsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      try {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Alert[];
        
        setAlerts(alertsData);
        setLoadingAlerts(false);
        setError(null);
      } catch (error) {
        console.error('Error loading alerts:', error);
        setError('Failed to load alerts. Please try again.');
        setLoadingAlerts(false);
      }
    }, (error) => {
      console.error('Error in alerts listener:', error);
      setError('Failed to load alerts. Please try again.');
      setLoadingAlerts(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load user's listing alert
  useEffect(() => {
    if (!user) return;

    const listingAlertsRef = collection(db, 'listingAlerts');
    const alertsQuery = query(
      listingAlertsRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      try {
        if (snapshot.docs.length > 0) {
          const alertData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          } as ListingAlert;
          setListingAlert(alertData);
        } else {
          setListingAlert(null);
        }
        setLoadingListingAlert(false);
        setError(null);
      } catch (error) {
        console.error('Error loading listing alert:', error);
        setError('Failed to load listing alert. Please try again.');
        setLoadingListingAlert(false);
      }
    }, (error) => {
      console.error('Error in listing alert listener:', error);
      setError('Failed to load listing alert. Please try again.');
      setLoadingListingAlert(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createListingAlert = async () => {
    if (!user) {
      setError('You must be logged in to create alerts.');
      return;
    }

    if (!newListingAlert.city || !newListingAlert.apartmentType || !newListingAlert.moveInDate || !newListingAlert.moveOutDate) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('🔔 Creating listing alert for user:', user.uid);
      console.log('📋 Alert data:', newListingAlert);
      
      const listingAlertData = {
        userId: user.uid,
        city: newListingAlert.city.trim(),
        apartmentType: newListingAlert.apartmentType,
        moveInDate: Timestamp.fromDate(newListingAlert.moveInDate!),
        moveOutDate: Timestamp.fromDate(newListingAlert.moveOutDate!),
        isActive: true,
        createdAt: Timestamp.now()
      };

      console.log('📤 Sending to Firestore:', listingAlertData);
      console.log('📍 Collection path: listingAlerts');

      const docRef = await addDoc(collection(db, 'listingAlerts'), listingAlertData);
      
      console.log('✅ Alert created successfully with ID:', docRef.id);
      
      // IMMEDIATELY CHECK EXISTING LISTINGS FOR MATCHES
      console.log('🔍 Checking existing listings for matches...');
      
      try {
        // Query all existing listings
        const listingsQuery = query(collection(db, 'listings'));
        const listingsSnapshot = await getDocs(listingsQuery);
        
        const existingListings: any[] = [];
        listingsSnapshot.forEach((doc) => {
          existingListings.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('📊 Found', existingListings.length, 'existing listings to check');
        
        // Debug: Log all existing listings
        console.log('🔍 All existing listings:', existingListings.map(l => ({
          id: l.id,
          city: l.city,
          apartmentType: l.apartmentType,
          moveIn: l.moveIn,
          moveOut: l.moveOut,
          title: l.title
        })));
        
        // Debug: Log alert details
        console.log('🚨 Alert details:', {
          city: newListingAlert.city.trim(),
          apartmentType: newListingAlert.apartmentType,
          moveInDate: newListingAlert.moveInDate,
          moveOutDate: newListingAlert.moveOutDate
        });
        
        // Use the same matching logic as search-results page
        const matchedListings = existingListings.filter((listing) => {
          // City matching (improved normalization for variations)
          const alertCity = normalizeCity(newListingAlert.city.trim());
          const listingCity = normalizeCity(listing.city);
          
          console.log('🏙️ City matching:', {
            alertCity: alertCity,
            listingCity: listingCity,
            originalAlertCity: newListingAlert.city.trim(),
            originalListingCity: listing.city
          });
          
          if (alertCity !== listingCity) return false;
          
          // Apartment type matching
          if (newListingAlert.apartmentType !== listing.apartmentType) return false;
          
          // Date range matching (listing availability must cover alert date range)
          const alertFromDate = newListingAlert.moveInDate!;
          const alertToDate = newListingAlert.moveOutDate!;
          
          // Convert listing dates to Date objects (handle both Timestamp and Date)
          let listingMoveIn: Date;
          let listingMoveOut: Date;
          
          if (listing.moveIn?.toDate) {
            listingMoveIn = listing.moveIn.toDate();
          } else if (listing.moveIn instanceof Date) {
            listingMoveIn = listing.moveIn;
          } else if (listing.moveIn?.seconds) {
            listingMoveIn = new Date(listing.moveIn.seconds * 1000);
          } else {
            listingMoveIn = new Date(listing.moveIn);
          }
          
          if (listing.moveOut?.toDate) {
            listingMoveOut = listing.moveOut.toDate();
          } else if (listing.moveOut instanceof Date) {
            listingMoveOut = listing.moveOut;
          } else if (listing.moveOut?.seconds) {
            listingMoveOut = new Date(listing.moveOut.seconds * 1000);
          } else {
            listingMoveOut = new Date(listing.moveOut);
          }
          
          console.log('📅 Date matching:', {
            alertFromDate: alertFromDate.toISOString().split('T')[0],
            alertToDate: alertToDate.toISOString().split('T')[0],
            listingMoveIn: listingMoveIn.toISOString().split('T')[0],
            listingMoveOut: listingMoveOut.toISOString().split('T')[0]
          });
          
          // Apply the SAME formula as search-results page: moveInDate <= fromDate && moveOutDate >= toDate
          // This means: listing must be available for the ENTIRE alert period
          const isDateMatch = listingMoveIn <= alertFromDate && listingMoveOut >= alertToDate;
          
          console.log('✅ Date match result:', isDateMatch);
          
          return isDateMatch;
        });
        
        console.log('🎯 Found', matchedListings.length, 'matching listings');
        
        if (matchedListings.length > 0) {
          console.log('📧 Sending immediate alert email with', matchedListings.length, 'matches');
          
          // Send email with ALL matches
          const emailResponse = await fetch('/api/send-listing-alert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipientEmail: user.email,
              recipientName: user.displayName || user.email?.split('@')[0] || 'User',
              city: newListingAlert.city.trim(),
              moveInDate: newListingAlert.moveInDate!.toISOString().split('T')[0],
              moveOutDate: newListingAlert.moveOutDate!.toISOString().split('T')[0],
              matchedListings: matchedListings.map(listing => ({
                id: listing.id,
                title: listing.title || 'Untitled Listing',
                city: listing.city,
                rent: listing.rent || 'Price not specified',
                address: listing.address || 'Address not specified',
                propertyName: listing.propertyName || 'Property',
                listingUrl: `${window.location.origin}/listing/${listing.id}`
              }))
            }),
          });

          if (emailResponse.ok) {
            console.log('✅ Immediate alert email sent successfully');
            setSuccessMessage(`Alert created successfully! We found ${matchedListings.length} existing listing${matchedListings.length > 1 ? 's' : ''} that match your preferences. Check your email for details.`);
          } else {
            console.error('❌ Failed to send immediate alert email:', emailResponse.status);
            setSuccessMessage(`Alert created successfully! We found ${matchedListings.length} existing listing${matchedListings.length > 1 ? 's' : ''} that match your preferences, but there was an issue sending the email.`);
          }
        } else {
          console.log('ℹ️ No existing listings match this alert');
          setSuccessMessage('Alert created successfully! We\'ll notify you when new listings match your preferences.');
        }
        
      } catch (matchError) {
        console.error('❌ Error checking existing listings:', matchError);
        setSuccessMessage('Alert created successfully! We\'ll notify you when new listings match your preferences.');
        // Don't fail the alert creation if matching fails
      }
      
      // Reset form
      setNewListingAlert({
        city: '',
        apartmentType: '',
        moveInDate: undefined,
        moveOutDate: undefined
      });
      setShowListingAlertForm(false);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error creating listing alert:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error code:', error.code);
      setError('Failed to create listing alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleListingAlert = async () => {
    if (!listingAlert || !user) return;

    try {
      setError(null);
      const alertRef = doc(db, 'listingAlerts', listingAlert.id);
      await updateDoc(alertRef, {
        isActive: !listingAlert.isActive
      });
    } catch (error) {
      console.error('Error toggling listing alert:', error);
      setError('Failed to update alert status. Please try again.');
    }
  };

  const deleteListingAlert = async () => {
    if (!listingAlert || !user) return;

    try {
      setError(null);
      const alertRef = doc(db, 'listingAlerts', listingAlert.id);
      await deleteDoc(alertRef);
      setListingAlert(null);
    } catch (error) {
      console.error('Error deleting listing alert:', error);
      setError('Failed to delete listing alert. Please try again.');
    }
  };

  const apartmentTypes = [
    '1b1b', '2b2b', '2b1b', '3b2b'
  ];

  // Helper function for better city matching
  const normalizeCity = (city: string): string => {
    if (!city) return '';
    
    // Remove all non-alphanumeric characters and convert to lowercase
    let normalized = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Handle common city variations
    const cityVariations: { [key: string]: string[] } = {
      'newyork': ['newyork', 'newyorkcity', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'statenisland'],
      'losangeles': ['losangeles', 'la', 'hollywood', 'beverlyhills', 'santamonica', 'venice'],
      'chicago': ['chicago', 'chitown', 'windycity'],
      'houston': ['houston', 'htx', 'spacecity'],
      'phoenix': ['phoenix', 'phx', 'valleyofthesun'],
      'philadelphia': ['philadelphia', 'philly', 'cityofbrotherlylove'],
      'sanantonio': ['sanantonio', 'satx', 'alamocity'],
      'sandiego': ['sandiego', 'sd', 'americasfinestcity'],
      'dallas': ['dallas', 'dfw', 'bigd'],
      'austin': ['austin', 'atx', 'liveaustin'],
      'jacksonville': ['jacksonville', 'jax', 'boldnewcityofthesouth'],
      'fortworth': ['fortworth', 'ftw', 'cowtown'],
      'columbus': ['columbus', 'cbus', 'archcity'],
      'charlotte': ['charlotte', 'clt', 'queencity'],
      'sanfrancisco': ['sanfrancisco', 'sf', 'frisco', 'goldengatecity'],
      'indianapolis': ['indianapolis', 'indy', 'circlecity'],
      'seattle': ['seattle', 'sea', 'emeraldcity'],
      'denver': ['denver', 'den', 'milehighcity'],
      'washington': ['washington', 'dc', 'washingtondc', 'capitolcity'],
      'boston': ['boston', 'bos', 'beantown'],
      'nashville': ['nashville', 'bna', 'musiccity'],
      'detroit': ['detroit', 'dtw', 'motorcity'],
      'portland': ['portland', 'pdx', 'rosecity'],
      'memphis': ['memphis', 'mem', 'bluffcity'],
      'oklahomacity': ['oklahomacity', 'okc', 'sooner'],
      'lasvegas': ['lasvegas', 'lv', 'sin city', 'entertainmentcapital'],
      'louisville': ['louisville', 'sdf', 'derbycity'],
      'baltimore': ['baltimore', 'bwi', 'charmcity'],
      'milwaukee': ['milwaukee', 'mke', 'brewcity'],
      'albuquerque': ['albuquerque', 'abq', 'duke city'],
      'tucson': ['tucson', 'tus', 'oldpueblo'],
      'fresno': ['fresno', 'fat', 'raisincapital'],
      'sacramento': ['sacramento', 'smf', 'sac', 'cityoftrees'],
      'atlanta': ['atlanta', 'atl', 'hotlanta', 'peachtreecity'],
      'kansascity': ['kansascity', 'mci', 'kc', 'cityoffountains'],
      'miami': ['miami', 'mia', 'magiccity'],
      'raleigh': ['raleigh', 'rdu', 'cityofoaks'],
      'omaha': ['omaha', 'oma', 'gatewaytothewest'],
      'minneapolis': ['minneapolis', 'msp', 'twin cities', 'cityoflakes'],
      'tampa': ['tampa', 'tpa', 'lightningcity'],
      'cleveland': ['cleveland', 'cle', 'forestcity'],
      'winston': ['winston', 'int', 'twin city'],
      'orlando': ['orlando', 'mco', 'citybeautiful'],
      'stlouis': ['stlouis', 'stl', 'gatewaycity'],
      'cincinnati': ['cincinnati', 'cvg', 'queencity'],
      'pittsburgh': ['pittsburgh', 'pit', 'steelcity'],
      'anchorage': ['anchorage', 'anc', 'lastfrontier'],
      'bakersfield': ['bakersfield', 'bfl', 'californiasfrontier'],
      'tulsa': ['tulsa', 'tul', 'oilcapital'],
      'aurora': ['aurora', 'den', 'gatewaytotherockies'],
      'anaheim': ['anaheim', 'sna', 'happiestplaceonearth'],
      'santaana': ['santaana', 'sna', 'downtown'],
      'corpuschristi': ['corpuschristi', 'crp', 'sparklingcity'],
      'riverside': ['riverside', 'ral', 'missioninncity'],
      'lexington': ['lexington', 'lex', 'horsecapital'],
      'stockton': ['stockton', 'sck', 'portcity'],
      'henderson': ['henderson', 'las', 'greenvalley'],
      'stpaul': ['stpaul', 'msp', 'capitalcity'],
      'stpetersburg': ['stpetersburg', 'tpa', 'sunshinecity'],
      'fortwayne': ['fortwayne', 'fwa', 'summitcity'],
      'joliet': ['joliet', 'ord', 'cityofsteel'],
      'chandler': ['chandler', 'phx', 'innovationcity'],
      'madison': ['madison', 'msn', 'madcity'],
      'laredo': ['laredo', 'lrd', 'gatewaycity'],
      'durham': ['durham', 'rdu', 'bullcity'],
      'garland': ['garland', 'dfw', 'texas'],
      'glendale': ['glendale', 'phx', 'burbank', 'arizona', 'california'],
      'hialeah': ['hialeah', 'mia', 'cityofprogress'],
      'reno': ['reno', 'rno', 'biggestlittlecity'],
      'chesapeake': ['chesapeake', 'orf', 'virginia'],
      'gilbert': ['gilbert', 'phx', 'arizona'],
      'batonrouge': ['batonrouge', 'btr', 'redstick', 'louisiana'],
      'irving': ['irving', 'dfw', 'texas'],
      'scottsdale': ['scottsdale', 'phx', 'westmost'],
      'northlasvegas': ['northlasvegas', 'las', 'nevada'],
      'fremont': ['fremont', 'oak', 'california'],
      'boise': ['boise', 'boi', 'cityoftrees'],
      'richmond': ['richmond', 'ric', 'rivercity'],
      'spokane': ['spokane', 'geg', 'lilaccity'],
      'birmingham': ['birmingham', 'bhm', 'magiccity'],
      'tacoma': ['tacoma', 'sea', 'cityofdestiny'],
      'fontana': ['fontana', 'ont', 'california'],
      'rochester': ['rochester', 'roc', 'flowercity'],
      'oxnard': ['oxnard', 'oxr', 'california'],
      'morenovalley': ['morenovalley', 'ont', 'california'],
      'huntingtonbeach': ['huntingtonbeach', 'sna', 'surfcity'],
      'saltlakecity': ['saltlakecity', 'slc', 'crossroadsofthewest'],
      'grandrapids': ['grandrapids', 'grr', 'furniturecity'],
      'tallahassee': ['tallahassee', 'tall', 'florida'],
      'huntsville': ['huntsville', 'hsv', 'rocketcity'],
      'worcester': ['worcester', 'wor', 'heartofthecommonwealth'],
      'knoxville': ['knoxville', 'tys', 'marblecity'],
      'neworleans': ['neworleans', 'msy', 'nola', 'bigeasy'],
      'grandprairie': ['grandprairie', 'dfw', 'texas'],
      'brownsville': ['brownsville', 'bro', 'texas'],
      'overlandpark': ['overlandpark', 'mci', 'kansas'],
      'santaclarita': ['santaclarita', 'burbank', 'california'],
      'providence': ['providence', 'pvd', 'creativecapital', 'rhodeisland'],
      'jackson': ['jackson', 'jan', 'mississippi'],
      'fortcollins': ['fortcollins', 'den', 'choicecity'],
      'chattanooga': ['chattanooga', 'cha', 'sceniccity'],
      'tempe': ['tempe', 'phx', 'arizona'],
      'siouxfalls': ['siouxfalls', 'fsd', 'queencity'],
      'lancaster': ['lancaster', 'bwi', 'pennsylvania'],
      'cape coral': ['capecoral', 'rsw', 'florida'],
      'palmdale': ['palmdale', 'burbank', 'california'],
      'chico': ['chico', 'cic', 'california'],
      'springfield': ['springfield', 'sgf', 'bdl', 'missouri', 'massachusetts', 'illinois'],
      'peoria': ['peoria', 'pia', 'illinois'],
      'annarbor': ['annarbor', 'dtw', 'treetown'],
      'naples': ['naples', 'rsw', 'florida'],
      'albany': ['albany', 'alb', 'newyork', 'oregon'],
      'victorville': ['victorville', 'ont', 'california'],
      'greensboro': ['greensboro', 'gso', 'gatewaycity'],
      'fortlauderdale': ['fortlauderdale', 'fll', 'veniceofamerica'],
      'rancho': ['rancho', 'ont', 'california'],
      'carlsbad': ['carlsbad', 'san', 'california'],
      'fairfield': ['fairfield', 'oak', 'california'],
      'berkeley': ['berkeley', 'oak', 'california'],
      'vallejo': ['vallejo', 'oak', 'california'],
      'elpaso': ['elpaso', 'el paso', 'texas'],
      'dayton': ['dayton', 'day', 'gemcity'],
      'lynchburg': ['lynchburg', 'lyn', 'virginia'],
      'palmsprings': ['palmsprings', 'psp', 'california'],
      'columbia': ['columbia', 'cae', 'cou', 'southcarolina', 'missouri'],
      'elgin': ['elgin', 'ord', 'illinois'],
      'murfreesboro': ['murfreesboro', 'bna', 'tennessee'],
      'hartford': ['hartford', 'bdl', 'connecticut'],
      'trenton': ['trenton', 'ttn', 'newjersey'],
      'wilmington': ['wilmington', 'ilg', 'clt', 'delaware', 'northcarolina'],
      'salem': ['salem', 'sle', 'boston', 'oregon', 'massachusetts'],
      'littlerock': ['littlerock', 'lit', 'arkansas'],
      'desmoines': ['desmoines', 'dsm', 'iowa'],

      'frankfort': ['frankfort', 'lex', 'kentucky'],
      'jeffersoncity': ['jeffersoncity', 'cou', 'missouri'],

      'cheyenne': ['cheyenne', 'cys', 'wyoming'],
      'helena': ['helena', 'hln', 'montana'],
      'bismarck': ['bismarck', 'bis', 'northdakota'],
      'pierre': ['pierre', 'pir', 'southdakota'],
      'lincoln': ['lincoln', 'lnk', 'nebraska'],
      'topeka': ['topeka', 'top', 'kansas'],





      'honolulu': ['honolulu', 'hnl', 'hawaii']
    };
    
    // Check if this city has known variations
    for (const [standard, variations] of Object.entries(cityVariations)) {
      if (variations.includes(normalized)) {
        return standard;
      }
    }
    
    return normalized;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">Manage your notifications and listing alerts</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Alerts Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">General Alerts</h2>
            <p className="text-sm text-gray-600">System notifications and updates</p>
          </div>
        </div>

        {loadingAlerts ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts yet</p>
            <p className="text-sm text-gray-400">You'll see important updates here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {alert.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-3 mt-2"></div>
                  )}
                </div>
                {alert.actionUrl && alert.actionText && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => window.open(alert.actionUrl, '_blank')}
                  >
                    {alert.actionText}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Alert Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Listing Alert</h2>
            <p className="text-sm text-gray-600">Get notified when new listings match your preferences</p>
          </div>
          {listingAlert && (
            <Button
              onClick={toggleListingAlert}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {listingAlert.isActive ? (
                <>
                  <ToggleRight className="w-4 h-4 text-green-600" />
                  <span>ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                  <span>OFF</span>
                </>
              )}
            </Button>
          )}
        </div>

        {loadingListingAlert ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : listingAlert ? (
          <div className="space-y-4">
            {/* Display current alert settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <p className="text-gray-900">{listingAlert.city}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Apartment Type</Label>
                <p className="text-gray-900">{listingAlert.apartmentType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Move-in Date</Label>
                <p className="text-gray-900">
                  {format(listingAlert.moveInDate.toDate(), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Move-out Date</Label>
                <p className="text-gray-900">
                  {format(listingAlert.moveOutDate.toDate(), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowListingAlertForm(true)}
                variant="outline"
                size="sm"
              >
                Edit Alert
              </Button>
              <Button
                onClick={deleteListingAlert}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Delete Alert
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No listing alert set up</p>
            <Button
              onClick={() => setShowListingAlertForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Create Listing Alert
            </Button>
          </div>
        )}

        {/* Create/Edit Listing Alert Form */}
        {showListingAlertForm && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {listingAlert ? 'Edit Listing Alert' : 'Create Listing Alert'}
            </h3>
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="inline-flex text-green-400 hover:text-green-600"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); createListingAlert(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city name"
                    value={newListingAlert.city}
                    onChange={(e) => setNewListingAlert({ ...newListingAlert, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apartmentType">Apartment Type</Label>
                  <Select
                    value={newListingAlert.apartmentType}
                    onValueChange={(value) => setNewListingAlert({ ...newListingAlert, apartmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select apartment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1b1b">1 Bedroom 1 Bathroom</SelectItem>
                      <SelectItem value="2b1b">2 Bedroom 1 Bathroom</SelectItem>
                      <SelectItem value="2b2b">2 Bedroom 2 Bathroom</SelectItem>
                      <SelectItem value="3b1b">3 Bedroom 1 Bathroom</SelectItem>
                      <SelectItem value="3b2b">3 Bedroom 2 Bathroom</SelectItem>
                      <SelectItem value="4b2b">4 Bedroom 2 Bathroom</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moveInDate">Move-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {newListingAlert.moveInDate ? (
                          format(newListingAlert.moveInDate, 'PPP')
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newListingAlert.moveInDate}
                        onSelect={(date) => setNewListingAlert({ ...newListingAlert, moveInDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="moveOutDate">Move-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {newListingAlert.moveOutDate ? (
                          format(newListingAlert.moveOutDate, 'PPP')
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newListingAlert.moveOutDate}
                        onSelect={(date) => setNewListingAlert({ ...newListingAlert, moveOutDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create Alert'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowListingAlertForm(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 