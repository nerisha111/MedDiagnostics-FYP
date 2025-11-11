import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Icons
import {
  Upload,
  FileCheck,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  ArrowRight,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  Loader2, 
} from "lucide-react";

// --- Child Page Components ---
export function DashboardHome() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Here's a summary of your recent activity and health status.</p>
      <main className="space-y-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-lg bg-primary/10"><Upload className="w-6 h-6 text-primary" /></div>
            <div>
              <CardTitle className="text-xl font-semibold">Start a New Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Upload your latest medical data to begin.</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6">Our secure platform allows you to upload medical images, notes, and lab results for AI-powered insights. Click the button to go to the upload interface.</p>
            <Button onClick={() => navigate("/patient/upload")}>Go to Upload Interface<ArrowRight className="w-4 h-4 ml-2" /></Button>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /><span>Recent Activity</span></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/><div><p className="font-medium">New Report Ready</p><p className="text-sm text-muted-foreground">Your Type 2 Diabetes analysis from Oct 18 is complete.</p><Button variant="link" className="p-0 h-auto mt-1" onClick={() => navigate('/patient/reports')}>View Report</Button></div></div>
              <div className="flex items-start gap-3"><Upload className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0"/><div><p className="font-medium">Data Uploaded Successfully</p><p className="text-sm text-muted-foreground">3 files were uploaded on Oct 18.</p></div></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRight className="w-5 h-5" /><span>Quick Access</span></CardTitle></CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/reports')}><FileCheck className="w-4 h-4 mr-2" /> View All My Reports</Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/history')}><Clock className="w-4 h-4 mr-2" /> See Full Activity History</Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/settings')}><Settings className="w-4 h-4 mr-2" /> Manage Account Settings</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export const PatientDataUpload = () => <div className="space-y-6"><p className="text-muted-foreground">Your full upload interface will be here.</p></div>;
export const MyReports = () => <div className="space-y-6"><p className="text-muted-foreground">A list of your completed reports will be here.</p></div>;
export const PatientHistory = () => <div className="space-y-6"><p className="text-muted-foreground">Your full activity timeline will be here.</p></div>;
export const AccountSettings = () => <div className="space-y-6"><p className="text-muted-foreground">Your account settings will be here.</p></div>;
export const Help = () => <div className="space-y-6"><p className="text-muted-foreground">The Help & Support page will be here.</p></div>;

/**
 * Main Patient Dashboard Layout Component with Role-Based Access Control
 */
export function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the secure auth hook with role validation
  const { user, loading, isAuthorized } = useAuth({ 
    requiredRole: 'patient',
    redirectTo: '/patient/login'
  });

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/patient/dashboard", description: "View your health summary and recent activity." },
    { id: "upload", icon: Upload, label: "Upload Data", path: "/patient/upload", description: "Securely upload your medical data for analysis." },
    { id: "reports", icon: FileCheck, label: "My Reports", path: "/patient/reports", description: "Access and review your analysis reports." },
    { id: "history", icon: Clock, label: "History", path: "/patient/history", description: "See your full activity timeline." },
    { id: "settings", icon: Settings, label: "Account Settings", path: "/patient/settings", description: "Manage your profile and preferences." },
    { id: "help", icon: HelpCircle, label: "Help & Support", path: "/patient/help", description: "Find answers and get help." },
  ];
  
  const activeMenuItem = menuItems.find(item => location.pathname === item.path);

  useDocumentTitle(
    activeMenuItem
      ? `${activeMenuItem.label} - MedDiagnostic Pro`
      : 'Patient Portal - MedDiagnostic Pro'
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const getInitials = (): string => {
    if (!user || !user.firstName || !user.lastName) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Show loading state while validating
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if user is authorized
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">MedDiagnostic Pro</h2>
          <p className="text-sm text-muted-foreground">Patient Portal</p>
        </div>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">{getInitials()}</span>
            </div>
            <div>
              <p className="font-semibold">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs text-muted-foreground">Patient</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm font-medium">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {activeMenuItem && (
            <header>
              <h1 className="text-3xl font-bold">{activeMenuItem.label}</h1>
              <p className="text-muted-foreground mt-1">{activeMenuItem.description}</p>
            </header>
          )}
          <div className="border-t pt-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}