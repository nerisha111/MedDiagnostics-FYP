import { Card } from "./ui/card";
import { Stethoscope, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';


export function RoleSelection() {
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl">Welcome to MedDiagnostic Pro</h1>
          <p className="text-muted-foreground">Please select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Healthcare Professional Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary">
           
            <div
              onClick={() => navigate('/healthcare/login')}
              className="w-full p-8 text-center"
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Stethoscope className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl">Healthcare Professional</h2>
                  <p className="text-muted-foreground">
                    Access advanced diagnostic tools and patient management features
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Patient Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary">
            <div
              
              onClick={() => navigate('/patient/login')}
              className="w-full p-8 text-center"
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl">Patient</h2>
                  <p className="text-muted-foreground">
                    Upload your medical data and view your diagnostic results
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}