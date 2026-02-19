'use client';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { MapPin, Users, Building2, FileText, Zap, Home as HomeIcon, CalendarDays, Clock3 } from 'lucide-react';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { AdminListing } from '@/lib/admin-mock-data';


// Helper to convert Google Drive links to viewable URLs
const getGoogleDriveImageUrl = (url: string) => {
    if (!url) return null;
    try {
        // If it's already a direct link or other image host
        if (!url.includes('drive.google.com')) return url;

        let id = '';

        // Regex to find ID
        const matchFileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const matchParamId = url.match(/id=([a-zA-Z0-9_-]+)/);

        if (matchFileId && matchFileId[1]) {
            id = matchFileId[1];
        } else if (matchParamId && matchParamId[1]) {
            id = matchParamId[1];
        }

        if (id) {
            // Use our server-side proxy to fetch restricted images using Service Account credentials
            return `/api/admin/proxy-image?id=${id}`;
        }
        return url;
    } catch (e) {
        console.error('Error parsing drive URL:', e);
        return url;
    }
};

const safeRender = (value: unknown): string => {
    if (!value) return '';
    return String(value);
};

interface ListingPreviewProps {
    listing: AdminListing;
}

export default function ListingPreview({ listing }: ListingPreviewProps) {
    if (!listing) return <div className="p-8 text-center">No listing data available.</div>;

    // Process images
    const displayImages = listing.imageUrls && listing.imageUrls.length > 0
        ? listing.imageUrls.map(getGoogleDriveImageUrl).filter(Boolean) as string[]
        : [];

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Image Carousel */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-64 sm:h-80 md:h-96 lg:h-[400px] bg-gray-100"
            >
                {displayImages.length > 0 ? (
                    <Swiper
                        modules={[Pagination, Autoplay, Navigation]}
                        spaceBetween={0}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        navigation
                        autoplay={{ delay: 5000 }}
                        className="h-full w-full"
                    >
                        {displayImages.map((img, index) => (
                            <SwiperSlide key={index}>
                                <div className="relative w-full h-full">
                                    <Image
                                        src={img}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <HomeIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No Images Provided</p>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="p-6 md:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{listing.title}</h1>
                        {listing.propertyName && (
                            <div className="text-lg font-medium text-gray-600">{listing.propertyName}</div>
                        )}
                        <div className="flex items-center text-gray-500">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span>{listing.address}, {listing.city} {listing.zipCode}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline md:text-right">
                        <span className="text-3xl font-bold text-red-600">${listing.rent}</span>
                        <span className="text-gray-600 ml-1">/month</span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this place</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {listing.description || 'No description provided.'}
                    </p>
                </div>

                {/* Key Details Grid */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Lease Duration */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <CalendarDays className="w-5 h-5 mr-3 text-blue-600" />
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lease</span>
                                <div className="font-medium text-gray-900">{safeRender(listing.leaseDuration) || 'Not specified'}</div>
                            </div>
                        </div>

                        {/* Move In */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Clock3 className="w-5 h-5 mr-3 text-orange-600" />
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Move In</span>
                                <div className="font-medium text-gray-900">{safeRender(listing.moveIn) || 'Immediate'}</div>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Users className="w-5 h-5 mr-3 text-purple-600" />
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</span>
                                <div className="font-medium text-gray-900">{safeRender(listing.genderPref) || 'Any'}</div>
                            </div>
                        </div>

                        {/* Room Type */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <HomeIcon className="w-5 h-5 mr-3 text-teal-600" />
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room Type</span>
                                <div className="font-medium text-gray-900">{listing.apartmentType || 'Standard'}</div>
                            </div>
                        </div>

                        {/* Listing Type */}
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Listing Type</span>
                                <div className="font-medium text-gray-900">{listing.listingType || 'Sublease'}</div>
                            </div>
                        </div>

                        {/* Extra Utilities */}
                        {listing.extraUtilityCost && (
                            <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Zap className="w-5 h-5 mr-3 text-yellow-600" />
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extra Utilities</span>
                                    <div className="font-medium text-gray-900">${listing.extraUtilityCost}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Amenities Section */}
                {(listing.whatsIncluded?.length > 0 || listing.roomAmenities?.length > 0 || listing.communityAmenities?.length > 0) && (
                    <div className="space-y-6">
                        {/* What's Included */}
                        {listing.whatsIncluded?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Included in Rent</h3>
                                <div className="flex flex-wrap gap-2">
                                    {listing.whatsIncluded.map((item, i) => (
                                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                                            <Zap className="w-3.5 h-3.5 mr-1.5" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Room Amenities */}
                        {listing.roomAmenities?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {listing.roomAmenities.map((item, i) => (
                                        <div key={i} className="flex items-center text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 text-red-600">
                                                <HomeIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Community Amenities */}
                        {listing.communityAmenities?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {listing.communityAmenities.map((item, i) => (
                                        <div key={i} className="flex items-center text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
