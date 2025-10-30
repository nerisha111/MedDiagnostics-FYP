// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { Session } from '@supabase/supabase-js';

// Define the shape of our context data
interface AuthContextType {
  session: Session | null;
  profile: any | null; // This will hold the clinician or patient profile
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

    // 2. Listen for changes in auth state (login/logout)
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

  const fetchProfile = async (currentSession: Session | null) => {
    setIsLoading(true);
    if (!currentSession) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const token = currentSession.access_token;
      const userId = currentSession.user.id;
      
      // We need to know if the user is a clinician or patient.
      // For now, let's assume the URL tells us, or we can add role to metadata.
      // We will check for a clinician profile first as an example.
      try {
        const response = await axios.get(`/api/clinicians/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (clinicianError) {
        // If clinician fetch fails, you could try fetching a patient profile
        // console.error("Not a clinician, trying patient...");
        setProfile(null); // Or handle patient profile fetching here
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
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