import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = () =>{
    const { session, isLoading } = useAuth();
    if (isLoading) {
        return(
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        
        );
    }

    if (!session) {
        return <Navigate to="/patient/login" replace />;
    }
    return <Outlet />
};