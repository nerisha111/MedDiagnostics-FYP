import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Users,
  FileText,
  BookOpen,
  MessageSquare,
  Settings,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Define the type for the component's props
interface HealthcareLayoutProps {
  children: React.ReactNode; // `children` will be the page content
}

// The layout component that includes the sidebar and top navigation
export function HealthcareLayout({ children }: HealthcareLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/healthcare/dashboard" },
    { id: "upload", icon: Upload, label: "Upload Data", path: "/healthcare/upload" },
    { id: "patients", icon: Users, label: "Patient Management", path: "/healthcare/compare" },
    { id: "reports", icon: FileText, label: "Diagnostic Reports", path: "/healthcare/history" },
    { id: "guidelines", icon: BookOpen, label: "Clinical Guidelines", path: "/healthcare/guidelines" },
    { id: "feedback", icon: MessageSquare, label: "Feedback System", path: "/healthcare/feedback" },
    { id: "settings", icon: Settings, label: "Settings", path: "/healthcare/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r border-border flex-col hidden lg:flex">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl">MedDiagnostic Pro</h2>
          <p className="text-sm text-muted-foreground">Healthcare Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search patients, reports, guidelines..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm">DR</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Dr. Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Healthcare Professional</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/healthcare/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page specific content is rendered here */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}