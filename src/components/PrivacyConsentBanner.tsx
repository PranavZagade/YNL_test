'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already agreed to privacy policy
    const hasAgreed = localStorage.getItem('privacy-policy-agreed');
    if (!hasAgreed) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('privacy-policy-agreed', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // You could redirect to a different page or show a message
    // For now, we'll just hide the banner
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              We use cookies and collect data to provide you with the best experience on our platform. 
              By continuing to use YourNextLease, you agree to our{' '}
              <Link 
                href="/privacy" 
                className="text-red-600 hover:text-red-700 underline font-medium"
                target="_blank"
              >
                Privacy Policy
              </Link>
              {' '}and consent to our data collection practices.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAgree}
              className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 