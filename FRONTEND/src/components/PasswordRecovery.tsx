import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Mail, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";


export function PasswordRecovery() {
  const navigate = useNavigate(); 
  const [step, setStep] = useState<"email" | "code" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Verification code sent to your email");
      setStep("code");
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      toast.success("Code verified");
      setStep("reset");
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setStep("success");
      setTimeout(() => {
        // 4. Replace onSuccess with navigate
        navigate(-1); // Go back to the previous page (the login screen)
      }, 2000);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <div className="p-8 space-y-6">
            {step !== "success" && (
              <button
                
                onClick={() => navigate(-1)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </button>
            )}

            {/* Email Step */}
            {step === "email" && (
              <>
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl">Forgot Password?</h2>
                  <p className="text-muted-foreground">
                    Enter your email address and we'll send you a verification code
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </Button>
                </form>
              </>
            )}

            {/* Code Verification Step */}
            {step === "code" && (
              <>
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={code.length !== 6}
                  >
                    Verify Code
                  </Button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend code in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Code resent");
                          setResendTimer(60);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Reset Password Step */}
            {step === "reset" && (
              <>
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl">Set New Password</h2>
                  <p className="text-muted-foreground">
                    Create a strong password for your account
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                passwordStrength === 1
                                  ? "w-1/4 bg-destructive"
                                  : passwordStrength === 2
                                  ? "w-2/4 bg-yellow-500"
                                  : passwordStrength === 3
                                  ? "w-3/4 bg-primary"
                                  : passwordStrength === 4
                                  ? "w-full bg-green-500"
                                  : "w-0"
                              }`}
                            />
                          </div>
                          <span className="text-xs">
                            {["Weak", "Fair", "Good", "Strong"][
                              Math.max(0, passwordStrength - 1)
                            ] || ""}
                          </span>
                        </div>
                        <ul className="text-xs space-y-1">
                          <li
                            className={
                              newPassword.length >= 8
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
                          </li>
                          <li
                            className={
                              /[A-Z]/.test(newPassword)
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {/[A-Z]/.test(newPassword) ? "✓" : "○"} One uppercase letter
                          </li>
                          <li
                            className={
                              /[0-9]/.test(newPassword)
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {/[0-9]/.test(newPassword) ? "✓" : "○"} One number
                          </li>
                          <li
                            className={
                              /[^A-Za-z0-9]/.test(newPassword)
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} One special
                            character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p
                        className={`text-xs ${
                          newPassword === confirmPassword
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {newPassword === confirmPassword
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={
                      !newPassword || newPassword !== confirmPassword || passwordStrength < 4
                    }
                  >
                    Reset Password
                  </Button>
                </form>
              </>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl">Password Reset Successful!</h2>
                <p className="text-muted-foreground">
                  Your password has been reset successfully. You can now sign in with your
                  new password.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to sign in...
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}