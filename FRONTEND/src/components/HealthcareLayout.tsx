import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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

export function HealthcareLayout() {
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

  // This effect hook updates the browser tab title whenever the URL changes.
  useEffect(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));

    if (currentItem) {
      document.title = `${currentItem.label} | MedDiagnostic Pro`;
    } else {
      document.title = "MedDiagnostic Pro"; // A fallback title
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">MedDiagnostic Pro</h2>
          <p className="text-sm text-muted-foreground">Healthcare Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar with Search */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search patients, reports, guidelines..." className="pl-10" />
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
                  <DropdownMenuItem onClick={() => navigate("/healthcare/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* 
          THIS IS THE KEY CHANGE:
          The <main> tag now provides the outer padding (p-8), 
          and the inner <div> provides the max-width and centering.
          The Outlet is placed inside, so all pages inherit this structure.
        */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}