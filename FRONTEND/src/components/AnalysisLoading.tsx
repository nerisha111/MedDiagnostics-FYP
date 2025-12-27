import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import { toast } from "sonner";
import axios from "axios";
import { supabase } from "../supabaseClient";

// Type definition for the data we expect from the polling endpoint
interface CaseData {
  id: string;
  status: 'PROCESSING' | 'COMPLETE' | 'FAILED';
  diagnosis_set: { diagnosis_json: any }[]; // This holds our final result
}

export function AnalysisLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId } = useParams<{ caseId: string }>(); // Get the caseId from the URL

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLogs, setShowLogs] = useState(false); // Kept for your UI

  // Determine paths dynamically, just like your original code
  const isPatientFlow = location.pathname.startsWith('/patient');
  const resultsPath = isPatientFlow ? '/patient/results' : '/healthcare/results';
  const uploadPath = isPatientFlow ? '/patient/upload' : '/healthcare/upload';

  // Your original UI steps for visual feedback
  const steps = [
    { id: 1, title: "Data Validation & Preprocessing", substeps: ["File integrity check", "Format verification", "Text extraction"] },
    { id: 2, title: "Integrating Multimodal Profile", substeps: ["Combining data sources", "Feature extraction"] },
    { id: 3, title: "AI Analyzing Patterns (Map Phase)", substeps: ["Chunking documents", "Generating initial summaries"] },
    { id: 4, title: "Synthesizing Summaries (Reduce Phase)", substeps: ["Combining insights", "Cross-referencing findings"] },
    { id: 5, title: "Generating Final Report", substeps: ["Structuring JSON output", "Final confidence calculation"] },
  ];

  // Your original logs, can be kept for visual effect
  const logs = [
    "[INFO] Initializing analysis pipeline...",
    "[INFO] Secure session established.",
    "[INFO] Beginning file download from cloud storage...",
    "[SUCCESS] PDF content extracted successfully.",
    "[INFO] Data validation complete. Starting preprocessing...",
  ];
  
  // --- NEW useEffect hook with REAL backend polling ---
  useEffect(() => {
    let isMounted = true; // Prevents state updates if the component unmounts

    // 1. REAL POLLING LOGIC
    const pollStatus = async () => {
      if (!isMounted || !caseId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated.");

        const response = await axios.get<CaseData>(`/api/cases/${caseId}/`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const caseData = response.data;

        if (caseData.status === 'COMPLETE') {
          setProgress(100); // Set progress to 100% on completion
          setCurrentStep(steps.length - 1);
          toast.success("Analysis complete!");
          const diagnosisResult = caseData.diagnosis_set[0]?.diagnosis_json;
          // Navigate to the results page with the structured JSON data
          setTimeout(() => navigate(resultsPath, { state: { result: diagnosisResult }, replace: true }), 1000);
          return; // Stop the polling loop
        }
        
        if (caseData.status === 'FAILED') {
          toast.error("Analysis failed. Please check the case and try again.");
          navigate(uploadPath, { replace: true });
          return; // Stop the polling loop
        }
        
        // If status is still 'PROCESSING', schedule the next poll
        setTimeout(pollStatus, 5000); // Poll every 5 seconds

      } catch (error) {
        toast.error("A connection error occurred while checking analysis status.");
        console.error("Polling error:", error);
        // Optional: you could navigate away after several failed attempts
      }
    };

    // 2. FAKE PROGRESS UI LOGIC (for a better user experience)
    // This runs in parallel to the real polling to make the UI feel responsive.
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 99 ? 99 : prev + 1)); // It will never reach 100 on its own
    }, 800); // A slightly slower, more believable progress speed

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev >= steps.length - 1 ? prev : prev + 1));
    }, 15000); // Advance a major visual step every 15 seconds

    // 3. Start the process
    toast.info("Analysis started. This may take several minutes.");
    setTimeout(pollStatus, 3000); // Start polling after a 3-second delay

    // Cleanup function to stop timers and polling when the user navigates away
    return () => {
      isMounted = false;
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [caseId, navigate, resultsPath, uploadPath]); // Add all dependencies

  const estimatedTime = Math.max(0, Math.ceil((100 - progress) * 0.8));

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
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>Estimated time remaining: {progress < 99 ? `${estimatedTime} seconds` : "Finalizing..."}</span></div>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isComplete = idx < currentStep || progress === 100;
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
                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Canceling this analysis will discard all progress. You will be returned to the upload page.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Analysis</AlertDialogCancel>
                    <AlertDialogAction onClick={() => navigate(uploadPath)} className="bg-destructive hover:bg-destructive/90">
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