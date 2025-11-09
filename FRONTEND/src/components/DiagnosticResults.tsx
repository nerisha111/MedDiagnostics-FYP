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
  Info, ExternalLink, TrendingUp, Activity, ArrowLeft, AlertCircle
} from "lucide-react";
import { toast } from 'sonner';


interface PrimaryDiagnosis {
  name: string;
  confidence: number;
  description: string;
  icd10?: string;
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
  error?: string; 
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

  console.log("Data received by DiagnosticResults page:", state);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading Analysis Results...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Analysis Data Not Found</h1>
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">The component did not receive valid analysis data.</p>
            <Button onClick={() => navigate('/healthcare/upload')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Upload
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  console.log("Rendering with this analysis data:", analysis);

  if (analysis.error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold text-center mb-4 text-destructive">AI Analysis Failed</h1>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Error Message:</h3>
            <p className="text-destructive mb-4">{analysis.error}</p>
            <h3 className="font-semibold">Technical Details:</h3>
            <pre className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap text-sm font-mono overflow-x-auto">
              {analysis.raw_output || "No raw output available."}
            </pre>
            <Button onClick={() => navigate('/healthcare/upload')} className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!analysis.primaryDiagnosis) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-2xl font-bold mb-4">Incomplete Analysis Data</h1>
          <p className="text-muted-foreground">The analysis did not return a complete diagnosis.</p>
          <Button onClick={() => navigate('/healthcare/upload')} className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('imaging')) return <Image className="w-4 h-4" />;
    if (cat.includes('lab') || cat.includes('test')) return <FlaskConical className="w-4 h-4" />;
    if (cat.includes('treatment') || cat.includes('medication')) return <Activity className="w-4 h-4" />;
    if (cat.includes('follow') || cat.includes('review')) return <CheckCircle2 className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/healthcare/upload')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Diagnostic Results</h1>
              <p className="text-muted-foreground">
                Case ID: PT-2024-{Math.random().toString(36).substr(2, 6).toUpperCase()} • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Diagnosis Card */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Primary Diagnosis</Badge>
                      {analysis.primaryDiagnosis?.icd10 && (
                        <Badge variant="secondary" className="text-xs">
                          ICD-10: {analysis.primaryDiagnosis.icd10}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">
                      {analysis.primaryDiagnosis?.name}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysis.primaryDiagnosis?.description}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Diagnostic Confidence
                    </span>
                    <span className={`text-sm font-bold ${getConfidenceColor(analysis.primaryDiagnosis?.confidence || 0)}`}>
                      {analysis.primaryDiagnosis?.confidence}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis.primaryDiagnosis?.confidence || 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {analysis.primaryDiagnosis?.confidence >= 80 
                      ? "High confidence - Diagnosis strongly supported by findings"
                      : analysis.primaryDiagnosis?.confidence >= 60
                      ? "Moderate confidence - Additional tests may be beneficial"
                      : "Lower confidence - Further investigation recommended"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Differential Diagnoses Card */}
            {analysis.differentialDiagnoses && analysis.differentialDiagnoses.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Differential Diagnoses</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Alternative conditions to consider based on the clinical presentation
                </p>
                <div className="space-y-3">
                  {analysis.differentialDiagnoses.map((diagnosis, idx) => (
                    <Card key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{diagnosis.name}</h4>
                        <span className={`text-sm font-semibold ${getConfidenceColor(diagnosis.confidence)}`}>
                          {diagnosis.confidence}%
                        </span>
                      </div>
                      <Progress 
                        value={diagnosis.confidence} 
                        className="h-1.5" 
                      />
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Key Findings Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Key Clinical Findings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Significant observations from image analysis
              </p>
              <ul className="space-y-3">
                {analysis.findings?.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getConfidenceColor(analysis.primaryDiagnosis?.confidence || 0)}`}>
                  {analysis.primaryDiagnosis?.confidence}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Confidence</p>
              </div>
            </Card>

            {/* Recommended Next Steps Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Recommended Next Steps</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Clinical actions to support diagnosis and treatment
              </p>
              <div className="space-y-3">
                {analysis.nextSteps?.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="border-l-4 border-primary pl-4 py-3 bg-muted/30 rounded-r-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(step.category)}
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {step.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm leading-relaxed">
                      {step.action}
                    </h4>
                  </div>
                ))}
              </div>
            </Card>

            {/* Disclaimer Card */}
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Medical Disclaimer</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This AI analysis is for informational purposes only and should not replace 
                    professional medical advice. Always consult with a qualified healthcare provider.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Card */}
        <Card className="p-4 sticky bottom-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Analysis complete with {analysis.primaryDiagnosis?.confidence || 0}% confidence
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-xs text-muted-foreground">
                Generated by LLaVA-Med AI
              </span>
            </div>
            <Button onClick={onFeedback}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Provide Feedback
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}