import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import { supabase } from "../supabaseClient"; // Import supabase for the logout function
import { toast } from "sonner"; // Optional: for user feedback

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
  const { profile, isLoading, session } = useAuth(); 

 
  useEffect(() => {
    
    if (!isLoading && !session) {
      toast.info("Please sign in to continue.");
      navigate('/healthcare/login');
    }
  }, [isLoading, session, navigate]);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/healthcare/dashboard" },
    { id: "upload", icon: Upload, label: "Upload Data", path: "/healthcare/upload" },
    //{ id: "patients", icon: Users, label: "Patient Management", path: "/healthcare/compare" },
    { id: "reports", icon: FileText, label: "Diagnostic Reports", path: "/healthcare/history" },
    //{ id: "guidelines", icon: BookOpen, label: "Clinical Guidelines", path: "/healthcare/guidelines" },
    { id: "feedback", icon: MessageSquare, label: "Feedback System", path: "/healthcare/feedback" },
    { id: "settings", icon: Settings, label: "Settings", path: "/healthcare/settings" },
  ];

  
  useEffect(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));

    if (currentItem) {
      document.title = `${currentItem.label} | MedDiagnostic Pro`;
    } else {
      document.title = "MedDiagnostic Pro"; 
    }
  }, [location.pathname, menuItems]); 


  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
 
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
   
      navigate('/healthcare/login');
    }
  };

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
            onClick={handleSignOut} // Use the new sign out handler
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
                  <button className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm">
                          {profile ? getInitials(profile.user_details?.first_name, profile.user_details?.last_name) : '...'}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      {isLoading ? (
                        <>
                          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </>
                      ) : profile ? (
                        <>
                          <p className="text-sm font-medium">
                            Dr. {profile.user_details?.first_name} {profile.user_details?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* Capitalizes the first letter of the role */}
                            {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm">Not signed in</p>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/healthcare/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Show a loading indicator until the session check is complete */}
            {isLoading && !profile ? (
              <div>Loading Page...</div> 
            ) : (
              <Outlet /> // Render the actual page content
            )}
          </div>
        </main>
      </div>
    </div>
  );
}