export interface AdminListing {
    id: string;
    timestamp: string;
    submissionDate: string;
    name: string;
    email: string;
    title: string;
    rent: number;
    city: string;
    listingType: string;
    propertyName?: string;
    description: string;
    imageUrls: string[];
    roomAmenities: string[];
    communityAmenities: string[];
    whatsIncluded: string[];
    leaseDuration: string;
    moveIn: string;
    moveOut: string;
    genderPref: string;
    contactMethod: string;
    numOccupants: number;
    depositAmount?: number;
    availableForViewing?: string;
    preferredRoommateType?: string;
    occupancyType?: string;
    apartmentType?: string;
    address?: string;
    zipCode?: string;
    contacts?: string;
    mapsLink?: string;
    extraUtilityCost?: string;
}

export const MOCK_LISTINGS: AdminListing[] = [
    {
        id: 'sheet_001',
        timestamp: '2024-02-18T10:30:00Z',
        submissionDate: 'Feb 18, 2024',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.asu.edu',
        title: 'Private Room in 2B2B near ASU',
        rent: 850,
        city: 'Tempe',
        listingType: 'Sublease',
        propertyName: 'The District',
        description: 'Looking for someone to take over my lease for the summer (May - July). Private room with attached bath in a 4x4 unit. Fully furnished!',
        imageUrls: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        roomAmenities: ['Furnished', 'Private Bath', 'Walk-in Closet'],
        communityAmenities: ['Pool', 'Gym', 'Study Lounge'],
        whatsIncluded: ['WiFi', 'Water', 'Trash'],
        leaseDuration: '3 months',
        moveIn: '2024-05-15',
        moveOut: '2024-07-31',
        genderPref: 'Female',
        contactMethod: 'Phone',
        numOccupants: 1,
    },
    {
        id: 'sheet_002',
        timestamp: '2024-02-18T14:15:00Z',
        submissionDate: 'Feb 18, 2024',
        name: 'Michael Chen',
        email: 'mchen22@gmail.com',
        title: 'Master Bedroom in Luxury House',
        rent: 1200,
        city: 'Phoenix',
        listingType: 'Long Term',
        propertyName: 'Downtown Luxury',
        description: 'Spacious master bedroom in a 3-bedroom house. 10 mins drive to downtown. Garage parking included.',
        imageUrls: [
            'https://images.unsplash.com/photo-1502005229762-cf1afd34cd75?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
            'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        roomAmenities: ['Unfurnished', 'Private Bath', 'Balcony'],
        communityAmenities: ['Gated', 'Parking'],
        whatsIncluded: ['Parking'],
        leaseDuration: '12 months',
        moveIn: '2024-03-01',
        moveOut: '2025-02-28',
        genderPref: 'Any',
        contactMethod: 'Email',
        numOccupants: 0
    },
    {
        id: 'sheet_003',
        timestamp: '2024-02-19T09:00:00Z',
        submissionDate: 'Feb 19, 2024',
        name: 'Emily Davis',
        email: 'edavis@asu.edu',
        title: 'Shared Room in 4B2B',
        rent: 550,
        city: 'Tempe',
        listingType: 'Sublease',
        propertyName: 'University House',
        description: 'Affordable shared room option right next to campus. Great for students!',
        imageUrls: [], // Testing empty images
        roomAmenities: ['Furnished', 'Shared Bath'],
        communityAmenities: ['Pool', 'Gym', 'Rooftop'],
        whatsIncluded: ['All Utilities'],
        leaseDuration: '6 months',
        moveIn: '2024-08-01',
        moveOut: '2024-12-31',
        genderPref: 'Female',
        contactMethod: 'Text',
        numOccupants: 3
    }
];
