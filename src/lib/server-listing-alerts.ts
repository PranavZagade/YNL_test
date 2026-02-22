import { adminDb } from '@/lib/firebase-admin';

// Helper function for better city matching (Re-used from frontend)
const normalizeCity = (city: string): string => {
    if (!city) return '';

    let normalized = city.toLowerCase().replace(/[^a-z0-9]/g, '');

    const cityVariations: { [key: string]: string[] } = {
        'newyork': ['newyork', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'statenisland'],
        'losangeles': ['losangeles', 'la', 'hollywood', 'beverlyhills', 'santamonica', 'venice'],
        'chicago': ['chicago', 'chitown', 'windycity'],
        'houston': ['houston', 'htx', 'spacecity'],
        'phoenix': ['phoenix', 'phx', 'valleyofthesun', 'arizona'],
        'austin': ['austin', 'atx', 'aus', 'texas'],
        'sandiego': ['sandiego', 'sd', 'americasfinestcity'],
        'dallas': ['dallas', 'dfw', 'bigd'],
        'tempe': ['tempe', 'phx', 'arizona'],
        'scottsdale': ['scottsdale', 'phx', 'westmost'],
        'gilbert': ['gilbert', 'phx', 'arizona'],
        'chandler': ['chandler', 'phx', 'innovationcity'],
        'glendale': ['glendale', 'phx', 'burbank', 'arizona', 'california'],
    };

    for (const [standard, variations] of Object.entries(cityVariations)) {
        if (variations.includes(normalized)) {
            return standard;
        }
    }

    return normalized;
};

// Interface mimicking frontend structure
interface Listing {
    id: string;
    title?: string;
    propertyName?: string;
    address?: string;
    city: string;
    apartmentType: string;
    moveIn: any;
    moveOut: any;
    rent: string;
}

export async function checkServerListingAlerts(listingId: string, listing: Listing) {
    try {
        console.log('[SERVER] 🔍 Checking backend listing alerts for:', listingId);

        // 1. Get all active listing alerts using Firebase Admin (adminDb)
        const alertsQuery = await adminDb
            .collection('listingAlerts')
            .where('isActive', '==', true)
            .get();

        console.log('[SERVER] 🔔 Found', alertsQuery.size, 'active alerts to check.');

        // 2. Check if we've already sent emails for this listing
        const sentEmailsQuery = await adminDb
            .collection('sentListingAlertEmails')
            .where('listingId', '==', listingId)
            .get();

        const sentAlertIds = new Set(sentEmailsQuery.docs.map(doc => doc.data().alertId));

        const matchingAlerts: any[] = [];

        // 3. Match the data
        alertsQuery.forEach((doc) => {
            const alert = doc.data();

            // City Matching
            const alertCity = normalizeCity(alert.city);
            const listingCity = normalizeCity(listing.city);

            if (alertCity !== listingCity) return;

            // Apartment type matching
            if (alert.apartmentType !== listing.apartmentType) return;

            // Date range matching
            const alertFromDate = alert.moveInDate.toDate();
            const alertToDate = alert.moveOutDate.toDate();

            let listingMoveIn: Date;
            let listingMoveOut: Date;

            // Unpack Timestamp or string types from admin approval payload
            if (listing.moveIn?.toDate) {
                listingMoveIn = listing.moveIn.toDate();
            } else if (listing.moveIn instanceof Date) {
                listingMoveIn = listing.moveIn;
            } else {
                listingMoveIn = new Date(listing.moveIn);
            }

            if (listing.moveOut?.toDate) {
                listingMoveOut = listing.moveOut.toDate();
            } else if (listing.moveOut instanceof Date) {
                listingMoveOut = listing.moveOut;
            } else {
                listingMoveOut = new Date(listing.moveOut);
            }

            // Must cover entire window
            const isDateMatch = listingMoveIn <= alertFromDate && listingMoveOut >= alertToDate;

            if (isDateMatch && !sentAlertIds.has(doc.id)) {
                matchingAlerts.push({
                    ...alert,
                    id: doc.id
                });
            }
        });

        console.log(`[SERVER] 🎯 Found ${matchingAlerts.length} total matches.`);

        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // 4. Dispatch Emails
        if (matchingAlerts.length > 0) {
            for (const alert of matchingAlerts) {
                try {
                    const userDoc = await adminDb.collection('users').doc(alert.userId).get();
                    if (!userDoc.exists) continue;

                    const userData = userDoc.data();

                    console.log(`[SERVER] 📧 Dispatching backend email to user: ${userData?.email} for matched listing: ${listingId}`);

                    // Note: you can't hit a route handler cleanly from another route handler on the server in Next.js without absolute URL
                    // so we'll fetch our own absolute endpoint for the email
                    const emailResponse = await fetch(`${BASE_URL}/api/send-listing-alert`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recipientEmail: userData?.email,
                            recipientName: userData?.displayName || userData?.email?.split('@')[0] || 'User',
                            city: alert.city,
                            moveInDate: alert.moveInDate.toDate().toISOString().split('T')[0],
                            moveOutDate: alert.moveOutDate.toDate().toISOString().split('T')[0],
                            matchedListings: [{
                                id: listingId,
                                title: listing.title || `${listing.apartmentType} in ${listing.city}`,
                                city: listing.city,
                                rent: listing.rent || 'Price not specified',
                                address: listing.address || 'Address not specified',
                                propertyName: listing.propertyName || 'Property',
                                listingUrl: `${BASE_URL}/listing/${listingId}`
                            }]
                        }),
                    });

                    if (emailResponse.ok) {
                        console.log(`[SERVER] ✅ Successfully sent to ${userData?.email}`);

                        // Mark sent
                        await adminDb.collection('sentListingAlertEmails').doc(`${listingId}_${alert.id}`).set({
                            listingId: listingId,
                            alertId: alert.id,
                            userId: alert.userId,
                            sentAt: new Date(),
                            email: userData?.email
                        });
                    } else {
                        console.error(`[SERVER] ❌ Failed to send to ${userData?.email}, status: ${emailResponse.status}`);
                    }
                } catch (innerError) {
                    console.error('[SERVER] ❌ Error iterating over matching alert: ', innerError);
                }
            }
        }

    } catch (error) {
        console.error('[SERVER] ❌ Error checking backend listing alerts:', error);
    }
}
