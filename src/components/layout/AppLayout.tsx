
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
import { motion } from 'framer-motion';

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
          <SidebarHeader className="p-4 flex items-center justify-center">
            <HealableLogo size="sm" withText={false} animateOnHover className="mb-1" />
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
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/patient/1')}
                  >
                    Patient Records
                  </Button>
                </li>
              </ul>
            </nav>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-healable-primary text-white flex items-center justify-center font-medium">
                  {userInfo?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{userInfo?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userInfo?.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>Log out</Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-xl font-bold text-healable-secondary ml-4">{title}</h1>
              </motion.div>
            </div>
            <div>
              <HealableLogo size="sm" withText animateOnHover />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
