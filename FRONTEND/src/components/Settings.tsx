import { SetStateAction, useEffect, useRef, useState } from "react";
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
  // Global "Source of Truth" from Context
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  // Local "Draft" state for Previewing changes
  const [previewTheme, setPreviewTheme] = useState(theme);
  const [previewFontSize, setPreviewFontSize] = useState(fontSize);

  // Create a flag to track if we saved
  const isSaved = useRef(false);

  /**
   * LIVE PREVIEW EFFECT
   * This updates the DOM visually while the user interacts with sliders/buttons,
   * but it does NOT trigger the localStorage save logic in the Provider.
   */
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply Preview Theme
    root.classList.remove("light", "dark");
    root.classList.add(previewTheme);

    // Apply Preview Font Size
    root.style.setProperty("--font-size", `${previewFontSize}px`);

    // 2. CLEANUP FUNCTION (Runs when leaving the page)
    return () => {
      // ONLY revert if the user DID NOT click save
      if (!isSaved.current) {
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        root.style.setProperty("--font-size", `${fontSize}px`);
      }
    };
  }, [previewTheme, previewFontSize, theme, fontSize]);

  const handleSave = () => {
    isSaved.current = true; // 3. Set the flag to true
    // Commit the draft values to the Global Provider
    // This is what triggers the localStorage.setItem calls
    setTheme(previewTheme);
    setFontSize(previewFontSize);
    toast.success("Settings saved successfully");
  };

  const handleCancel = () => {
    // Reset local drafts back to the last saved global state
    setPreviewTheme(theme);
    setPreviewFontSize(fontSize);

    // Explicitly revert the DOM visuals immediately
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.setProperty("--font-size", `${fontSize}px`);

    toast.info("Changes discarded");
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
              value={[previewFontSize]} // Linked to Preview
              onValueChange={(value: SetStateAction<number>[]) => setPreviewFontSize(value[0])} // Updates Preview
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Preview size: {previewFontSize}px
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewFontSize(16)}
                >
                  Reset to default
                </Button>
              </div>

              {/* Live Preview */}
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-2">Live Preview:</p>
                <div style={{ fontSize: `${previewFontSize}px` }}>
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
              <Select value={previewTheme} onValueChange={(val: "light" | "dark") => setPreviewTheme(val)}>
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
                  onClick={() => setPreviewTheme("light")}
                  className={`p-4 rounded-lg border-2 transition-all${
                    previewTheme === "light"
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
                  onClick={() => setPreviewTheme("dark")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    previewTheme === "dark"
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