import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  Dna,
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


const MEDICAL_AI_API_URL = "https://recollectedly-unnuzzled-tonita.ngrok-free.dev";


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
}

export function HealthcareDataUpload() {
  const navigate = useNavigate();
  const [clinicianProfile, setClinicianProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientInfoOpen, setPatientInfoOpen] = useState(true);
  const [patientId, setPatientId] = useState("PT-2024-" + Math.floor(Math.random() * 1000).toString().padStart(3, "0"));
  const [dob, setDob] = useState("");
  const [dobError, setDobError] = useState("");
  const [gender, setGender] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [activeTab, setActiveTab] = useState("images");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({
    images: [],
    notes: [],
    labs: [],
    genetic: [],
  });

  const uploadZones = [
    { id: "images", label: "Medical Images", icon: Image, formats: "JPG, JPEG, PNG, DICOM", maxSize: "100MB" },
    { id: "notes", label: "Clinical Notes", icon: FileText, formats: "PDF, DOC, DOCX, TXT", maxSize: "50MB" },
    { id: "labs", label: "Lab Results", icon: FlaskConical, formats: "PDF, CSV, Excel, TXT", maxSize: "50MB" },
    { id: "genetic", label: "Genetic Data", icon: Dna, formats: "VCF, BAM, FASTQ, TXT, PDF", maxSize: "50MB" },
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const parseSize = (sizeStr: string): number => {
    const unit = sizeStr.slice(-2).toUpperCase();
    const value = parseFloat(sizeStr.slice(0, -2));
    if (unit === 'MB') return value * 1024 * 1024;
    if (unit === 'KB') return value * 1024;
    return value;
  };

  const validateFile = (file: File, category: string) => {
    const zone = uploadZones.find(z => z.id === category)!;
    const allowedFormats = zone.formats.toLowerCase().split(', ');
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

    let qualityScore = 80; 
    qualityScore += Math.floor(Math.random() * 20); 
    if (category === 'images' && file.size < 500 * 1024) { qualityScore -= 10; }
    if (extension === 'dicom') { qualityScore = Math.min(100, qualityScore + 10); }
    
    return { formatOk, sizeOk, qualityScore: Math.max(0, Math.min(100, qualityScore)) };
  };

  /**
   * Determines if a file is a medical image (for old image-only endpoint)
   * or a document/text file (for new document/text endpoints)
   */
  const getFileAnalysisType = (file: UploadedFile, category: string): 'image' | 'document' | 'text' => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Images go to image analysis endpoint
    if (['jpg', 'jpeg', 'png', 'dicom'].includes(extension)) {
      return 'image';
    }
    
    // Documents go to document analysis endpoint
    if (['pdf', 'doc', 'docx'].includes(extension)) {
      return 'document';
    }
    
    // Text files and others go to text analysis endpoint
    return 'text';
  };

  /**
   * Call the appropriate AI analysis endpoint based on file type
   */
  const analyzeWithAI = async (
    file: UploadedFile, 
    category: string,
    patientContext: string
  ): Promise<AnalysisResult> => {
    const analysisType = getFileAnalysisType(file, category);
    
    try {
      if (analysisType === 'image') {
        // Use existing image analysis endpoint
        toast.info("Analyzing medical image with AI...");
        
        const formData = new FormData();
        formData.append('image', file.file);
        formData.append('question', patientContext);
        
        const response = await axios.post(
          `${MEDICAL_AI_API_URL}/analyze_image`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000 // 60 second timeout
          }
        );
        
        // Parse the JSON string in result field
        const resultData = JSON.parse(response.data.result);
        return resultData;
        
      } else if (analysisType === 'document') {
        // Use new document analysis endpoint
        toast.info("Extracting and analyzing document with AI...");
        
        const formData = new FormData();
        formData.append('document', file.file);
        formData.append('patient_context', patientContext);
        
        const response = await axios.post(
          `${MEDICAL_AI_API_URL}/analyze_medical_document`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 90000 // 90 second timeout for OCR
          }
        );
        
        const resultData = JSON.parse(response.data.result);
        return resultData;
        
      } else {
        // Use text analysis endpoint (for TXT, CSV, etc.)
        toast.info("Analyzing medical text data with AI...");
        
        // Read file content as text
        const fileText = await file.file.text();
        
        const formData = new FormData();
        formData.append('medical_text', fileText);
        formData.append('patient_context', patientContext);
        
        const response = await axios.post(
          `${MEDICAL_AI_API_URL}/analyze_medical_text`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000
          }
        );
        
        const resultData = JSON.parse(response.data.result);
        return resultData;
      }
      
    } catch (error: any) {
      console.error(`AI ${analysisType} analysis error:`, error);
      
      // Enhanced error handling
      let errorMessage = "AI analysis failed";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Analysis timeout - file may be too large or complex";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  useEffect(() => {
    const fetchClinicianData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          toast.error("You are not logged in.");
          navigate('/healthcare/login');
          return;
        }
        const token = session.access_token;
        const userId = session.user.id;
        const response = await axios.get(
          `/api/clinicians/${userId}/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setClinicianProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch clinician data:", error);
        toast.error("Could not fetch your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClinicianData();
  }, [navigate]);

  // ============================================================================
  // MAIN ANALYSIS HANDLER
  // ============================================================================
  const handleProceedToAnalysis = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication error. Please log in again.");
      }

      const token = session.access_token;
      
      // Step 1: Create diagnostic case in your backend
      const caseData = {
        status: "Pending Analysis",
        description: `Chief Complaint: ${chiefComplaint}\n\nMedical History: ${medicalHistory}`,
        profile_info: {
          patient_id: patientId,
          date_of_birth: dob,
          gender: gender,
        }
      };
      
      const caseResponse = await axios.post('/api/cases/', caseData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseId = caseResponse.data.id;
      
      // Step 2: Save all uploaded files to your backend
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
        await axios.post('/api/inputs/bulk-create/', allFilesData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      toast.success("Diagnostic case and records created successfully!");
      
      // Step 3: Find the best file for AI analysis
      // Priority: images > documents > text files
      const allFiles = Object.entries(files).flatMap(([category, fileArray]) => 
        fileArray
          .filter(f => f.status === 'success')
          .map(f => ({ ...f, category }))
      );
      
      let fileForAnalysis = allFiles.find(f => f.category === 'images');
      if (!fileForAnalysis) {
        fileForAnalysis = allFiles.find(f => f.category === 'labs');
      }
      if (!fileForAnalysis) {
        fileForAnalysis = allFiles.find(f => f.category === 'notes');
      }
      if (!fileForAnalysis) {
        fileForAnalysis = allFiles.find(f => f.category === 'genetic');
      }

      if (!fileForAnalysis) {
        toast.info("No files available for AI analysis.");
        navigate('/healthcare/dashboard');
        return;
      }

      // Step 4: Prepare patient context for AI
      const patientContext = [
        chiefComplaint && `Chief Complaint: ${chiefComplaint}`,
        medicalHistory && `Medical History: ${medicalHistory}`,
        gender && `Gender: ${gender}`,
        dob && `Date of Birth: ${dob}`
      ].filter(Boolean).join('\n\n');

      // Step 5: Analyze with appropriate AI endpoint
      try {
        const analysisType = getFileAnalysisType(fileForAnalysis, fileForAnalysis.category);
        
        toast.info(`Starting ${analysisType} analysis...`);
        console.log(`Analyzing ${fileForAnalysis.name} as ${analysisType}`);
        
        const aiResult = await analyzeWithAI(
          fileForAnalysis,
          fileForAnalysis.category,
          patientContext || "No additional context provided"
        );

        toast.success("AI analysis complete!");
        
        // Navigate to results page with analysis data
        navigate('/healthcare/results', { 
          state: { 
            result: aiResult
          } 
        });

      } catch (aiError: any) {
        console.error("AI analysis failed:", aiError);
        toast.error(aiError.message || "AI analysis failed");
        
        // Still navigate but with error state
        const errorResult = {
          error: aiError.message || "Failed to get AI analysis",
          raw_output: aiError.response?.data || "No additional details available"
        };
        
        navigate('/healthcare/results', { 
          state: { 
            result: errorResult 
          } 
        });
      }

    } catch (error: any) {
      console.error("Failed to create diagnostic case:", error);
      toast.error(error.response?.data?.detail || "Failed to create the case");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) {
        setDobError("Date of birth cannot be in the future.");
      } else {
        setDobError("");
      }
    } else {
      setDobError("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setDragOver(true); 
  };
  
  const handleDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setDragOver(false); 
  };
  
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

  const handleFiles = async (fileList: File[], category: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    const newUploads = fileList.map((file) => {
      const validation = validateFile(file, category);
      const initialStatus = validation.error ? 'error' : 'uploading';

      if (validation.error) {
        toast.error(`${file.name}: ${validation.error}`);
      }

      return {
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: initialStatus as "uploading" | "success" | "error",
        validation,
      };
    });

    setFiles((prev) => ({ 
      ...prev, 
      [category]: [...prev[category], ...newUploads] 
    }));

    // Upload each file to Supabase storage
    newUploads.forEach(async (upload) => {
      if (upload.status !== 'uploading') return;

      const filePath = `${session.user.id}/${category}/${Date.now()}_${upload.name}`;
      const { error } = await supabase.storage
        .from('medical_records')
        .upload(filePath, upload.file);

      if (error) {
        setFiles((prev) => {
          const updatedCategory = prev[category].map((f) =>
            f.name === upload.name ? { 
              ...f, 
              status: 'error' as const, 
              validation: { 
                ...f.validation!, 
                error: error.message 
              } 
            } : f
          );
          return { ...prev, [category]: updatedCategory };
        });
        toast.error(`Upload failed for ${upload.name}`);
      } else {
        setFiles((prev) => {
          const updatedCategory = prev[category].map((f) =>
            f.name === upload.name ? { 
              ...f, 
              status: 'success' as const, 
              progress: 100, 
              storagePath: filePath 
            } : f
          );
          return { ...prev, [category]: updatedCategory };
        });
        toast.success(`${upload.name} uploaded successfully`);
      }
    });
  };
  
  const removeFile = (category: string, fileName: string) => {
    setFiles((prev) => ({ 
      ...prev, 
      [category]: prev[category].filter((f) => f.name !== fileName) 
    }));
    toast.info(`${fileName} removed`);
  };
  
  const clearAll = () => {
    setFiles({ images: [], notes: [], labs: [], genetic: [] });
    toast.info("All files cleared");
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);
  const successfulFiles = Object.values(files).flat().filter(f => f.status === 'success' && f.validation);
  const validatedFiles = successfulFiles.length;
  const hasErrors = Object.values(files).flat().some((f) => f.status === "error");

  const overallQuality = successfulFiles.length > 0
    ? Math.round(successfulFiles.reduce((sum, f) => sum + f.validation!.qualityScore, 0) / successfulFiles.length)
    : 0;

  // ============================================================================
  // RENDER
  // ============================================================================
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate('/healthcare/dashboard')} 
              className="cursor-pointer"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Upload Data</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Patient Data</h1>
          {clinicianProfile && (
            <p className="text-muted-foreground">
              Welcome, Dr. {clinicianProfile.user_details.first_name} {clinicianProfile.user_details.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Patient Information Collapsible */}
      <Collapsible open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
        <Card>
          <CollapsibleTrigger className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors">
            <h3 className="font-semibold">Patient Information (Optional)</h3>
            <ChevronDown 
              className={`w-5 h-5 transition-transform flex-shrink-0 ${
                patientInfoOpen ? "rotate-180" : ""
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 sm:px-6 pb-6 pt-4 border-t space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input 
                    id="patientId" 
                    value={patientId} 
                    onChange={(e) => setPatientId(e.target.value)} 
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={dob} 
                    onChange={handleDobChange} 
                    className={dobError ? "border-destructive" : ""}
                  />
                  {dobError && (
                    <p className="text-sm text-destructive mt-1">{dobError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complaint">Chief Complaint</Label>
                <Textarea 
                  id="complaint" 
                  value={chiefComplaint} 
                  onChange={(e) => setChiefComplaint(e.target.value)} 
                  placeholder="Describe the main symptoms or concerns..." 
                  rows={2}
                />
              </div>
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
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Upload Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Upload Medical Data</h3>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
                {uploadZones.map((zone) => {
                  const Icon = zone.icon;
                  const count = files[zone.id].length;
                  return (
                    <TabsTrigger 
                      key={zone.id} 
                      value={zone.id} 
                      className="relative flex-wrap h-12"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="truncate">{zone.label}</span>
                      {count > 0 && (
                        <Badge className="ml-2 h-5 px-1.5 text-xs">{count}</Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {uploadZones.map((zone) => (
                <TabsContent 
                  key={zone.id} 
                  value={zone.id} 
                  className="space-y-4 mt-4"
                >
                  <div className="text-sm text-muted-foreground">
                    {zone.formats} • Max {zone.maxSize}
                  </div>
                  
                  {/* Upload Zone */}
                  <div 
                    className="relative" 
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileSelect} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
                        dragOver 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm sm:text-base">
                        Drag & drop files or{" "}
                        <span className="text-primary font-semibold">browse</span>
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Maximum file size: {zone.maxSize}
                      </p>
                    </div>
                  </div>
                  
                  {/* Uploaded Files List */}
                  {files[zone.id].length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        Uploaded Files ({files[zone.id].length})
                      </h4>
                      {files[zone.id].map((file, idx) => (
                        <Card key={idx} className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            {file.status === "success" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : file.status === "error" ? (
                              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 flex-shrink-0">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              
                              {file.status === "uploading" && (
                                <Progress value={file.progress} className="h-1 mt-2" />
                              )}
                              
                              {file.status === "success" && file.validation && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                  <span className={`flex items-center gap-1 ${
                                    file.validation.formatOk ? 'text-green-500' : 'text-destructive'
                                  }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Format OK
                                  </span>
                                  <span className={`flex items-center gap-1 ${
                                    file.validation.sizeOk ? 'text-green-500' : 'text-destructive'
                                  }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Size OK
                                  </span>
                                  <span>Quality: {file.validation.qualityScore}%</span>
                                </div>
                              )}
                              
                              {file.status === "error" && file.validation?.error && (
                                <p className="text-xs text-destructive mt-1.5">
                                  {file.validation.error}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8" 
                                onClick={() => removeFile(zone.id, file.name)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
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
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Quality</span>
                  <span>{overallQuality}%</span>
                </div>
                <Progress value={overallQuality}/>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Files Uploaded</span>
                  <span>{totalFiles}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Validated</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {validatedFiles}
                  </span>
                </div>
                {hasErrors && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Errors</span>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {Object.values(files).flat().filter((f) => f.status === "error").length}
                    </span>
                  </div>
                )}
              </div>
              
              {hasErrors && (
                <Button variant="outline" className="w-full mt-4">
                  Fix Issues
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Bar - Sticky Bottom */}
      <Card className="p-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {totalFiles} file{totalFiles !== 1 ? "s" : ""} uploaded, {validatedFiles} validated
            {hasErrors && (
              <span className="text-destructive ml-2">
                • {Object.values(files).flat().filter((f) => f.status === "error").length} error
                {Object.values(files).flat().filter((f) => f.status === "error").length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-auto" 
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAll} 
              disabled={totalFiles === 0 || isSubmitting} 
              className="flex-1 sm:flex-auto"
            >
              Clear All
            </Button>
            
            <Button 
              onClick={handleProceedToAnalysis} 
              disabled={validatedFiles === 0 || hasErrors || isSubmitting} 
              className="bg-primary hover:bg-primary/90 flex-1 sm:flex-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Analyzing...
                </>
              ) : (
                <>
                  Proceed to Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card about AI Analysis */}
      {validatedFiles > 0 && !hasErrors && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-100">
                AI Analysis Ready
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your files will be analyzed using advanced AI. The system will automatically select 
                the most appropriate analysis method based on file type:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                <li><strong>Medical Images</strong> (JPG, PNG, DICOM): Visual analysis with LLaVA-Med</li>
                <li><strong>Documents</strong> (PDF, DOCX): Text extraction + RAG-enhanced diagnosis</li>
                <li><strong>Lab Results</strong> (TXT, CSV): Direct text analysis with medical knowledge base</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}