"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function AuthModal({ open, onClose, mode: initialMode = "login" }: { open: boolean; onClose: () => void; mode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // When modal opens, set mode to initialMode
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setError(null);
      setLoading(false);
      setMode('login');
    }
  }, [open]);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting Google sign-in...');
      const provider = new GoogleAuthProvider();
      // Add mobile-specific configuration
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      onClose();
    } catch (e: any) {
      // Handle popup-closed-by-user gracefully without showing as error
      if (e.code === 'auth/popup-closed-by-user') {
        console.log('User cancelled Google sign-in popup');
        // Don't show this as an error - user just cancelled
        setLoading(false);
        return;
      }
      
      // Log other errors for debugging
      console.error('Google sign-in error:', e);
      let errorMessage = "Google sign-in failed";
      
      if (e.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by your browser. Please allow popups and try again.";
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email using a different sign-in method. Please use email/password sign-in.";
      } else if (e.code === 'auth/credential-already-in-use') {
        errorMessage = "This account is already linked to another sign-in method. Please use the original sign-in method.";
      } else if (e.code === 'auth/operation-not-allowed') {
        errorMessage = "Google sign-in is not enabled. Please contact support.";
      } else if (e.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google sign-in. Please contact support.";
      } else if (e.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Form submission started...');
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        console.log('Creating user account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          try {
            await updateProfile(userCredential.user, { displayName: fullName });
            console.log('User profile updated successfully');
          } catch (profileErr: any) {
            console.error('Profile update error:', profileErr);
            setError('Account created, but failed to save your name.');
            setLoading(false);
            return;
          }
        }
        console.log('Signup successful');
        onClose();
      } else {
        // Login validation
        if (!email.trim()) {
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }
        console.log('Logging in user...', { email });
        console.log('Note: If you see a Firebase error below, this is expected when testing with invalid credentials.');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful');
        onClose();
      }
    } catch (err: any) {
      console.log('Authentication attempt failed:', { 
        code: err.code, 
        message: err.message,
        email: email,
        mode: mode 
      });
      // User-friendly error messages for ALL possible Firebase auth errors
      let msg = 'Something went wrong. Please try again.';
      if (err.code) {
        switch (err.code) {
          // Email/Password Authentication Errors
          case 'auth/email-already-in-use':
            msg = 'This email is already registered. Please try logging in instead.';
            break;
          case 'auth/invalid-email':
            msg = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            msg = 'Password must be at least 6 characters.';
            break;
          case 'auth/user-not-found':
            msg = 'No account found with this email. Please sign up first.';
            break;
          case 'auth/wrong-password':
            msg = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-credential':
            msg = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
            break;
          case 'auth/user-disabled':
            msg = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/operation-not-allowed':
            msg = 'Email/password sign-in is not enabled. Please use Google sign-in.';
            break;
          
          // Rate Limiting & Security Errors
          case 'auth/too-many-requests':
            msg = 'Too many failed attempts. Please wait a few minutes and try again.';
            break;
          case 'auth/account-exists-with-different-credential':
            msg = 'An account already exists with this email using a different sign-in method. Please use Google sign-in.';
            break;
          case 'auth/credential-already-in-use':
            msg = 'This account is already linked to another sign-in method. Please use the original sign-in method.';
            break;
          case 'auth/invalid-verification-code':
            msg = 'Invalid verification code. Please check and try again.';
            break;
          case 'auth/invalid-verification-id':
            msg = 'Verification session expired. Please try again.';
            break;
          case 'auth/missing-verification-code':
            msg = 'Verification code is required. Please enter the code sent to your email.';
            break;
          case 'auth/missing-verification-id':
            msg = 'Verification session not found. Please try again.';
            break;
          
          // Network & Connection Errors
          case 'auth/network-request-failed':
            msg = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/request-failed':
            msg = 'Request failed. Please try again.';
            break;
          case 'auth/timeout':
            msg = 'Request timed out. Please check your connection and try again.';
            break;
          
          // Popup & Redirect Errors
          case 'auth/popup-closed-by-user':
            // Don't show this as an error - user just cancelled
            return; // Exit early without showing error
          case 'auth/popup-blocked':
            msg = 'Popup was blocked by your browser. Please allow popups and try again.';
            break;
          case 'auth/redirect-cancelled-by-user':
            msg = 'Sign-in was cancelled. Please try again.';
            break;
          case 'auth/redirect-operation-pending':
            msg = 'Sign-in is already in progress. Please wait.';
            break;
          
          // App Configuration Errors
          case 'auth/app-not-authorized':
            msg = 'This app is not authorized to use Firebase Authentication. Please contact support.';
            break;
          case 'auth/app-deleted':
            msg = 'This app has been deleted. Please contact support.';
            break;
          case 'auth/invalid-api-key':
            msg = 'Invalid API key. Please contact support.';
            break;
          case 'auth/invalid-app-credential':
            msg = 'Invalid app credentials. Please contact support.';
            break;
          case 'auth/invalid-app-id':
            msg = 'Invalid app ID. Please contact support.';
            break;
          case 'auth/invalid-user-token':
            msg = 'Your session has expired. Please sign in again.';
            break;
          case 'auth/user-token-expired':
            msg = 'Your session has expired. Please sign in again.';
            break;
          case 'auth/invalid-tenant-id':
            msg = 'Invalid tenant ID. Please contact support.';
            break;
          
          // Phone Authentication Errors
          case 'auth/invalid-phone-number':
            msg = 'Invalid phone number. Please enter a valid phone number.';
            break;
          case 'auth/missing-verification-code':
            msg = 'Verification code is required. Please enter the code sent to your phone.';
            break;
          case 'auth/missing-verification-id':
            msg = 'Verification session not found. Please try again.';
            break;
          case 'auth/quota-exceeded':
            msg = 'SMS quota exceeded. Please try again later.';
            break;
          
          // Default case
          default:
            msg = err.message || 'Authentication failed. Please try again.';
            break;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative flex flex-col gap-6"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">
              {mode === "login" ? "Login to YourNextLease" : "Sign Up for YourNextLease"}
            </h2>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-red-50 text-gray-700 font-medium rounded-lg py-3 active:scale-95 transition-all duration-200"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-red-600 rounded-full" /> : "Continue with Google"}
            </Button>
            

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                    {(error.includes('cancelled') || error.includes('blocked')) && (
                      <Button
                        onClick={handleGoogle}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                      >
                        {loading ? 'Retrying...' : 'Try Again'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-full-name">Full Name</label>
                  <Input id="modal-full-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-lg h-10" placeholder="Full Name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-email">Email</label>
                <Input id="modal-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="rounded-lg h-10" placeholder="you@university.edu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-password">Password</label>
                <Input id="modal-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="rounded-lg h-10" placeholder="••••••••" />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-confirm-password">Confirm Password</label>
                  <Input id="modal-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" className="rounded-lg h-10" placeholder="••••••••" />
                </div>
              )}
              <Button type="submit" className="bg-red-600 text-white font-semibold rounded-lg h-12 mt-2 shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300 transition-all active:scale-95 duration-200" disabled={loading}>
                {loading ? (mode === 'signup' ? 'Signing up...' : 'Logging in...') : (mode === "login" ? "Login" : "Sign Up")}
              </Button>
            </form>
            <div className="text-center text-sm text-gray-600 mt-2">
              {mode === "login" ? (
                <>
                  New to YourNextLease?{' '}
                  <button
                    className="text-red-600 font-semibold hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    className="text-red-600 font-semibold hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 