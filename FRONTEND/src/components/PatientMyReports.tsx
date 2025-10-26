import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
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
  ArrowLeft,
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
} from "lucide-react";
import { toast } from "sonner"; 


interface Report {
  id: string;
  type: string;
  diagnosis: string;
  date: string;
  status: "complete" | "processing" | "pending";
  confidence: number;
  dataSources: string[];
}


export function PatientMyReports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports: Report[] = [
    {
      id: "RPT-2024-001",
      type: "Diagnostic Analysis",
      diagnosis: "Type 2 Diabetes Mellitus",
      date: "2024-10-18",
      status: "complete",
      confidence: 92,
      dataSources: ["images", "labs", "notes"],
    },
    {
      id: "RPT-2024-002",
      type: "Follow-up Analysis",
      diagnosis: "Type 2 Diabetes - Progress Check",
      date: "2024-10-10",
      status: "complete",
      confidence: 94,
      dataSources: ["labs"],
    },
    {
      id: "RPT-2024-003",
      type: "Initial Screening",
      diagnosis: "General Health Assessment",
      date: "2024-09-15",
      status: "complete",
      confidence: 88,
      dataSources: ["images", "labs"],
    },
    {
      id: "RPT-2024-004",
      type: "Diagnostic Analysis",
      diagnosis: "Processing...",
      date: "2024-10-19",
      status: "processing",
      confidence: 0,
      dataSources: ["images", "notes"],
    },
  ];

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

  const handleDownloadPDF = (reportId: string) => {
    toast.success(`Downloading report ${reportId}...`);
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case "images":
        return <Image className="w-4 h-4" />;
      case "labs":
        return <FlaskConical className="w-4 h-4" />;
      case "notes":
        return <FileText className="w-4 h-4" />;
      case "genetic":
        return <Dna className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 4. Updated Back button to use navigate */}
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl">My Reports</h1>
              <p className="text-muted-foreground">
                View and manage your medical analysis reports
              </p>
            </div>
          </div>
        </div>

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
                  onClick={() => report.status === "complete" && setSelectedReport(report)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {report.type}
                        </Badge>
                        <h3 className="mb-1">{report.diagnosis}</h3>
                        <p className="text-sm text-muted-foreground">{report.id}</p>
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

                    {/* Details */}
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
                        <div className="flex gap-2">
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

                    {/* Actions */}
                    {report.status === "complete" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDownloadPDF(report.id);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
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
                  onClick={() => report.status === "complete" && setSelectedReport(report)}
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
                        <p className="text-sm">{report.diagnosis}</p>
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
                    {report.status === "complete" && (
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => {e.stopPropagation(); setSelectedReport(report);}}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDownloadPDF(report.id);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
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
              <p className="text-muted-foreground">No reports found</p>
            </Card>
          )}
        </div>

        {/* View Report Modal */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
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
                  {/* Summary */}
                  <div>
                    <h3 className="mb-3">Diagnosis</h3>
                    <Card className="p-4 bg-primary/5">
                      <p className="text-lg">{selectedReport.diagnosis}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${selectedReport.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm">{selectedReport.confidence}%</span>
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  {/* Key Findings */}
                  <div>
                    <h3 className="mb-3">Key Findings</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          Elevated HbA1c levels detected (8.2%)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          Fasting glucose above normal range (156 mg/dL)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          BMI indicates obesity (32.4)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div>
                    <h3 className="mb-3">Recommended Next Steps</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm">
                          <strong>High Priority:</strong> Consult with your healthcare provider to
                          discuss treatment options
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm">
                          <strong>Lifestyle:</strong> Adopt dietary changes and increase physical
                          activity
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleDownloadPDF(selectedReport.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report (PDF)
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