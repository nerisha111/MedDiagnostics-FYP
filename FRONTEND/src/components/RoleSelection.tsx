import { Card } from "./ui/card";
// Import the missing icons for loading and error states
import { Stethoscope, User, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from 'axios';

// A helper component mapping icon names from the API to actual React components
const IconMap = {
  Stethoscope: <Stethoscope className="w-10 h-10 text-primary" />,
  User: <User className="w-10 h-10 text-primary" />,
};

// Define a type for our role data for better TypeScript support
type Role = {
  name: string;
  description: string;
  path: string;
  icon: keyof typeof IconMap;
};

export function RoleSelection() {
  const navigate = useNavigate();

  // State for storing roles, loading status, and any potential errors
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component first mounts
  useEffect(() => {
    // The relative URL '/api/roles/' works because of the Vite proxy we set up
    axios.get('/api/roles/')
      .then(response => {
        setRoles(response.data);
      })
      .catch(err => {
        console.error("Error fetching roles:", err);
        setError("Could not connect to the server. Please ensure the backend is running and try again.");
      })
      .finally(() => {
        // This runs whether the request succeeded or failed
        setLoading(false);
      });
  }, []); // The empty dependency array means this effect runs only once

  // Helper function to render content based on the current state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center py-20 text-destructive text-center">
          <AlertTriangle className="h-10 w-10 mb-4" />
          <p className="text-lg font-semibold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      );
    }

    // This is the part that renders the roles from the API data
    return (
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {roles.map((role) => (
          <Card
            key={role.name}
            onClick={() => navigate(role.path)}
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary"
          >
            <div className="w-full p-8 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {IconMap[role.icon] || <User className="w-10 h-10 text-primary" />}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl">{role.name}</h2>
                  <p className="text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl">Welcome to MedDiagnostic Pro</h1>
          <p className="text-muted-foreground">Please select your role to continue</p>
        </div>

        {/* This single line replaces your hard-coded cards */}
        {renderContent()}
      </div>
    </div>
  );
}