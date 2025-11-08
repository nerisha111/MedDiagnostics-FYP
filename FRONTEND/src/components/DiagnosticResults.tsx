// src/components/DiagnosticResults.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Download, FileText, MessageSquare, Image, FlaskConical, Dna, CheckCircle2,
  Info, ExternalLink, TrendingUp, Activity, ArrowLeft
} from "lucide-react";
import { toast } from 'sonner';

// --- Define Types for the AI's JSON output ---
interface PrimaryDiagnosis {
  name: string;
  confidence: number;
  description: string;
  icd10?: string; // Optional fields
  riskLevel?: string;
}
interface DifferentialDiagnosis {
  name:string;
  confidence: number;
}
interface NextStep {
  category: string;
  action: string;
  priority?: number;
  description?: string;
}
interface AnalysisResult {
  primaryDiagnosis: PrimaryDiagnosis;
  differentialDiagnoses: DifferentialDiagnosis[];
  findings: string[];
  nextSteps: NextStep[];
  error?: string; // To handle cases where the AI fails
  raw_output?: string;
}

interface LocationState {
  result?: AnalysisResult;
}

interface DiagnosticResultsProps {
  onFeedback: () => void;
}

export function DiagnosticResults({ onFeedback }: DiagnosticResultsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // --- State to hold the dynamic data from the AI ---
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state?.result) {
      if (state.result.error) {
        toast.error(state.result.error);
        console.error("AI Raw Output:", state.result.raw_output);
      }
      setAnalysis(state.result);
      setIsLoading(false);
    } else {
      toast.error("No analysis data found. Redirecting...");
      navigate('/healthcare/upload');
    }
  }, [state, navigate]);

  if (isLoading || !analysis || !analysis.primaryDiagnosis) {
    return <div>Loading Analysis Results...</div>; // Or a spinner component
  }

  // Render a fallback UI if the AI returned an error
  if (analysis.error) {
     return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Analysis Failed</h1>
            <Card className="p-6">
                <p className="text-destructive mb-4">{analysis.error}</p>
                <h3 className="font-semibold">Raw AI Output:</h3>
                <pre className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                    {analysis.raw_output || "No raw output available."}
                </pre>
            </Card>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => navigate('/healthcare/upload')}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold">Diagnostic Results</h1>
              <p className="text-muted-foreground">Case ID: PT-2024-XXX • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export PDF</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl">{analysis.primaryDiagnosis.name}</h2>
                    <p className="text-muted-foreground mt-2">{analysis.primaryDiagnosis.description}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                    <span className="text-sm">{analysis.primaryDiagnosis.confidence}%</span>
                  </div>
                  <Progress value={analysis.primaryDiagnosis.confidence} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Differential Diagnoses</h3>
              <div className="space-y-3">
                {analysis.differentialDiagnoses.map((diagnosis, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between">
                      <h4>{diagnosis.name}</h4>
                      <span className="text-sm text-muted-foreground">{diagnosis.confidence}%</span>
                    </div>
                    <Progress value={diagnosis.confidence} className="h-1 mt-2" />
                  </Card>
                ))}
              </div>
            </Card>

             <Card className="p-6">
                <h3 className="mb-4 font-semibold">Key Findings from Documents</h3>
                 <ul className="space-y-2">
                    {analysis.findings.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Recommended Next Steps</h3>
              <div className="space-y-3">
                {analysis.nextSteps.map((step, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                    <span className="text-xs text-muted-foreground">{step.category}</span>
                    <h4 className="font-medium">{step.action}</h4>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-4 sticky bottom-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Report generated with {analysis.primaryDiagnosis.confidence}% confidence.</p>
            <Button onClick={onFeedback}><MessageSquare className="w-4 h-4 mr-2" />Provide Feedback</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}