"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createOrUpdateUserProfile } from "@/lib/user-management";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      // Create or update user profile in Firestore when user signs in
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          const isNewUser = !userSnap.exists();
          
          const profile = await createOrUpdateUserProfile(u);
          
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
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut: () => fbSignOut(auth) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 