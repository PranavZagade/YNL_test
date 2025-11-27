import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getUserProfile, updateEmailNotificationPreference } from '@/lib/user-management';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [status, setStatus] = useState('Available');
  const [lastSeen] = useState(new Date().toLocaleString()); // Placeholder
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [muteChats, setMuteChats] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Error handling states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        setIsLoading(true);
        setLoadingProfile(true);
        setProfileLoadError(null);
        setError(null);
        
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setEmailNotifications(profile.emailNotifications);
            setDisplayName(profile.displayName || user.displayName || '');
            setStatus(profile.status || 'Available');
            setAvatarUrl(profile.photoURL || user.photoURL || '');
          }
        } catch (error: any) {
          console.error('Error loading user profile:', error);
          let errorMessage = 'Failed to load profile. ';
          
          if (error?.code === 'permission-denied') {
            errorMessage += 'You don\'t have permission to access this profile.';
          } else if (error?.code === 'not-found') {
            errorMessage += 'Profile not found.';
          } else if (error?.code === 'unavailable') {
            errorMessage += 'Service temporarily unavailable. Please try again.';
          } else if (error?.message) {
            errorMessage += error.message;
          } else {
            errorMessage += 'Please try again later.';
          }
          
          setProfileLoadError(errorMessage);
          setError(errorMessage);
        } finally {
          setIsLoading(false);
          setLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleEmailNotificationToggle = async (enabled: boolean) => {
    if (!user) return;
    
    try {
      setError(null);
      await updateEmailNotificationPreference(user.uid, enabled);
      setEmailNotifications(enabled);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error: any) {
      console.error('Error updating email notification preference:', error);
      let errorMessage = 'Failed to update email preferences. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'You don\'t have permission to update settings.';
      } else if (error?.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);
      
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('File size too large. Please select an image under 5MB.');
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select a valid image file (JPEG, PNG, GIF).');
          return;
        }
        
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
      }
    } catch (error: any) {
      console.error('Error handling avatar change:', error);
      setError('Failed to process image. Please try again.');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSaveError(null);
      setError(null);
      
      // Validate input fields
      if (!displayName.trim()) {
        setSaveError('Display name is required.');
        return;
      }
      
      if (displayName.trim().length < 2) {
        setSaveError('Display name must be at least 2 characters long.');
        return;
      }
      
      if (displayName.trim().length > 50) {
        setSaveError('Display name must be less than 50 characters.');
        return;
      }
      
      if (status.trim().length > 100) {
        setSaveError('Status message must be less than 100 characters.');
        return;
      }
      
      // Simulate API call (replace with actual profile update logic)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      let errorMessage = 'Failed to save profile. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'You don\'t have permission to update your profile.';
      } else if (error?.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setSaveError(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      setLogoutError(null);
      setError(null);
      
      await signOut();
      router.push('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      let errorMessage = 'Failed to sign out. ';
      
      if (error?.code === 'auth/network-request-failed') {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage += 'Too many attempts. Please wait a moment and try again.';
      } else if (error?.code === 'auth/operation-not-allowed') {
        errorMessage += 'Sign out is not allowed. Please contact support.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setLogoutError(errorMessage);
      setError(errorMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setDeleteError(null);
      setError(null);
      
      if (!user) {
        throw new Error('No user found');
      }
      
      console.log('🗑️ Starting account deletion process for user:', user.uid);
      
      // 1. Delete user's listings and associated images
      console.log('📋 Deleting user listings...');
      const listingsRef = collection(db, 'listings');
      const listingsQuery = query(listingsRef, where('userId', '==', user.uid));
      const listingsSnapshot = await getDocs(listingsQuery);
      
      let cloudinaryDeletions = 0;
      let cloudinaryErrors = 0;
      
      for (const listingDoc of listingsSnapshot.docs) {
        const listingData = listingDoc.data();
        
        // Delete images from Cloudinary
        if (Array.isArray(listingData.imageUrls) && listingData.imageUrls.length > 0) {
          for (const imageUrl of listingData.imageUrls) {
            try {
              const matches = imageUrl.match(/upload\/.*\/([a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/);
              const publicId = matches ? matches[1] : null;
              if (publicId) {
                const response = await fetch('/api/delete-cloudinary-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ publicId }),
                });
                if (response.ok) {
                  cloudinaryDeletions++;
                } else {
                  cloudinaryErrors++;
                }
              }
            } catch (error) {
              cloudinaryErrors++;
            }
          }
        }
        
        // Delete listing document
        await deleteDoc(listingDoc.ref);
      }
      
      console.log('✅ Deleted', listingsSnapshot.size, 'listings');
      console.log('🖼️ Cloudinary images deleted:', cloudinaryDeletions, 'Errors:', cloudinaryErrors);
      
      // 2. Delete user's saved listings
      console.log('💾 Deleting saved listings...');
      const savedListingsRef = collection(db, 'savedListings');
      const savedListingsQuery = query(savedListingsRef, where('userId', '==', user.uid));
      const savedListingsSnapshot = await getDocs(savedListingsQuery);
      
      for (const savedDoc of savedListingsSnapshot.docs) {
        await deleteDoc(savedDoc.ref);
      }
      
      console.log('✅ Deleted', savedListingsSnapshot.size, 'saved listings');
      
      // 3. Delete user's conversations
      console.log('💬 Deleting conversations...');
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(conversationsRef, where('participants', 'array-contains', user.uid));
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      for (const convDoc of conversationsSnapshot.docs) {
        await deleteDoc(convDoc.ref);
      }
      
      console.log('✅ Deleted', conversationsSnapshot.size, 'conversations');
      
      // 4. Delete user's listing alerts
      console.log('🔔 Deleting listing alerts...');
      const alertsRef = collection(db, 'listingAlerts');
      const alertsQuery = query(alertsRef, where('userId', '==', user.uid));
      const alertsSnapshot = await getDocs(alertsQuery);
      
      for (const alertDoc of alertsSnapshot.docs) {
        await deleteDoc(alertDoc.ref);
      }
      
      console.log('✅ Deleted', alertsSnapshot.size, 'listing alerts');
      
      // 5. Delete user's status
      console.log('📊 Deleting user status...');
      const userStatusRef = doc(db, 'userStatus', user.uid);
      try {
        await deleteDoc(userStatusRef);
      } catch (error) {
        console.log('User status not found or already deleted');
      }
      
      // 6. Delete user profile
      console.log('👤 Deleting user profile...');
      const userProfileRef = doc(db, 'users', user.uid);
      try {
        await deleteDoc(userProfileRef);
      } catch (error) {
        console.log('User profile not found or already deleted');
      }
      
      // 7. Delete sent email records
      console.log('📧 Deleting email records...');
      const sentEmailsRef = collection(db, 'sentListingAlertEmails');
      const sentEmailsQuery = query(sentEmailsRef, where('userId', '==', user.uid));
      const sentEmailsSnapshot = await getDocs(sentEmailsQuery);
      
      for (const emailDoc of sentEmailsSnapshot.docs) {
        await deleteDoc(emailDoc.ref);
      }
      
      console.log('✅ Deleted', sentEmailsSnapshot.size, 'email records');
      
      // 8. Delete user from Firebase Auth
      console.log('🔥 Deleting user from Firebase Auth...');
      
      try {
        // Try to delete the user directly first
        await user.delete();
        console.log('✅ User deleted from Firebase Auth successfully');
      } catch (authError: any) {
        if (authError.code === 'auth/requires-recent-login') {
          // Force sign out the user and redirect to home
          console.log('⚠️ Re-authentication required, forcing sign out');
          console.log('✅ Data cleanup completed successfully');
          
          try {
            // Sign out the user immediately
            await signOut();
            console.log('✅ User signed out successfully');
            
            // Close modal and show success message
            setShowDeleteModal(false);
            setShowToast(true);
            
            // Show message about account deletion
            setDeleteError('Account data deleted successfully! You have been signed out. Please log back in to complete account deletion.');
            setError('Account data deleted successfully! You have been signed out. Please log back in to complete account deletion.');
            
            // Redirect to home immediately
            router.push('/');
            
          } catch (signOutError) {
            console.error('Error signing out user:', signOutError);
            // Even if sign out fails, redirect to home
            router.push('/');
          }
          
          return; // Exit early since we've handled the re-authentication case
        } else {
          // Handle other Firebase Auth errors
          console.error('Firebase Auth deletion error:', authError);
          throw new Error(`Failed to delete account: ${authError.message || 'Unknown error'}`);
        }
      }
      
      console.log('✅ Account deletion completed successfully');
      
      // Close modal and show success
      setShowDeleteModal(false);
      setShowToast(true);
      
      // Redirect to home after successful deletion
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'You don\'t have permission to delete your account.';
      } else if (error?.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else if (error?.code === 'resource-exhausted') {
        errorMessage += 'Too many deletion attempts. Please try again later.';
      } else if (error?.code === 'auth/requires-recent-login') {
        errorMessage += 'Please log out and log back in before deleting your account.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setDeleteError(errorMessage);
      setError(errorMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-red-50/30 to-white rounded-3xl shadow-2xl mt-6 sm:mt-8 lg:mt-12 flex flex-col gap-8 sm:gap-10 border border-red-100/50 backdrop-blur-sm">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800 font-medium">Loading profile...</span>
          </div>
        </div>
      )}
      
      {/* Profile Load Error */}
      {profileLoadError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Failed to Load Profile</p>
              <p className="text-red-700 text-sm mt-1">{profileLoadError}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
      {/* Profile Display Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl p-6 sm:p-8 border border-red-100 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-100/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
            <div className="relative group">
              <Avatar className="w-32 h-32 lg:w-28 lg:h-28 border-4 border-white shadow-xl ring-4 ring-red-100 transition-all duration-300 group-hover:ring-red-200 group-hover:scale-105">
                <AvatarImage src={avatarUrl} alt={displayName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-4xl">
                  {displayName ? displayName[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Change Photo Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <label className="cursor-pointer text-white text-xs font-medium">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  Change Photo
                </label>
              </div>
            </div>
            
            {/* Online Status Indicator */}
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </div>
          </div>
          
          {/* Profile Info Section */}
          <div className="flex-1 flex flex-col gap-4 w-full text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center justify-center lg:justify-start gap-2">
                {displayName || 'User'}
                <VerifiedBadge university={userProfile?.verifiedUniversity} size="lg" />
              </h1>
              <p className="text-gray-600 text-lg break-all">{user?.email}</p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {/* University Verified Badge */}
              {userProfile?.verifiedUniversity?.isVerified && (
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ 
                    backgroundColor: `${userProfile.verifiedUniversity.color}15`,
                    borderColor: `${userProfile.verifiedUniversity.color}40`,
                    color: '#1f2937'
                  }}
                >
                  <VerifiedBadge university={userProfile.verifiedUniversity} size="sm" showTooltip={false} />
                  <span>{userProfile.verifiedUniversity.name}</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {status}
              </div>
              
              {/* Member Since Badge */}
              <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium border border-purple-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {new Date().getFullYear()}
              </div>
            </div>
            
            {/* Last Seen */}
            <div className="text-gray-500 text-sm">
              Last active: {lastSeen}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Section */}
      {editing && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-lg">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
          
          <div className="relative">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Save Error Display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Validation Error</p>
                    <p className="text-red-700 text-sm mt-1">{saveError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSaveError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)} 
                    className={`rounded-xl h-12 transition-colors ${
                      saveError && !displayName.trim() 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your display name" 
                  />
                  {saveError && !displayName.trim() && (
                    <p className="text-red-600 text-xs mt-1">Display name is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status Message</label>
                  <Input 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className={`rounded-xl h-12 transition-colors ${
                      saveError && status.length > 100 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="How are you feeling?" 
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Optional</span>
                    <span className={`text-xs ${status.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                      {status.length}/100
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  error && error.includes('image') 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="profile-photo" />
                  <label htmlFor="profile-photo" className="cursor-pointer">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </label>
                </div>
                {error && error.includes('image') && (
                  <p className="text-red-600 text-xs mt-2">{error}</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl h-12 shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-300 w-full sm:w-auto" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </div>
                  )}
                </Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all w-full sm:w-auto" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      )}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg z-50 transition text-sm sm:text-base">Profile updated!</div>
      )}

      {/* App Settings */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl p-6 sm:p-8 border border-green-100 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-green-200/20 to-transparent rounded-full -translate-y-10 -translate-x-10"></div>
        
        <div className="relative">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            App Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Dark Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Mute Chats</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Sound On</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Show Last Seen</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Show Profile Photo</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Email Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Management */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-100 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-orange-200/20 to-transparent rounded-full translate-y-14 translate-x-14"></div>
        
        <div className="relative">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Management
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              onClick={handleLogout} 
              className="h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 w-full sm:w-auto flex items-center gap-2" 
              disabled={loggingOut}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? 'Logging Out...' : 'Logout'}
            </Button>
            
            {/* Logout Error Display */}
            {logoutError && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-xs">{logoutError}</p>
              </div>
            )}
            
            <Button 
              type="button" 
              onClick={() => setShowDeleteModal(true)} 
              className="h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg transition-all duration-300 w-full sm:w-auto flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </Button>
            
            {/* Delete Account Error Display */}
            {deleteError && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-xs">{deleteError}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-orange-800">
                <p className="font-medium">Important:</p>
                <p className="mt-1">Deleting your account will permanently remove all your data, listings, and preferences. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-xs w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-red-600 mb-4">Delete Account?</h3>
            <p className="text-gray-700 mb-6 text-center text-sm sm:text-base">This action is permanent and cannot be undone. Are you sure you want to delete your account?</p>
            <div className="flex gap-3 w-full">
              <Button type="button" className="bg-gray-100 text-gray-700 w-1/2" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button type="button" className="bg-red-600 text-white w-1/2" onClick={handleDeleteAccount}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 