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

// === CONFIGURATION ===
// 🔥 IMPORTANT: Use your RunPod public URL, NOT localhost!
const MEDICAL_AI_API_URL = "https://roffvw4k1z5a3n-8004.proxy.runpod.net";

// === INTERFACES ===
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
  patientGuidance?: {
    urgency: string;
    recommendedActions: string[];
    disclaimer: string;
  };
}

// === UPLOAD ZONES CONFIGURATION ===
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

  // === FILE HANDLING ===
  const handleFiles = async (fileList: File[], category: string) => {
    if (!session) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    const newUploads = fileList.map((file): UploadedFile => {
      const validation = validateFile(file, category);
      const initialStatus = validation.error ? 'error' : 'validating';
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

    // Upload each valid file to Supabase
    newUploads.forEach(async (upload) => {
      if (upload.validation.error) return;

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

  // === MAIN ANALYSIS HANDLER - WORKS WITH EXISTING FASTAPI ===
  const handleProceedToAnalysis = async () => {
    setIsSubmitting(true);
    
    try {
      if (!session || !profile) throw new Error("Authentication error. Please log in again.");
      const token = session.access_token;
      
      // Step 1: Create diagnostic case in Django backend
      const caseData = {
        status: "Pending Analysis",
        description: `Case submitted by patient: ${profile.first_name} ${profile.last_name}`,
        profile_info: {
          patient_id: profile.id,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
        }
      };
      
      const caseResponse = await axios.post('http://127.0.0.1:8000/api/cases/', caseData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseId = caseResponse.data.id;
      
      // Step 2: Save all uploaded files metadata to Django
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
      
      toast.success("Case created successfully! Starting AI analysis...");
      
      // Step 3: Prepare files for AI analysis
      const allFilesForAnalysis = Object.entries(files).flatMap(([category, fileArray]) => 
        fileArray
          .filter(f => f.status === 'success')
          .map(f => ({
            file: f.file,
            category: category,
            name: f.name
          }))
      );

      if (allFilesForAnalysis.length === 0) {
        toast.info("No files available for AI analysis.");
        navigate('/patient/dashboard');
        return;
      }

      // Step 4: Build patient context
      const patientContext = [
        profile.first_name && profile.last_name && `Patient: ${profile.first_name} ${profile.last_name}`,
        profile.gender && `Gender: ${profile.gender}`,
        profile.date_of_birth && `Date of Birth: ${profile.date_of_birth}`,
        profile.id && `Patient ID: ${profile.id}`
      ].filter(Boolean).join('\n\n');

      // Step 5: Analyze files using your EXISTING FastAPI endpoints
      toast.info("🔬 Analyzing your medical data with AI...", {
        description: `Processing ${allFilesForAnalysis.length} file(s)`
      });

      const analysisResults: any[] = [];
      
      for (const fileData of allFilesForAnalysis) {
        let endpoint = '';
        let fieldName = '';
        try {
          const formData = new FormData();
          const fileExtension = fileData.name.split('.').pop()?.toLowerCase() || '';
          
          // Determine which endpoint to use based on file type
          
          if (['jpg', 'jpeg', 'png', 'dicom'].includes(fileExtension)) {
            // Use /analyze_image
            endpoint = `${MEDICAL_AI_API_URL}/analyze_image`;
            fieldName = 'image';
            formData.append(fieldName, fileData.file);
            formData.append('question', patientContext || "Analyze this medical image");
            formData.append('user_id', session.user.id);
            
          } else if (['pdf', 'doc', 'docx', 'txt'].includes(fileExtension)) {
            // Use /analyze_medical_document
            endpoint = `${MEDICAL_AI_API_URL}/analyze_medical_document`;
            fieldName = 'document';
            formData.append(fieldName, fileData.file);
            formData.append('patient_context', patientContext || "");
            formData.append('user_id', session.user.id);
            
          } else {
            console.warn(`Unsupported file type: ${fileExtension}`);
            continue;
          }
          
          toast.info(`Analyzing ${fileData.name}...`);
          
          console.log(`📤 Sending request to: ${endpoint}`);
          console.log(`📄 File: ${fileData.name} (${fileExtension})`);
          
          const response = await axios.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000 // 2 minutes per file
          });
          
          console.log(`✅ Response received:`, response.data);
          
          const result = JSON.parse(response.data.result);
          analysisResults.push({
            fileName: fileData.name,
            category: fileData.category,
            result: result
          });
          
          toast.success(`✅ ${fileData.name} analyzed`);
          
        } catch (fileError: any) {
          console.error(`❌ Error analyzing ${fileData.name}:`, fileError);
          console.error('Error details:', {
            message: fileError.message,
            response: fileError.response?.data,
            status: fileError.response?.status,
            endpoint: endpoint
          });
          toast.error(`Failed to analyze ${fileData.name}: ${fileError.message}`);
          // Continue with other files
        }
      }
      
      if (analysisResults.length === 0) {
        throw new Error("No files were successfully analyzed");
      }
      
      // Step 6: Combine results (use the first/most confident result)
      const primaryResult = analysisResults.reduce((best, current) => {
        const bestConf = best.result?.primaryDiagnosis?.confidence || 0;
        const currentConf = current.result?.primaryDiagnosis?.confidence || 0;
        return currentConf > bestConf ? current : best;
      });
      
      const combinedResult = primaryResult.result;
      
      // Add metadata about all analyzed files
      combinedResult.dataSourcesAnalyzed = {
        totalFiles: analysisResults.length,
        images: analysisResults.filter(r => r.category === 'images').length,
        labResults: analysisResults.filter(r => r.category === 'labs').length,
        clinicalNotes: analysisResults.filter(r => r.category === 'notes').length,
      };
      
      // Step 7: Save diagnosis to Django backend
      const diagnosisData = {
        diagnostic_case: caseId,
        name: combinedResult.primaryDiagnosis.name,
        confidence: combinedResult.primaryDiagnosis.confidence,
        clinician_comment: combinedResult.primaryDiagnosis.description,
        is_reviewed: false
      };
      
      const diagnosisResponse = await axios.post(
        'http://127.0.0.1:8000/api/diagnoses/',
        diagnosisData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const diagnosisId = diagnosisResponse.data.id;
      
      // Step 8: Save recommendations
      if (combinedResult.nextSteps && combinedResult.nextSteps.length > 0) {
        const recommendationsData = combinedResult.nextSteps.map((step: any) => ({
          diagnosis: diagnosisId,
          name: step.action,
          category: step.category,
          type: step.category,
          is_reviewed: false
        }));
        
        await Promise.all(
          recommendationsData.map((rec: any) =>
            axios.post('http://127.0.0.1:8000/api/recommendations/', rec, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          )
        );
      }
      
      toast.success("✅ Analysis complete!", {
        description: `Analyzed ${analysisResults.length} file(s)`
      });
      
      // Navigate to results
      navigate('/patient/results', { 
        state: { 
          caseId: caseId,
          result: combinedResult,
          allResults: analysisResults,
          metadata: {
            filesAnalyzed: analysisResults.length,
            analysisType: analysisResults.length > 1 ? 'multiple' : 'single'
          }
        } 
      });

    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.detail || error.message || "Failed to complete analysis");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === UI HANDLERS ===
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setDragOver(false); 
    handleFiles(Array.from(e.dataTransfer.files), activeTab); 
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files) handleFiles(Array.from(e.target.files), activeTab); 
  };
  
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <>Proceed to Analysis <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </footer>

      {/* Info Card */}
      {validatedFiles > 0 && !hasErrors && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-100">
                {validatedFiles > 1 ? "🔬 Comprehensive Analysis" : "AI-Powered Analysis"}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your files will be analyzed using advanced medical AI. The system will provide preliminary insights that should be reviewed by a healthcare professional.
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 font-semibold">
                ⚠️ This is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}