import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UserPlus, Mic } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r h-screen p-4">
      <div className="space-y-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-healable-primary">HealableInsight</span>
        </Link>

        <nav className="space-y-2">
          <Link to="/">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", 
                location.pathname === "/" && "bg-healable-light"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/patients">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", 
                location.pathname.includes("/patients") && "bg-healable-light"
              )}
            >
              <Users className="h-4 w-4" />
              Patient Records
            </Button>
          </Link>

          <Link to="/new-patient">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", 
                location.pathname === "/new-patient" && "bg-healable-light"
              )}
            >
              <UserPlus className="h-4 w-4" />
              New Patient
            </Button>
          </Link>

          <Link to="/live-notes">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", 
                location.pathname === "/live-notes" && "bg-healable-light"
              )}
            >
              <Mic className="h-4 w-4" />
              Live Note Capture
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 