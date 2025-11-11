import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Eye, EyeOff, Stethoscope, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

export function HealthcareProfessionalLogin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const canSubmit = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!canSubmit) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Login failed: No user data returned");
      }

      // Step 2: Verify user role from database
      const { data: userData, error: dbError } = await supabase
        .from('User')
        .select('role')
        .eq('supabase_user_id', data.user.id)
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        await supabase.auth.signOut();
        throw new Error("Unable to verify your account. Please contact support.");
      }

      if (!userData) {
        await supabase.auth.signOut();
        throw new Error("User profile not found. Please contact support.");
      }

      // Step 3: Check if user has clinician role (doctor or nurse)
      const userRole = userData.role;
      const isClinicianRole = userRole === 'doctor' || userRole === 'nurse';

      if (!isClinicianRole) {
        // User is not a healthcare professional
        await supabase.auth.signOut();
        setServerError("Access Denied: This portal is for healthcare professionals only. Please use the patient portal.");
        toast.error("Access Denied: You don't have permission to access this portal.");
        return;
      }

      // Step 4: Success - navigate to dashboard
      toast.success("Login successful! Welcome back.");
      navigate('/healthcare/dashboard');

    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred.";
      setServerError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-t-4 border-t-primary">
          <div className="p-8 space-y-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to role selection
            </button>

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl">Healthcare Professional Login</h1>
              <p className="text-muted-foreground">
                Sign in with your email and password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {serverError && (
                <div className="text-sm text-center text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {serverError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/healthcare/register')}
                className="text-primary hover:underline"
                disabled={isSubmitting}
              >
                Register as Healthcare Professional
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}