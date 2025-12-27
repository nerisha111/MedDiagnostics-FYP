import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  MoreVertical,
  Plus,
  AlertCircle,
  Calendar,
  Search,
  FlaskConical,
  Pill,
  Activity,
  FileText,
  Star,
  CheckCircle2 
} from "lucide-react";
import { toast } from "sonner"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
} from "recharts";

// --- PDF Import ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Configuration ---
const API_ENDPOINTS = {
  DIAGNOSES_LIST: `/api/diagnoses/with-feedback/`,
  FEEDBACK_STATS: `/api/feedback/stats/`,
  DIAGNOSIS_DETAIL: (id: string) => `/api/diagnoses/${id}/`,
  FEEDBACK_DETAIL: (id: string) => `/api/feedback/diagnosis/${id}/`,
};

// --- Interfaces ---

interface DiagnosisData {
  id: string;
  diagnosisTitle: string;
  date: string;
  status: 'given' | 'pending';
  confidence: number;
  feedback_details: {
    accuracyRating: number | null;
    usefulnessRating: number | null;
    comments: string | null;
  } | null;
}

interface FeedbackStats {
  total_feedback: number;
  average_accuracy_stars: number | null;
  average_next_steps_rating: number | null;
}

interface Recommendation {
  name: string | null;
  category: string | null;
  type: string | null;
}

interface DiagnosisDetailResponse {
  id: string;
  diagnostic_case: {
    description: string;
  };
  name: string;
  confidence: number;
  recommendations: Recommendation[];
}

interface FullFeedbackDetails {
  id: string;
  diagnosis_details: {
    id: string;
    name: string;
    diagnosis_date: string;
  };
  accuracy_stars: number | null;
  next_steps_rating: number | null;
  general_comments: string | null;
}

export function HealthcareProfessionalDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthorized } = useAuth({ 
    requiredRole: 'clinician',
    redirectTo: '/healthcare/login'
  });

  // --- Dashboard State ---
  const [cases, setCases] = useState<DiagnosisData[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("6m");

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalContentType, setModalContentType] = useState<'diagnosis' | 'feedback' | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisDetailResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FullFeedbackDetails | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [casesRes, statsRes] = await Promise.all([
          fetch(API_ENDPOINTS.DIAGNOSES_LIST, { headers }),
          fetch(API_ENDPOINTS.FEEDBACK_STATS, { headers })
        ]);

        if (!casesRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const casesData = await casesRes.json();
        const statsData = await statsRes.json();

        setCases(casesData);
        setStats(statsData);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthorized && !authLoading) {
      fetchData();
    }
  }, [user, isAuthorized, authLoading]);

  // --- Handlers ---
  const handleViewDiagnosisDetails = async (diagnosisId: string) => {
    setModalContentType('diagnosis');
    setIsModalLoading(true);
    setIsModalOpen(true);
    setSelectedDiagnosis(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(API_ENDPOINTS.DIAGNOSIS_DETAIL(diagnosisId), {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch diagnosis details.");
      const data: DiagnosisDetailResponse = await response.json();
      setSelectedDiagnosis(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load details.");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewFeedbackDetails = async (diagnosisId: string) => {
    setModalContentType('feedback');
    setIsModalLoading(true);
    setIsModalOpen(true);
    setSelectedFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(API_ENDPOINTS.FEEDBACK_DETAIL(diagnosisId), {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch feedback details.");
      const data: FullFeedbackDetails = await response.json();
      setSelectedFeedback(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load feedback.");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleActionClick = (item: DiagnosisData) => {
    if (item.status === 'given') {
      handleViewFeedbackDetails(item.id);
    } else {
      handleViewDiagnosisDetails(item.id);
    }
  };

  // --- Computed Metrics ---
  const pendingReviewsCount = useMemo(() => cases.filter(c => c.status === 'pending').length, [cases]);

  const accuracyPercentage = useMemo(() => {
    if (!stats?.average_accuracy_stars) return 0;
    return (stats.average_accuracy_stars / 5) * 100;
  }, [stats]);

  const diagnosisDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach(c => {
      const name = c.diagnosisTitle || "Unknown";
      let category = "Other";
      
      const lowerName = name.toLowerCase();
      if (lowerName.includes("diabetes") || lowerName.includes("sugar")) category = "Diabetes";
      else if (lowerName.includes("heart") || lowerName.includes("cardio") || lowerName.includes("hypertension")) category = "Cardiovascular";
      else if (lowerName.includes("lung") || lowerName.includes("pneumonia") || lowerName.includes("asthma") || lowerName.includes("respiratory")) category = "Respiratory";
      else if (lowerName.includes("fracture") || lowerName.includes("bone") || lowerName.includes("arthr")) category = "Musculoskeletal";
      else category = "Other";

      counts[category] = (counts[category] || 0) + 1;
    });

    const colors = ["#0f766e", "#3b82f6", "#8b5cf6", "#f59e0b", "#64748b"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [cases]);

  const metrics = [
    {
      title: "Total Cases Analyzed",
      value: cases.length.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      chartData: [65, 68, 70, 72, 75, 78, cases.length > 0 ? cases.length : 80],
    },
    {
      title: "Pending Reviews",
      value: pendingReviewsCount.toString(),
      change: pendingReviewsCount > 5 ? "+2" : "-1",
      trend: pendingReviewsCount > 5 ? "up" : "down",
      urgent: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    {
      title: "Avg. Accuracy Score",
      value: `${accuracyPercentage.toFixed(1)}%`,
      change: "+2.1%",
      trend: "up",
      progress: accuracyPercentage,
    },
    {
      title: "Feedback Provided",
      value: stats?.total_feedback?.toString() || "0",
      change: "+8.3%",
      trend: "up",
    },
  ];

  const accuracyTrendData = [
    { month: "Apr", accuracy: 89 },
    { month: "May", accuracy: 90 },
    { month: "Jun", accuracy: 91 },
    { month: "Jul", accuracy: 92 },
    { month: "Aug", accuracy: 93 },
    { month: "Sep", accuracy: 94 },
    { month: "Oct", accuracy: accuracyPercentage > 0 ? accuracyPercentage : 94.2 },
  ];

 
  const handleExportSummary = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("Dashboard Summary Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Clinician: ${user?.email || 'Unknown'}`, 14, 33);
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Key Performance Metrics", 14, 45);
      const metricsData = [
        ['Metric', 'Value'],
        ['Total Cases Analyzed', cases.length.toString()],
        ['Pending Reviews', pendingReviewsCount.toString()],
        ['Average Accuracy', `${accuracyPercentage.toFixed(1)}%`],
        ['Feedback Submitted', stats?.total_feedback.toString() || "0"]
      ];
      autoTable(doc, {
        startY: 50,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [15, 118, 110] as [number, number, number] }, 
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
      // @ts-ignore
      let yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Recent Diagnostic Cases", 14, yPos);
      const casesTableData = cases.map(c => [
        c.id.slice(0, 8) + '...', 
        new Date(c.date).toLocaleDateString(),
        c.diagnosisTitle || "N/A",
        c.status === 'pending' ? 'Pending Review' : 'Completed',
        `${c.confidence}%`
      ]);
      autoTable(doc, {
        startY: yPos + 5,
        head: [['ID', 'Date', 'Diagnosis', 'Status', 'Confidence']],
        body: casesTableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] as [number, number, number] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });
      doc.save(`Dashboard_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Dashboard summary exported successfully");
    } catch (err: any) {
      console.error("Export failed:", err);
      toast.error("Failed to export summary");
    }
  };

 const handleExportSingleReport = async (diagnosisId: string) => {
    const toastId = toast.loading("Generating professional report...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(API_ENDPOINTS.DIAGNOSIS_DETAIL(diagnosisId), {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch case details.");
      const detail: DiagnosisDetailResponse = await response.json();

      // --- PDF Generation
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const primaryColor: [number, number, number] = [15, 118, 110]; 
      const secondaryColor: [number, number, number] = [100, 116, 139];
      const accentColor: [number, number, number] = [241, 245, 249]; 

      let yPos = 0;

      // --- Helper: Header ---
      const addHeader = () => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Title
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
          
          // Divider Line
          doc.setDrawColor(200);
          doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
         
          const disclaimer = "CONFIDENTIAL: This report is generated by an AI system as a clinical support tool. It does not constitute a final diagnosis. All findings must be verified by a qualified healthcare professional.";
         
          doc.text(disclaimer, margin, pageHeight - 18, { maxWidth: contentWidth - 30 });
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
        }
      };

      // Start Document
      addHeader();

    -
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
      doc.text("STATUS", col3X, yPos + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      
      const displayId = detail.id ? detail.id.slice(0, 13) + "..." + detail.id.slice(-4) : "N/A";
      
      doc.text(displayId, col1X, yPos + 18);
      doc.text(new Date().toLocaleDateString(), col2X, yPos + 18);
      doc.text("Clinician Review", col3X, yPos + 18);

      yPos += 45;

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("PRIMARY DIAGNOSIS", margin, yPos);
      
      yPos += 7;

     
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      const diagText = detail.name || "Pending Diagnosis";
     
      const diagSplit = doc.splitTextToSize(diagText, contentWidth - 10);
      const boxHeight = (diagSplit.length * 7) + 20; 

      // Background box for diagnosis
      doc.setFillColor(...accentColor);
      doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
      
      // Diagnosis Name
      doc.setTextColor(0);
      doc.text(diagSplit, margin + 5, yPos + 10);
      
      // Confidence Bar/Text
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`AI Confidence Model: ${detail.confidence}%`, margin + 5, yPos + boxHeight - 5);

      yPos += boxHeight + 15;

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("CLINICAL FINDINGS / DESCRIPTION", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.setFont("helvetica", "normal");
      
      const descText = detail.diagnostic_case?.description || "No clinical description was recorded for this case.";
      const splitDesc = doc.splitTextToSize(descText, contentWidth);
      doc.text(splitDesc, margin, yPos);
      
      yPos += (splitDesc.length * 5) + 15;

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("RECOMMENDATIONS & PLAN", margin, yPos);
      yPos += 5;

      const recsData = (detail.recommendations || [])
        .filter(r => r.name && !r.name.includes('NOT NULL'))
        .map((r, index) => [`${index + 1}`, r.name]);

      if (recsData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Recommended Action / Test / Treatment']],
          body: recsData,
          theme: 'grid',
          headStyles: { 
            fillColor: primaryColor, 
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' }
          },
          styles: { 
            fontSize: 10,
            cellPadding: 4,
            overflow: 'linebreak' 
          },
          margin: { left: margin, right: margin }
        });
      } else {
        // Fallback if no recommendations
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text("No specific recommendations were generated for this analysis.", margin, yPos + 10);
      }
      
      addFooter();

      // Save
      doc.save(`MedicalReport_${detail.id.slice(0, 8)}.pdf`);
      toast.dismiss(toastId);
      toast.success("Professional report generated");

    } catch (err: any) {
      console.error("PDF Gen Error", err);
      toast.dismiss(toastId);
      toast.error("Failed to export report");
    }
  };

  const renderStarRating = (rating: number | null) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-5 h-5 ${star <= (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
      ))}
    </div>
  );

  const CasesTable = ({ filter }: { filter: string }) => {
    const filteredCases = useMemo(() => {
      if (filter === 'all') return cases;
      if (filter === 'pending') return cases.filter(c => c.status === 'pending');
      if (filter === 'completed') return cases.filter(c => c.status === 'given');
      return cases;
    }, [cases, filter]);
      
    if (filteredCases.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No cases found.</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Diagnosis ID</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>AI Diagnosis</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[100px]">Confidence</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCases.slice(0, 10).map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                {item.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(item.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span className="font-medium text-slate-700 dark:text-slate-300 block truncate max-w-[400px]" title={item.diagnosisTitle}>
                  {item.diagnosisTitle || "Analysis Pending"}
                </span>
              </TableCell>
              <TableCell>
     
                <Badge
                  style={{ minWidth: '10em' }}
                  className={`
                    flex items-center w-fit gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-colors
                    ${item.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800'
                    }
                  `}
                >
                  {item.status === 'pending' ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Needs Review</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.confidence > 90 ? "bg-green-500" : item.confidence > 80 ? "bg-amber-500" : "bg-red-500"}`} />
                  {item.confidence}%
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleActionClick(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                   
                    <DropdownMenuItem onClick={() => handleExportSingleReport(item.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const getModalTitle = () => {
    if (isModalLoading) return "Loading Details...";
    if (modalContentType === 'diagnosis') return "Analysis Details";
    if (modalContentType === 'feedback') return "Review Details";
    return "Details";
  };

  const getModalDesc = () => {
    if (isModalLoading) return "Please wait while we fetch the data.";
    if (modalContentType === 'diagnosis') return "Detailed view of the AI's diagnostic findings and recommendations.";
    if (modalContentType === 'feedback') return "Review the feedback submitted for this case.";
    return "";
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportSummary}>
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={() => navigate("/healthcare/upload")} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Case Analysis
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                {metric.trend && (
                  <Badge variant="secondary" className={`font-normal ${
                    metric.trend === "up" 
                      ? (metric.title === "Pending Reviews" 
                          ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300" 
                          : "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300") 
                      : "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    <span className="flex items-center gap-1">
                      {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {metric.change}
                    </span>
                  </Badge>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  {metric.urgent && (
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      {metric.urgent} require attention
                    </p>
                  )}
                </div>
                
                {metric.progress && (
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                      
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-800 opacity-20" />
                     
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray={`${metric.progress * 1.76} 176`} 
                        strokeLinecap="round"
                        className="text-emerald-500" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">{Math.floor(metric.progress)}%</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Accuracy Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Diagnostic Accuracy Trends</h3>
              <p className="text-sm text-muted-foreground">Confidence scores over time</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" domain={[50, 100]} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#0f766e" strokeWidth={3} dot={{ fill: "#ffffff", stroke: "#0f766e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#0f766e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6 flex flex-col min-w-0">
          <h3 className="font-semibold text-lg mb-1">Diagnosis Distribution</h3>
          <p className="text-sm text-muted-foreground mb-6">Based on recent analysis</p>
          
          {diagnosisDistribution.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diagnosisDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {diagnosisDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {diagnosisDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate" title={item.name}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm min-h-[250px]">
              Not enough data to display distribution
            </div>
          )}
        </Card>
      </div>

      {/* Tables */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Cases</h3>
              <p className="text-sm text-muted-foreground">Manage and review patient diagnostics</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search cases..." className="h-9 w-64 rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
               </div>
              <TabsList>
                <TabsTrigger value="all">All Cases</TabsTrigger>
                <TabsTrigger value="pending">Needs Review {pendingReviewsCount > 0 && <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200">{pendingReviewsCount}</Badge>}</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="all" className="m-0"><CasesTable filter="all" /></TabsContent>
          <TabsContent value="pending" className="m-0"><CasesTable filter="pending" /></TabsContent>
          <TabsContent value="completed" className="m-0"><CasesTable filter="completed" /></TabsContent>

          <div className="p-4 border-t bg-muted/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing recent activity</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/healthcare/history')}>
              View Full History <TrendingUp className="w-4 h-4 ml-2 rotate-90" />
            </Button>
          </div>
        </Tabs>
      </Card>

     
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            <DialogDescription>{getModalDesc()}</DialogDescription>
          </DialogHeader>

          {isModalLoading ? (
            <div className="flex items-center justify-center h-64"><Activity className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {modalContentType === 'diagnosis' && selectedDiagnosis && (
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                    <p className="text-base p-4 bg-muted/50 rounded-lg border break-words whitespace-pre-wrap">
                      {selectedDiagnosis.diagnostic_case?.description || "No description recorded."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Primary Diagnosis</label>
                    <p className="font-semibold text-lg break-words leading-tight">
                      {selectedDiagnosis.name || "Pending Analysis"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">AI Confidence</label>
                    <p className="font-bold text-xl text-primary">{selectedDiagnosis.confidence}%</p>
                  </div>
                  
                  {/* Recommended Tests */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Recommended Tests</label>
                    <div className="p-4 bg-muted/50 rounded-lg border flex flex-wrap gap-2">
                      {(selectedDiagnosis.recommendations || [])
                        .filter(r => r.name && r.name.toLowerCase().includes('test'))
                        .filter(r => r.name && !r.name.includes('NOT NULL'))
                        .length > 0 ? (
                        
                        (selectedDiagnosis.recommendations || [])
                          .filter(r => r.name && r.name.toLowerCase().includes('test'))
                          .filter(r => r.name && !r.name.includes('NOT NULL'))
                          .map((test, index) => (
                            <Badge key={index} variant="secondary" className="text-sm h-auto py-1 whitespace-normal text-left">
                              <FlaskConical className="w-3 h-3 mr-1.5 shrink-0" />
                              <span>{test.name}</span>
                            </Badge>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific tests recommended.</p>
                      )}
                    </div>
                  </div>

                  {/* Treatment Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Treatment Options</label>
                    <div className="p-4 bg-muted/50 rounded-lg border flex flex-wrap gap-2">
                      {(selectedDiagnosis.recommendations || [])
                        .filter(r => r.name && !r.name.toLowerCase().includes('test'))
                        .filter(r => r.name && !r.name.includes('NOT NULL'))
                        .length > 0 ? (

                        (selectedDiagnosis.recommendations || [])
                          .filter(r => r.name && !r.name.toLowerCase().includes('test'))
                          .filter(r => r.name && !r.name.includes('NOT NULL'))
                          .map((treatment, index) => (
                            <Badge key={index} variant="outline" className="text-sm h-auto py-1 whitespace-normal text-left">
                              <Pill className="w-3 h-3 mr-1.5 shrink-0" />
                              <span>{treatment.name}</span>
                            </Badge>
                          ))
                      ) : (
                          <p className="text-sm text-muted-foreground">No specific treatments recommended.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalContentType === 'feedback' && selectedFeedback && (
                 <div className="space-y-6 py-4 w-full">
                   <Separator />
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-start gap-3">
                         <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                         <div>
                            <p className="font-semibold text-sm sm:text-base break-words leading-snug">
                              {selectedFeedback.diagnosis_details.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reviewed on: {new Date(selectedFeedback.diagnosis_details.diagnosis_date).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                    </Card>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Diagnostic Accuracy</label>
                      {renderStarRating(selectedFeedback.accuracy_stars)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Clinical Usefulness</label>
                      {renderStarRating(selectedFeedback.next_steps_rating)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional Comments</label>
                      
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border min-h-[80px] w-full break-all whitespace-pre-wrap">
                        {selectedFeedback.general_comments || "No comments."}
                      </div>
                    </div>
                  </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
