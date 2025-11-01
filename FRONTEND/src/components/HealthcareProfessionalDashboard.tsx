import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "../supabaseClient";
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
  TrendingUp,
  TrendingDown,
  Eye,
  FileEdit,
  Download,
  MoreVertical,
  Plus,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";


export function HealthcareProfessionalDashboard() {
  const navigate = useNavigate();
  

  
  const metrics = [
    {
      title: "Total Cases Analyzed",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      chartData: [65, 68, 70, 72, 75, 78, 80],
    },
    {
      title: "Pending Reviews",
      value: "23",
      change: "-5.2%",
      trend: "down",
      urgent: 3,
    },
    {
      title: "Accuracy Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      progress: 94.2,
    },
    {
      title: "Reports Generated",
      value: "856",
      change: "+8.3%",
      trend: "up",
    },
  ];

  const recentCases = [
    {
      id: "PT-2024-001",
      date: "2024-10-18",
      dataTypes: ["Images", "Labs"],
      status: "Complete",
      confidence: 92,
      diagnosis: "Type 2 Diabetes",
    },
    {
      id: "PT-2024-002",
      date: "2024-10-18",
      dataTypes: ["Images", "Notes", "Labs"],
      status: "Complete",
      confidence: 88,
      diagnosis: "Hypertension",
    },
    {
      id: "PT-2024-003",
      date: "2024-10-17",
      dataTypes: ["Images"],
      status: "Pending Review",
      confidence: 76,
      diagnosis: "Pneumonia",
    },
    {
      id: "PT-2024-004",
      date: "2024-10-17",
      dataTypes: ["Labs", "Genetic"],
      status: "Complete",
      confidence: 95,
      diagnosis: "Anemia",
    },
    {
      id: "PT-2024-005",
      date: "2024-10-16",
      dataTypes: ["Images", "Notes"],
      status: "Complete",
      confidence: 91,
      diagnosis: "Osteoarthritis",
    },
  ];

  const accuracyData = [
    { month: "Apr", accuracy: 89 },
    { month: "May", accuracy: 90 },
    { month: "Jun", accuracy: 91 },
    { month: "Jul", accuracy: 92 },
    { month: "Aug", accuracy: 93 },
    { month: "Sep", accuracy: 94 },
    { month: "Oct", accuracy: 94.2 },
  ];

  const diagnosisDistribution = [
    { name: "Diabetes", value: 28, color: "#0f766e" },
    { name: "Cardiovascular", value: 22, color: "#3b82f6" },
    { name: "Respiratory", value: 18, color: "#8b5cf6" },
    { name: "Musculoskeletal", value: 15, color: "#f59e0b" },
    { name: "Other", value: 17, color: "#64748b" },
  ];

  // Helper to render the table (avoids code duplication in Tabs)
  const CasesTable = ({ filter }: { filter: string }) => {
    const filteredCases = filter === 'all' 
      ? recentCases 
      : recentCases.filter(c => filter === 'pending' ? c.status === 'Pending Review' : c.status === 'Complete');
      
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Data Types</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell className="font-medium">{caseItem.id}</TableCell>
              <TableCell className="text-muted-foreground">{caseItem.date}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {caseItem.dataTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="font-normal">
                      {type}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={caseItem.status === "Complete" ? "default" : "secondary"}
                  className={caseItem.status === "Pending Review" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
                >
                  {caseItem.status}
                </Badge>
              </TableCell>
              <TableCell>{caseItem.diagnosis}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${caseItem.confidence > 90 ? "bg-green-500" : caseItem.confidence > 80 ? "bg-amber-500" : "bg-red-500"}`} />
                  {caseItem.confidence}%
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
                    <DropdownMenuItem onClick={() => navigate('/healthcare/results')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileEdit className="w-4 h-4 mr-2" />
                      Edit Diagnosis
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
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

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">October 25, 2024</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={() => navigate("/healthcare/upload")} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Case Analysis
          </Button>
        </div>
      </div>



      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                {metric.trend && (
                  <Badge 
                    variant="secondary" 
                    className={`font-normal ${metric.trend === "up" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                  >
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
                    <p className="text-sm font-medium text-red-600 mt-1 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      {metric.urgent} require attention
                    </p>
                  )}
                </div>
                {metric.chartData && (
                  <div className="w-24 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.chartData.map((v) => ({ value: v }))}>
                        <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {metric.progress && (
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/20" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${metric.progress * 1.76} 176`} className="text-primary" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                      {Math.floor(metric.progress)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Diagnostic Accuracy Trends</h3>
              <p className="text-sm text-muted-foreground">6-month performance overview</p>
            </div>
            <Select defaultValue="6m">
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" domain={[80, 100]} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#0f766e" strokeWidth={3} dot={{ fill: "#ffffff", stroke: "#0f766e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#0f766e" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="font-semibold mb-1">Case Distribution</h3>
          <p className="text-sm text-muted-foreground mb-6">By medical category</p>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {diagnosisDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {diagnosisDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabbed Case Management - A more professional way to handle data */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold">Case Management</h3>
              <p className="text-sm text-muted-foreground">Manage and review your recent patient cases</p>
            </div>
            <TabsList>
              <TabsTrigger value="all">All Cases</TabsTrigger>
              <TabsTrigger value="pending">
                Needs Review
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <CasesTable filter="all" />
          </TabsContent>
          <TabsContent value="pending" className="m-0">
            <CasesTable filter="pending" />
          </TabsContent>
          <TabsContent value="completed" className="m-0">
            <CasesTable filter="completed" />
          </TabsContent>

          <div className="p-4 border-t bg-muted/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing most recent 5 cases</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/healthcare/history')}>
              View Full History
              <TrendingUp className="w-4 h-4 ml-2 rotate-90" />
            </Button>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

// You'll need to add these imports at the top if you don't have them already:
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";