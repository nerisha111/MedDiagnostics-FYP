import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, 
  Loader2, Shield, AlertCircle, Stethoscope, User 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

export function PasswordRecovery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  
  // Form State
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Role State (Used ONLY for navigation/logic now, not styling)
  const [userType, setUserType] = useState<"healthcare" | "patient">("healthcare");
  const [isRolePredefined, setIsRolePredefined] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Detect Role from URL
    const roleFromUrl = searchParams.get('role');        
    const initialRole = searchParams.get('initial_role'); 

    const determinedRole = roleFromUrl || initialRole;

    if (determinedRole === 'patient') {
      setUserType('patient');
      setIsRolePredefined(true); 
    } else if (determinedRole === 'healthcare') {
      setUserType('healthcare');
      setIsRolePredefined(true); 
    }

    // 2. Detect if User is Returning from Email Link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      setStep("reset");
      toast.info("Welcome back. Please set your new password.");
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/recover-password?role=${userType}`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success("Check your email", {
        description: `We sent a recovery link to ${email}`,
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Request failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setStep("success");
      toast.success("Password updated successfully!");

      setTimeout(() => {
        navigate(userType === 'patient' ? "/patient/login" : "/healthcare/login");
      }, 2000);

    } catch (error: any) {
      toast.error("Update failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check role for text display (Styling is now unified)
  const isPatient = userType === 'patient';

  return (
    // UNIFIED TEAL BACKGROUND for both roles
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="w-full max-w-md">
        
        {/* UNIFIED TEAL BORDER */}
        <Card className="shadow-2xl border-t-4 border-t-primary">
          <div className="p-8 space-y-6">
            
            {/* Back Link */}
            {step !== "success" && (
              <button
                onClick={() => navigate(isPatient ? "/patient/login" : "/healthcare/login")}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to {isPatient ? 'Patient' : 'Healthcare'} login
              </button>
            )}

            {/* Header with UNIFIED TEAL Icon */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
                  {step === 'email' ? (
                     <Shield className="w-8 h-8 text-primary" />
                  ) : (
                     <Lock className="w-8 h-8 text-primary" />
                  )}
                </div>
              </div>
              <h1 className="text-3xl">
                {step === 'email' ? 'Reset Password' : step === 'reset' ? 'New Password' : 'Success!'}
              </h1>
              <p className="text-muted-foreground">
                {step === 'email' 
                  ? `Enter your email to receive a reset link` 
                  : step === 'reset'
                  ? 'Create a strong password for your account'
                  : 'Your password has been updated'}
              </p>
            </div>

            {/* Role Toggle (Hidden if role is known) */}
            {!isRolePredefined && step === 'email' && (
              <div className="flex p-1 bg-secondary/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUserType('healthcare')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${
                    !isPatient ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> Healthcare
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${
                    isPatient ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="w-4 h-4" /> Patient
                </button>
              </div>
            )}

            {/* --- STEP 1: EMAIL FORM --- */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {/* --- STEP 2: RESET PASSWORD FORM --- */}
            {step === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    New Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${confirmPassword && newPassword !== confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}

            {/* --- STEP 3: SUCCESS --- */}
            {step === "success" && (
              <div className="text-center py-6 space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Password Updated!</h3>
                <p className="text-muted-foreground">
                  Redirecting you to {isPatient ? 'patient' : 'healthcare'} login...
                </p>
                <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4 text-muted-foreground" />
              </div>
            )}

          </div>
        </Card>
      </div>
    </div>
  );
}