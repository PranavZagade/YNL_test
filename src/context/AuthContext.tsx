"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createOrUpdateUserProfile, UserProfile, VerifiedUniversity } from "@/lib/user-management";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh profile from Firestore
  const refreshProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      // Create or update user profile in Firestore when user signs in
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          const isNewUser = !userSnap.exists();
          
          // Get the auth provider ID for verification check
          const providerId = u.providerData[0]?.providerId || 'password';
          
          // Create/update profile with provider info for university verification
          const profile = await createOrUpdateUserProfile(u, { providerId });
          setUserProfile(profile);
          
          // Log verification status
          if (profile.verifiedUniversity?.isVerified) {
            console.log('🎓 User is verified:', profile.verifiedUniversity.name);
          }
          
          // Send welcome email for new users only
          if (isNewUser) {
            try {
              console.log('Sending welcome email to new user:', u.email);
              const response = await fetch('/api/send-welcome-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userEmail: u.email,
                  userName: u.displayName || u.email?.split('@')[0] || 'User'
                }),
              });
              
              if (response.ok) {
                console.log('Welcome email sent successfully');
              } else {
                console.error('Failed to send welcome email:', response.status);
              }
            } catch (emailError) {
              console.error('Error sending welcome email:', emailError);
            }
          }
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signOut: handleSignOut,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Convenience hook to get just the verification status
export function useVerifiedUniversity(): VerifiedUniversity | null {
  const { userProfile } = useAuth();
  return userProfile?.verifiedUniversity || null;
}
