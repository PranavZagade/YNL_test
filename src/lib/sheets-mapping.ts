
// ==========================================
// COLUMN INDEX MAPPING
// ==========================================
export const COLUMN_MAP = {
    TIMESTAMP: 0,
    NAME: 1,
    EMAIL: 2,
    CONTACT_NUMBER: 3,
    CONTACT_METHOD: 4,
    TITLE: 5,
    LISTING_TYPE: 6,
    GENDER_PREF: 7,
    MOVE_IN: 8,
    MOVE_OUT: 9,
    LEASE_DURATION: 10,
    APARTMENT_TYPE: 11,
    AVAILABLE_FOR_VIEWING: 12,
    PREFERRED_ROOMMATE: 13,
    NUM_OCCUPANTS: 14,
    PROPERTY_NAME: 15,
    ADDRESS: 16,
    CITY: 17,
    ZIP_CODE: 18,
    MAPS_LINK: 19,
    DESCRIPTION: 20,
    RENT: 21,
    WHATS_INCLUDED: 22,
    IMAGE_URLS: 23,
    EXTRA_UTILITY_COST: 24,
    TERMS: 25,
    DEPOSIT: 26,
    STATUS: 28
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const parseCurrency = (value: string): string => {
    if (!value) return '';
    // Remove '$', ',', and whitespace
    const clean = value.toString().replace(/[$,\s]/g, '');
    return clean;
};


const extractDriveId = (url: string): string | null => {
    // Matches /d/ID/ or id=ID
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
};

const parseImageUrls = (value: string): string[] => {
    if (!value) return [];

    // Split by comma or newline
    const rawUrls = value.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);

    return rawUrls.map(url => {
        const id = extractDriveId(url);
        if (id) {
            return `/api/admin/proxy-image?id=${id}`;
        }
        return url;
    });
};

const parseList = (value: string): string[] => {
    if (!value) return [];
    return value.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
};

const parseDate = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
};

// ==========================================
// MAIN TRANSFORM FUNCTION
// ==========================================

export const transformSheetRow = (row: string[], rowIndex: number): Record<string, unknown> | null => {
    try {
        if (!row[COLUMN_MAP.TIMESTAMP]) return null;

        const id = `sheet_row_${rowIndex + 1}`;

        // Map to the shape expected by ListingForm's mapInitialDataToForm
        // We use the keys that match the Firebase Schema (mostly camelCase)
        return {
            id,
            timestamp: row[COLUMN_MAP.TIMESTAMP],

            // User Info
            email: (row[COLUMN_MAP.EMAIL] || '').trim(),
            name: (row[COLUMN_MAP.NAME] || '').trim(),
            contacts: [row[COLUMN_MAP.CONTACT_NUMBER] || ''],
            contactMethod: row[COLUMN_MAP.CONTACT_METHOD],

            // Core Listing
            title: row[COLUMN_MAP.TITLE],
            description: row[COLUMN_MAP.DESCRIPTION],

            // Type & Dates
            listingType: row[COLUMN_MAP.LISTING_TYPE],
            apartmentType: row[COLUMN_MAP.APARTMENT_TYPE],
            genderPref: row[COLUMN_MAP.GENDER_PREF],

            moveIn: parseDate(row[COLUMN_MAP.MOVE_IN]),
            moveOut: parseDate(row[COLUMN_MAP.MOVE_OUT]),
            leaseDuration: row[COLUMN_MAP.LEASE_DURATION],
            availableForViewing: row[COLUMN_MAP.AVAILABLE_FOR_VIEWING],

            // Roommate
            preferredRoommateType: row[COLUMN_MAP.PREFERRED_ROOMMATE],
            numOccupants: row[COLUMN_MAP.NUM_OCCUPANTS] || '0',
            occupancyType: 'Private Room', // Default if not in sheet ?? Or infer?

            // Location
            propertyName: row[COLUMN_MAP.PROPERTY_NAME],
            address: row[COLUMN_MAP.ADDRESS],
            city: row[COLUMN_MAP.CITY],
            zipCode: row[COLUMN_MAP.ZIP_CODE],
            mapsLink: row[COLUMN_MAP.MAPS_LINK],
            proximityLandmarks: '', // Missing in Sheet?

            // Financial
            rent: parseCurrency(row[COLUMN_MAP.RENT]),
            extraUtilityCost: row[COLUMN_MAP.EXTRA_UTILITY_COST],
            depositAmount: parseCurrency(row[COLUMN_MAP.DEPOSIT]),

            // Lists
            whatsIncluded: parseList(row[COLUMN_MAP.WHATS_INCLUDED]),
            imageUrls: parseImageUrls(row[COLUMN_MAP.IMAGE_URLS]),

            // Defaults for fields not in Sheet
            roomAmenities: [],
            communityAmenities: [],

            // Metadata for Admin
            status: row[COLUMN_MAP.STATUS], // To filter out "ADDED" rows
            transit: '',
            commute: '',
            distance: '',
            stores: '',
            hideNumber: false,
            personality: '',
            terms: false, // User must accept terms in the form
        };
    } catch (error) {
        console.error(`Error parsing row ${rowIndex + 1}:`, error);
        return null;
    }
};
