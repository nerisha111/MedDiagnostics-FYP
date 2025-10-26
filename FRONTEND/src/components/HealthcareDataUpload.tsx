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
    {
      id: "images",
      label: "Medical Images",
      icon: Image,
      formats: "JPEG, PNG, DICOM",
      maxSize: "100MB",
    },
    {
      id: "notes",
      label: "Clinical Notes",
      icon: FileText,
      formats: "PDF, DOC, TXT",
      maxSize: "50MB",
    },
    {
      id: "labs",
      label: "Laboratory Results",
      icon: FlaskConical,
      formats: "PDF, CSV, Excel",
      maxSize: "50MB",
    },
    {
      id: "genetic",
      label: "Genetic Information",
      icon: Dna,
      formats: "VCF, BAM, FASTQ",
      maxSize: "50MB",
    },
  ];

  // 2. Added a handler for date of birth with validation
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles, activeTab);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles, activeTab);
    }
  };

  const handleFiles = (fileList: File[], category: string) => {
    fileList.forEach((file) => {
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
        validation: {
          integrity: false,
          format: false,
          quality: 0,
        },
      };

      setFiles((prev) => ({
        ...prev,
        [category]: [...prev[category], newFile],
      }));

      // Simulate upload and validation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
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
                    validation: {
                      integrity: true,
                      format: true,
                      quality: Math.floor(Math.random() * 20) + 80,
                    },
                  }
                : f
            ),
          }));
          toast.success(`${file.name} uploaded and validated`);
        } else {
          setFiles((prev) => ({
            ...prev,
            [category]: prev[category].map((f) =>
              f.name === file.name ? { ...f, progress } : f
            ),
          }));
        }
      }, 150);
    });
  };

  const removeFile = (category: string, fileName: string) => {
    setFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((f) => f.name !== fileName),
    }));
    toast.info(`${fileName} removed`);
  };

  const clearAll = () => {
    setFiles({
      images: [],
      notes: [],
      labs: [],
      genetic: [],
    });
    toast.info("All files cleared");
  };

  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);
  const validatedFiles = Object.values(files)
    .flat()
    .filter((f) => f.status === "success").length;
  const hasErrors = Object.values(files)
    .flat()
    .some((f) => f.status === "error");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Breadcrumb */}
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

        {/* Progress Stepper */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            {["Upload", "Preprocessing", "Analysis", "Results"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      idx === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={idx === 0 ? "" : "text-muted-foreground"}>
                    {step}
                  </span>
                </div>
                {idx < 3 && (
                  <div className="w-24 h-0.5 bg-muted mx-4" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Upload Patient Data</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/healthcare/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Patient Information */}
        <Collapsible open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
          <Card>
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors">
              <h3>Patient Information (Optional)</h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  patientInfoOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
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
                  {/* 3. Replaced Age with Date of Birth input */}
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={handleDobChange}
                      className={dobError ? "border-destructive" : ""}
                    />
                     {dobError && <p className="text-sm text-destructive mt-1">{dobError}</p>}
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Upload Medical Data</h1>
          </div>
        </div>

        {/* Multimodal Upload Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="mb-4">Upload Medical Data</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  {uploadZones.map((zone) => {
                    const Icon = zone.icon;
                    const count = files[zone.id].length;
                    return (
                      <TabsTrigger key={zone.id} value={zone.id} className="relative">
                        <Icon className="w-4 h-4 mr-2" />
                        {zone.label}
                        {count > 0 && (
                          <Badge className="ml-2 h-5 px-1.5 text-xs">{count}</Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {uploadZones.map((zone) => (
                  <TabsContent key={zone.id} value={zone.id} className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Supported formats: {zone.formats} • Max size: {zone.maxSize}
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
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                          dragOver
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="mb-2">
                          Drag & drop files here or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {zone.formats} • Max {zone.maxSize}
                        </p>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {files[zone.id].length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm">Uploaded Files ({files[zone.id].length})</h4>
                        {files[zone.id].map((file, idx) => (
                          <Card key={idx} className="p-4">
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
                                <p className="truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {file.status === "uploading" && (
                                  <Progress value={file.progress} className="h-1 mt-2" />
                                )}
                                {file.status === "success" && (
                                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                      Integrity
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                      Format
                                    </span>
                                    <span>Quality: {file.validation.quality}%</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
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

          {/* Data Quality Check Panel */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="mb-4">Data Quality Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Quality</span>
                    <span>
                      {validatedFiles > 0
                        ? Math.round(
                            Object.values(files)
                              .flat()
                              .filter((f) => f.status === "success")
                              .reduce((sum, f) => sum + f.validation.quality, 0) /
                              validatedFiles
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      validatedFiles > 0
                        ? Object.values(files)
                            .flat()
                            .filter((f) => f.status === "success")
                            .reduce((sum, f) => sum + f.validation.quality, 0) /
                          validatedFiles
                        : 0
                    }
                  />
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

        {/* Bottom Action Bar */}
        <Card className="p-6 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} uploaded, {validatedFiles}{" "}
              validated
              {hasErrors && (
                <span className="text-destructive ml-2">
                  • {Object.values(files).flat().filter((f) => f.status === "error").length}{" "}
                  error{Object.values(files).flat().filter((f) => f.status === "error").length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" onClick={clearAll} disabled={totalFiles === 0}>
                Clear All
              </Button>
              <Button
                onClick={() => navigate('/loading')}
                disabled={validatedFiles === 0 || hasErrors}
                className="bg-primary hover:bg-primary/90"
              >
                Proceed to Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}