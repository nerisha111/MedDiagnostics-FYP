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
  FlaskConical,
  Shield,
  AlertCircle,
  CheckCircle2,
  Heart,
  Brain
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => <div key={i} className="h-64 bg-muted/20 animate-pulse rounded-xl" />)}
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
          <h2 className="text-3xl font-bold tracking-tight">{getTimeGreeting()}, {user?.firstName}</h2>
          <p className="text-muted-foreground mt-2">Welcome back to your health dashboard</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded-full shadow-sm border">
          <Calendar className="w-4 h-4" /> 
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* AI Disclaimer Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">Important Medical Disclaimer</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Our AI-powered analysis is designed to assist healthcare professionals and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Area */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left Column: Hero Action */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Start New Analysis</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
              Upload your latest medical images, clinical notes, or lab results. Our secure AI system will process them and generate a comprehensive diagnostic report within minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <Button onClick={() => navigate("/patient/upload")} size="lg" className="w-full shadow-md text-base h-12">
              Upload Medical Data <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>HIPAA compliant • End-to-end encrypted</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Health Insight Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 border-none shadow-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
              <Brain className="w-5 h-5" />
              AI Health Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-slate-200 leading-relaxed text-base">
                AI-assisted diagnostics can reduce human error in medical image interpretation by up to 30%, often highlighting subtle anomalies that might be overlooked in early-stage screenings.
              </p>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Medical Research Insight</p>
                <p className="text-sm text-slate-300 font-medium">Updated weekly from latest studies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-card" onClick={() => navigate('/patient/reports')}>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-base">View Reports</div>
                  <div className="text-sm text-muted-foreground mt-1">Access your analysis history</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-card" onClick={() => navigate('/patient/history')}>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-base">Activity History</div>
                  <div className="text-sm text-muted-foreground mt-1">Track your health timeline</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-card" onClick={() => navigate('/patient/settings')}>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-slate-50 text-slate-600 rounded-full">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-base">Settings</div>
                  <div className="text-sm text-muted-foreground mt-1">Manage your preferences</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-card" onClick={() => navigate('/patient/help')}>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-green-50 text-green-600 rounded-full">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-base">Get Help</div>
                  <div className="text-sm text-muted-foreground mt-1">Support and resources</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CheckCircle2 className="w-5 h-5" />
              Your Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-blue-900">HIPAA Compliant Storage</p>
                <p className="text-sm text-blue-700 mt-1">All medical data is encrypted and stored securely following healthcare regulations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-blue-900">Private & Confidential</p>
                <p className="text-sm text-blue-700 mt-1">Your health information is never shared without your explicit consent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Heart className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-sm text-green-900">Upload Your Data</p>
                <p className="text-sm text-green-700 mt-1">Securely upload medical images or documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-sm text-green-900">AI Analysis</p>
                <p className="text-sm text-green-700 mt-1">Our system analyzes patterns and generates insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-sm text-green-900">Review Results</p>
                <p className="text-sm text-green-700 mt-1">Get your detailed report to share with your doctor</p>
              </div>
            </div>
          </CardContent>
        </Card>
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