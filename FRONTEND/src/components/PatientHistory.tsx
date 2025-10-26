import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
  Calendar,
  Upload,
  FileText,
  Eye,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";


interface HistoryItem {
  id: string;
  type: "upload" | "analysis" | "download" | "view";
  title: string;
  description: string;
  date: string;
  time: string;
  status?: "success" | "failed" | "processing";
  details?: string;
}


export function PatientHistory() {
  const navigate = useNavigate(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const history: HistoryItem[] = [
    {
      id: "H-001",
      type: "analysis",
      title: "Diagnostic Analysis Completed",
      description: "Type 2 Diabetes Mellitus analysis finished",
      date: "2024-10-18",
      time: "2:30 PM",
      status: "success",
      details: "Report ID: RPT-2024-001",
    },
    {
      id: "H-002",
      type: "upload",
      title: "Lab Results Uploaded",
      description: "Blood test results (HbA1c, Glucose)",
      date: "2024-10-18",
      time: "2:15 PM",
      status: "success",
      details: "2 files uploaded",
    },
    {
      id: "H-003",
      type: "upload",
      title: "Medical Images Uploaded",
      description: "Retinal scan images",
      date: "2024-10-18",
      time: "2:10 PM",
      status: "success",
      details: "4 files uploaded",
    },
    {
      id: "H-004",
      type: "download",
      title: "Report Downloaded",
      description: "Downloaded diagnostic report as PDF",
      date: "2024-10-10",
      time: "4:45 PM",
      status: "success",
      details: "RPT-2024-002",
    },
    {
      id: "H-005",
      type: "analysis",
      title: "Follow-up Analysis Completed",
      description: "Progress check for diabetes management",
      date: "2024-10-10",
      time: "3:20 PM",
      status: "success",
      details: "Report ID: RPT-2024-002",
    },
    {
      id: "H-006",
      type: "view",
      title: "Report Viewed",
      description: "Viewed diagnostic report RPT-2024-001",
      date: "2024-10-09",
      time: "11:30 AM",
      details: "RPT-2024-001",
    },
    {
      id: "H-007",
      type: "upload",
      title: "Clinical Notes Uploaded",
      description: "Doctor's consultation notes",
      date: "2024-09-15",
      time: "9:15 AM",
      status: "success",
      details: "1 file uploaded",
    },
    {
      id: "H-008",
      type: "analysis",
      title: "Initial Screening Completed",
      description: "General health assessment",
      date: "2024-09-15",
      time: "10:30 AM",
      status: "success",
      details: "Report ID: RPT-2024-003",
    },
  ];

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    
    let matchesDate = true;
    if (filterDate !== "all") {
      const itemDate = new Date(item.date);
      const today = new Date();
      if (filterDate === "today") {
        matchesDate = itemDate.toDateString() === today.toDateString();
      } else if (filterDate === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = itemDate >= weekAgo;
      } else if (filterDate === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = itemDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="w-5 h-5" />;
      case "analysis":
        return <FileText className="w-5 h-5" />;
      case "download":
        return <Download className="w-5 h-5" />;
      case "view":
        return <Eye className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (status === "processing") return <Clock className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  // Group by date
  const groupedHistory = filteredHistory.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 4. Updated Back button to use navigate */}
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl">Activity History</h1>
              <p className="text-muted-foreground">
                View your complete activity timeline
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Activities</p>
            <p className="text-2xl">{history.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Uploads</p>
            <p className="text-2xl">{history.filter((h) => h.type === "upload").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Analyses</p>
            <p className="text-2xl">{history.filter((h) => h.type === "analysis").length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Downloads</p>
            <p className="text-2xl">{history.filter((h) => h.type === "download").length}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search activity history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="upload">Uploads</SelectItem>
                <SelectItem value="analysis">Analyses</SelectItem>
                <SelectItem value="download">Downloads</SelectItem>
                <SelectItem value="view">Views</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>

              <div className="space-y-3 ml-8 border-l-2 border-border pl-6">
                {items.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4>{item.title}</h4>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.status && getStatusIcon(item.status)}
                          {item.details && (
                            <Badge variant="outline" className="text-xs">
                              {item.details}
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No activity found</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}