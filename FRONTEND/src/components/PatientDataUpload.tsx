import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Upload,
  Image,
  FileText,
  FlaskConical,
  Dna,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

// Define the file structure
interface UploadedFile {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "success" | "error";
  validation: {
    integrity: boolean;
    format: boolean;
    quality: number;
  };
}

// Renamed to PatientDataUpload
export function PatientDataUpload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("images");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({
    images: [],
    notes: [],
    labs: [],
    genetic: [],
  });

  const uploadZones = [
    { id: "images", label: "Medical Images", icon: Image, formats: "JPEG, PNG, DICOM", maxSize: "100MB" },
    { id: "notes", label: "Clinical Notes", icon: FileText, formats: "PDF, DOC, TXT", maxSize: "50MB" },
    { id: "labs", label: "Lab Results", icon: FlaskConical, formats: "PDF, CSV", maxSize: "50MB" },
    { id: "genetic", label: "Genetic Data", icon: Dna, formats: "VCF, BAM", maxSize: "200MB" },
  ];

  // --- File handling logic remains the same ---
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files), activeTab);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files), activeTab);
    }
  };

  const handleFiles = (fileList: File[], category: string) => {
    fileList.forEach((file) => {
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
        validation: { integrity: false, format: false, quality: 0 },
      };
      setFiles((prev) => ({ ...prev, [category]: [...prev[category], newFile] }));

      // Simulate upload and validation
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) => ({
            ...prev,
            [category]: prev[category].map((f) =>
              f.name === file.name
                ? {
                    ...f,
                    progress: 100,
                    status: "success",
                    validation: { integrity: true, format: true, quality: Math.floor(Math.random() * 20) + 80 },
                  }
                : f
            ),
          }));
          toast.success(`${file.name} uploaded and validated`);
        } else {
          setFiles((prev) => ({
            ...prev,
            [category]: prev[category].map((f) => (f.name === file.name ? { ...f, progress } : f)),
          }));
        }
      }, 200);
    });
  };

  const removeFile = (category: string, fileName: string) => {
    setFiles((prev) => ({...prev, [category]: prev[category].filter((f) => f.name !== fileName)}));
    toast.info(`${fileName} removed`);
  };

  const clearAll = () => {
    setFiles({ images: [], notes: [], labs: [], genetic: [] });
    toast.info("All files cleared");
  };

  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);
  const validatedFiles = Object.values(files).flat().filter((f) => f.status === "success").length;
  const hasErrors = Object.values(files).flat().some((f) => f.status === "error");

  return (
   
    <div className="max-w-7xl mx-auto p-8 space-y-6">


      
      <Card className="p-6">
        <div className="flex items-center justify-center">
            {["Upload", "Preprocessing", "Analysis", "Results"].map((step, idx) => (
            <div key={step} className="flex items-center">
                <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {idx + 1}
                </div>
                <span className={idx === 0 ? "font-semibold" : "text-muted-foreground"}>{step}</span>
                </div>
                {idx < 3 && <div className="w-24 h-0.5 bg-border mx-4" />}
            </div>
            ))}
        </div>
      </Card>
      
    

      {/* Multimodal Upload Section */}
      <main className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Upload Files</h3>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-muted p-1 h-auto">
                {uploadZones.map((zone) => {
                  const Icon = zone.icon;
                  const count = files[zone.id].length;
                  return (
                    <TabsTrigger key={zone.id} value={zone.id} className="relative data-[state=active]:bg-card data-[state=active]:shadow-sm">
                      <Icon className="w-4 h-4 mr-2" />
                      {zone.label}
                      {count > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{count}</Badge>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {uploadZones.map((zone) => (
                <TabsContent key={zone.id} value={zone.id} className="mt-4">
                  {/* Upload Zone */}
                  <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                    <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-2">Drag & drop files here or <span className="text-primary font-semibold">browse</span></p>
                      <p className="text-sm text-muted-foreground">{zone.formats} • Max {zone.maxSize}</p>
                    </div>
                  </div>
                  {/* Uploaded Files List */}
                  {files[zone.id].length > 0 && (
                    <div className="space-y-3 mt-4">
                      {files[zone.id].map((file, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-center gap-4">
                            {file.status === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : file.status === "error" ? <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" /> : <div className="w-5 h-5 flex-shrink-0"><div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /></div>}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              {file.status === "uploading" && <Progress value={file.progress} className="h-1.5 mt-2" />}
                              {file.status === "success" && <div className="flex gap-3 text-xs text-muted-foreground mt-1.5"><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />Integrity</span><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />Format</span><span>Quality: {file.validation.quality}%</span></div>}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="w-8 h-8"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => removeFile(zone.id, file.name)}><X className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>

       
        <aside>
          <Card className="p-6 sticky top-8">
            <h3 className="font-semibold mb-4">Data Quality Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-muted-foreground">Overall Quality</span><span>{validatedFiles > 0 ? Math.round(Object.values(files).flat().filter(f => f.status === "success").reduce((s, f) => s + f.validation.quality, 0) / validatedFiles) : 0}%</span></div>
                <Progress value={validatedFiles > 0 ? Object.values(files).flat().filter(f => f.status === "success").reduce((s, f) => s + f.validation.quality, 0) / validatedFiles : 0} />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Files Uploaded</span><span>{totalFiles}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Validated</span><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />{validatedFiles}</span></div>
                {hasErrors && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Errors</span><span className="flex items-center gap-1.5 text-destructive"><AlertCircle className="w-4 h-4" />{Object.values(files).flat().filter(f => f.status === "error").length}</span></div>}
              </div>
            </div>
          </Card>
        </aside>
      </main>

      {/* Bottom Action Bar */}
      <footer className="sticky bottom-0">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} uploaded, {validatedFiles} validated
              {hasErrors && <span className="text-destructive ml-2">• {Object.values(files).flat().filter((f) => f.status === "error").length} error{Object.values(files).flat().filter((f) => f.status === "error").length !== 1 ? "s" : ""}</span>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline"><Save className="w-4 h-4 mr-2" />Save Draft</Button>
              <Button variant="outline" onClick={clearAll} disabled={totalFiles === 0}>Clear All</Button>
          <Button
            // This line is what makes the navigation happen
            onClick={() => navigate('/patient/loading')} 
            disabled={validatedFiles === 0 || hasErrors}
          >
            Proceed to Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
            </div>
          </div>
        </Card>
      </footer>
    </div>
  );
}