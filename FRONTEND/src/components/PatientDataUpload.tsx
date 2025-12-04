import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext"; // distinct from healthcare
import axios from "axios";

// UI Components
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input"; // Kept for consistency, though fewer inputs used
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  ArrowLeft,
  Upload,
  Image,
  FileText,
  FlaskConical,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Eye,
  Save,
  Loader2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

// === CONFIGURATION ===
const MEDICAL_AI_API_URL = "https://roffvw4k1z5a3n-8004.proxy.runpod.net";

// === INTERFACES ===
interface UploadedFile {
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "success" | "error";
  storagePath?: string;
  validation?: {
    formatOk: boolean;
    sizeOk: boolean;
    qualityScore: number;
    error?: string; 
  };
}

interface AnalysisResult {
  primaryDiagnosis: {
    name: string;
    confidence: number;
    description: string;
    icd10?: string;
  };
  differentialDiagnoses: Array<{
    name: string;
    confidence: number;
  }>;
  findings: string[];
  nextSteps: Array<{
    category: string;
    action: string;
  }>;
  dataSourcesAnalyzed?: {
    images: number;
    labResults: number;
    clinicalNotes: number;
    totalFiles: number;
  };
  dataSource?: string;
}

export function PatientDataUpload() {
  const navigate = useNavigate();
  const { profile, session } = useAuth(); // Hook to get logged-in patient details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientInfoOpen, setPatientInfoOpen] = useState(true);
  
  // === PATIENT INPUT STATE ===
  // Note: ID, DOB, Gender are removed as inputs, derived from 'profile' instead
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [geneticHistory, setGeneticHistory] = useState("");

  const [activeTab, setActiveTab] = useState("images");
  const [dragOver, setDragOver] = useState(false);
  
  // File state
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({
    images: [],
    notes: [],
    labs: [],
  });

  // Upload Zones (Matching Healthcare interface)
  const uploadZones = [
    { id: "images", label: "Medical Images", icon: Image, formats: "JPG, JPEG, PNG, DICOM", maxSize: "100MB" },
    { id: "notes", label: "Clinical Notes", icon: FileText, formats: "PDF, DOC, DOCX, TXT", maxSize: "50MB" },
    { id: "labs", label: "Lab Results", icon: FlaskConical, formats: "PDF, CSV, Excel, TXT", maxSize: "50MB" },
  ];

  // === VALIDATION HELPERS ===
  const parseSize = (sizeStr: string): number => {
    const unit = sizeStr.slice(-2).toUpperCase();
    const value = parseFloat(sizeStr.slice(0, -2));
    if (unit === 'MB') return value * 1024 * 1024;
    if (unit === 'KB') return value * 1024;
    return value;
  };

  const validateFile = (file: File, category: string) => {
    const zone = uploadZones.find(z => z.id === category)!;
    const allowedFormats = zone.formats.toLowerCase().replace(/\s+/g, '').split(',');
    const maxSize = parseSize(zone.maxSize);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    const formatOk = allowedFormats.includes(extension);
    const sizeOk = file.size <= maxSize;
    
    if (!formatOk) {
      return { formatOk, sizeOk, qualityScore: 0, error: `Invalid format. Expected: ${zone.formats}` };
    }
    if (!sizeOk) {
      return { formatOk, sizeOk, qualityScore: 0, error: `File exceeds max size of ${zone.maxSize}` };
    }

    // Mock quality score logic
    let qualityScore = 80; 
    qualityScore += Math.floor(Math.random() * 20); 
    if (category === 'images' && file.size < 500 * 1024) { qualityScore -= 10; }
    if (extension === 'dicom') { qualityScore = Math.min(100, qualityScore + 10); }
    
    return { formatOk, sizeOk, qualityScore: Math.max(0, Math.min(100, qualityScore)) };
  };

  const getFileAnalysisType = (file: UploadedFile, category: string): 'image' | 'document' | 'text' => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'dicom'].includes(extension)) return 'image';
    if (['pdf', 'doc', 'docx'].includes(extension)) return 'document';
    return 'text';
  };

  // === AI ANALYSIS LOGIC (SAME AS HEALTHCARE) ===
  
  // Single File Analysis
  const analyzeWithAI = async (
    file: UploadedFile, 
    category: string,
    patientContext: string,
    session: Session
  ): Promise<AnalysisResult> => {
    const analysisType = getFileAnalysisType(file, category);
    
    try {
      if (analysisType === 'image') {
        toast.info("Analyzing medical image with AI...");
        const formData = new FormData();
        formData.append('image', file.file);
        formData.append('question', patientContext);
        formData.append('user_id', session.user.id);
        
        const response = await axios.post(`${MEDICAL_AI_API_URL}/analyze_image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000 
        });
        return JSON.parse(response.data.result);
        
      } else if (analysisType === 'document') {
        toast.info("Extracting and analyzing document with AI...");
        const formData = new FormData();
        formData.append('document', file.file);
        formData.append('patient_context', patientContext);
        formData.append('user_id', session.user.id);
        
        const response = await axios.post(`${MEDICAL_AI_API_URL}/analyze_medical_document`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 90000 
        });
        return JSON.parse(response.data.result);
        
      } else {
        toast.info("Analyzing medical text data with AI...");
        const fileText = await file.file.text();
        const formData = new FormData();
        formData.append('medical_text', fileText);
        formData.append('patient_context', patientContext);
        formData.append('user_id', session.user.id);
        
        const response = await axios.post(`${MEDICAL_AI_API_URL}/analyze_medical_text`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        });
        return JSON.parse(response.data.result);
      }
    } catch (error: any) {
      console.error(`AI ${analysisType} analysis error:`, error);
      throw new Error(error.response?.data?.detail || error.message || "AI analysis failed");
    }
  };

  // Multi-File Analysis
  const analyzeMultipleFilesCombined = async (
    allFiles: Array<{ file: File; category: string; name: string }>,
    patientContext: string,
    session: Session
  ): Promise<AnalysisResult> => {
    try {
      toast.info(`Analyzing ${allFiles.length} files together for comprehensive diagnosis...`);
      const formData = new FormData();
      
      allFiles.forEach(fileData => formData.append('files', fileData.file));
      formData.append('patient_context', patientContext);
      formData.append('user_id', session.user.id);
      
      const response = await axios.post(`${MEDICAL_AI_API_URL}/analyze_multiple_files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000 
      });
      
      const resultData = JSON.parse(response.data.result);
      toast.success(`✅ Combined analysis complete! Analyzed ${resultData.dataSourcesAnalyzed?.totalFiles || allFiles.length} files`);
      return resultData;
      
    } catch (error: any) {
      console.error("Multi-file combined analysis error:", error);
      throw new Error(error.response?.data?.detail || error.message || "Combined AI analysis failed");
    }
  };

  // === MAIN HANDLER ===
  const handleProceedToAnalysis = async () => {
    setIsSubmitting(true);
    
    try {
      if (!session || !profile) {
        throw new Error("Authentication error. Please log in again.");
      }
      const token = session.access_token;
      
      // Step 1: Create diagnostic case in Django backend
      // Note: We use profile data for ID/DOB/Gender, but send the manually entered text fields
      const caseData = {
        status: "Pending Analysis",
        description: `Chief Complaint: ${chiefComplaint}\n\nMedical History: ${medicalHistory}\n\nGenetic History: ${geneticHistory}`,
        profile_info: {
          patient_id: profile.id,         // Automatically from profile
          date_of_birth: profile.date_of_birth, // Automatically from profile
          gender: profile.gender,         // Automatically from profile
          genetic_history: geneticHistory // Sent to DB
        }
      };
      
      const caseResponse = await axios.post('http://127.0.0.1:8000/api/cases/', caseData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseId = caseResponse.data.id;
      
      // Step 2: Save metadata to Django backend
      const allFilesData = Object.entries(files).flatMap(([category, fileArray]) => 
        fileArray
          .filter(f => f.status === 'success' && f.storagePath)
          .map(f => {
            const { data: { publicUrl } } = supabase.storage
              .from('medical_records')
              .getPublicUrl(f.storagePath!);
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
      
      toast.success("Medical records submitted successfully!");
      
      // Step 3: Collect files for AI
      const allFilesForAnalysis = Object.entries(files).flatMap(([category, fileArray]) => 
        fileArray
          .filter(f => f.status === 'success')
          .map(f => ({ file: f.file, category: category, name: f.name }))
      );

      if (allFilesForAnalysis.length === 0) {
        toast.info("No files available for AI analysis.");
        navigate('/patient/dashboard');
        return;
      }

      // Step 4: Build Context (Includes Profile + Manual Inputs)
      const patientContext = [
        `Patient Name: ${profile.first_name} ${profile.last_name}`,
        chiefComplaint && `Chief Complaint: ${chiefComplaint}`,
        medicalHistory && `Medical History: ${medicalHistory}`,
        geneticHistory && `Genetic History: ${geneticHistory}`,
        profile.gender && `Gender: ${profile.gender}`,
        profile.date_of_birth && `Date of Birth: ${profile.date_of_birth}`,
        profile.id && `Patient ID: ${profile.id}`
      ].filter(Boolean).join('\n\n');

      // Step 5: Execute AI Analysis
      try {
        let aiResult: AnalysisResult;
        
        if (allFilesForAnalysis.length > 1) {
          toast.info("🔬 Performing comprehensive multi-modal analysis...");
          aiResult = await analyzeMultipleFilesCombined(allFilesForAnalysis, patientContext, session);
        } else {
          const fileForAnalysis = allFilesForAnalysis[0];
           // Construct a temporary uploaded file object for the helper
          const tempFileObj: UploadedFile = {
            file: fileForAnalysis.file,
            name: fileForAnalysis.name,
            size: fileForAnalysis.file.size,
            progress: 100,
            status: 'success'
          };
          
          aiResult = await analyzeWithAI(
            tempFileObj,
            fileForAnalysis.category,
            patientContext,
            session
          );
          toast.success("AI analysis complete!");
        }

        // Navigate to results
        navigate('/patient/results', { 
          state: { 
            caseId: caseId,
            result: aiResult,
            metadata: {
              filesAnalyzed: allFilesForAnalysis.length,
              analysisType: allFilesForAnalysis.length > 1 ? 'combined' : 'single'
            }
          } 
        });

      } catch (aiError: any) {
        console.error("AI analysis failed:", aiError);
        toast.error(aiError.message || "AI analysis failed");
        
        // Navigate with error state
        navigate('/patient/results', { 
          state: { 
            caseId: caseId,
            result: { error: aiError.message, raw_output: aiError.response?.data } 
          } 
        });
      }

    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.detail || "Failed to submit data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === UI HANDLERS ===
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files), activeTab); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(Array.from(e.target.files), activeTab); };
  
  const handleFiles = async (fileList: File[], category: string) => {
    if (!session) { toast.error("Please log in."); return; }

    const newUploads = fileList.map((file) => {
      const validation = validateFile(file, category);
      const initialStatus = validation.error ? 'error' : 'uploading';
      if (validation.error) toast.error(`${file.name}: ${validation.error}`);

      return {
        file, name: file.name, size: file.size, progress: 0, status: initialStatus as "uploading" | "success" | "error", validation,
      };
    });

    setFiles((prev) => ({ ...prev, [category]: [...prev[category], ...newUploads] }));

    newUploads.forEach(async (upload) => {
      if (upload.status !== 'uploading') return;
      const filePath = `${session.user.id}/${category}/${Date.now()}_${upload.name}`;
      const { error } = await supabase.storage.from('medical_records').upload(filePath, upload.file);

      setFiles((prev) => {
        const updatedCategory = prev[category].map((f) =>
          f.name === upload.name ? { 
            ...f, 
            status: error ? ('error' as const) : ('success' as const), 
            progress: 100, 
            storagePath: error ? undefined : filePath,
            validation: error ? { ...f.validation!, error: error.message } : f.validation
          } : f
        );
        return { ...prev, [category]: updatedCategory };
      });
      
      if (error) toast.error(`Upload failed for ${upload.name}`);
      else toast.success(`${upload.name} uploaded`);
    });
  };

  const removeFile = (category: string, fileName: string) => {
    setFiles((prev) => ({ ...prev, [category]: prev[category].filter((f) => f.name !== fileName) }));
  };
  
  const clearAll = () => {
    setFiles({ images: [], notes: [], labs: [] });
    toast.info("All files cleared");
  };

  // Stats
  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);
  const successfulFiles = Object.values(files).flat().filter(f => f.status === 'success' && f.validation);
  const validatedFiles = successfulFiles.length;
  const hasErrors = Object.values(files).flat().some((f) => f.status === "error");
  const overallQuality = successfulFiles.length > 0 ? Math.round(successfulFiles.reduce((sum, f) => sum + f.validation!.qualityScore, 0) / successfulFiles.length) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/patient/dashboard')} className="cursor-pointer">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Upload Data</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      

      {/* Patient Information Collapsible*/}
      <Collapsible open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
        <Card>
          <CollapsibleTrigger className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors">
            <h3 className="font-semibold">Clinical Information (Optional)</h3>
            <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${patientInfoOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 sm:px-6 pb-6 pt-4 border-t space-y-4">
              {/* Removed Row with ID, DOB, Gender */}
              
              <div className="space-y-2">
                <Label htmlFor="complaint">Chief Complaint</Label>
                <Textarea 
                  id="complaint" 
                  value={chiefComplaint} 
                  onChange={(e) => setChiefComplaint(e.target.value)} 
                  placeholder="Describe your main symptoms or concerns..." 
                  rows={2}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="history">Medical History</Label>
                  <Textarea 
                    id="history" 
                    value={medicalHistory} 
                    onChange={(e) => setMedicalHistory(e.target.value)} 
                    placeholder="Relevant medical history, medications, allergies..." 
                    rows={3}
                  />
                </div>
                {/* Genetic History */}
                <div className="space-y-2">
                  <Label htmlFor="geneticHistory">Genetic History</Label>
                  <Textarea 
                    id="geneticHistory" 
                    value={geneticHistory} 
                    onChange={(e) => setGeneticHistory(e.target.value)} 
                    placeholder="Family history of genetic disorders, carrier status..." 
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Upload Section - Same as Healthcare */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Upload Medical Data</h3>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 h-auto">
                {uploadZones.map((zone) => {
                  const Icon = zone.icon;
                  const count = files[zone.id].length;
                  return (
                    <TabsTrigger key={zone.id} value={zone.id} className="relative flex-wrap h-12">
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="truncate">{zone.label}</span>
                      {count > 0 && <Badge className="ml-2 h-5 px-1.5 text-xs">{count}</Badge>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {uploadZones.map((zone) => (
                <TabsContent key={zone.id} value={zone.id} className="space-y-4 mt-4">
                  <div className="text-sm text-muted-foreground">{zone.formats} • Max {zone.maxSize}</div>
                  
                  <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                    <div className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"}`}>
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm sm:text-base">Drag & drop files or <span className="text-primary font-semibold">browse</span></p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Maximum file size: {zone.maxSize}</p>
                    </div>
                  </div>
                  
                  {files[zone.id].length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Uploaded Files ({files[zone.id].length})</h4>
                      {files[zone.id].map((file, idx) => (
                        <Card key={idx} className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            {file.status === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : file.status === "error" ? <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" /> : <div className="w-5 h-5 flex-shrink-0"><div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /></div>}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-2" />}
                              {file.status === "success" && file.validation && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                  <span className={`flex items-center gap-1 ${file.validation.formatOk ? 'text-green-500' : 'text-destructive'}`}><CheckCircle2 className="w-3 h-3" />Format OK</span>
                                  <span className={`flex items-center gap-1 ${file.validation.sizeOk ? 'text-green-500' : 'text-destructive'}`}><CheckCircle2 className="w-3 h-3" />Size OK</span>
                                  <span>Quality: {file.validation.qualityScore}%</span>
                                </div>
                              )}
                              {file.status === "error" && file.validation?.error && <p className="text-xs text-destructive mt-1.5">{file.validation.error}</p>}
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

        {/* Data Quality Sidebar */}
        <div>
          <Card className="p-6 lg:sticky lg:top-8">
            <h3 className="font-semibold mb-4">Data Quality Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-muted-foreground">Overall Quality</span><span>{overallQuality}%</span></div>
                <Progress value={overallQuality}/>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Files Uploaded</span><span>{totalFiles}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Validated</span><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />{validatedFiles}</span></div>
                {hasErrors && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Errors</span><span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-3 h-3" />{Object.values(files).flat().filter((f) => f.status === "error").length}</span></div>}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <Card className="p-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {totalFiles} file{totalFiles !== 1 ? "s" : ""} uploaded, {validatedFiles} validated
            {hasErrors && <span className="text-destructive ml-2">• {Object.values(files).flat().filter((f) => f.status === "error").length} error(s)</span>}
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-auto" disabled={isSubmitting}><Save className="w-4 h-4 mr-2" />Save as Draft</Button>
            <Button variant="outline" onClick={clearAll} disabled={totalFiles === 0 || isSubmitting} className="flex-1 sm:flex-auto">Clear All</Button>
            <Button onClick={handleProceedToAnalysis} disabled={validatedFiles === 0 || hasErrors || isSubmitting} className="bg-primary hover:bg-primary/90 flex-1 sm:flex-auto">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <>Proceed to Analysis<ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      {validatedFiles > 0 && !hasErrors && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-100">{validatedFiles > 1 ? "🔬 Comprehensive Multi-Modal Analysis" : "How Your Data Will Be Analyzed"}</h4>
              {validatedFiles > 1 ? (
                <>
                  <p className="text-xs text-blue-700 dark:text-blue-300"><strong>All {validatedFiles} files will be analyzed together</strong> for a comprehensive diagnosis.</p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                    <li><strong>Combined Analysis:</strong> Imaging findings + Lab results + Clinical notes</li>
                    <li><strong>Cross-Validation:</strong> AI correlates abnormalities across modalities</li>
                  </ul>
                </>
              ) : (
                <p className="text-xs text-blue-700 dark:text-blue-300">Your file will be analyzed using advanced AI optimized for {Object.keys(files).find(k => files[k].length > 0)}.</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}