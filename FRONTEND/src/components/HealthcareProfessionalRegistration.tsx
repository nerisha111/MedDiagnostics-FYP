import { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft, Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";


export function HealthcareProfessionalRegistration() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    role: "",
    department: "",
    email: "",
    dob: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    gender: false,
    role: false,
    department: false,
    email: false,
    dob: false,
    licenseNumber: false,
    password: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      gender: "",
      role: "",
      department: "",
      email: "",
      dob: "",
      licenseNumber: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
      isValid = false;
    } else if (!/^[A-Za-z\s'-]+$/.test(firstName.trim())) {
      newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes.";
      isValid = false;
    }
    
    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
      isValid = false;
    } else if (!/^[A-Za-z\s'-]+$/.test(lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes.";
      isValid = false;
    }
    
    if (!gender) {
      newErrors.gender = "Please select a gender.";
      isValid = false;
    }
    if (!role) {
      newErrors.role = "Please select a role.";
      isValid = false;
    }
    if (!department.trim()) {
      newErrors.department = "Department is required.";
      isValid = false;
    }

    // Email validation with domain check
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    } else {
      const parts = email.split("@");
      const domain = parts.length > 1 ? parts[1].toLowerCase() : "";

      const validDomains = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
        "icloud.com", "live.com", "msn.com", "aol.com",
        "protonmail.com", "proton.me", "mail.com", "zoho.com",
        "yandex.com", "gmx.com", "me.com", "mac.com"
      ];

      const isValidDomain =
        validDomains.includes(domain) ||
        /^[\w-]+(\.[\w-]+)*\.(com|net|org|edu|gov|mil|co|info|biz)$/i.test(domain);

      if (!isValidDomain) {
        newErrors.email = "Please enter an email from a valid domain.";
        isValid = false;
      }
    }

    // Date of Birth validation with age check
    if (!dob) {
      newErrors.dob = "Date of birth is required.";
      isValid = false;
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (birthDate > today) {
        newErrors.dob = "Date of birth cannot be in the future.";
        isValid = false;
      } else if (exactAge < 18) {
        newErrors.dob = "You must be at least 18 years old to register.";
        isValid = false;
      }
    }
    
    // Medical License Number validation
    if (!licenseNumber.trim()) {
      newErrors.licenseNumber = "Medical license number is required.";
      isValid = false;
    } else {
      const cleanLicense = licenseNumber.replace(/\s+/g, '').toUpperCase();
      
      const npiPattern = /^(NPI)?[0-9]{10}$/;
      const deaPattern = /^[A-Z]{2}[0-9]{7}$/;
      const stateLicensePattern = /^[A-Z0-9-]{5,15}$/;
      
      const isValidNPI = npiPattern.test(cleanLicense);
      const isValidDEA = deaPattern.test(cleanLicense);
      const isValidStateLicense = stateLicensePattern.test(cleanLicense);
      
      if (!isValidNPI && !isValidDEA && !isValidStateLicense) {
        newErrors.licenseNumber = "Invalid license format. Enter a valid NPI (10 digits), DEA (2 letters + 7 digits), or state license number.";
        isValid = false;
      }
      
      if (isValidNPI) {
        const npiDigits = cleanLicense.replace(/^NPI/, '');
        if (!['1', '2', '3', '4'].includes(npiDigits[0])) {
          newErrors.licenseNumber = "Invalid NPI number. NPI must start with 1, 2, 3, or 4.";
          isValid = false;
        }
      }
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setTouched({
      firstName: true, lastName: true, gender: true, role: true,
      department: true, email: true, dob: true, licenseNumber: true,
      password: true, confirmPassword: true,
    });

    if (validateForm()) {
      setIsSubmitting(true);
      let supabaseUserId: string | null = null;

      try { 
        // Step 1: Create Supabase user
        // We FORCE role to "doctor" here for Auth metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
              role: role,
            },
          },
        });

        if (authError) {
          // Handle specific Supabase errors
          if (authError.message.includes("already registered")) {
            throw new Error("This email is already registered. Please login instead.");
          }
          throw authError;
        }

        if (!authData.user) {
          throw new Error("Supabase registration failed: User object not returned.");
        }

        supabaseUserId = authData.user.id;
        console.log("Supabase user created:", supabaseUserId);

        // Step 2: Create user in Django database
        // We FORCE role to "doctor" here for the DB Table
        const registrationData = {
          id: supabaseUserId,
          first_name: firstName,
          last_name: lastName,
          gender,
          role: role,
          department,
          email,
          date_of_birth: dob,
          medical_license_number: licenseNumber,
        };

        console.log("Sending to Django:", registrationData);

        try {
          await axios.post('/api/register/clinician/', registrationData);
          
          toast.success("Registration successful! You can now log in.");
          navigate('/healthcare/login');
          
        } catch (dbError: any) {
          console.error("Database registration error:", dbError);
          
          // If Django registration fails, delete the Supabase user to keep data consistent
          if (supabaseUserId) {
            console.log("Cleaning up Supabase user due to database error...");
            try {
              // Sign out and attempt to delete the user
              await supabase.auth.signOut();
            } catch (cleanupError) {
              console.error("Error during cleanup:", cleanupError);
            }
          }
          
          // Provide a helpful error message
          const dbErrorMessage = dbError.response?.data?.detail 
            || dbError.response?.data?.message 
            || dbError.response?.data?.email?.[0]
            || "Database registration failed. Please contact support.";
          
          throw new Error(dbErrorMessage);
        }

      } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data) {
          errorMessage = error.response.data.detail 
            || error.response.data.message 
            || error.response.data.email?.[0]
            || JSON.stringify(error.response.data);
        }
        
        console.error("Registration failed:", errorMessage);
        setServerError(errorMessage);
        toast.error(`Registration failed: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="w-full max-w-2xl">
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
              <h1 className="text-3xl">Healthcare Professional Registration</h1>
              <p className="text-muted-foreground">
                Create your account to access the diagnostic system
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (touched.firstName) validateForm();
                    }}
                    onBlur={() => handleBlur("firstName")}
                    className={touched.firstName && errors.firstName ? "border-[#E63946]" : ""}
                    disabled={isSubmitting}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-sm text-[#E63946]">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (touched.lastName) validateForm();
                    }}
                    onBlur={() => handleBlur("lastName")}
                    className={touched.lastName && errors.lastName ? "border-[#E63946]" : ""}
                    disabled={isSubmitting}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-sm text-[#E63946]">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>
                  Gender <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value: string) => {
                    setGender(value);
                  }}
                  className="flex gap-4"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer font-normal">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer font-normal">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer font-normal">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
                {touched.gender && errors.gender && (
                  <p className="text-sm text-[#E63946]">{errors.gender}</p>
                )}
              </div>

              {/* Role and Department */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={role}
                    onValueChange={(value: string) => {
                      setRole(value);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="role"
                      className={touched.role && errors.role ? "border-[#E63946]" : ""}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.role && errors.role && (
                    <p className="text-sm text-[#E63946]">{errors.role}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Cardiology"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (touched.department) validateForm();
                    }}
                    onBlur={() => handleBlur("department")}
                    className={touched.department && errors.department ? "border-[#E63946]" : ""}
                    disabled={isSubmitting}
                  />
                  {touched.department && errors.department && (
                    <p className="text-sm text-[#E63946]">{errors.department}</p>
                  )}
                </div>
              </div>

              {/* Email and DOB */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@hospital.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateForm();
                    }}
                    onBlur={() => handleBlur("email")}
                    className={touched.email && errors.email ? "border-[#E63946]" : ""}
                    disabled={isSubmitting}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-[#E63946]">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (touched.dob) validateForm();
                    }}
                    onBlur={() => handleBlur("dob")}
                    className={touched.dob && errors.dob ? "border-[#E63946]" : ""}
                    disabled={isSubmitting}
                  />
                  {touched.dob && errors.dob && (
                    <p className="text-sm text-[#E63946]">{errors.dob}</p>
                  )}
                </div>
              </div>

              {/* Medical License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  Medical License Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="e.g., NPI1234567890 or STATE-MD-12345"
                  value={licenseNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s+/g, '').toUpperCase();
                    setLicenseNumber(value);
                    if (touched.licenseNumber) validateForm();
                  }}
                  onBlur={() => handleBlur("licenseNumber")}
                  className={touched.licenseNumber && errors.licenseNumber ? "border-[#E63946]" : ""}
                  disabled={isSubmitting}
                />
                {touched.licenseNumber && errors.licenseNumber && (
                  <p className="text-sm text-[#E63946]">{errors.licenseNumber}</p>
                )}
                {!errors.licenseNumber && licenseNumber && touched.licenseNumber && (
                  <p className="text-xs text-green-600">✓ Valid license format</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter NPI (10 digits), state license, or DEA number
                </p>
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateForm();
                    }}
                    onBlur={() => handleBlur("password")}
                    className={`pr-10 ${touched.password && errors.password ? "border-[#E63946]" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
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
                {password && !errors.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength === 1
                              ? "w-1/4 bg-[#E63946]"
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
                        {["Weak", "Fair", "Good", "Strong"][Math.max(0, passwordStrength - 1)] ||
                          ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) validateForm();
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`pr-10 ${touched.confirmPassword && errors.confirmPassword ? "border-[#E63946]" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-sm text-[#E63946]">{errors.confirmPassword}</p>
                )}
                {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600">✓ Passwords match</p>
                )}
              </div>

              {/* Server Error Display */}
              {serverError && (
                <div className="text-center p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  <p className="text-sm font-medium">{serverError}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/healthcare/login')}
                  disabled={isSubmitting}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}