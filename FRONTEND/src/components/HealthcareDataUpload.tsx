import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
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
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

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

export function HealthcareDataUpload() {
  const navigate = useNavigate();
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
    { id: "images", label: "Medical Images", icon: Image, formats: "JPEG, PNG, DICOM", maxSize: "100MB" },
    { id: "notes", label: "Clinical Notes", icon: FileText, formats: "PDF, DOC, TXT", maxSize: "50MB" },
    { id: "labs", label: "Lab Results", icon: FlaskConical, formats: "PDF, CSV, Excel", maxSize: "50MB" },
    { id: "genetic", label: "Genetic Data", icon: Dna, formats: "VCF, BAM, FASTQ", maxSize: "50MB" },
  ];

  // --- All handlers remain unchanged ---
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
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) => ({
            ...prev,
            [category]: prev[category].map((f) =>
              f.name === file.name
                ? { ...f, progress: 100, status: "success", validation: { integrity: true, format: true, quality: Math.floor(Math.random() * 20) + 80 } }
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
      }, 150);
    });
  };
  const removeFile = (category: string, fileName: string) => {
    setFiles((prev) => ({ ...prev, [category]: prev[category].filter((f) => f.name !== fileName) }));
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
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/healthcare/dashboard')} className="cursor-pointer">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Upload Data</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

    

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Patient Data</h1>
        </div>
      </div>

      <Collapsible open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
        <Card>
          <CollapsibleTrigger className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors">
            <h3 className="font-semibold">Patient Information (Optional)</h3>
            <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${ patientInfoOpen ? "rotate-180" : "" }`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 sm:px-6 pb-6 pt-4 border-t space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="patientId">Patient ID</Label><Input id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Auto-generated"/></div>
                <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" type="date" value={dob} onChange={handleDobChange} className={dobError ? "border-destructive" : ""}/>{dobError && <p className="text-sm text-destructive mt-1">{dobError}</p>}</div>
                <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="complaint">Chief Complaint</Label><Textarea id="complaint" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Describe the main symptoms or concerns..." rows={2}/></div>
              <div className="space-y-2"><Label htmlFor="history">Medical History</Label><Textarea id="history" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} placeholder="Relevant medical history, medications, allergies..." rows={3}/></div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Medical Data</h1>
        </div>
      </div>

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
                              {file.status === "success" && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />Integrity</span>
                                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />Format</span>
                                  <span>Quality: {file.validation.quality}%</span>
                                </div>
                              )}
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

        <div>
          <Card className="p-6 lg:sticky lg:top-8">
            <h3 className="font-semibold mb-4">Data Quality Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-muted-foreground">Overall Quality</span><span>{validatedFiles > 0 ? Math.round(Object.values(files).flat().filter((f) => f.status === "success").reduce((sum, f) => sum + f.validation.quality, 0) / validatedFiles) : 0}%</span></div>
                <Progress value={validatedFiles > 0 ? Object.values(files).flat().filter((f) => f.status === "success").reduce((sum, f) => sum + f.validation.quality, 0) / validatedFiles : 0}/>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Files Uploaded</span><span>{totalFiles}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Validated</span><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />{validatedFiles}</span></div>
                {hasErrors && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Errors</span><span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-3 h-3" />{Object.values(files).flat().filter((f) => f.status === "error").length}</span></div>}
              </div>
              {hasErrors && <Button variant="outline" className="w-full mt-4">Fix Issues</Button>}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4 sticky bottom-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {totalFiles} file{totalFiles !== 1 ? "s" : ""} uploaded, {validatedFiles} validated
            {hasErrors && <span className="text-destructive ml-2">• {Object.values(files).flat().filter((f) => f.status === "error").length} error{Object.values(files).flat().filter((f) => f.status === "error").length !== 1 ? "s" : ""}</span>}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-auto">
              <Save className="w-4 h-4 mr-2" />Save as Draft
            </Button>
            <Button variant="outline" onClick={clearAll} disabled={totalFiles === 0} className="flex-1 sm:flex-auto">
              Clear All
            </Button>
            <Button onClick={() => navigate('/loading')} disabled={validatedFiles === 0 || hasErrors} className="bg-primary hover:bg-primary/90 flex-1 sm:flex-auto">
              Proceed to Analysis<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}