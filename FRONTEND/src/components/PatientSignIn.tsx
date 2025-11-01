
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // <-- 1. Import Supabase client
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner"; // <-- 2. Import toast for notifications
import { Eye, EyeOff, Shield, ArrowLeft, Loader2 } from "lucide-react";

export function PatientSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  // --- 3. Add state for loading and server errors ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    // (This validation function is good, no changes needed here)
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // --- 4. Rewrite the handleSubmit function completely ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); // Clear previous errors
    setTouched({ email: true, password: true });

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // This is the crucial step: Call Supabase to sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        // If Supabase returns an error (e.g., "Invalid login credentials"), throw it
        if (error) {
          throw error;
        }

        // If successful, show a success message and navigate to the dashboard
        toast.success("Login successful! Welcome back.");
        navigate('/patient/dashboard');

      } catch (error: any) {
        // Catch any errors and display them to the user
        const errorMessage = error.message || "An unknown error occurred.";
        setServerError(errorMessage);
        toast.error(`Login failed: ${errorMessage}`);
      } finally {
        // Ensure the loading state is turned off, whether it succeeded or failed
        setIsSubmitting(false);
      }
    }
  };


  const handleBlur = (field: "email" | "password") => {
    setTouched({ ...touched, [field]: true });
    validateForm();
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
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl">Patient Login</h1>
              <p className="text-muted-foreground">
                Sign in to access your medical reports
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={touched.email && errors.email ? "border-[#E63946]" : ""}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-[#E63946]">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <button type="button" onClick={() => navigate('/recover-password')} className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`pr-10 ${touched.password && errors.password ? "border-[#E63946]" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-sm text-[#E63946]">{errors.password}</p>
                )}
              </div>

              {/* --- 5. Display server error message to the user --- */}
              {serverError && (
                <p className="text-sm text-center text-[#E63946] bg-red-50 p-3 rounded-md">{serverError}</p>
              )}

              {/* --- 6. Update Button to show loading state --- */}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                ) : ( "Login" )}
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
              <button type="button" onClick={() => navigate('/patient/register')} className="text-primary hover:underline">
                Register as Patient
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
