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
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Droplet,
  Scale,
} from "lucide-react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PatientAnalysisProps {
  onBack: () => void;
}

export function PatientAnalysis({ onBack }: PatientAnalysisProps) {
  const [timePeriod, setTimePeriod] = useState("3months");

  // Mock health data
  const glucoseData = [
    { date: "Jul 1", fasting: 145, postMeal: 178, target: 100 },
    { date: "Jul 15", fasting: 152, postMeal: 185, target: 100 },
    { date: "Aug 1", fasting: 148, postMeal: 180, target: 100 },
    { date: "Aug 15", fasting: 142, postMeal: 172, target: 100 },
    { date: "Sep 1", fasting: 138, postMeal: 165, target: 100 },
    { date: "Sep 15", fasting: 135, postMeal: 160, target: 100 },
    { date: "Oct 1", fasting: 130, postMeal: 155, target: 100 },
    { date: "Oct 18", fasting: 126, postMeal: 150, target: 100 },
  ];

  const hba1cData = [
    { date: "Jul", value: 8.5, target: 7.0 },
    { date: "Aug", value: 8.2, target: 7.0 },
    { date: "Sep", value: 7.8, target: 7.0 },
    { date: "Oct", value: 7.4, target: 7.0 },
  ];

  const weightData = [
    { date: "Jul", weight: 210 },
    { date: "Aug", weight: 207 },
    { date: "Sep", weight: 204 },
    { date: "Oct", weight: 201 },
  ];

  const bpData = [
    { date: "Jul 1", systolic: 145, diastolic: 92 },
    { date: "Jul 15", systolic: 142, diastolic: 90 },
    { date: "Aug 1", systolic: 140, diastolic: 88 },
    { date: "Aug 15", systolic: 138, diastolic: 86 },
    { date: "Sep 1", systolic: 135, diastolic: 85 },
    { date: "Sep 15", systolic: 133, diastolic: 84 },
    { date: "Oct 1", systolic: 130, diastolic: 82 },
    { date: "Oct 18", systolic: 128, diastolic: 80 },
  ];

  const reportStats = [
    { month: "Jul", completed: 2 },
    { month: "Aug", completed: 1 },
    { month: "Sep", completed: 1 },
    { month: "Oct", completed: 2 },
  ];

  const metrics = [
    {
      title: "Latest Glucose",
      value: "126 mg/dL",
      change: "-14%",
      trend: "down",
      status: "improving",
      icon: Droplet,
    },
    {
      title: "Latest HbA1c",
      value: "7.4%",
      change: "-13%",
      trend: "down",
      status: "improving",
      icon: Activity,
    },
    {
      title: "Current Weight",
      value: "201 lbs",
      change: "-9 lbs",
      trend: "down",
      status: "improving",
      icon: Scale,
    },
    {
      title: "Blood Pressure",
      value: "128/80",
      change: "-17 points",
      trend: "down",
      status: "improving",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl">Health Analytics</h1>
              <p className="text-muted-foreground">
                Track your health metrics and progress over time
              </p>
            </div>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl mb-2">{metric.value}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex items-center gap-1 ${
                      metric.status === "improving"
                        ? "text-green-600"
                        : "text-destructive"
                    }`}
                  >
                    {metric.trend === "down" ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {metric.change}
                  </span>
                  <Badge
                    variant={metric.status === "improving" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.status === "improving" ? "Improving" : "Needs Attention"}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Health Trends */}
        <Tabs defaultValue="glucose" className="space-y-6">
          <TabsList>
            <TabsTrigger value="glucose">Blood Glucose</TabsTrigger>
            <TabsTrigger value="hba1c">HbA1c</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="bp">Blood Pressure</TabsTrigger>
          </TabsList>

          {/* Blood Glucose */}
          <TabsContent value="glucose">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">Blood Glucose Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Fasting and post-meal glucose levels over time
                  </p>
                </div>
                <Badge variant="outline">mg/dL</Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={glucoseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[80, 200]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fasting"
                    stroke="#0f766e"
                    strokeWidth={2}
                    name="Fasting"
                    dot={{ fill: "#0f766e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="postMeal"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    name="Post-Meal"
                    dot={{ fill: "#14b8a6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#dc2626"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Target"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm">
                  <strong>Progress:</strong> Your glucose levels have improved by 14% over the
                  past 3 months. Keep up the good work!
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* HbA1c */}
          <TabsContent value="hba1c">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">HbA1c Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    3-month average blood sugar levels
                  </p>
                </div>
                <Badge variant="outline">%</Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={hba1cData}>
                  <defs>
                    <linearGradient id="colorHbA1c" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[6, 9]} />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0f766e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHbA1c)"
                    name="HbA1c"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#dc2626"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Target (< 7.0%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="text-sm">
                  <strong>Goal:</strong> Your HbA1c is trending down! You're getting closer to
                  the target of 7.0%. Continue your current treatment plan.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Weight */}
          <TabsContent value="weight">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">Weight Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your weight changes over time
                  </p>
                </div>
                <Badge variant="outline">lbs</Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[195, 215]} />
                  <RechartsTooltip />
                  <Bar dataKey="weight" fill="#0f766e" radius={[8, 8, 0, 0]} name="Weight" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm">
                  <strong>Success:</strong> You've lost 9 lbs in the past 3 months! Sustainable
                  weight loss supports better diabetes management.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Blood Pressure */}
          <TabsContent value="bp">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">Blood Pressure Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Systolic and diastolic pressure over time
                  </p>
                </div>
                <Badge variant="outline">mmHg</Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[70, 150]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#0f766e"
                    strokeWidth={2}
                    name="Systolic"
                    dot={{ fill: "#0f766e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    name="Diastolic"
                    dot={{ fill: "#14b8a6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm">
                  <strong>Good News:</strong> Your blood pressure has improved to 128/80, which
                  is within the normal range. Keep monitoring regularly.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Activity */}
        <Card className="p-6">
          <h3 className="mb-4">Report Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <RechartsTooltip />
              <Bar
                dataKey="completed"
                fill="#0f766e"
                radius={[8, 8, 0, 0]}
                name="Reports Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
