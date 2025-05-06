import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import HealableLogo from '@/components/HealableLogo';
import { UserPlus, LayoutDashboard, Users, UserCircle } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 flex items-center">
            <HealableLogo size="sm" />
          </SidebarHeader>
          <SidebarContent>
            <nav className="px-4 py-2">
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/patients')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Patient Records
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-healable-primary hover:text-healable-secondary"
                    onClick={() => navigate('/new-patient')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Patient
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/profile')}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                </li>
              </ul>
            </nav>
          </SidebarContent>
          <SidebarFooter className="p-4">
            {userInfo && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-healable-primary text-white flex items-center justify-center font-medium">
                  {userInfo.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{userInfo.name}</div>
                  <div className="text-xs text-muted-foreground">{userInfo.role}</div>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={logout}
            >
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
