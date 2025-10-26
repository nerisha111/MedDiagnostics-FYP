import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 1. Import hooks
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
  Home,
  Upload,
  Users,
  FileText,
  BookOpen,
  MessageSquare,
  Settings,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Eye,
  FileEdit,
  Download,
  MoreVertical,
  Plus,
  AlertCircle,
  LogOut, // Added for clarity in sign-out button
} from "lucide-react";
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

// 2. Removed the props interface
export function HealthcareProfessionalDashboard() {
  const navigate = useNavigate(); // 3. Initialize navigate
  const location = useLocation(); // 4. Initialize location to track the current path
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/healthcare/dashboard" },
    { id: "upload", icon: Upload, label: "Upload Data", path: "/healthcare/upload" },
    { id: "patients", icon: Users, label: "Patient Management", path: "/healthcare/compare" },
    { id: "reports", icon: FileText, label: "Diagnostic Reports", path: "/healthcare/history" },
    { id: "guidelines", icon: BookOpen, label: "Clinical Guidelines", path: "/healthcare/guidelines" },
    { id: "feedback", icon: MessageSquare, label: "Feedback System", path: "/healthcare/feedback" },
    { id: "settings", icon: Settings, label: "Settings", path: "/healthcare/settings" },
  ];

  // Mock data (remains unchanged)
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl">MedDiagnostic Pro</h2>
          <p className="text-sm text-muted-foreground">Healthcare Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search patients, reports, guidelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm">DR</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Dr. Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Healthcare Professional</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* 8. Updated dropdown navigation */}
                  <DropdownMenuItem onClick={() => navigate("/healthcare/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, Dr. Johnson
                </p>
              </div>
              <Button
                // 9. Updated button navigation
                onClick={() => navigate("/healthcare/upload")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Case Analysis
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                      {metric.trend && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            metric.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {metric.trend === "up" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {metric.change}
                        </span>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl">{metric.value}</p>
                        {metric.urgent && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {metric.urgent} urgent
                          </p>
                        )}
                      </div>
                      {metric.chartData && (
                        <div className="w-20 h-10">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metric.chartData.map((v, i) => ({ value: v }))}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#0f766e"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {metric.progress && (
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-muted"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${metric.progress * 1.76} 176`}
                              className="text-primary"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Accuracy Over Time */}
              <Card className="lg:col-span-2 p-6">
                <h3 className="mb-4">Diagnostic Accuracy Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[85, 100]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={{ fill: "#0f766e", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Diagnosis Distribution */}
                            <Card className="p-6">
                              <h3 className="mb-4">Cases by Category</h3>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={diagnosisDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                  >
                                    {diagnosisDistribution.map((entry) => (
                                      <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }