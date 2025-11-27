import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

// ============================================
// University Verification Types & Config
// ============================================

export interface VerifiedUniversity {
  domain: string;
  name: string;
  shortName: string;
  color: string;
  isVerified: boolean;
}

// Centralized university configuration - add new universities here
export const UNIVERSITY_CONFIG: Record<string, Omit<VerifiedUniversity, 'isVerified'>> = {
  'asu.edu': {
    domain: 'asu.edu',
    name: 'Arizona State University',
    shortName: 'ASU',
    color: '#FFC627', // ASU Gold
  },
  // Future universities can be added here:
  // 'ucla.edu': { domain: 'ucla.edu', name: 'UCLA', shortName: 'UCLA', color: '#2774AE' },
  // 'utexas.edu': { domain: 'utexas.edu', name: 'UT Austin', shortName: 'UT', color: '#BF5700' },
};

/**
 * Check if an email belongs to a supported university
 * Returns the university config if verified, null otherwise
 */
export function getUniversityFromEmail(email: string | null | undefined): VerifiedUniversity | null {
  if (!email) return null;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  const config = UNIVERSITY_CONFIG[domain];
  if (!config) return null;
  
  return {
    ...config,
    isVerified: true,
  };
}

/**
 * Check if a user should be verified based on their auth provider and email
 * Only Google OAuth with university email gets verified
 */
export function shouldVerifyUser(email: string | null | undefined, providerId: string): VerifiedUniversity | null {
  // Only verify Google OAuth users
  if (providerId !== 'google.com') return null;
  
  return getUniversityFromEmail(email);
}

// ============================================
// User Profile Types
// ============================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailNotifications: boolean;
  verifiedUniversity?: VerifiedUniversity | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User Profile Functions
// ============================================

export interface CreateProfileOptions {
  providerId?: string; // e.g., 'google.com', 'password'
}

export async function createOrUpdateUserProfile(
  user: User, 
  options: CreateProfileOptions = {}
): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    // Determine auth provider
    const providerId = options.providerId || user.providerData[0]?.providerId || 'password';
    
    // Check for university verification (only for Google OAuth)
    const verifiedUniversity = shouldVerifyUser(user.email, providerId);
    
    const userData: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      emailNotifications: true, // Default to true
      createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
      updatedAt: new Date(),
    };

    // Only include photoURL if it has a valid value
    if (user.photoURL) {
      userData.photoURL = user.photoURL;
    }

    if (userSnap.exists()) {
      // Update existing user
      const updateData: Partial<UserProfile> = {
        displayName: userData.displayName,
        updatedAt: userData.updatedAt,
      };
      
      // Only include photoURL in update if it has a valid value
      if (user.photoURL) {
        updateData.photoURL = user.photoURL;
      }
      
      // Update verification status if user signs in with Google OAuth
      // This allows users to "upgrade" their verification status
      if (verifiedUniversity) {
        updateData.verifiedUniversity = verifiedUniversity;
        console.log('🎓 User verified as:', verifiedUniversity.name);
      }
      
      await updateDoc(userRef, updateData);
      
      // Return merged data
      const existingData = userSnap.data();
      return {
        ...existingData,
        ...updateData,
        verifiedUniversity: verifiedUniversity || existingData.verifiedUniversity || null,
      } as UserProfile;
    } else {
      // Create new user with verification status
      const newUserData = {
        ...userData,
        verifiedUniversity: verifiedUniversity || null,
      };
      
      await setDoc(userRef, newUserData);
      
      if (verifiedUniversity) {
        console.log('🎓 New user verified as:', verifiedUniversity.name);
      }
      
      return newUserData as UserProfile;
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function updateEmailNotificationPreference(uid: string, enabled: boolean) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      emailNotifications: enabled,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating email notification preference:', error);
    throw error;
  }
}
