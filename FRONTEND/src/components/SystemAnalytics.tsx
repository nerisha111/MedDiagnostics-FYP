import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  ThumbsUp,
} from "lucide-react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

interface SystemAnalyticsProps {
  onBack: () => void;
}

export function SystemAnalytics({ onBack }: SystemAnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState("30days");

  // Mock data
  const analysesOverTime = [
    { date: "Oct 1", analyses: 42, confidence: 89 },
    { date: "Oct 3", analyses: 51, confidence: 90 },
    { date: "Oct 5", analyses: 48, confidence: 91 },
    { date: "Oct 7", analyses: 55, confidence: 89 },
    { date: "Oct 9", analyses: 62, confidence: 92 },
    { date: "Oct 11", analyses: 58, confidence: 91 },
    { date: "Oct 13", analyses: 67, confidence: 93 },
    { date: "Oct 15", analyses: 72, confidence: 94 },
    { date: "Oct 17", analyses: 68, confidence: 93 },
    { date: "Oct 18", analyses: 75, confidence: 94 },
  ];

  const analysesByDataType = [
    { name: "Images + Labs", value: 385, color: "#0f766e" },
    { name: "All Modalities", value: 247, color: "#14b8a6" },
    { name: "Images Only", value: 156, color: "#5eead4" },
    { name: "Labs + Notes", value: 134, color: "#99f6e4" },
    { name: "Single Modality", value: 78, color: "#ccfbf1" },
  ];

  const diagnosisCategories = [
    { category: "Endocrine", count: 324, percentage: 28 },
    { category: "Cardiovascular", count: 256, percentage: 22 },
    { category: "Respiratory", count: 210, percentage: 18 },
    { category: "Musculoskeletal", count: 175, percentage: 15 },
    { category: "Neurological", count: 128, percentage: 11 },
    { category: "Other", count: 67, percentage: 6 },
  ];

  const confidenceByDiagnosis = [
    { diagnosis: "Type 2 Diabetes", jan: 88, feb: 90, mar: 91, apr: 92 },
    { diagnosis: "Hypertension", jan: 86, feb: 87, mar: 89, apr: 90 },
    { diagnosis: "Pneumonia", jan: 82, feb: 84, mar: 86, apr: 87 },
    { diagnosis: "Osteoarthritis", jan: 89, feb: 90, mar: 91, apr: 93 },
  ];

  const processingTimes = [
    { timeRange: "< 30s", count: 456 },
    { timeRange: "30s-1m", count: 312 },
    { timeRange: "1-2m", count: 178 },
    { timeRange: "2-5m", count: 89 },
    { timeRange: "> 5m", count: 25 },
  ];

  const dataQualityScores = [
    { score: "90-100", count: 523, color: "#10b981" },
    { score: "80-89", count: 312, color: "#0f766e" },
    { score: "70-79", count: 145, color: "#f59e0b" },
    { score: "< 70", count: 67, color: "#ef4444" },
  ];

  const feedbackSentiment = [
    { month: "Jul", positive: 87, neutral: 10, negative: 3 },
    { month: "Aug", positive: 89, neutral: 8, negative: 3 },
    { month: "Sep", positive: 91, neutral: 7, negative: 2 },
    { month: "Oct", positive: 94, neutral: 5, negative: 1 },
  ];

  const topDiagnoses = [
    { diagnosis: "Type 2 Diabetes Mellitus", count: 324, accuracy: 94 },
    { diagnosis: "Essential Hypertension", count: 256, accuracy: 91 },
    { diagnosis: "Community-Acquired Pneumonia", count: 210, accuracy: 87 },
    { diagnosis: "Osteoarthritis", count: 175, accuracy: 93 },
    { diagnosis: "Iron Deficiency Anemia", count: 128, accuracy: 95 },
  ];

  const kpiCards = [
    {
      title: "Total Analyses",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      period: "vs last month",
      icon: Activity,
    },
    {
      title: "Average Confidence",
      value: "92.3%",
      change: "+2.8%",
      trend: "up",
      period: "vs last month",
      icon: Target,
    },
    {
      title: "Feedback Rate",
      value: "67%",
      change: "+5.2%",
      trend: "up",
      period: "vs last month",
      icon: ThumbsUp,
    },
    {
      title: "Avg. Processing Time",
      value: "42s",
      change: "-8.4%",
      trend: "down",
      period: "vs last month",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl">System Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into diagnostic performance and usage patterns
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Dashboard
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl">{kpi.value}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex items-center gap-1 ${
                        kpi.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground">{kpi.period}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="data">Data Insights</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          </TabsList>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Analyses Over Time */}
              <Card className="lg:col-span-2 p-6">
                <h3 className="mb-4">Analyses Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analysesOverTime}>
                    <defs>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="analyses"
                      stroke="#0f766e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAnalyses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Analyses by Data Type */}
              <Card className="p-6">
                <h3 className="mb-4">Analyses by Data Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysesByDataType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analysesByDataType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {analysesByDataType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Diagnosis Categories */}
            <Card className="p-6">
              <h3 className="mb-4">Cases by Diagnosis Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diagnosisCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Confidence Scores by Diagnosis */}
            <Card className="p-6">
              <h3 className="mb-4">Confidence Scores by Diagnosis Type Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={confidenceByDiagnosis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="diagnosis" stroke="#64748b" />
                  <YAxis domain={[75, 100]} stroke="#64748b" />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="jan" stroke="#0f766e" strokeWidth={2} />
                  <Line type="monotone" dataKey="feb" stroke="#14b8a6" strokeWidth={2} />
                  <Line type="monotone" dataKey="mar" stroke="#5eead4" strokeWidth={2} />
                  <Line type="monotone" dataKey="apr" stroke="#99f6e4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Processing Times */}
              <Card className="p-6">
                <h3 className="mb-4">Processing Time Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processingTimes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="timeRange" type="category" stroke="#64748b" />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#0f766e" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Top Diagnoses Table */}
              <Card className="p-6">
                <h3 className="mb-4">Most Common Diagnoses</h3>
                <div className="space-y-3">
                  {topDiagnoses.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                            {index + 1}
                          </Badge>
                          {item.diagnosis}
                        </span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${item.accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                          {item.accuracy}% acc
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Data Insights Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Data Quality Scores */}
              <Card className="p-6">
                <h3 className="mb-4">Data Quality Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataQualityScores}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label
                    >
                      {dataQualityScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {dataQualityScores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.score}%</span>
                      </div>
                      <span>{item.count} uploads</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Storage & File Stats */}
              <Card className="p-6">
                <h3 className="mb-4">Upload Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Files Uploaded</span>
                      <span className="text-2xl">4,247</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Medical Images</span>
                      <span>1,823 (43%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "43%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Clinical Notes</span>
                      <span>1,234 (29%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "29%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Lab Results</span>
                      <span>892 (21%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: "21%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Genetic Data</span>
                      <span>298 (7%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: "7%" }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Analysis Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4">Feedback Sentiment Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={feedbackSentiment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="mb-2">User Satisfaction</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl">4.7</span>
                  <span className="text-muted-foreground mb-1">/ 5.0</span>
                </div>
                <p className="text-sm text-muted-foreground">Based on 847 reviews</p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2">Accuracy Feedback</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl text-green-600">91%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Diagnoses rated as correct or partially correct
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2">Recommendation Rate</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl text-primary">86%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Would recommend to colleagues
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
