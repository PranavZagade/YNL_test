import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, onSnapshot, orderBy, getDoc, doc, setDoc } from 'firebase/firestore';

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
    'phoenix': ['phoenix', 'phx', 'valleyofthesun', 'arizona'],
    'philadelphia': ['philadelphia', 'philly', 'cityofbrotherlylove'],
    'sanantonio': ['sanantonio', 'satx', 'alamocity'],
    'sandiego': ['sandiego', 'sd', 'americasfinestcity'],
    'dallas': ['dallas', 'dfw', 'bigd'],
    'austin': ['austin', 'atx', 'aus', 'liveaustin', 'texas'],
    'jacksonville': ['jacksonville', 'jax', 'boldnewcityofthesouth'],
    'fortworth': ['fortworth', 'ftw', 'cowtown'],
    'columbus': ['columbus', 'cbus', 'cmh', 'archcity', 'ohio'],
    'charlotte': ['charlotte', 'clt', 'queencity'],
    'sanfrancisco': ['sanfrancisco', 'sf', 'frisco', 'goldengatecity'],
    'indianapolis': ['indianapolis', 'indy', 'circlecity'],
    'seattle': ['seattle', 'sea', 'emeraldcity'],
    'denver': ['denver', 'den', 'milehighcity', 'colorado'],
    'washington': ['washington', 'dc', 'washingtondc', 'capitolcity'],
    'boston': ['boston', 'bos', 'beantown'],
    'nashville': ['nashville', 'bna', 'musiccity'],
    'detroit': ['detroit', 'dtw', 'motorcity'],
    'portland': ['portland', 'pdx', 'rosecity'],
    'memphis': ['memphis', 'mem', 'bluffcity'],
    'oklahomacity': ['oklahomacity', 'okc', 'sooner', 'oklahoma'],
    'lasvegas': ['lasvegas', 'lv', 'sin city', 'entertainmentcapital'],
    'louisville': ['louisville', 'sdf', 'derbycity'],
    'baltimore': ['baltimore', 'bwi', 'charmcity'],
    'milwaukee': ['milwaukee', 'mke', 'brewcity'],
    'albuquerque': ['albuquerque', 'abq', 'duke city'],
    'tucson': ['tucson', 'tus', 'oldpueblo'],
    'fresno': ['fresno', 'fat', 'raisincapital'],
    'sacramento': ['sacramento', 'smf', 'sac', 'cityoftrees', 'california'],
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
    'anchorage': ['anchorage', 'anc', 'lastfrontier', 'alaska'],
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
    'madison': ['madison', 'msn', 'madcity', 'wisconsin'],
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
    'capecoral': ['capecoral', 'rsw', 'florida'],
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

interface ListingAlert {
  id: string;
  userId: string;
  city: string;
  apartmentType: string;
  moveInDate: Timestamp;
  moveOutDate: Timestamp;
  isActive: boolean;
}

interface Listing {
  id: string;
  title: string;
  propertyName: string;
  address: string;
  city: string;
  apartmentType: string;
  moveIn: Timestamp;
  moveOut: Timestamp;
  rent: string;
  userId: string;
}

// Global variable to track if listener is already set up
let isListenerActive = false;

// Function to start real-time listing listener
export function startListingAlertListener() {
  if (isListenerActive) {
    console.log('🔔 Listing alert listener already active');
    return;
  }

  console.log('🔔 Starting real-time listing alert listener...');
  isListenerActive = true;

  // Listen to the listings collection in real-time
  const listingsRef = collection(db, 'listings');
  const listingsQuery = query(
    listingsRef,
    orderBy('createdAt', 'desc')
    // Removed limit(1) to listen to all listings
  );

  const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const newListing = {
          id: change.doc.id,
          ...change.doc.data()
        } as Listing;
        
        console.log('🆕 New listing detected:', newListing.id);
        console.log('📋 New listing data:', {
          id: newListing.id,
          userId: newListing.userId,
          city: newListing.city,
          apartmentType: newListing.apartmentType,
          moveIn: newListing.moveIn,
          moveOut: newListing.moveOut,
          title: newListing.title
        });
        
        // Check alerts for the new listing
        checkListingAlerts(newListing);
      } else if (change.type === 'modified') {
        const updatedListing = {
          id: change.doc.id,
          ...change.doc.data()
        } as Listing;
        
        console.log('✏️ Updated listing detected:', updatedListing.id);
        console.log('📋 Updated listing data:', {
          id: updatedListing.id,
          userId: updatedListing.userId,
          city: updatedListing.city,
          apartmentType: updatedListing.apartmentType,
          moveIn: updatedListing.moveIn,
          moveOut: updatedListing.moveOut,
          title: updatedListing.title
        });
        
        // Check alerts for the updated listing
        checkListingAlerts(updatedListing);
      }
    });
  }, (error) => {
    console.error('❌ Error in listing alert listener:', error);
    isListenerActive = false;
  });

  // Return unsubscribe function
  return unsubscribe;
}

// Function to stop the listener
export function stopListingAlertListener() {
  console.log('🔔 Stopping listing alert listener...');
  isListenerActive = false;
}

export async function checkListingAlerts(listing: Listing) {
  try {
    console.log('🔍 Checking listing alerts for:', listing.id);
    console.log('📋 Listing data:', {
      id: listing.id,
      city: listing.city,
      apartmentType: listing.apartmentType,
      moveIn: listing.moveIn,
      moveOut: listing.moveOut,
      title: listing.title
    });
    
    // Get all active listing alerts
    const alertsRef = collection(db, 'listingAlerts');
    const alertsQuery = query(alertsRef, where('isActive', '==', true));
    const alertsSnapshot = await getDocs(alertsQuery);
    
    console.log('🔔 Found', alertsSnapshot.size, 'active alerts to check');
    
    // Check if we've already sent emails for this listing
    const sentEmailsRef = collection(db, 'sentListingAlertEmails');
    const sentEmailsQuery = query(sentEmailsRef, where('listingId', '==', listing.id));
    const sentEmailsSnapshot = await getDocs(sentEmailsQuery);
    
    // Create a set of alert IDs that have already received emails for this listing
    const sentAlertIds = new Set(sentEmailsSnapshot.docs.map(doc => doc.data().alertId));
    
    console.log('📧 Already sent emails for alerts:', Array.from(sentAlertIds));
    
    const matchingAlerts: any[] = [];
    
    alertsSnapshot.forEach((doc) => {
      const alert = doc.data();
      
      console.log('🔔 Checking alert:', {
        id: doc.id,
        city: alert.city,
        apartmentType: alert.apartmentType,
        moveInDate: alert.moveInDate,
        moveOutDate: alert.moveOutDate
      });
      
      // City matching (improved normalization for variations)
      const alertCity = normalizeCity(alert.city);
      const listingCity = normalizeCity(listing.city);
      
      console.log('🏙️ City matching in real-time listener:', {
        alertCity: alertCity,
        listingCity: listingCity,
        originalAlertCity: alert.city,
        originalListingCity: listing.city
      });
      
      if (alertCity !== listingCity) return;
      
      // Apartment type matching
      if (alert.apartmentType !== listing.apartmentType) return;
      
      // Date range matching (listing availability must cover alert date range)
      const alertFromDate = alert.moveInDate.toDate();
      const alertToDate = alert.moveOutDate.toDate();
      
      // Convert listing dates to Date objects (handle both Timestamp and Date)
      let listingMoveIn: Date;
      let listingMoveOut: Date;
      
      if (listing.moveIn?.toDate) {
        listingMoveIn = listing.moveIn.toDate();
      } else if (listing.moveIn instanceof Date) {
        listingMoveIn = listing.moveIn;
      } else if (listing.moveIn?.seconds) {
        listingMoveIn = new Date(listing.moveIn.seconds * 1000);
      } else if (listing.moveIn?.seconds) {
        listingMoveIn = new Date(listing.moveIn.seconds * 1000);
      } else {
        listingMoveIn = new Date();
      }
      
      if (listing.moveOut?.toDate) {
        listingMoveOut = listing.moveOut.toDate();
      } else if (listing.moveOut instanceof Date) {
        listingMoveOut = listing.moveOut;
      } else if (listing.moveOut?.seconds) {
        listingMoveOut = new Date(listing.moveOut.seconds * 1000);
      } else {
        listingMoveOut = new Date();
      }
      
      console.log('📅 Date matching in real-time listener:', {
        alertFromDate: alertFromDate.toISOString().split('T')[0],
        alertToDate: alertToDate.toISOString().split('T')[0],
        listingMoveIn: listingMoveIn.toISOString().split('T')[0],
        listingMoveOut: listingMoveOut.toISOString().split('T')[0]
      });
      
      // Apply the SAME formula as search-results page: moveInDate <= fromDate && moveOutDate >= toDate
      // This means: listing must be available for the ENTIRE alert period
      const isDateMatch = listingMoveIn <= alertFromDate && listingMoveOut >= alertToDate;
      
      console.log('✅ Date match result in real-time listener:', isDateMatch);
      
      if (isDateMatch && !sentAlertIds.has(doc.id)) {
        // Only add alerts that haven't received emails yet
        matchingAlerts.push({
          ...alert,
          id: doc.id
        });
      } else if (isDateMatch && sentAlertIds.has(doc.id)) {
        console.log('📧 Skipping alert', doc.id, '- email already sent for this listing');
      }
    });
    
    console.log('🎯 Found', matchingAlerts.length, 'new matching alerts for listing:', listing.id);
    
    if (matchingAlerts.length > 0) {
      // Send email notifications for each matching alert
      for (const alert of matchingAlerts) {
        try {
          // Get user info for the alert
          const userDoc = await getDoc(doc(db, 'users', alert.userId));
          if (!userDoc.exists()) {
            console.log('❌ User not found for alert:', alert.id);
            continue;
          }
          
          const userData = userDoc.data();
          
          // Note: Removed online user check - now sending emails regardless of user status
          console.log('📧 Sending listing alert email for alert:', alert.id);
          
          // Send email with the single matching listing
          const emailResponse = await fetch('/api/send-listing-alert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipientEmail: userData.email,
              recipientName: userData.displayName || userData.email?.split('@')[0] || 'User',
              city: alert.city,
              moveInDate: alert.moveInDate.toDate().toISOString().split('T')[0],
              moveOutDate: alert.moveOutDate.toDate().toISOString().split('T')[0],
              matchedListings: [{
                id: listing.id,
                title: listing.title || 'Untitled Listing',
                city: listing.city,
                rent: listing.rent || 'Price not specified',
                address: listing.address || 'Address not specified',
                propertyName: listing.propertyName || 'Property',
                listingUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/listing/${listing.id}`
              }]
            }),
          });

          if (emailResponse.ok) {
            console.log('✅ Listing alert email sent successfully for alert:', alert.id);
            
            // Record that this email was sent to prevent duplicates
            try {
              await setDoc(doc(db, 'sentListingAlertEmails', `${listing.id}_${alert.id}`), {
                listingId: listing.id,
                alertId: alert.id,
                userId: alert.userId,
                sentAt: Timestamp.now(),
                email: userData.email
              });
              console.log('📝 Recorded email sent for listing', listing.id, 'and alert', alert.id);
            } catch (recordError) {
              console.error('❌ Failed to record email sent:', recordError);
            }
          } else {
            console.error('❌ Failed to send listing alert email for alert:', alert.id, emailResponse.status);
          }
          
        } catch (emailError) {
          console.error('❌ Error sending email for alert:', alert.id, emailError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking listing alerts:', error);
  }
} 