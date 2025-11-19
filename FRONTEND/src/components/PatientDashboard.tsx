import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// UI Components
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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
  Loader2, 
  FileText,
  Activity,
  Calendar,
  TrendingUp,
  FlaskConical
} from "lucide-react";

// --- Types for Dynamic Data ---
interface DashboardStats {
  totalReports: number;
  pendingAnalysis: number;
  lastUploadDate: string;
}

// --- Child Page Components ---

export function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ 
    totalReports: 0, 
    pendingAnalysis: 0, 
    lastUploadDate: "N/A" 
  });

  // Simulate Data Fetching
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch: supabase.from('reports')...
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          totalReports: 12,
          pendingAnalysis: 1,
          lastUploadDate: new Date().toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error loading stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />)}
        </div>
        <div className="h-48 bg-muted/20 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{getTimeGreeting()}, {user?.firstName}</h2>
          
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm border">
          <Calendar className="w-4 h-4" /> 
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Row */}
      

      {/* Main Action Area */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Hero Action (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <CardTitle>Start New Analysis</CardTitle>
              </div>
              <CardDescription className="text-base">
                Upload your latest medical images, clinical notes, or lab results. Our AI will process them securely and generate a detailed report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/patient/upload")} size="lg" className="shadow-md">
                Upload Medical Data <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Access Row (Styled nicer than original list) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start px-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => navigate('/patient/reports')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">View Reports</div>
                  <div className="text-xs text-muted-foreground">Access analysis history</div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start px-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => navigate('/patient/settings')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-full">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Account Settings</div>
                  <div className="text-xs text-muted-foreground">Manage preferences</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Right Column: Health Tip (Spans 1 column) */}
        <div className="md:col-span-1">
          <Card className="bg-slate-900 text-slate-50 border-none h-full flex flex-col justify-between shadow-xl relative overflow-hidden">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
             
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                Did you know?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                AI-assisted diagnostics can reduce human error in image interpretation by providing a second opinion, often highlighting anomalies that might be overlooked in early stages.
              </p>
              
              <div className="pt-4 mt-auto">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FlaskConical className="w-3 h-3" />
                  <span>Medical Insight #42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

// --- Placeholders ---
export const PatientDataUpload = () => <div className="space-y-6"><p className="text-muted-foreground">Your full upload interface will be here.</p></div>;
export const MyReports = () => <div className="space-y-6"><p className="text-muted-foreground">A list of your completed reports will be here.</p></div>;
export const PatientHistory = () => <div className="space-y-6"><p className="text-muted-foreground">Your full activity timeline will be here.</p></div>;
export const AccountSettings = () => <div className="space-y-6"><p className="text-muted-foreground">Your account settings will be here.</p></div>;
export const Help = () => <div className="space-y-6"><p className="text-muted-foreground">The Help & Support page will be here.</p></div>;

/**
 * Main Patient Dashboard Layout Component 
 * (SIDE PANEL RESTORED EXACTLY AS REQUESTED)
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
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/patient/dashboard", description: "" },
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