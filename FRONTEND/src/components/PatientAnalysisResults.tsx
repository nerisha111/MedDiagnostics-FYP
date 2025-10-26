import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Image,
  FlaskConical,
  Info,
  ExternalLink,
  ShieldCheck,
  Heart,
  BookOpen,
  UserCheck,
  BarChart,
} from "lucide-react";

// The onFeedback prop is kept to allow a feedback modal to be shown
interface PatientAnalysisResultsProps {
  onFeedback?: () => void;
}

export function PatientAnalysisResults({ onFeedback }: PatientAnalysisResultsProps) {
  const navigate = useNavigate();

  // --- Data for the report ---
  const result = { analysisDate: "October 26, 2025, 10:24 AM" };
  const primaryFinding = {
    name: "Indicators of Type 2 Diabetes",
    description: "The analysis found strong indicators consistent with Type 2 Diabetes, a common condition where the body has difficulty managing its blood sugar levels.",
  };
  const findings = {
    labs: [
      { test: "HbA1c", value: "8.2%", normal: "< 5.7%", status: "high" },
      { test: "Fasting Glucose", value: "156 mg/dL", normal: "70-100 mg/dL", status: "high" },
      { test: "Total Cholesterol", value: "245 mg/dL", normal: "< 200 mg/dL", status: "high" },
      { test: "HDL Cholesterol", value: "38 mg/dL", normal: "> 40 mg/dL", status: "low" },
    ],
    images: [{ type: "Retinal Scan", finding: "Signs of early-stage diabetic retinopathy were detected." }],
    notes: ["Increased thirst and frequent urination reported.", "Family history of diabetes."],
  };
  const nextSteps = {
    doctor: ["Review these results with your primary care physician.", "Talk about potential medication options and a management plan."],
    lifestyle: ["Incorporate at least 30 minutes of moderate exercise on most days.", "Focus on a balanced diet rich in whole grains and vegetables."],
  };

  const getStatusColor = (status: string) => {
    if (status === "high") return "bg-red-500";
    if (status === "low") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    // ADJUSTMENT: More controlled padding for top/bottom and sides. Increased gap between elements.
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Analysis Report</h1>
            <p className="text-muted-foreground mt-1">Completed: {result.analysisDate}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-1/2 sm:w-auto"><Download className="w-4 h-4 mr-2" />PDF</Button>
            <Button onClick={() => navigate('/patient/dashboard')} className="w-1/2 sm:w-auto"><ArrowLeft className="w-4 h-4 mr-2" />Dashboard</Button>
          </div>
        </header>

        {/* disclaimer */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <Info className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-amber-900">This is a starting point, not a medical diagnosis.</h3>
                    <p className="text-sm text-amber-800 mt-2">
                        This AI-generated report is a tool to help you and your doctor understand your health better. It is <strong>not</strong> a substitute for professional medical advice.
                        <br />
                        <strong className="mt-1 block">Please share and discuss these results with your doctor.</strong>
                    </p>
                </div>
            </div>
        </div>
        <main className="space-y-8">
          {/* 1. The Main Takeaway */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-white"><CardTitle className="text-xl">What Our Analysis Suggests</CardTitle></CardHeader>
            <CardContent className="p-6">
              <p className="text-2xl font-semibold text-primary mb-2">{primaryFinding.name}</p>
              <p className="text-muted-foreground mb-6">{primaryFinding.description}</p>
              <div className="p-4 bg-muted rounded-lg border">
                <p className="font-semibold flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary"/>Most Important Next Step</p>
                <p className="text-sm text-muted-foreground mt-1">The most important next step is to schedule an appointment to discuss these results with your doctor.</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Key Data Points */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-white space-y-1">
              <CardTitle className="text-xl">The Data Behind This Finding</CardTitle>
              <p className="text-sm text-muted-foreground">Our AI identified the following key points from the data you provided.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-3 mb-4"><FlaskConical className="w-5 h-5 text-primary"/>Your Lab Results</h3>
                <div className="space-y-3">
                  {findings.labs.map((lab) => (
                    <div key={lab.test} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(lab.status)}`} /><div><p className="font-medium">{lab.test}</p><p className="text-xs text-muted-foreground">Normal Range: {lab.normal}</p></div></div>
                      <p className="font-semibold">{lab.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t my-6" />
              <div>
                <h3 className="font-semibold flex items-center gap-3 mb-4"><Image className="w-5 h-5 text-primary"/>Image Findings</h3>
                {findings.images.map((finding) => (<p key={finding.type} className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">{finding.finding}</p>))}
              </div>
              <div className="border-t my-6" />
              <div>
                <h3 className="font-semibold flex items-center gap-3 mb-4"><FileText className="w-5 h-5 text-primary"/>From Your Notes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">{findings.notes.map((note, idx) => (<li key={idx}>{note}</li>))}</ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. Action Plan */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-white space-y-1">
              <CardTitle className="text-xl">Your Action Plan</CardTitle>
              <p className="text-sm text-muted-foreground">Here are some recommended steps. Remember to discuss them with your doctor.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-3 mb-4"><Heart className="w-5 h-5 text-primary"/>To Discuss With Your Doctor</h3>
                <ul className="space-y-2 text-sm list-disc list-inside">{nextSteps.doctor.map((step, idx) => (<li key={idx} className="text-muted-foreground">{step}</li>))}</ul>
              </div>
              <div className="border-t my-6" />
              <div>
                <h3 className="font-semibold flex items-center gap-3 mb-4"><BarChart className="w-5 h-5 text-primary"/>Lifestyle Suggestions</h3>
                <ul className="space-y-2 text-sm list-disc list-inside">{nextSteps.lifestyle.map((step, idx) => (<li key={idx} className="text-muted-foreground">{step}</li>))}</ul>
              </div>
            </CardContent>
          </Card>
        </main>
        
        {/* Footer */}
        <footer>
          <Card className="p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground text-center sm:text-left">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>This AI analysis is a tool to support, not replace, professional medical care.</span>
              </div>
              <div className="flex gap-3">
                {onFeedback && <Button variant="outline" onClick={onFeedback}><MessageSquare className="w-4 h-4 mr-2"/>Feedback</Button>}
                <Button onClick={() => navigate('/patient/upload')}>Upload New Data</Button>
              </div>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
}