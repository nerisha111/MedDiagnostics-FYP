// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { Session } from '@supabase/supabase-js';

// --- 1. DEFINE PROPER TYPESCRIPT INTERFACES ---
// These match the data structure from your new UserProfileSerializer in Django.

interface PatientProfile {
  phone_number: string;
  address: string;
}

interface ClinicianProfile {
  role: string;
  department: string;
  medical_license_number: string;
}

// This is the main profile object we will store in our context.
interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_role: 'patient' | 'clinician' | null;
  patient_profile: PatientProfile | null;
  clinician_profile: ClinicianProfile | null;
}

// Define the shape of our context data using the new interfaces.
interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null; // Use the strongly-typed UserProfile
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This part is good. It gets the initial session when the app loads.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // We pass the session to our updated fetchProfile function
      fetchProfile(session);
    });

    // This part is also good. It listens for auth changes (login/logout).
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchProfile(session);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- 2. COMPLETELY REWRITE the fetchProfile LOGIC ---
  const fetchProfile = async (currentSession: Session | null) => {
    // Set loading to true whenever we start fetching.
    setIsLoading(true);

    // If there's no session, there's no user. Clear the profile and stop.
    if (!currentSession) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get the JWT from the session. This is the user's "proof of login".
      const token = currentSession.access_token;

      // This is the CRITICAL FIX:
      // We now call the new, generic /api/profile/me/ endpoint.
      // We no longer need the userId in the URL. The backend knows who the user
      // is by validating the token in the Authorization header.
 
      const response = await axios.get('http://127.0.0.1:8000/api/profile/me/', {
       headers: {
        Authorization: `Bearer ${token}`
    },
});

      // Store the complete user profile from the response.
      setProfile(response.data);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If fetching fails for any reason, clear the profile to be safe.
      setProfile(null);
    } finally {
      // Always set loading to false when we're done.
      setIsLoading(false);
    }
  };

  const value = {
    session,
    profile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};