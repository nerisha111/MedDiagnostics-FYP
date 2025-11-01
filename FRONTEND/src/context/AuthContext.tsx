import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { Session } from '@supabase/supabase-js';

// --- INTERFACES (No changes needed here) ---
interface PatientProfile {
  phone_number: string;
  address: string;
}

interface ClinicianProfile {
  role: string;
  department: string;
  medical_license_number: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string; 
  user_role: 'patient' | 'clinician' | null;
  patient_profile: PatientProfile | null;
  clinician_profile: ClinicianProfile | null;
}

interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null; 
  isLoading: boolean;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (currentSession: Session | null) => {
   
    if (currentSession) {
      setIsLoading(true);
    }
    
    if (!currentSession) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const token = currentSession.access_token;
      const response = await axios.get('http://127.0.0.1:8000/api/profile/me/', {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
   
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

   
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchProfile(session);
      }
    );

  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

 
  const refreshProfile = () => {
    if (session) {
      fetchProfile(session);
    }
  };


  const value: AuthContextType = {
    session,
    profile,
    isLoading,
    refreshProfile, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};