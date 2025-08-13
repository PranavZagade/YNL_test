import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status?: string;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createOrUpdateUserProfile(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
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
      
      await updateDoc(userRef, updateData);
    } else {
      // Create new user
      await setDoc(userRef, userData);
    }

    return userData as UserProfile;
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