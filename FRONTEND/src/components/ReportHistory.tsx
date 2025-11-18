import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { toast } from "sonner";

// UI Components
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";

// Icons
import {
  Search, Filter, Eye, Download, Archive, Trash2, MoreVertical, ChevronDown,
  Activity, AlertCircle, ArrowLeft, FlaskConical, Pill, XCircle
} from "lucide-react";

// The definitive interface for our data from the API
interface Report {
  id: string;
  diagnosisTitle: string;
  date: string;
  status: "given" | "pending";
  confidence: number;
}

interface Recommendation {
  recommended_text: string;
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

export function ReportHistory() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisDetailResponse | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        // Fetching directly from Supabase can also be an option here
        // For now, we'll keep the API endpoint fetch
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnoses/with-feedback/`, {
          headers: { "Authorization": `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const data: Report[] = await response.json();
        setReports(data);

      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || "An error occurred while fetching reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);
  
  const filteredReports = (reports || []).filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.diagnosisTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const reportStatusForFilter = report.status === 'given' ? 'Complete' : 'Pending Review';
    const matchesStatus = statusFilter === 'all' || reportStatusForFilter === statusFilter;
    
    const matchesDiagnosis = diagnosisFilter === 'all' || report.diagnosisTitle === diagnosisFilter;
    return matchesSearch && matchesStatus && matchesDiagnosis;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, diagnosisFilter]);

  const uniqueDiagnoses = [...new Set((reports || []).map(r => r.diagnosisTitle))];

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedReports.length === currentReports.length && currentReports.length > 0) {
      setSelectedReports([]);
    } else {
      setSelectedReports(currentReports.map((r) => r.id));
    }
  };

  // Get confidence color class based on the numerical score
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Handle View action
  const handleView = async (reportId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setIsModalLoading(true);
    setIsModalOpen(true);
    setSelectedDiagnosis(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnoses/${reportId}/`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
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

  // Handle Export PDF action
  const handleExportPDF = async (report: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const toastId = toast.loading("Generating PDF...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // This should point to an actual API endpoint that generates and returns a PDF
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnoses/${report.id}/export-pdf/`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      
      toast.success(`PDF exported for report ${report.id}`, { id: toastId });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF", { id: toastId });
    }
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  // NEW: Confirm and execute single report deletion from Supabase
  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Deleting report...");
    
    try {
      // Perform the delete operation on the 'diagnoses' table in Supabase
      const { error } = await supabase
        .from('Diagnosis') // IMPORTANT: Replace with your actual table name
        .delete()
        .eq('id', reportToDelete.id);

      // If Supabase returns an error, throw it to be caught by the catch block
      if (error) throw error;
      
      // On successful deletion, update the local state to reflect the change
      setReports(prevReports => 
        prevReports.filter(r => r.id !== reportToDelete.id)
      );
      
      setSelectedReports(prev => prev.filter(id => id !== reportToDelete.id));
      
      toast.success(`Report deleted successfully`, { id: toastId });
      setDeleteDialogOpen(false);
      setReportToDelete(null);

    } catch (error: any) {
      toast.error(error.message || "Failed to delete report", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle opening the bulk delete dialog
  const handleBulkDeleteClick = () => {
    if (selectedReports.length === 0) {
      toast.error("No reports selected");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  // NEW: Confirm and execute bulk report deletion from Supabase
  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${selectedReports.length} reports...`);
    
    try {
      // Perform the bulk delete operation using the 'in' filter
      const { error } = await supabase
        .from('Diagnosis') // IMPORTANT: Replace with your actual table name
        .delete()
        .in('id', selectedReports);
      
      // If Supabase returns an error, throw it
      if (error) throw error;
      
      // On successful deletion, update local state
      setReports(prevReports => 
        prevReports.filter(r => !selectedReports.includes(r.id))
      );
      
      const count = selectedReports.length;
      setSelectedReports([]);
      toast.success(`${count} reports deleted successfully`, { id: toastId });
      setBulkDeleteDialogOpen(false);

    } catch (error: any) {
      toast.error(error.message || "Failed to delete reports", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Activity className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50">
        <AlertCircle className="w-8 h-8 mr-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-gray-900">Diagnostic Reports</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all diagnostic reports</p>
          </div>
          
          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeleteClick}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedReports.length})
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by report ID or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                </SelectContent>
              </Select>

              <Select value={diagnosisFilter} onValueChange={setDiagnosisFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by diagnosis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Diagnoses</SelectItem>
                  {uniqueDiagnoses.map((diagnosis) => (
                    <SelectItem key={diagnosis} value={diagnosis}>
                      {diagnosis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(statusFilter !== 'all' || diagnosisFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setDiagnosisFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Reports Table */}
        <Card className="bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      currentReports.length > 0 &&
                      selectedReports.length === currentReports.length
                    }
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Report ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Date Created</TableHead>
                <TableHead className="font-semibold text-gray-700">Primary Diagnosis</TableHead>
                <TableHead className="font-semibold text-gray-700">Confidence</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReports.length > 0 ? (
                currentReports.map((report) => (
                    <TableRow 
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleView(report.id)}
                    >
                      <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedReports.includes(report.id)}
                          onCheckedChange={() => toggleReportSelection(report.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-900">
                        {report.id}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {report.diagnosisTitle}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getConfidenceColor(report.confidence)}`}
                              style={{ width: `${report.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 font-medium min-w-[40px]">
                            {report.confidence}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={report.status === "given" ? "default" : "outline"}
                          className={
                            report.status === "given" 
                              ? "bg-teal-600 hover:bg-teal-700 text-white" 
                              : "text-gray-700 border-gray-300"
                          }
                        >
                          {report.status === "given" ? "Complete" : "Pending Review"}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLElement>) => handleView(report.id, e)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLElement>) => handleExportPDF(report, e)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e: React.MouseEvent<HTMLElement>) => handleDeleteClick(report, e)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <Card className="p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredReports.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="min-w-[40px]"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-2">...</span>;
                }
                return null;
              })}
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {isModalLoading ? (
            <div className="flex items-center justify-center h-64">
              <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            selectedDiagnosis && (
              <>
                <DialogHeader>
                  <DialogTitle>View Details</DialogTitle>
                  <p className="text-sm text-muted-foreground">A summary of the AI's diagnostic analysis.</p>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                    <p className="text-base p-4 bg-muted/50 rounded-lg border">{selectedDiagnosis.diagnostic_case.description}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Primary Diagnosis</label>
                    <p className="font-semibold text-lg">{selectedDiagnosis.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">AI Confidence</label>
                    <p className="font-bold text-xl text-primary">{selectedDiagnosis.confidence}%</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Recommended Tests</label>
                    <div className="p-4 bg-muted/50 rounded-lg border flex flex-wrap gap-2">
                      {(selectedDiagnosis.recommendations
                        .filter(r => r.recommended_text.toLowerCase().includes('test'))
                        .filter(r => r.recommended_text && r.recommended_text.trim() !== '' && !r.recommended_text.includes('NOT NULL'))
                        .length > 0) ? (
                        selectedDiagnosis.recommendations
                          .filter(r => r.recommended_text.toLowerCase().includes('test'))
                          .filter(r => r.recommended_text && r.recommended_text.trim() !== '' && !r.recommended_text.includes('NOT NULL'))
                          .map((test, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              <FlaskConical className="w-3 h-3 mr-1.5" />{test.recommended_text}
                            </Badge>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific tests recommended.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Treatment Options</label>
                    <div className="p-4 bg-muted/50 rounded-lg border flex flex-wrap gap-2">
                      {(selectedDiagnosis.recommendations
                        .filter(r => !r.recommended_text.toLowerCase().includes('test'))
                        .filter(r => r.recommended_text && r.recommended_text.trim() !== '' && !r.recommended_text.includes('NOT NULL'))
                        .length > 0) ? (
                        selectedDiagnosis.recommendations
                          .filter(r => !r.recommended_text.toLowerCase().includes('test'))
                          .filter(r => r.recommended_text && r.recommended_text.trim() !== '' && !r.recommended_text.includes('NOT NULL'))
                          .map((treatment, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              <Pill className="w-3 h-3 mr-1.5" />{treatment.recommended_text}
                            </Badge>
                          ))
                      ) : (
                         <p className="text-sm text-muted-foreground">No specific treatments recommended.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Delete Report
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete report{" "}
              <span className="font-mono font-semibold text-gray-900">
                {reportToDelete?.id}
              </span>
              ?
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setReportToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Delete Multiple Reports
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {selectedReports.length} reports
              </span>
              ?
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedReports.length} Reports
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}