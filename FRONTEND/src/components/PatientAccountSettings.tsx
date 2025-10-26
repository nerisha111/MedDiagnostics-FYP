import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { ArrowLeft, User, Palette } from "lucide-react";
import { toast } from "sonner";


export function PatientAccountSettings() {
  const navigate = useNavigate(); 
  const [activeSection, setActiveSection] = useState("account");
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");
  
  // Form fields
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("230 51234567");

  // Apply font size changes in real-time
  useEffect(() => {
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
  }, [fontSize]);

  // Apply theme changes in real-time
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleSaveAccount = () => {
    toast.success("Account information updated successfully");
  };

  const handleSaveDisplay = () => {
    toast.success("Display settings saved successfully");
  };

  const categories = [
    { id: "account", icon: User, label: "Account Information" },
    { id: "display", icon: Palette, label: "Display & Accessibility" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* 4. Updated Back button to use navigate */}
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveSection(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeSection === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-3">
            {/* Account Information */}
            {activeSection === "account" && (
              <Card className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl">Account Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Update your personal details
                    </p>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  {/* 5. Updated Cancel button to use navigate */}
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAccount} className="bg-primary hover:bg-primary/90">
                    Save Changes
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

                {/* Font Size */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fontSize" className="text-lg">
                      Font Size
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adjust the text size for better readability
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Small</span>
                      <span className="text-sm text-muted-foreground">Large</span>
                    </div>
                    <Slider
                      id="fontSize"
                      value={[fontSize]}
                      onValueChange={(value: number[]) => setFontSize(value[0])}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Current size: {fontSize}px
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize(16)}
                      >
                        Reset to default
                      </Button>
                    </div>

                    {/* Live Preview */}
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

                {/* Theme */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme" className="text-lg">
                      Theme
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose between light and dark mode
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme" className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Theme Preview */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === "light"
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
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
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === "dark"
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
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
                 
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDisplay} className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}