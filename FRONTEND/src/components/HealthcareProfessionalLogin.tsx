import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Eye, EyeOff, Stethoscope } from "lucide-react";
import { toast } from "sonner";


export function HealthcareProfessionalLogin() {
  const navigate = useNavigate(); 
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ licenseNumber: "", password: "" });
  const [touched, setTouched] = useState({ licenseNumber: false, password: false });

  const validateForm = () => {
    const newErrors = { licenseNumber: "", password: "" };
    let isValid = true;

    if (!licenseNumber.trim()) {
      newErrors.licenseNumber = "Medical License Number is required.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ licenseNumber: true, password: true });
    
    if (validateForm()) {
      toast.success("Login successful");
   
      navigate('/healthcare/dashboard'); 
    }
  };

  const handleBlur = (field: "licenseNumber" | "password") => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-t-4 border-t-primary">
          <div className="p-8 space-y-6">
            {/* Back Button */}
            <button
              
              onClick={() => navigate('/')} 
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to role selection
            </button>

            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl">Healthcare Professional Login</h1>
              <p className="text-muted-foreground">
                Sign in to access the diagnostic system
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medical License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  Medical License Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="Enter your license number"
                  value={licenseNumber}
                  onChange={(e) => {
                    setLicenseNumber(e.target.value);
                    if (touched.licenseNumber) validateForm();
                  }}
                  onBlur={() => handleBlur("licenseNumber")}
                  className={touched.licenseNumber && errors.licenseNumber ? "border-[#E63946]" : ""}
                />
                {touched.licenseNumber && errors.licenseNumber && (
                  <p className="text-sm text-[#E63946]">{errors.licenseNumber}</p>
                )}
              </div>

              {/* Password */}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateForm();
                    }}
                    onBlur={() => handleBlur("password")}
                    className={`pr-10 ${touched.password && errors.password ? "border-[#E63946]" : ""}`}
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
                {touched.password && errors.password && (
                  <p className="text-sm text-[#E63946]">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Login
              </Button>
            </form>

            {/* Divider */}
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

            {/* Register Link */}
            <div className="text-center">
              <button
                type="button"
                
                onClick={() => navigate('/healthcare/register')}
                className="text-primary hover:underline"
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