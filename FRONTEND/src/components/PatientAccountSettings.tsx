import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

// UI Components
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { User, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PatientAccountSettings() {
  const navigate = useNavigate();
  
  const { profile, session, refreshProfile } = useAuth();
  
  // State for UI and Form Data
  const [activeSection, setActiveSection] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");
 
  // --- Load Data Effect ---
  useEffect(() => {
    if (session?.user) {
      // Helper to bypass TypeScript checks for fields that exist in API but not in Interface
      const apiData = profile as any; 

      const meta = session.user.user_metadata || {};
      
      // 1. NAMES
      setFirstName(
        apiData?.user_details?.first_name || 
        apiData?.first_name || 
        meta.first_name || 
        ""
      );
      setLastName(
        apiData?.user_details?.last_name || 
        apiData?.last_name || 
        meta.last_name || 
        ""
      );
      
      // 2. EMAIL
      setEmail(
        apiData?.user_details?.email || 
        apiData?.email || 
        session.user.email || 
        ""
      );
      
      // 3. PHONE & ADDRESS
      // We use 'apiData' here to avoid "Property does not exist on type UserProfile" errors
      setPhone(
        apiData?.phone_number || 
        apiData?.patient_profile?.phone_number || 
        ""
      );
      
      setAddress(
        apiData?.address || 
        apiData?.patient_profile?.address || 
        ""
      );
      
      setIsLoading(false);
    }
  }, [profile, session]);

  const handleSaveAccount = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to save changes.");
      return;
    }

    setIsSaving(true);
    try {
      // Update User Table (Core Info)
      const { error: userError } = await supabase
        .from('User')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', session.user.id);

      if (userError) throw userError;

      // Update Patient Table (Profile Info)
      const { error: patientError } = await supabase
        .from('Patient')
        .upsert({
          id: session.user.id,
          phone_number: phone,
          address: address,
        });

      if (patientError) throw patientError;

      toast.success("Account information updated successfully!");
      refreshProfile(); 

    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Accessibility Logic ---
  useEffect(() => {
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleSaveDisplay = () => {
    toast.success("Display settings saved successfully");
  };

  const categories = [
    { id: "account", icon: User, label: "Account Information" },
    { id: "display", icon: Palette, label: "Display & Accessibility" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveSection(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeSection === category.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="text-sm">{category.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-3">
            
            {activeSection === "account" && (
              <Card className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl">Account Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal details</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="e.g. John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john.doe@example.com"
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="123 Medical Center Blvd, Suite 100"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>Cancel</Button>
                  <Button onClick={handleSaveAccount} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Display & Accessibility */}
            {activeSection === "display" && (
              <Card className="p-8 space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl">Display & Accessibility</h2>
                        <p className="text-sm text-muted-foreground">
                        Adjust visual preferences for better readability
                        </p>
                    </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="fontSize" className="text-lg">Font Size</Label>
                        <p className="text-sm text-muted-foreground mt-1">Adjust the text size for better readability</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Small</span>
                            <span className="text-sm text-muted-foreground">Large</span>
                        </div>
                        <Slider
                            id="fontSize" value={[fontSize]} onValueChange={(value: number[]) => setFontSize(value[0])}
                            min={12} max={24} step={1} className="w-full"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Current size: {fontSize}px</span>
                            <Button variant="outline" size="sm" onClick={() => setFontSize(16)}>Reset to default</Button>
                        </div>
                        <div className="mt-4 p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground mb-2">Live Preview:</p>
                            <div style={{ fontSize: `${fontSize}px` }}>
                                <p>This is how your text will appear with the selected font size.</p>
                                <p className="mt-2">Sample heading text for preview</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="theme" className="text-lg">Theme</Label>
                        <p className="text-sm text-muted-foreground mt-1">Choose between light and dark mode</p>
                    </div>
                    <div className="space-y-4">
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger id="theme" className="w-full max-w-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light Mode</SelectItem>
                                <SelectItem value="dark">Dark Mode</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={`p-4 rounded-lg border-2 transition-all ${theme === "light" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                            >
                                <div className="space-y-2">
                                    <div className="h-16 bg-white rounded border border-gray-200 flex items-center justify-center">
                                        <div className="space-y-1.5 w-full px-3">
                                            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-center">Light Mode</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-lg border-2 transition-all ${theme === "dark" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                            >
                                <div className="space-y-2">
                                    <div className="h-16 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
                                        <div className="space-y-1.5 w-full px-3">
                                            <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-center">Dark Mode</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                  <Button onClick={handleSaveDisplay} className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}