import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Save,
  Image,
  FlaskConical,
  Dna,
  CheckCircle2,
  Info,
  ExternalLink,
  TrendingUp,
  Activity,
} from "lucide-react";


interface DiagnosticResultsProps {
  onFeedback: () => void;
}


export function DiagnosticResults({ onFeedback }: DiagnosticResultsProps) {
  const navigate = useNavigate();
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);

  const result = {
    caseId: "PT-2024-001",
    analysisDate: "October 18, 2024, 10:24 AM",
    dataSources: {
      images: 4,
      notes: 2,
      labs: 1,
      genetic: 0,
    },
    confidence: 92,
    status: "Complete",
  };

  const primaryDiagnosis = {
    name: "Type 2 Diabetes Mellitus",
    icd10: "E11",
    confidence: 92,
    riskLevel: "High",
    description:
      "A chronic metabolic disorder characterized by high blood glucose levels due to insulin resistance and relative insulin deficiency.",
  };

  const differentialDiagnoses = [
    {
      id: "diff-1",
      name: "Metabolic Syndrome",
      confidence: 78,
      indicators: ["Elevated glucose", "High BMI", "Hypertension"],
    },
    {
      id: "diff-2",
      name: "Prediabetes",
      confidence: 65,
      indicators: ["Borderline glucose", "Family history"],
    },
    {
      id: "diff-3",
      name: "Insulin Resistance",
      confidence: 58,
      indicators: ["Elevated insulin", "Obesity"],
    },
  ];

  const findings = {
    images: [
      {
        type: "Retinal Scan",
        finding: "Early diabetic retinopathy detected",
        confidence: 89,
      },
      {
        type: "Foot X-Ray",
        finding: "No evidence of diabetic foot complications",
        confidence: 95,
      },
    ],
    labs: [
      { test: "HbA1c", value: "8.2%", normal: "< 5.7%", status: "high" },
      { test: "Fasting Glucose", value: "156 mg/dL", normal: "70-100 mg/dL", status: "high" },
      { test: "Total Cholesterol", value: "245 mg/dL", normal: "< 200 mg/dL", status: "high" },
      { test: "HDL Cholesterol", value: "38 mg/dL", normal: "> 40 mg/dL", status: "low" },
    ],
    notes: [
      "Patient reports increased thirst and frequent urination",
      "Family history of diabetes (mother and grandfather)",
      "BMI: 32.4 (Obese)",
      "Sedentary lifestyle with minimal physical activity",
    ],
  };

  const guidelines = {
    source: "American Diabetes Association (ADA)",
    updated: "2024",
    recommendations: [
      "Initiate metformin therapy as first-line pharmacological treatment",
      "Recommend lifestyle modifications including diet and exercise",
      "Target HbA1c < 7% for most adults",
      "Monitor for cardiovascular risk factors",
    ],
  };

  const nextSteps = [
    {
      priority: 1,
      category: "Further Testing",
      action: "Comprehensive metabolic panel",
      description: "Complete lipid profile and kidney function tests",
    },
    {
      priority: 1,
      category: "Treatment",
      action: "Start metformin 500mg",
      description: "Twice daily with meals, titrate up as needed",
    },
    {
      priority: 2,
      category: "Lifestyle",
      action: "Diabetes education program",
      description: "Referral to certified diabetes educator",
    },
    {
      priority: 2,
      category: "Monitoring",
      action: "Regular blood glucose monitoring",
      description: "Daily fasting and post-prandial glucose checks",
    },
  ];

  const toggleDiagnosisSelection = (id: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
          
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl">Diagnostic Results</h1>
              <p className="text-muted-foreground">
                Case ID: {result.caseId} • {result.analysisDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Report
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data Sources</p>
                <div className="flex gap-2">
                  {result.dataSources.images > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Image className="w-3 h-3" />
                      {result.dataSources.images} Images
                    </Badge>
                  )}
                  {result.dataSources.notes > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="w-3 h-3" />
                      {result.dataSources.notes} Notes
                    </Badge>
                  )}
                  {result.dataSources.labs > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <FlaskConical className="w-3 h-3" />
                      {result.dataSources.labs} Labs
                    </Badge>
                  )}
                  {result.dataSources.genetic > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Dna className="w-3 h-3" />
                      {result.dataSources.genetic} Genetic
                    </Badge>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Confidence</p>
                <div className="flex items-center gap-3">
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
                        strokeDasharray={`${result.confidence * 1.76} 176`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">{result.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className="bg-green-500">{result.status}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Diagnosis */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl">{primaryDiagnosis.name}</h2>
                      <Badge variant="outline" className="text-xs">
                        ICD-10: {primaryDiagnosis.icd10}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{primaryDiagnosis.description}</p>
                  </div>
                  <Badge
                    className={
                      primaryDiagnosis.riskLevel === "High"
                        ? "bg-red-500"
                        : primaryDiagnosis.riskLevel === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }
                  >
                    {primaryDiagnosis.riskLevel} Risk
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                    <span className="text-sm">{primaryDiagnosis.confidence}%</span>
                  </div>
                  <Progress value={primaryDiagnosis.confidence} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Differential Diagnoses */}
            <Card className="p-6">
              <h3 className="mb-4">Differential Diagnoses</h3>
              <div className="space-y-3">
                {differentialDiagnoses.map((diagnosis) => (
                  <Card key={diagnosis.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4>{diagnosis.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {diagnosis.confidence}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {diagnosis.indicators.map((indicator, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                        <Progress value={diagnosis.confidence} className="h-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Supporting Evidence */}
            <Card className="p-6">
              <h3 className="mb-4">Supporting Evidence</h3>
              <Tabs defaultValue="images">
                <TabsList>
                  <TabsTrigger value="images">
                    <Image className="w-4 h-4 mr-2" />
                    Medical Images
                  </TabsTrigger>
                  <TabsTrigger value="labs">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Lab Results
                  </TabsTrigger>
                  <TabsTrigger value="notes">
                    <FileText className="w-4 h-4 mr-2" />
                    Clinical Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="images" className="space-y-3 mt-4">
                  {findings.images.map((finding, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="mb-1">{finding.type}</h4>
                          <p className="text-sm text-muted-foreground">{finding.finding}</p>
                        </div>
                        <Badge variant="secondary">{finding.confidence}% confidence</Badge>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="labs" className="mt-4">
                  <div className="space-y-2">
                    {findings.labs.map((lab, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          {lab.status === "high" ? (
                            <TrendingUp className="w-5 h-5 text-red-500" />
                          ) : lab.status === "low" ? (
                            <Activity className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <p>{lab.test}</p>
                            <p className="text-xs text-muted-foreground">
                              Normal: {lab.normal}
                            </p>
                          </div>
                        </div>
                        <span
                          className={
                            lab.status === "high" || lab.status === "low"
                              ? "text-destructive"
                              : ""
                          }
                        >
                          {lab.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <ul className="space-y-2">
                    {findings.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Guidelines & Next Steps Column */}
          <div className="space-y-6">
            {/* Clinical Guidelines */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3>Clinical Guidelines</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm">{guidelines.source}</p>
                  <p className="text-xs text-muted-foreground">Updated {guidelines.updated}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm mb-3">Key Recommendations:</p>
                  <ul className="space-y-2">
                    {guidelines.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Full Guideline
                </Button>
              </div>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="p-6">
              <h3 className="mb-4">Recommended Next Steps</h3>
              <div className="space-y-3">
                {nextSteps.map((step, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={step.priority === 1 ? "default" : "secondary"}>
                        Priority {step.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{step.category}</span>
                    </div>
                    <h4 className="mb-1">{step.action}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <Card className="p-6 sticky bottom-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Generated diagnostic report with {result.confidence}% confidence
            </p>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90" onClick={onFeedback}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Provide Feedback
              </Button>
              {/* 4. Updated the onClick handler to the correct route */}
              <Button
                variant="outline"
                onClick={() => navigate('/healthcare/upload')}
              >
                Start New Analysis
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}