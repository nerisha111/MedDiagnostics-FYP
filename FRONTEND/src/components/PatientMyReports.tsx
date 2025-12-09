import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  FileText,
  Download,
  Eye,
  Calendar,
  Image,
  FlaskConical,
  Dna,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface Report {
  id: string;
  case_id: string;
  type: string;
  diagnosis: string;
  date: string;
  status: "complete" | "processing" | "pending";
  confidence: number;
  dataSources: string[];
  diagnosis_id?: string;
  description?: string;
}

interface ReportDetail extends Report {
  
  findings: string[];
  nextSteps: Array<{
    category: string;
    action: string;
  }>;
  profile_info?: any;
}

export function PatientMyReports() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!session) {
      toast.error("You must be logged in to view reports");
      navigate('/patient/login');
      return;
    }

    setLoading(true);
    try {
      //secure API call with Bearer token
      const response = await axios.get('http://127.0.0.1:8000/api/patients/reports/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      setReports(response.data);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error(error.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (diagnosisId: string) => {
    if (!session) return;

    setLoadingDetail(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/patients/reports/${diagnosisId}/`,
        { headers: { 'Authorization': `Bearer ${session.access_token}` } }
      );
      
      setSelectedReport(response.data);
    } catch (error: any) {
      console.error('Error fetching report detail:', error);
      toast.error('Failed to load report details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewReport = (report: Report) => {
    if (report.status === "complete" && report.diagnosis_id) {
      fetchReportDetail(report.diagnosis_id);
    }
  };

  const generatePDF = async (report: ReportDetail) => {
    setDownloadingPDF(report.id);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      
      //header and branding
      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MEDICAL ANALYSIS REPORT', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Patient Report', pageWidth / 2, 30, { align: 'center' });
      
      yPos = 50;
      
      // Case Information
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'FD');
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      pdf.text('REPORT ID', 20, yPos + 8);
      pdf.text('DATE', 85, yPos + 8);
      pdf.text('STATUS', 150, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      pdf.text(report.id.substring(0, 20), 20, yPos + 16);
      pdf.text(format(new Date(report.date), 'MM/dd/yyyy'), 85, yPos + 16);
      pdf.text('Complete', 150, yPos + 16);
      
      yPos += 35;
      // Primary Diagnosis
      pdf.setFillColor(240, 248, 255);
      pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
      
      pdf.setTextColor(13, 148, 136);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRIMARY FINDING', 20, yPos + 8);
      
      yPos += 15;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const diagnosisLines = pdf.splitTextToSize(report.diagnosis, pageWidth - 40);
      pdf.text(diagnosisLines, 20, yPos);
      yPos += diagnosisLines.length * 6 + 3;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Confidence: ${report.confidence}%`, 20, yPos);
      yPos += 8;
      
      if (report.description) {
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const descLines = pdf.splitTextToSize(report.description, pageWidth - 40);
        pdf.text(descLines, 20, yPos);
        yPos += descLines.length * 5 + 5;
      }
      
      // Key Findings
      if (report.findings && report.findings.length > 0) {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFillColor(240, 248, 255);
        pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
        
        pdf.setTextColor(13, 148, 136);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KEY FINDINGS', 20, yPos + 8);
        
        yPos += 15;
        
        report.findings.forEach((finding: string) => {
          if (yPos > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const findingLines = pdf.splitTextToSize(`• ${finding}`, pageWidth - 40);
          pdf.text(findingLines, 20, yPos);
          yPos += findingLines.length * 5 + 2;
        });
        
        yPos += 5;
      }
      
      //dynamic recommendations table
      if (report.nextSteps && report.nextSteps.length > 0) {
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFillColor(240, 248, 255);
        pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
        
        pdf.setTextColor(13, 148, 136);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECOMMENDATIONS', 20, yPos + 8);
        
        yPos += 15;
        
        const tableData = report.nextSteps.map((step: any, index: number) => [
          index + 1,
          step.action,
          step.category
        ]);
        
        autoTable(pdf, {
          startY: yPos,
          head: [['#', 'Recommended Action', 'Category']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [13, 148, 136],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 130 },
            2: { cellWidth: 40 }
          },
          margin: { left: 15, right: 15 }
        });
        
        yPos = (pdf as any).lastAutoTable.finalY + 10;
      }
      
      //disclaimer section
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFillColor(255, 248, 220);
      pdf.setDrawColor(255, 193, 7);
      pdf.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'FD');
      
      pdf.setTextColor(120, 80, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONFIDENTIAL:', 20, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      const disclaimerText = 'This report is AI-generated for informational purposes only. It does not constitute medical advice. Always consult with your healthcare provider.';
      const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 40);
      pdf.text(disclaimerLines, 20, yPos + 14);
      
      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Save
      const fileName = `Medical_Report_${format(new Date(report.date), 'yyyy-MM-dd')}_${report.id.substring(0, 8)}.pdf`;
      pdf.save(fileName);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case "images":
      case "image":
        return <Image className="w-4 h-4" />;
      case "labs":
      case "lab":
        return <FlaskConical className="w-4 h-4" />;
      case "notes":
      case "note":
      case "clinical_notes":
        return <FileText className="w-4 h-4" />;
      case "genetic":
      case "genomic":
        return <Dna className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search reports by ID, diagnosis, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Diagnostic Analysis">Diagnostic Analysis</SelectItem>
                <SelectItem value="Follow-up Analysis">Follow-up Analysis</SelectItem>
                <SelectItem value="Initial Screening">Initial Screening</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>
          </div>
        </Card>

        {/* Reports Display */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
          </p>

          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewReport(report)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {report.type}
                        </Badge>
                        <h3 className="mb-1 line-clamp-2">{report.diagnosis}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{report.id}</p>
                      </div>
                      <Badge
                        variant={
                          report.status === "complete"
                            ? "default"
                            : report.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {report.status === "complete" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {report.status === "processing" && <Clock className="w-3 h-3 mr-1" />}
                        {report.status === "complete"
                          ? "Complete"
                          : report.status === "processing"
                          ? "Processing"
                          : "Pending"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(report.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {report.status === "complete" && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${report.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm">{report.confidence}%</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Data Sources</p>
                        <div className="flex gap-2 flex-wrap">
                          {report.dataSources.map((source, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs bg-accent px-2 py-1 rounded"
                            >
                              {getDataSourceIcon(source)}
                              <span className="capitalize">{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {report.status === "complete" && report.diagnosis_id && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleViewReport(report);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewReport(report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Report ID</p>
                        <p className="font-mono text-sm">{report.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Type</p>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                        <p className="text-sm line-clamp-1">{report.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Date</p>
                        <p className="text-sm">{report.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Badge
                          variant={
                            report.status === "complete"
                              ? "default"
                              : report.status === "processing"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {report.status === "complete"
                            ? "Complete"
                            : report.status === "processing"
                            ? "Processing"
                            : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    {report.status === "complete" && report.diagnosis_id && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation(); 
                            handleViewReport(report);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredReports.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No reports found</p>
              <Button onClick={() => navigate('/patient/upload')}>
                Upload Medical Data
              </Button>
            </Card>
          )}
        </div>

        {/* View Report Modal */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading report details...</p>
              </div>
            ) : selectedReport && (
              <>
                <DialogHeader>
                  <DialogTitle>Report Details - {selectedReport.id}</DialogTitle>
                  <DialogDescription>
                    {new Date(selectedReport.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  
                  
                  

                  <div>
                    <h3 className="mb-3 font-semibold">Diagnosis</h3>
                    <Card className="p-4 bg-primary/5">
                      <p className="text-lg font-medium">{selectedReport.diagnosis}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${selectedReport.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{selectedReport.confidence}%</span>
                      </div>
                    </Card>
                  </div>

                  {selectedReport.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">Description</h3>
                        <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                      </div>
                    </>
                  )}

                  {selectedReport.findings && selectedReport.findings.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">Key Findings</h3>
                        <ul className="space-y-2">
                          {selectedReport.findings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {selectedReport.nextSteps && selectedReport.nextSteps.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">Recommended Next Steps</h3>
                        <div className="space-y-2">
                          {selectedReport.nextSteps.map((step, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                              <p className="text-sm">
                                <strong>{step.category}:</strong> {step.action}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => generatePDF(selectedReport)}
                      disabled={downloadingPDF === selectedReport.id}
                    >
                      {downloadingPDF === selectedReport.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}