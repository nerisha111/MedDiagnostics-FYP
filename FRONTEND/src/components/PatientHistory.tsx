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
    // ... your history data remains unchanged
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
      if (filterDate === "today") { matchesDate = itemDate.toDateString() === today.toDateString(); }
      else if (filterDate === "week") { const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); matchesDate = itemDate >= weekAgo; }
      else if (filterDate === "month") { const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); matchesDate = itemDate >= monthAgo; }
    }
    return matchesSearch && matchesType && matchesDate;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "upload": return <Upload className="w-5 h-5" />;
      case "analysis": return <FileText className="w-5 h-5" />;
      case "download": return <Download className="w-5 h-5" />;
      case "view": return <Eye className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (status === "processing") return <Clock className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  const groupedHistory = filteredHistory.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    // REMOVED: The two outer wrapper divs.
    // The component now returns a single div that only controls the vertical spacing of its direct children.
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Activities</p>
          <p className="text-2xl font-semibold">{history.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Uploads</p>
          <p className="text-2xl font-semibold">{history.filter((h) => h.type === "upload").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Analyses</p>
          <p className="text-2xl font-semibold">{history.filter((h) => h.type === "analysis").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Downloads</p>
          <p className="text-2xl font-semibold">{history.filter((h) => h.type === "download").length}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full md:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-52">
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
              <SelectTrigger className="w-full sm:w-40">
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
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
            </div>
            <div className="space-y-3 sm:ml-8 sm:border-l-2 border-border sm:pl-6">
              {items.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{item.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.status && getStatusIcon(item.status)}
                        {item.details && <Badge variant="outline" className="text-xs font-normal">{item.details}</Badge>}
                        <Badge variant="secondary" className="text-xs capitalize font-normal">{item.type}</Badge>
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
            <p className="font-semibold">No Activity Found</p>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filter settings.</p>
          </Card>
        )}
      </div>
    </div>
  );
}