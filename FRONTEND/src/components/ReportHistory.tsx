import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  Archive,
  Trash2,
  MoreVertical,
  ChevronDown,
  FileText,
  Image,
  FlaskConical,
  Dna,
} from "lucide-react";

// 2. Removed the props interface
export function ReportHistory() {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");

  const reports = [
    {
      id: "PT-2024-001",
      patientId: "Anonymous-001",
      date: "2024-10-18",
      diagnosis: "Type 2 Diabetes",
      confidence: 92,
      dataSources: ["images", "notes", "labs"],
      status: "Complete",
    },
    {
      id: "PT-2024-002",
      patientId: "Anonymous-002",
      date: "2024-10-18",
      diagnosis: "Hypertension",
      confidence: 88,
      dataSources: ["images", "notes", "labs"],
      status: "Complete",
    },
    {
      id: "PT-2024-003",
      patientId: "Anonymous-003",
      date: "2024-10-17",
      diagnosis: "Pneumonia",
      confidence: 76,
      dataSources: ["images"],
      status: "Pending Review",
    },
    {
      id: "PT-2024-004",
      patientId: "Anonymous-004",
      date: "2024-10-17",
      diagnosis: "Anemia",
      confidence: 95,
      dataSources: ["labs", "genetic"],
      status: "Complete",
    },
    {
      id: "PT-2024-005",
      patientId: "Anonymous-005",
      date: "2024-10-16",
      diagnosis: "Osteoarthritis",
      confidence: 91,
      dataSources: ["images", "notes"],
      status: "Complete",
    },
    {
      id: "PT-2024-006",
      patientId: "Anonymous-006",
      date: "2024-10-16",
      diagnosis: "Migraine",
      confidence: 84,
      dataSources: ["notes"],
      status: "Archived",
    },
  ];

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesDiagnosis =
      diagnosisFilter === "all" || report.diagnosis === diagnosisFilter;
    return matchesSearch && matchesStatus && matchesDiagnosis;
  });

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
    }
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case "images":
        return <Image className="w-3 h-3" />;
      case "notes":
        return <FileText className="w-3 h-3" />;
      case "labs":
        return <FlaskConical className="w-3 h-3" />;
      case "genetic":
        return <Dna className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div>
              <h1 className="text-3xl">Diagnostic Reports</h1>
              <p className="text-muted-foreground">
                View and manage all diagnostic reports
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by report ID or diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                      <SelectItem value="Pending Review">Pending Review</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Diagnosis Type</label>
                  <Select value={diagnosisFilter} onValueChange={setDiagnosisFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Diagnoses</SelectItem>
                      <SelectItem value="Type 2 Diabetes">Type 2 Diabetes</SelectItem>
                      <SelectItem value="Hypertension">Hypertension</SelectItem>
                      <SelectItem value="Pneumonia">Pneumonia</SelectItem>
                      <SelectItem value="Anemia">Anemia</SelectItem>
                      <SelectItem value="Osteoarthritis">Osteoarthritis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setDiagnosisFilter("all");
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Batch Actions */}
        {selectedReports.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {selectedReports.length} report{selectedReports.length > 1 ? "s" : ""}{" "}
                selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Reports Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredReports.length > 0 &&
                      selectedReports.length === filteredReports.length
                    }
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead>Report ID</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Primary Diagnosis</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Data Sources</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-accent/50"
                  // 5. Updated row click to navigate
                  onClick={() => navigate('/healthcare/results')}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={() => toggleReportSelection(report.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{report.id}</TableCell>
                  <TableCell>{report.patientId}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.diagnosis}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                        <div
                          className={`h-full ${
                            report.confidence >= 90
                              ? "bg-green-500"
                              : report.confidence >= 80
                              ? "bg-primary"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${report.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm min-w-[3rem] text-right">
                        {report.confidence}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {report.dataSources.map((source, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
                        >
                          {getDataSourceIcon(source)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "Complete"
                          ? "default"
                          : report.status === "Archived"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* 6. Updated dropdown item to navigate */}
                        <DropdownMenuItem onClick={() => navigate('/healthcare/results')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}