import { useState } from "react";
import { useTheme } from "../context/theme-provider";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
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
import { Palette } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const [originalSettings, setOriginalSettings] = useState({ theme, fontSize });
  const handleSave = () => {
    setOriginalSettings({ theme, fontSize });
    toast.success("Settings saved successfully");
  };

  const handleCancel = () => {
    setTheme(originalSettings.theme);
    setFontSize(originalSettings.fontSize);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        
          <div>
            <h1 className="text-3xl">Settings & Preferences</h1>
            <p className="text-muted-foreground">
              Customize your display and accessibility preferences
            </p>
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="p-8 space-y-8">
          {/* Header with Icon */}
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
              value={[fontSize]} // Ensure this is an array of numbers
              onValueChange={(value: number[]) => setFontSize(value[0])} // Explicitly define the type
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

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}