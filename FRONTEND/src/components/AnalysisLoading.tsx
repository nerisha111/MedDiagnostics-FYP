import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { CheckCircle2, Loader2, Clock, ChevronDown } from "lucide-react";

export function AnalysisLoading() {
  const navigate = useNavigate();

  const location = useLocation(); 

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLogs, setShowLogs] = useState(false);

  const isPatientFlow = location.pathname.startsWith('/patient');
  const resultsPath = isPatientFlow ? '/patient/results' : '/healthcare/results';
  const dashboardPath = isPatientFlow ? '/patient/dashboard' : '/healthcare/dashboard';

  const steps = [
    { id: 1, title: "Data Validation", substeps: ["File integrity check", "Format verification"] },
    { id: 2, title: "Preprocessing Data", substeps: ["Normalizing formats", "Image enhancement", "Text extraction"] },
    { id: 3, title: "Integrating Multimodal Profile", substeps: ["Combining data sources", "Feature extraction"] },
    { id: 4, title: "Analyzing Patterns", substeps: ["Neural network analysis", "Pattern recognition"] },
    { id: 5, title: "Generating Report", substeps: ["Diagnosis generation", "Confidence calculation", "Finalizing report"] },
  ];

  const logs = [
    "[10:23:45] Initializing analysis pipeline...",
    "[10:23:46] Loading user data from secure session...",
    "[10:23:47] Processing 4 DICOM files...",
    "[10:23:48] Extracting clinical notes...",
    "[10:23:50] Running quality checks...",
    "[10:23:51] Data validation complete.",
    "[10:23:52] Starting preprocessing...",
    "[10:23:54] Enhancing image contrast...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // 4. Use the dynamic resultsPath for navigation
          setTimeout(() => navigate(resultsPath), 1000); 
          return 100;
        }
        return prev + 1;
      });
    }, 120); // Slightly increased duration for realism

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2500); // Increased duration for realism

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [navigate, resultsPath]); // Added resultsPath to dependency array

  const estimatedTime = Math.max(0, Math.ceil((100 - progress) * 0.15));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <Card className="p-8 shadow-2xl">
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${progress * 4.4} 440`} className="text-primary transition-all duration-300" strokeLinecap="round" /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold">{progress}%</span><span className="text-sm text-muted-foreground">Complete</span></div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Analyzing Medical Data</h2>
              <p className="text-muted-foreground text-center max-w-md">Our AI is processing your medical data to generate comprehensive diagnostic insights. Please do not close this window.</p>
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>Estimated time remaining: {estimatedTime > 0 ? `${estimatedTime} seconds` : "Finalizing..."}</span></div>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isComplete = idx < currentStep;
                return (
                  <div key={step.id} className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${isActive ? "bg-primary/5 border border-primary/50" : "bg-muted/50"}`}>
                    <div className="flex-shrink-0 mt-1">
                      {isComplete ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : isActive ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center"><span className="text-xs text-muted-foreground">{step.id}</span></div>}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${isActive ? "text-primary" : isComplete ? "" : "text-muted-foreground"}`}>{step.title}</h3>
                      {isActive && <ul className="space-y-1 text-sm text-muted-foreground">{step.substeps.map((substep, subIdx) => (<li key={subIdx} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50" />{substep}</li>))}</ul>}
                    </div>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-center pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline">Cancel Analysis</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Canceling this analysis will discard all progress. You will be returned to your dashboard.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Analysis</AlertDialogCancel>
                    {/* 5. Use the dynamic dashboardPath for the cancel action */}
                    <AlertDialogAction onClick={() => navigate(dashboardPath)} className="bg-destructive hover:bg-destructive/90">
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
        <Card>
          <button onClick={() => setShowLogs(!showLogs)} className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-lg">
            <span className="text-sm font-medium">System Logs</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showLogs ? "rotate-180" : ""}`} />
          </button>
          {showLogs && (
            <div className="px-4 pb-4 max-h-48 overflow-y-auto"><div className="bg-muted/50 rounded p-3 font-mono text-xs space-y-1">{logs.map((log, idx) => (<div key={idx} className="text-muted-foreground">{log}</div>))}</div></div>
          )}
        </Card>
      </div>
    </div>
  );
}