import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

import { RoleSelection } from "./components/RoleSelection";
import { HealthcareProfessionalVerification } from "./components/HealthcareProfessionalVerification";
import { PatientSignUp } from "./components/PatientSignUp";
import { PatientSignIn } from "./components/PatientSignIn";
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
import { HealthcareProfessionalLogin } from "./components/HealthcareProfessionalLogin";
import { HealthcareProfessionalRegistration } from "./components/HealthcareProfessionalRegistration";


import {
  PatientDashboard,
  DashboardHome, // The new welcome screen component
} from "./components/PatientDashboard";
import { PatientMyReports } from "./components/PatientMyReports";
import { PatientHistory } from "./components/PatientHistory";
import { PatientAccountSettings } from "./components/PatientAccountSettings";
import { PatientHelpSupport } from "./components/PatientHelpSupport";
import { PatientDataUpload } from "./components/PatientDataUpload";
import { PatientAnalysisResults } from "./components/PatientAnalysisResults";

export default function App() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <Router>
        <Routes>
          {/* Default/Entry Route */}
          <Route path="/" element={<RoleSelection />} />

          {/* Healthcare Professional Flow */}
          <Route path="/healthcare/login" element={<HealthcareProfessionalLogin />} />
          <Route path="/healthcare/register" element={<HealthcareProfessionalRegistration />} />
          <Route path="/healthcare/verify" element={<HealthcareProfessionalVerification />} />
          <Route path="/healthcare/dashboard" element={<HealthcareProfessionalDashboard />} />
          <Route path="/healthcare/upload" element={<HealthcareDataUpload />} />
          <Route
            path="/healthcare/results"
            element={<DiagnosticResults onFeedback={() => setShowFeedbackModal(true)} />}
          />
          <Route path="/healthcare/history" element={<ReportHistory />} />
          <Route path="/healthcare/feedback" element={<HealthcareFeedbackSystem />} />
          <Route path="/healthcare/guidelines" element={<ClinicalGuidelines />} />
          <Route path="/healthcare/compare" element={<CaseComparison />} />
          <Route path="/healthcare/settings" element={<Settings />} />

          {/* Patient Flow */}
          <Route path="/patient/login" element={<PatientSignIn />} />
          <Route path="/patient/register" element={<PatientSignUp />} />
          <Route path="/patient/results" element={<PatientAnalysisResults />} />
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


          <Route path="/recover-password" element={<PasswordRecovery />} />
          <Route path="/loading" element={<AnalysisLoading />} />
        </Routes>
      </Router>

      {/* Modals and Toasters live outside the router */}
      <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
      <Toaster />
    </>
  );
}