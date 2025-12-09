import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Download, FileText, MessageSquare, Image, FlaskConical, CheckCircle2,
  Info, ExternalLink, TrendingUp, Activity, ArrowLeft, AlertCircle, 
  Pill, TestTube, BookOpen, Shield, Clock, AlertTriangle, Save
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../supabaseClient'; 

// --- Imports for PDF Generation ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Interfaces ---
interface PrimaryDiagnosis {
  name: string;
  confidence: number;
  description: string;
  icd10?: string;
  riskLevel?: string;
}

interface DifferentialDiagnosis {
  name: string;
  confidence: number;
  description?: string;
}

interface NextStep {
  category: string;
  action: string;
  priority?: number;
  description?: string;
}

interface ClinicalGuideline {
  id?: string;
  diagnosis_name?: string;
  icd10_code?: string;
  summary?: string;
  keyRecommendations?: string[];
  evidenceLevel?: string;
  source?: string;
  last_updated?: string;
  guideline_url?: string;
}

interface RecommendedTest {
  id?: string;
  test_name?: string;
  name?: string;
  category?: string;
  test_category?: string;
  rationale?: string;
  description?: string;
  priority?: string;
  typical_cost?: string;
  turnaround_time?: string;
}

interface RecommendedTreatment {
  id?: string;
  treatment_name?: string;
  name?: string;
  category?: string;
  treatment_category?: string;
  description?: string;
  dosage?: string;
  duration?: string;
  side_effects?: string;
  contraindications?: string;
  line?: string;
  treatment_line?: string;
}

interface AnalysisResult {
  id?: string;             
  diagnosis_id?: string;   
  primaryDiagnosis?: PrimaryDiagnosis;
  differentialDiagnoses?: DifferentialDiagnosis[];
  findings?: string[];
  nextSteps?: NextStep[];
  clinicalGuidelines?: ClinicalGuideline;
  recommendedTests?: RecommendedTest[];
  recommendedTreatments?: RecommendedTreatment[];
  dataSource?: string;
  error?: string;
  raw_output?: string;
  caseId?: string;
  caseDate?: string;
}

interface LocationState {
  result?: AnalysisResult;
}

interface DiagnosticResultsProps {
  onFeedback?: (diagnosisId: string) => void;
}

// --- EXPORT FUNCTION ---
export function DiagnosticResults({ onFeedback }: DiagnosticResultsProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveAttemptedRef = useRef(false);

  // --- Auto-Save Logic ---
  const saveDiagnosisToBackend = async (data: AnalysisResult) => {
    // Prevent duplicate saves
    if (saveAttemptedRef.current || data.id || data.diagnosis_id) return;
    
    // Ensure we have a caseId to attach to
    if (!data.caseId) {
      console.warn("Cannot save diagnosis: Missing caseId");
      return;
    }

    saveAttemptedRef.current = true;
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      // 1. Consolidate Recommendations for Backend format
      const backendRecommendations: { name: string | undefined; category: string; type: string; description: string; }[] = [];

      // Map Next Steps
      if (data.nextSteps) {
        data.nextSteps.forEach(step => {
          backendRecommendations.push({
            name: step.action,
            category: step.category,
            type: 'Plan',
            description: step.description || ''
          });
        });
      }

      // Map Tests
      if (data.recommendedTests) {
        data.recommendedTests.forEach(test => {
          backendRecommendations.push({
            name: test.test_name || test.name,
            category: test.category || test.test_category || 'Test',
            type: 'Diagnostic',
            description: test.rationale || test.description || ''
          });
        });
      }

      // Map Treatments
      if (data.recommendedTreatments) {
        data.recommendedTreatments.forEach(rx => {
          backendRecommendations.push({
            name: rx.treatment_name || rx.name,
            category: rx.category || rx.treatment_category || 'Treatment',
            type: 'Medication',
            description: rx.description || ''
          });
        });
      }

      // 2. Prepare Payload
      const payload = {
        case_id: data.caseId,
        diagnosis: {
          name: data.primaryDiagnosis?.name || "Unknown",
          confidence: data.primaryDiagnosis?.confidence || 0,
          description: data.primaryDiagnosis?.description || ""
        },
        recommendations: backendRecommendations
      };

      // 3. Send Request
      const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/diagnosis/save/`; 
      
      console.log("Auto-saving diagnosis to:", API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }

      const result = await response.json();
      console.log("Save success:", result);

      // 4. Update local state with the new ID
      setAnalysis(prev => prev ? ({
        ...prev,
        id: result.diagnosis_id, 
        diagnosis_id: result.diagnosis_id
      }) : null);

      toast.success("Analysis saved to patient history");

    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Note: Result not saved to database. Feedback unavailable.");
      saveAttemptedRef.current = false; 
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (state?.result) {
      console.log("Diagnostic Results Loaded:", state.result);

      if (state.result.error) {
        toast.error(state.result.error);
      }

      const raw = state.result;
      const normalizedAnalysis: AnalysisResult = {
        ...raw,
        id: raw.id || raw.diagnosis_id
      };

      setAnalysis(normalizedAnalysis);
      setIsLoading(false);

      // Trigger auto-save if ID is missing but we have a caseId
      if (!normalizedAnalysis.id && !normalizedAnalysis.diagnosis_id && normalizedAnalysis.caseId) {
        saveDiagnosisToBackend(normalizedAnalysis);
      }

    } else {
      toast.error("No analysis data found. Redirecting...");
      navigate('/healthcare/upload');
    }
  }, [state, navigate]);

  const handleFeedbackClick = () => {
    if (!analysis) return;

    // Check if we have a valid ID to attach feedback to
    const validId = analysis.id || analysis.diagnosis_id;

    if (!validId) {
      if (analysis.caseId && !isSaving) {
        toast.loading("Saving diagnosis first...");
        saveDiagnosisToBackend(analysis);
      } else {
        toast.error("Cannot provide feedback: Diagnosis not saved yet.");
      }
      return;
    }

    // --- REDIRECT TO FEEDBACK SYSTEM ---
    // We pass the diagnosisId in the state so the feedback page can select it
    navigate('/healthcare/feedback', { 
      state: { 
        diagnosisId: validId,
        caseId: analysis.caseId,
        fromDiagnosis: true
      } 
    });
  };

  // --- PDF Export Logic ---
  const handleExportReport = () => {
    if (!analysis) return;

    const toastId = toast.loading("Generating report...");

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const primaryColor: [number, number, number] = [15, 118, 110];
      const secondaryColor: [number, number, number] = [100, 116, 139]; 
      const accentColor: [number, number, number] = [241, 245, 249]; 

      let yPos = 0;

      const addHeader = () => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("DIAGNOSTIC CASE REPORT", margin, 25);

        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1);
        const iconX = pageWidth - margin - 10;
        doc.line(iconX - 5, 20, iconX + 5, 20);
        doc.line(iconX, 15, iconX, 25);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("AI-Assisted Analysis", pageWidth - margin - 20, 32, { align: 'right' });

        yPos = 55;
      };

      const addFooter = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          
          doc.setDrawColor(200);
          doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

          const disclaimer = "CONFIDENTIAL: This report is generated by an AI system as a clinical support tool. It does not constitute a final diagnosis. All findings must be verified by a qualified healthcare professional.";
          doc.text(disclaimer, margin, pageHeight - 18, { maxWidth: contentWidth - 30 });
          
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
        }
      };

      addHeader();

      doc.setDrawColor(220);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.setFont("helvetica", "bold");
      
      const col1X = margin + 5;
      const col2X = margin + 80;
      const col3X = margin + 135;

      doc.text("CASE ID", col1X, yPos + 10);
      doc.text("DATE GENERATED", col2X, yPos + 10);
      doc.text("SOURCE", col3X, yPos + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      
      const displayId = analysis.caseId ? analysis.caseId.slice(0, 13) + "..." + analysis.caseId.slice(-4) : "N/A";
      const displayDate = analysis.caseDate ? new Date(analysis.caseDate).toLocaleDateString() : new Date().toLocaleDateString();
      
      doc.text(displayId, col1X, yPos + 18);
      doc.text(displayDate, col2X, yPos + 18);
      doc.text(analysis.dataSource || "AI Analysis", col3X, yPos + 18);

      yPos += 45;

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("PRIMARY DIAGNOSIS", margin, yPos);
      yPos += 7;

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      const diagText = analysis.primaryDiagnosis?.name || "Pending Diagnosis";
      const diagSplit = doc.splitTextToSize(diagText, contentWidth - 10);
      const boxHeight = (diagSplit.length * 7) + 20;

      doc.setFillColor(...accentColor);
      doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
      
      doc.setTextColor(0);
      doc.text(diagSplit, margin + 5, yPos + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Confidence Score: ${analysis.primaryDiagnosis?.confidence || 0}%`, margin + 5, yPos + boxHeight - 5);

      yPos += boxHeight + 15;

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("CLINICAL FINDINGS & DESCRIPTION", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.setFont("helvetica", "normal");
      
      const descText = analysis.primaryDiagnosis?.description || "No description available.";
      const splitDesc = doc.splitTextToSize(descText, contentWidth);
      doc.text(splitDesc, margin, yPos);
      
      yPos += (splitDesc.length * 5) + 10;

      if (analysis.findings && analysis.findings.length > 0) {
         yPos += 5;
         analysis.findings.forEach(finding => {
           const findingText = `• ${finding}`;
           const splitFinding = doc.splitTextToSize(findingText, contentWidth);
           if (yPos + (splitFinding.length * 5) > pageHeight - 30) {
             doc.addPage();
             yPos = 20;
           }
           doc.text(splitFinding, margin, yPos);
           yPos += (splitFinding.length * 5);
         });
         yPos += 10;
      }

      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("RECOMMENDED ACTIONS", margin, yPos);
      yPos += 5;

      const nextStepsData = (analysis.nextSteps || []).map((step, idx) => [
        step.priority || "Normal",
        step.category,
        step.action
      ]);

      if (nextStepsData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Priority', 'Category', 'Action']],
          body: nextStepsData,
          theme: 'grid',
          headStyles: { 
            fillColor: primaryColor, 
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 'auto' }
          },
          styles: { 
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          margin: { left: margin, right: margin }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text("No specific immediate actions generated.", margin, yPos + 10);
      }

      addFooter();
      doc.save(`Report_${analysis.caseId || 'Medical'}.pdf`);
      toast.dismiss(toastId);
      toast.success("Report exported successfully");

    } catch (error: any) {
      console.error("Export error:", error);
      toast.dismiss(toastId);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading Analysis Results...</p>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getCategoryIcon = (category: string) => {
    if (!category) return <Info className="w-4 h-4" />;
    const cat = category.toLowerCase();
    if (cat.includes('imaging')) return <Image className="w-4 h-4" />;
    if (cat.includes('lab') || cat.includes('test')) return <FlaskConical className="w-4 h-4" />;
    if (cat.includes('treatment') || cat.includes('medication') || cat.includes('pharmacological')) 
      return <Pill className="w-4 h-4" />;
    if (cat.includes('follow') || cat.includes('review')) return <CheckCircle2 className="w-4 h-4" />;
    if (cat.includes('lifestyle')) return <Activity className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const p = priority.toLowerCase();
    if (p.includes('high') || p.includes('urgent'))
      return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
    if (p.includes('medium') || p.includes('moderate'))
      return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
    return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
  };

  const getEvidenceColor = (level?: string) => {
    if (!level) return "text-muted-foreground";
    const l = level.toUpperCase();
    if (l === 'A') return "text-green-600";
    if (l === 'B') return "text-blue-600";
    if (l === 'C') return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/healthcare/upload')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Comprehensive Diagnostic Report</h1>
              <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
  
                Case ID: {analysis.caseId} • 
                {analysis.caseDate ? new Date(analysis.caseDate).toLocaleDateString() : 'Date not available'}
                {analysis.dataSource && (
                  <Badge variant="outline" className="ml-2">
                    {analysis.dataSource === "Clinical Database" ? " Evidence-Based" : "AI-Generated"}
                  </Badge>
                )}
                {/* Visual indicator for Save Status */}
                {analysis.id && (
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                    </Badge>
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Diagnosis */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">Primary Diagnosis</Badge>
                      {analysis.primaryDiagnosis?.icd10 && (
                        <Badge variant="secondary" className="text-xs">
                          ICD-10: {analysis.primaryDiagnosis.icd10}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">
                      {analysis.primaryDiagnosis?.name || "Unknown Diagnosis"}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysis.primaryDiagnosis?.description || "No description available."}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Diagnostic Confidence
                    </span>
                    <span className={`text-sm font-bold ${getConfidenceColor(analysis.primaryDiagnosis?.confidence || 0)}`}>
                      {analysis.primaryDiagnosis?.confidence || 0}%
                    </span>
                  </div>
                  <Progress value={analysis.primaryDiagnosis?.confidence || 0} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Clinical Guidelines Section */}
            {analysis.clinicalGuidelines && Object.keys(analysis.clinicalGuidelines).length > 0 && (
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Clinical Guidelines</h3>
                        <p className="text-xs text-muted-foreground">
                          Evidence-based management recommendations
                        </p>
                      </div>
                    </div>
                    {analysis.clinicalGuidelines.evidenceLevel && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${getEvidenceColor(analysis.clinicalGuidelines.evidenceLevel)}`}
                      >
                        Evidence Level: {analysis.clinicalGuidelines.evidenceLevel}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {analysis.clinicalGuidelines.summary && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm">Clinical Overview</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.clinicalGuidelines.summary}
                      </p>
                    </div>
                  )}

                  {analysis.clinicalGuidelines.keyRecommendations && 
                   analysis.clinicalGuidelines.keyRecommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Key Clinical Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysis.clinicalGuidelines.keyRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <span>
                      Source: {analysis.clinicalGuidelines.source || "Clinical Database"}
                    </span>
                    {analysis.clinicalGuidelines.guideline_url && (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Full Guideline
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Tabbed Section for Tests and Treatments */}
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tests" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Recommended Tests
                  {analysis.recommendedTests && analysis.recommendedTests.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{analysis.recommendedTests.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="treatments" className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Treatment Options
                  {analysis.recommendedTreatments && analysis.recommendedTreatments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{analysis.recommendedTreatments.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Recommended Tests Tab */}
              <TabsContent value="tests" className="space-y-4 mt-4">
                {analysis.recommendedTests && analysis.recommendedTests.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.recommendedTests.map((test, idx) => (
                      <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {getCategoryIcon(test.category || test.test_category || "")}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-sm">
                                    {test.test_name || test.name}
                                  </h4>
                                  {getPriorityBadge(test.priority)}
                                </div>
                                <Badge variant="outline" className="text-xs mb-2">
                                  {test.category || test.test_category || "Diagnostic"}
                                </Badge>
                                {(test.rationale || test.description) && (
                                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {test.rationale || test.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {(test.turnaround_time || test.typical_cost) && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                              {test.turnaround_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {test.turnaround_time}
                                </div>
                              )}
                              {test.typical_cost && (
                                <div className="flex items-center gap-1">
                                  <span>💰</span>
                                  {test.typical_cost}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <TestTube className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No specific tests recommended in database. 
                      Consult with healthcare provider for appropriate diagnostic workup.
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* Treatment Options Tab */}
              <TabsContent value="treatments" className="space-y-4 mt-4">
                {analysis.recommendedTreatments && analysis.recommendedTreatments.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.recommendedTreatments.map((treatment, idx) => (
                      <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-green-500/10 rounded-lg">
                                <Pill className="w-4 h-4 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-sm">
                                    {treatment.treatment_name || treatment.name}
                                  </h4>
                                  {(treatment.line || treatment.treatment_line) && (
                                    <Badge 
                                      variant={(treatment.line || treatment.treatment_line)?.toLowerCase().includes('first') ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {treatment.line || treatment.treatment_line}
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs mb-2">
                                  {treatment.category || treatment.treatment_category || "Treatment"}
                                </Badge>
                                {treatment.description && (
                                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {treatment.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Treatment Details */}
                          <div className="space-y-2 pt-2 border-t">
                            {treatment.dosage && (
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Dosage:</span>
                                <span className="text-xs text-foreground">{treatment.dosage}</span>
                              </div>
                            )}
                            {treatment.duration && (
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Duration:</span>
                                <span className="text-xs text-foreground">{treatment.duration}</span>
                              </div>
                            )}
                            {treatment.side_effects && (
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-muted-foreground">Side Effects:</span>
                                  <p className="text-xs text-foreground mt-1">{treatment.side_effects}</p>
                                </div>
                              </div>
                            )}
                            {treatment.contraindications && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-muted-foreground">Contraindications:</span>
                                  <p className="text-xs text-foreground mt-1">{treatment.contraindications}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No specific treatments recommended in database. 
                      Consult with healthcare provider for appropriate treatment plan.
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Differential Diagnoses */}
            {analysis.differentialDiagnoses && analysis.differentialDiagnoses.length > 0 && (
              <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Differential Diagnoses</h3>
                      <p className="text-xs text-muted-foreground">
                        Alternative conditions to consider based on clinical presentation
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {analysis.differentialDiagnoses.map((diagnosis, idx) => (
                      <Card key={idx} className="p-4 hover:bg-muted/50 transition-all border-l-2 border-l-orange-400">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm flex-1">{diagnosis.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${getConfidenceColor(diagnosis.confidence)}`}
                            >
                              {diagnosis.confidence}%
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={diagnosis.confidence} 
                            className="h-2"
                          />
                          
                          {diagnosis.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {diagnosis.description}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                    <p className="text-xs text-muted-foreground">
                      <Info className="w-3 h-3 inline mr-1" />
                      These alternative diagnoses should be considered during clinical evaluation. 
                      Further testing may help differentiate between these possibilities.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Key Findings Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Key Clinical Findings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Significant observations from analysis
              </p>
              <ul className="space-y-3">
                {analysis.findings?.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence Summary */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getConfidenceColor(analysis.primaryDiagnosis?.confidence || 0)}`}>
                  {analysis.primaryDiagnosis?.confidence || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Confidence</p>
              </div>
            </Card>

            {/* Next Steps from Original Analysis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Recommended Actions</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Immediate clinical actions
              </p>
              <div className="space-y-3">
                {analysis.nextSteps?.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="border-l-4 border-primary pl-4 py-3 bg-muted/30 rounded-r-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(step.category)}
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {step.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm leading-relaxed">
                      {step.action}
                    </h4>
                  </div>
                ))}
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Medical Disclaimer</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This AI analysis is for informational purposes only and should not replace 
                    professional medical advice. Always consult with a qualified healthcare provider.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card className="p-4 sticky bottom-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Analysis complete with {analysis.primaryDiagnosis?.confidence || 0}% confidence
                </span>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <span className="text-xs text-muted-foreground">
                Generated by LLaVA-Med AI
              </span>
            </div>
        
          </div>
        </Card>
      </div>
    </div>
  );
}