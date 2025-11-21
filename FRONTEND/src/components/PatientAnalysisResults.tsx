import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Image,
  FlaskConical,
  Info,
  AlertCircle,
  ShieldCheck,
  Heart,
  BarChart,
  UserCheck,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Microscope,
  Brain,
  Target,
  Pill
} from "lucide-react";
import { format } from 'date-fns';
import { useState } from 'react';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

interface PatientAnalysisResultsProps {
  onFeedback?: () => void;
}

export function PatientAnalysisResults({ onFeedback }: PatientAnalysisResultsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [downloading, setDownloading] = useState(false);
  
  // Get data passed from upload page
  const { result, caseId, allResults, metadata, error } = location.state || {};
  
  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">Analysis Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate('/patient/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/patient/upload')}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle no data state
  if (!result || !result.primaryDiagnosis) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
              <h2 className="text-2xl font-bold">No Results Available</h2>
              <p className="text-muted-foreground">
                We couldn't find any analysis results. Please upload your medical data first.
              </p>
              <Button onClick={() => navigate('/patient/upload')} className="mt-4">
                Upload Medical Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Extract data from FastAPI result
  const primaryDiagnosis = result.primaryDiagnosis;
  const findings = result.findings || [];
  const differentialDiagnoses = result.differentialDiagnoses || [];
  const nextSteps = result.nextSteps || [];
  const dataSourcesAnalyzed = result.dataSourcesAnalyzed;
  const clinicalGuidelines = result.clinicalGuidelines;
  const recommendedTests = result.recommendedTests || [];
  const recommendedTreatments = result.recommendedTreatments || [];
  
  // Helper functions
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };
  
  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 80) return "default";
    if (confidence >= 60) return "secondary";
    return "destructive";
  };
  
  // FIXED: Added safety check for undefined category
  const getCategoryIcon = (category?: string) => {
    const categoryLower = (category || "unknown").toLowerCase();
    if (categoryLower.includes('imaging') || categoryLower.includes('images')) return <Image className="w-4 h-4" />;
    if (categoryLower.includes('lab') || categoryLower.includes('blood')) return <FlaskConical className="w-4 h-4" />;
    if (categoryLower.includes('treatment') || categoryLower.includes('medication')) return <Pill className="w-4 h-4" />;
    if (categoryLower.includes('notes') || categoryLower.includes('document')) return <FileText className="w-4 h-4" />;
    if (categoryLower.includes('specialist')) return <Stethoscope className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };
  
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Initialize PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Header
      pdf.setFillColor(13, 148, 136); 
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DIAGNOSTIC CASE REPORT', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-Assisted Analysis', pageWidth / 2, 30, { align: 'center' });
      
      yPos = 50;
      
      // Case Info Box
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'FD');
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      const col1X = 20;
      const col2X = 85;
      const col3X = 150;
      
      pdf.text('CASE ID', col1X, yPos + 8);
      pdf.text('DATE GENERATED', col2X, yPos + 8);
      pdf.text('STATUS', col3X, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      const shortCaseId = caseId ? caseId.substring(0, 18) + '...' : 'N/A';
      pdf.text(shortCaseId, col1X, yPos + 16);
      pdf.text(format(new Date(), 'MM/dd/yyyy'), col2X, yPos + 16);
      pdf.text('Complete', col3X, yPos + 16);
      
      yPos += 35;
      
      // PRIMARY DIAGNOSIS SECTION
      pdf.setFillColor(240, 248, 255);
      pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
      
      pdf.setTextColor(13, 148, 136);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRIMARY DIAGNOSIS', 20, yPos + 8);
      
      yPos += 15;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const diagnosisLines = pdf.splitTextToSize(primaryDiagnosis.name, pageWidth - 40);
      pdf.text(diagnosisLines, 20, yPos);
      yPos += diagnosisLines.length * 6 + 3;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`AI Confidence Model: ${primaryDiagnosis.confidence}%`, 20, yPos);
      yPos += 8;
      
      if (primaryDiagnosis.description) {
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const descLines = pdf.splitTextToSize(primaryDiagnosis.description, pageWidth - 40);
        pdf.text(descLines, 20, yPos);
        yPos += descLines.length * 5 + 5;
      }
      
      if (primaryDiagnosis.icd10) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`ICD-10 Code: ${primaryDiagnosis.icd10}`, 20, yPos);
        yPos += 8;
      }
      
      // DIFFERENTIAL DIAGNOSES
      if (differentialDiagnoses.length > 0) {
        yPos += 5;
        if (yPos > pageHeight - 60) { pdf.addPage(); yPos = 20; }
        
        pdf.setFillColor(240, 248, 255);
        pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
        
        pdf.setTextColor(13, 148, 136);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DIFFERENTIAL DIAGNOSES', 20, yPos + 8);
        yPos += 15;
        
        differentialDiagnoses.forEach((diagnosis: any, index: number) => {
          if (yPos > pageHeight - 20) { pdf.addPage(); yPos = 20; }
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const diagText = `${index + 1}. ${diagnosis.name} (${diagnosis.confidence}% confidence)`;
          const lines = pdf.splitTextToSize(diagText, pageWidth - 40);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5 + 3;
        });
        yPos += 5;
      }
      
      // FINDINGS
      if (findings.length > 0) {
        if (yPos > pageHeight - 60) { pdf.addPage(); yPos = 20; }
        
        pdf.setFillColor(240, 248, 255);
        pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
        
        pdf.setTextColor(13, 148, 136);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KEY CLINICAL FINDINGS', 20, yPos + 8);
        yPos += 15;
        
        findings.forEach((finding: string) => {
          if (yPos > pageHeight - 20) { pdf.addPage(); yPos = 20; }
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const findingLines = pdf.splitTextToSize(`• ${finding}`, pageWidth - 40);
          pdf.text(findingLines, 20, yPos);
          yPos += findingLines.length * 5 + 2;
        });
        yPos += 5;
      }
      
      // TABLE: RECOMMENDATIONS
      if (nextSteps.length > 0 || recommendedTests.length > 0 || recommendedTreatments.length > 0) {
        if (yPos > pageHeight - 80) { pdf.addPage(); yPos = 20; }
        
        pdf.setFillColor(240, 248, 255);
        pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
        
        pdf.setTextColor(13, 148, 136);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECOMMENDATIONS & PLAN', 20, yPos + 8);
        yPos += 15;
        
        const tableData: any[] = [];
        let rowNum = 1;
        
        nextSteps.forEach((step: any) => tableData.push([rowNum++, step.action, step.category || 'General']));
        recommendedTests.forEach((test: any) => tableData.push([rowNum++, test.test_name || test.name, 'Test / ' + (test.test_category || 'Diagnostic')]));
        recommendedTreatments.forEach((treatment: any) => tableData.push([rowNum++, treatment.treatment_name || treatment.name, 'Treatment']));
        
        autoTable(pdf, {
          startY: yPos,
          head: [['#', 'Recommended Action / Test / Treatment', 'Category']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 130 }, 2: { cellWidth: 40 } },
          margin: { left: 15, right: 15 }
        });
        
        yPos = (pdf as any).lastAutoTable.finalY + 10;
      }
      
      // DISCLAIMER
      if (yPos > pageHeight - 40) { pdf.addPage(); yPos = 20; }
      
      pdf.setFillColor(255, 248, 220);
      pdf.setDrawColor(255, 193, 7);
      pdf.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'FD');
      
      pdf.setTextColor(120, 80, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONFIDENTIAL:', 20, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      const disclaimerText = 'This report is generated by an AI system for informational purposes only. It does not constitute a medical diagnosis. All findings must be verified by a qualified healthcare professional.';
      const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 40);
      pdf.text(disclaimerLines, 20, yPos + 14);
      
      // Footer Page Numbers
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      pdf.save(`Medical_Report_${format(new Date(), 'yyyy-MM-dd')}_${caseId?.substring(0, 8) || 'analysis'}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Analysis Report</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Completed: {format(new Date(), 'MMMM dd, yyyy, h:mm a')}
            </p>
            {caseId && <p className="text-xs text-muted-foreground mt-1">Case ID: {caseId}</p>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-1/2 sm:w-auto" onClick={handleDownloadPDF} disabled={downloading}>
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Generating...' : 'PDF'}
            </Button>
            <Button onClick={() => navigate('/patient/dashboard')} className="w-1/2 sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </header>

        {/* Critical Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-amber-900">This is AI-Assisted Analysis, Not a Medical Diagnosis</h3>
              <p className="text-sm text-amber-800 mt-2">
                This report was generated by artificial intelligence. It helps you understand your health but is not a diagnosis.
              </p>
              <p className="text-sm font-semibold text-amber-900 mt-3">
                ⚠️ Do NOT use this as a substitute for professional medical advice. Always consult your doctor.
              </p>
            </div>
          </div>
        </div>

        <main className="space-y-8">
          {/* Primary Diagnosis */}
          <Card className="overflow-hidden shadow-md border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Primary Finding
                  </CardTitle>
                </div>
                <Badge variant={getConfidenceBadgeVariant(primaryDiagnosis.confidence)} className="text-sm px-3 py-1">
                  {primaryDiagnosis.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-3">{primaryDiagnosis.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{primaryDiagnosis.description}</p>
              </div>
              {primaryDiagnosis.icd10 && (
                <div className="p-3 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground"><span className="font-semibold">ICD-10 Code:</span> {primaryDiagnosis.icd10}</p>
                </div>
              )}
              <div className={`p-4 rounded-lg border-2 ${getConfidenceColor(primaryDiagnosis.confidence)}`}>
                <p className="font-semibold flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5" /> Most Important Next Step
                </p>
                <p className="text-sm">
                  Schedule an appointment with your healthcare provider to discuss these findings and create a personalized care plan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources Analyzed */}
          {dataSourcesAnalyzed && (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-primary" /> Data Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dataSourcesAnalyzed.images > 0 && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Image className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">{dataSourcesAnalyzed.images}</p>
                      <p className="text-xs text-muted-foreground">Medical Images</p>
                    </div>
                  )}
                  {dataSourcesAnalyzed.labResults > 0 && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <FlaskConical className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">{dataSourcesAnalyzed.labResults}</p>
                      <p className="text-xs text-muted-foreground">Lab Results</p>
                    </div>
                  )}
                  {dataSourcesAnalyzed.clinicalNotes > 0 && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-600">{dataSourcesAnalyzed.clinicalNotes}</p>
                      <p className="text-xs text-muted-foreground">Clinical Notes</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                    <p className="text-2xl font-bold text-indigo-600">{dataSourcesAnalyzed.totalFiles}</p>
                    <p className="text-xs text-muted-foreground">Total Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Differential Diagnoses */}
          {differentialDiagnoses.length > 0 && (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" /> Alternative Possibilities
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Other conditions sharing similar characteristics</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {differentialDiagnoses.map((diagnosis: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <p className="font-medium">{diagnosis.name}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">{diagnosis.confidence}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Findings */}
          {findings.length > 0 && (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Key Clinical Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {findings.map((finding: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground flex-1">{finding}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations - Unified List */}
          {(nextSteps.length > 0 || recommendedTests.length > 0 || recommendedTreatments.length > 0) && (
            <Card className="overflow-hidden shadow-sm border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" /> Your Recommended Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Next Steps */}
                {nextSteps.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Immediate Actions</h4>
                    {nextSteps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-white border">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(step.category)}
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-1 text-xs">{step.category || "Action"}</Badge>
                          <p className="text-sm text-muted-foreground">{step.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Treatments */}
                {recommendedTreatments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> Suggested Treatments</h4>
                    {recommendedTreatments.map((t: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-red-50/50 border border-red-100">
                        <p className="font-medium text-sm">{t.treatment_name || t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description || "Standard therapy"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tests */}
                {recommendedTests.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-green-500" /> Recommended Tests</h4>
                    {recommendedTests.map((t: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-green-50/50 border border-green-100">
                        <p className="font-medium text-sm">{t.test_name || t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.rationale || "Diagnostic confirmation"}</p>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          )}

        </main>
        
        {/* Footer */}
        <footer>
          <Card className="p-6 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">Your Privacy is Protected</p>
                  <p className="text-sm text-muted-foreground">
                    This analysis is confidential and stored securely. Share these results only with healthcare providers you trust.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {onFeedback && (
                  <Button variant="outline" onClick={onFeedback} className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" /> Provide Feedback
                  </Button>
                )}
                <Button onClick={() => navigate('/patient/upload')} className="flex-1">
                  Upload New Data
                </Button>
              </div>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
}