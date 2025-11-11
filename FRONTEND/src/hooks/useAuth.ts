// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

type UserRole = 'patient' | 'doctor' | 'nurse' | null;

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface UseAuthOptions {
  requiredRole?: 'patient' | 'clinician';
  redirectTo?: string;
}

export function useAuth(options?: UseAuthOptions) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const validateUserRole = async () => {
      try {
        // Step 1: Check if user has a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (isMounted) {
            setLoading(false);
            const redirectPath = options?.redirectTo || (options?.requiredRole === 'patient' ? '/patient/login' : '/healthcare/login');
            navigate(redirectPath);
          }
          return;
        }

        const authUser = session.user;

        // Step 2: Fetch user data from database to verify role
        const { data: userData, error: dbError } = await supabase
          .from('User')
          .select('id, first_name, last_name, email, role')
          .eq('supabase_user_id', authUser.id)
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Unable to verify user profile');
        }

        if (!userData) {
          throw new Error('User profile not found');
        }

        // Step 3: Validate role matches the required portal
        const userRole = userData.role as UserRole;
        
        // Check if user has the correct role for this portal
        if (options?.requiredRole) {
          const isClinicianRole = userRole === 'doctor' || userRole === 'nurse';
          const isPatientRole = userRole === 'patient';

          if (options.requiredRole === 'clinician' && !isClinicianRole) {
            if (isMounted) {
              await supabase.auth.signOut();
              toast.error('Access Denied: You do not have permission to access the healthcare portal. Please use the patient portal.');
              navigate('/patient/login');
            }
            return;
          }

          if (options.requiredRole === 'patient' && !isPatientRole) {
            if (isMounted) {
              await supabase.auth.signOut();
              toast.error('Access Denied: You do not have permission to access the patient portal. Please use the healthcare professional portal.');
              navigate('/healthcare/login');
            }
            return;
          }
        }

        // Step 4: Set authorized user
        if (isMounted) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userRole,
            firstName: userData.first_name,
            lastName: userData.last_name,
          });
          setIsAuthorized(true);
        }

      } catch (error: any) {
        console.error('Auth validation error:', error);
        if (isMounted) {
          toast.error(error.message || 'Authentication failed');
          await supabase.auth.signOut();
          const redirectPath = options?.redirectTo || '/';
          navigate(redirectPath);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateUserRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthorized(false);
      } else if (event === 'SIGNED_IN') {
        validateUserRole();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, options?.requiredRole, options?.redirectTo]);

  return { user, loading, isAuthorized };
}