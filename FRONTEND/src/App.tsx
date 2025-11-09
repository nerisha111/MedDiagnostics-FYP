import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Import Layout
import { HealthcareLayout } from "./components/HealthcareLayout";



// Import ALL Page Components
import { RoleSelection } from "./components/RoleSelection";
import { HealthcareProfessionalLogin } from "./components/HealthcareProfessionalLogin";
import { HealthcareProfessionalRegistration } from "./components/HealthcareProfessionalRegistration";
import { HealthcareProfessionalVerification } from "./components/HealthcareProfessionalVerification";
import { HealthcareProfessionalDashboard } from "./components/HealthcareProfessionalDashboard";
import { HealthcareDataUpload } from "./components/HealthcareDataUpload";
import { AnalysisLoading } from "./components/AnalysisLoading";
import { DiagnosticResults } from "./components/DiagnosticResults";
import { FeedbackModal } from "./components/FeedbackModal";
import { ReportHistory } from "./components/ReportHistory";
import { Settings } from "./components/Settings";
import { ClinicalGuidelines } from "./components/ClinicalGuidelines";
import { CaseComparison } from "./components/CaseComparison";
import { PasswordRecovery } from "./components/PasswordRecovery";
import { HealthcareFeedbackSystem } from "./components/HealthcareFeedbackSystem";
import { PatientDashboard, DashboardHome } from "./components/PatientDashboard";
import { PatientMyReports } from "./components/PatientMyReports";
import { PatientHistory } from "./components/PatientHistory";
import { PatientAccountSettings } from "./components/PatientAccountSettings";
import { PatientHelpSupport } from "./components/PatientHelpSupport";
import { PatientDataUpload } from "./components/PatientDataUpload";
import { PatientAnalysisResults } from "./components/PatientAnalysisResults";
import { PatientSignIn } from "./components/PatientSignIn";
import { PatientSignUp } from "./components/PatientSignUp";
import { NotFoundPage } from "./components/NotFoundPage";


type Note = {
  id: number;
  title: string;
  content: string;
};

export default function App() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
   const [notes, setNotes] = useState<Note[]>([]);

function handleNoteAdded(newNote: Note) {
  setNotes((prev) => [newNote, ...prev]);
}


  return (
    <>
      
        <Routes>
       
          <Route path="/" element={<RoleSelection />} />
          <Route path="/loading" element={<AnalysisLoading />} />
          <Route path="/recover-password" element={<PasswordRecovery />} />
          
         
          <Route path="/healthcare/login" element={<HealthcareProfessionalLogin />} />
          <Route path="/healthcare/register" element={<HealthcareProfessionalRegistration />} />
          <Route path="/healthcare/verify" element={<HealthcareProfessionalVerification />} />
          
          
          
          <Route element={<HealthcareLayout />}>
            <Route path="/healthcare/dashboard" element={<HealthcareProfessionalDashboard />} />
            <Route path="/healthcare/upload" element={<HealthcareDataUpload />} />
            <Route path="/healthcare/results" element={<DiagnosticResults onFeedback={() => setShowFeedbackModal(true)} />} />
            <Route path="/healthcare/history" element={<ReportHistory />} />
            <Route path="/healthcare/feedback" element={<HealthcareFeedbackSystem />} />
            <Route path="/healthcare/guidelines" element={<ClinicalGuidelines />} />
            <Route path="/healthcare/compare" element={<CaseComparison />} />
            <Route path="/healthcare/settings" element={<Settings />} />
          </Route>

     
          <Route path="/patient/login" element={<PatientSignIn />} />
          <Route path="/patient/register" element={<PatientSignUp />} />
          <Route path="/patient/loading" element={<AnalysisLoading />} /> 
          <Route path="/patient/results" element={<PatientAnalysisResults />} /> 
 
          
          <Route path="/patient" element={<PatientDashboard />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="upload" element={<PatientDataUpload />} />
            <Route path="reports" element={<PatientMyReports />} />
            <Route path="history" element={<PatientHistory />} />
            <Route path="settings" element={<PatientAccountSettings />} />
            <Route path="help" element={<PatientHelpSupport />} />
          </Route>

          {/*catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      

      <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
      <Toaster />

  );
   


  
</>
  )}