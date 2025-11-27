'use client';

import { useState } from 'react';
import type { VerifiedUniversity } from '@/lib/user-management';
import { UNIVERSITY_CONFIG } from '@/lib/user-management';

// Re-export for convenience
export type { VerifiedUniversity } from '@/lib/user-management';
export { getUniversityFromEmail, UNIVERSITY_CONFIG } from '@/lib/user-management';

// Helper to get shortName from config (handles old data without shortName)
function getShortName(university: VerifiedUniversity): string {
  // First try stored shortName
  if (university.shortName) return university.shortName;
  // Fallback: look up from config using domain
  const config = UNIVERSITY_CONFIG[university.domain];
  if (config?.shortName) return config.shortName;
  // Last resort: use full name
  return university.name;
}

// Badge size variants
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface VerifiedBadgeProps {
  university: VerifiedUniversity | null | undefined;
  size?: BadgeSize;
  showTooltip?: boolean;
  className?: string;
}

const sizeConfig: Record<BadgeSize, { shield: string; check: string }> = {
  xs: { shield: 'w-3.5 h-3.5', check: 'w-2 h-2' },
  sm: { shield: 'w-4 h-4', check: 'w-2.5 h-2.5' },
  md: { shield: 'w-5 h-5', check: 'w-3 h-3' },
  lg: { shield: 'w-6 h-6', check: 'w-3.5 h-3.5' },
};

// Shared shield icon component to avoid duplication
function ShieldIcon({ 
  color, 
  shieldClass, 
  checkClass 
}: { 
  color: string; 
  shieldClass: string; 
  checkClass: string;
}) {
  return (
    <span 
      className={`${shieldClass} relative inline-flex items-center justify-center`}
      style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))' }}
    >
      <svg viewBox="0 0 24 24" fill={color} className="w-full h-full">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
      </svg>
      <svg 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${checkClass} absolute`}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export default function VerifiedBadge({ 
  university, 
  size = 'sm', 
  showTooltip = true,
  className = '' 
}: VerifiedBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!university?.isVerified) return null;
  
  const { shield, check } = sizeConfig[size];
  
  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ShieldIcon color={university.color} shieldClass={shield} checkClass={check} />
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 
                     bg-gray-900 text-white text-xs font-medium rounded-lg 
                     whitespace-nowrap z-50 shadow-lg
                     animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-1.5">
            <ShieldIcon color={university.color} shieldClass="w-3 h-3" checkClass="w-1.5 h-1.5" />
            <span>{getShortName(university)} Verified</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Inline badge variant (no hover state, just title attribute)
export function VerifiedBadgeInline({ 
  university, 
  size = 'sm',
  className = '' 
}: Omit<VerifiedBadgeProps, 'showTooltip'>) {
  if (!university?.isVerified) return null;
  
  const { shield, check } = sizeConfig[size];
  
  return (
    <span 
      className={`inline-flex items-center ${className}`}
      title={`${getShortName(university)} Verified`}
    >
      <ShieldIcon color={university.color} shieldClass={shield} checkClass={check} />
    </span>
  );
}
