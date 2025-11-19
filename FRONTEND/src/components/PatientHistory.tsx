import { useState, useEffect } from "react";
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
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "../supabaseClient";

interface HistoryItem {
  id: string;
  type: "analysis" | "view";
  title: string;
  description: string;
  date: string;
  time: string;
  status?: "success" | "failed" | "processing";
  details?: string;
}

interface ActivityStats {
  total_activities: number;
  analyses: number;
  
}

// Named export to match App.tsx import
export function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total_activities: 0,
    analyses: 0,
    
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from Supabase instead of localStorage
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const token = session.access_token;
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch activity history and stats in parallel
      const [historyResponse, statsResponse] = await Promise.all([
        fetch("http://localhost:8000/api/patient/activity/history/", { headers }),
        fetch("http://localhost:8000/api/patient/activity/stats/", { headers }),
      ]);

      if (!historyResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch activity data");
      }

      const historyData = await historyResponse.json();
      const statsData = await statsResponse.json();

      const transformedHistory: HistoryItem[] = historyData.activities.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        date: item.date,
        time: item.time,
        status: item.status,
        details: item.details,
      }));

      setHistory(transformedHistory);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError(err instanceof Error ? err.message : "Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

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
      case "analysis": return <FileText className="w-5 h-5" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading activity history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="font-semibold text-lg mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchActivityData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Activities</p>
          <p className="text-2xl font-semibold">{stats.total_activities}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Analyses</p>
          <p className="text-2xl font-semibold">{stats.analyses}</p>
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
                <SelectItem value="analysis">Analysis</SelectItem>
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
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="space-y-3 sm:ml-8 sm:border-l-2 border-border sm:pl-6">
              {items.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.status && getStatusIcon(item.status)}
                        {item.details && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {item.details}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize font-normal">
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
            <p className="font-semibold">No Activity Found</p>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter settings.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}