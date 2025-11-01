import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

// UI Components
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Upload, Image, FileText, FlaskConical, Dna, X,
  CheckCircle2, AlertCircle, Save, ArrowRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

// --- INTERFACE FOR FILE STATE ---
interface UploadedFile {
  key: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "validating" | "uploading" | "success" | "error";
  storagePath?: string;
  validation: {
    formatOk: boolean;
    sizeOk: boolean;
    error?: string;
  };
}

// --- CONFIGURATION FOR UPLOAD ZONES ---
const uploadZones = [
  { id: "images", label: "Medical Images", icon: Image, formats: "jpeg,png,dicom", maxSize: "100MB" },
  { id: "notes", label: "Clinical Notes", icon: FileText, formats: "pdf,doc,txt", maxSize: "50MB" },
  { id: "labs", label: "Lab Results", icon: FlaskConical, formats: "pdf,csv", maxSize: "50MB" },
  { id: "genetic", label: "Genetic Data", icon: Dna, formats: "vcf,bam", maxSize: "200MB" },
];

export function PatientDataUpload() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({
    images: [], notes: [], labs: [], genetic: [],
  });

  // --- VALIDATION AND HELPER FUNCTIONS ---
  const parseSize = (sizeStr: string): number => {
    const unit = sizeStr.slice(-2).toUpperCase();
    const value = parseFloat(sizeStr.slice(0, -2));
    if (unit === 'MB') return value * 1024 * 1024;
    if (unit === 'KB') return value * 1024;
    return value;
  };

  const validateFile = (file: File, category: string) => {
    const zone = uploadZones.find(z => z.id === category)!;
    const allowedFormats = zone.formats.toLowerCase().split(',');
    const maxSize = parseSize(zone.maxSize);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    const formatOk = allowedFormats.includes(extension);
    const sizeOk = file.size <= maxSize;
    
    let error: string | undefined;
    if (!formatOk) error = `Invalid format. Expected: ${zone.formats.toUpperCase()}`;
    if (!sizeOk) error = `File exceeds max size of ${zone.maxSize}`;
    
    return { formatOk, sizeOk, error };
  };

  // --- DYNAMIC FILE HANDLING AND UPLOAD LOGIC ---
  const handleFiles = async (fileList: File[], category: string) => {
    if (!session) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    const newUploads = fileList.map((file): UploadedFile => {
      const validation = validateFile(file, category);
      const initialStatus = validation.error ? 'error' : 'validating'; // Start with validating
      if (validation.error) {
        toast.error(`${file.name}: ${validation.error}`);
      }
      return {
        key: uuidv4(),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: initialStatus,
        validation,
      };
    });

    setFiles((prev) => ({ ...prev, [category]: [...prev[category], ...newUploads] }));

    newUploads.forEach(async (upload) => {
      if (upload.validation.error) return; // Don't upload invalid files

      setFiles((prev) => {
          const updatedCategory = prev[category].map((f) =>
            f.key === upload.key ? { ...f, status: 'uploading' as const } : f
          );
          return { ...prev, [category]: updatedCategory };
      });

      const filePath = `${session.user.id}/${category}/${Date.now()}_${upload.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical_records')
        .upload(filePath, upload.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setFiles((prev) => {
          const updatedCategory = prev[category].map((f) =>
            f.key === upload.key ? { ...f, status: 'error' as const, validation: { ...f.validation, error: uploadError.message } } : f
          );
          return { ...prev, [category]: updatedCategory };
        });
        toast.error(`Upload failed for ${upload.name}: ${uploadError.message}`);
      } else {
        setFiles((prev) => {
          const updatedCategory = prev[category].map((f) =>
            f.key === upload.key ? { ...f, status: 'success' as const, progress: 100, storagePath: filePath } : f
          );
          return { ...prev, [category]: updatedCategory };
        });
        toast.success(`${upload.name} uploaded successfully.`);
      }
    });
  };

  // --- DYNAMIC SUBMISSION LOGIC ---
  const handleProceedToAnalysis = async () => {
    setIsSubmitting(true);
    try {
      if (!session || !profile) throw new Error("Authentication error. Please log in again.");
      const token = session.access_token;
      
      const caseData = {
        status: "Pending Analysis",
        description: `Case submitted by patient: ${profile.first_name} ${profile.last_name}`,
        profile_info: {
          patient_id: profile.id,
          date_of_birth: profile.date_of_birth, // FIX: Accessed from the main profile object
          gender: profile.gender,             // FIX: Accessed from the main profile object
        }
      };
      const caseResponse = await axios.post('http://127.0.0.1:8000/api/cases/', caseData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseId = caseResponse.data.id;
      
      const allFilesData = Object.entries(files).flatMap(([category, fileArray]) => 
        fileArray
          .filter(f => f.status === 'success' && f.storagePath)
          .map(f => {
            const { data: { publicUrl } } = supabase.storage.from('medical-files').getPublicUrl(f.storagePath!);
            return {
              diagnostic_case: caseId,
              input_type: category,
              file_name: f.name,
              file_size: f.size,
              file_url: publicUrl,
            };
          })
      );

      if (allFilesData.length > 0) {
        await axios.post('http://127.0.0.1:8000/api/inputs/bulk-create/', allFilesData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      toast.success("Case submitted successfully! You will be notified when analysis is complete.");
      navigate('/patient/loading', { state: { caseId } });

    } catch (error: any) {
      console.error("Failed to create diagnostic case:", error);
      toast.error(error.response?.data?.detail || "Failed to submit your case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI-related handlers ---
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files), activeTab); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(Array.from(e.target.files), activeTab); };
  
  const removeFile = (category: string, key: string) => {
    setFiles((prev) => ({ ...prev, [category]: prev[category].filter((f) => f.key !== key) }));
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
                  <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                    <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-2">Drag & drop files here or <span className="text-primary font-semibold">browse</span></p>
                      <p className="text-sm text-muted-foreground">{zone.formats.toUpperCase()} • Max {zone.maxSize}</p>
                    </div>
                  </div>
                  {files[zone.id].length > 0 && (
                    <div className="space-y-3 mt-4">
                      {files[zone.id].map((upload) => (
                        <Card key={upload.key} className="p-3">
                          <div className="flex items-center gap-4">
                            {upload.status === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : upload.status === "error" ? <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" /> : <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{upload.name}</p>
                              <p className="text-xs text-muted-foreground">{(upload.size / 1024 / 1024).toFixed(2)} MB</p>
                              {upload.status === "uploading" && <Progress value={upload.progress} className="h-1.5 mt-2" />}
                              {upload.status === "error" && upload.validation?.error && (
                                <p className="text-xs text-destructive mt-1.5">{upload.validation.error}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => removeFile(zone.id, upload.key)}><X className="w-4 h-4" /></Button>
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
            <h3 className="font-semibold mb-4">Upload Summary</h3>
            <div className="space-y-4">
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Files Selected</span><span>{totalFiles}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Uploaded & Saved</span><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />{validatedFiles}</span></div>
                {hasErrors && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Errors</span><span className="flex items-center gap-1.5 text-destructive"><AlertCircle className="w-4 h-4" />{Object.values(files).flat().filter((f) => f.status === "error").length}</span></div>}
              </div>
            </div>
          </Card>
        </aside>
      </main>

      <footer className="sticky bottom-0">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} selected, {validatedFiles} uploaded
              {hasErrors && <span className="text-destructive ml-2">• {Object.values(files).flat().filter((f) => f.status === "error").length} error{Object.values(files).flat().filter((f) => f.status === "error").length !== 1 ? "s" : ""}</span>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" disabled={isSubmitting}><Save className="w-4 h-4 mr-2" />Save Draft</Button>
              <Button variant="outline" onClick={clearAll} disabled={totalFiles === 0 || isSubmitting}>Clear All</Button>
              <Button
                onClick={handleProceedToAnalysis} 
                disabled={validatedFiles === 0 || hasErrors || isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <>Proceed to Analysis <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </footer>
    </div>
  );
}