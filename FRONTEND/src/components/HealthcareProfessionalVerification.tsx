import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, CheckCircle2, XCircle, ArrowLeft, Shield } from "lucide-react";
import { format } from "date-fns";


export function HealthcareProfessionalVerification() {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [institution, setInstitution] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false,
    institution: false,
    licenseNumber: false,
  });

  const institutions = [
    "Johns Hopkins Hospital",
    "Mayo Clinic",
    "Cleveland Clinic",
    "Massachusetts General Hospital",
    "UCLA Medical Center",
  ];

  const filteredInstitutions = institutions.filter((inst) =>
    inst.toLowerCase().includes(institution.toLowerCase())
  );

  const validateLicenseNumber = (value: string) => {
    // Simple validation: at least 6 alphanumeric characters
    return value.length >= 6 && /^[A-Z0-9]+$/i.test(value);
  };

  const isLicenseValid = validateLicenseNumber(licenseNumber);
  const showLicenseValidation = touched.licenseNumber && licenseNumber.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      institution: true,
      licenseNumber: true,
    });

    // Validate all fields
    if (firstName && lastName && dateOfBirth && institution && isLicenseValid) {
      
      navigate('/healthcare/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl">Healthcare Professional Verification</h1>
                  <p className="text-muted-foreground">
                    Please provide your credentials to access the system
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setTouched({ ...touched, firstName: true })}
                    className={`transition-all ${
                      touched.firstName && !firstName ? "border-destructive" : ""
                    } ${firstName ? "border-primary/50" : ""}`}
                  />
                  {touched.firstName && !firstName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      First name is required
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setTouched({ ...touched, lastName: true })}
                    className={`transition-all ${
                      touched.lastName && !lastName ? "border-destructive" : ""
                    } ${lastName ? "border-primary/50" : ""}`}
                  />
                  {touched.lastName && !lastName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Last name is required
                    </p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start bg-input-background hover:bg-input-background/80 ${
                        touched.dateOfBirth && !dateOfBirth ? "border-destructive" : ""
                      } ${dateOfBirth ? "border-primary/50" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : <span>MM/DD/YYYY</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={(date: Date | undefined | null) => {
                        setDateOfBirth(date as Date | undefined);
                        setTouched({ ...touched, dateOfBirth: true });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {touched.dateOfBirth && !dateOfBirth && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Date of birth is required
                  </p>
                )}
              </div>

              {/* Institution Name */}
              <div className="space-y-2">
                <Label htmlFor="institution">
                  Institution Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="institution"
                    placeholder="e.g., Johns Hopkins Hospital"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    onBlur={() => setTouched({ ...touched, institution: true })}
                    className={`transition-all ${
                      touched.institution && !institution ? "border-destructive" : ""
                    } ${institution ? "border-primary/50" : ""}`}
                  />
                  {institution && filteredInstitutions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredInstitutions.map((inst, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                          onClick={() => {
                            setInstitution(inst);
                            setTouched({ ...touched, institution: true });
                          }}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {touched.institution && !institution && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Institution name is required
                  </p>
                )}
              </div>

              {/* Medical License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  Medical License Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="e.g., MD123456"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  onBlur={() => setTouched({ ...touched, licenseNumber: true })}
                  className={`transition-all ${
                    showLicenseValidation && !isLicenseValid ? "border-destructive" : ""
                  } ${showLicenseValidation && isLicenseValid ? "border-primary/50" : ""}`}
                />
                {showLicenseValidation && (
                  <p
                    className={`text-sm flex items-center gap-1 ${
                      isLicenseValid ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {isLicenseValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Valid license number format
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        License number must be at least 6 alphanumeric characters
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  // 5. Replace onBack with navigate
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to role selection
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
                >
                  Verify Credentials
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}