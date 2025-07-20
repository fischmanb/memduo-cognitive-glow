
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Database, 
  Settings, 
  HelpCircle, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Home', icon: Home, path: '/dashboard', },
    { name: 'Knowledge Base', icon: Database, path: '/knowledge-base' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'System Settings', icon: Settings, path: '/settings' },
    { name: 'Help Desk', icon: HelpCircle, path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col neural-glass-premium backdrop-blur-premium">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/101a3a9b-610a-41f7-b143-4f57fcf9ed32.png" 
                alt="MemDuo" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                MemDuo
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full neural-glass flex items-center justify-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.first_name || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start neural-glass-hover transition-all duration-200",
                  isActive(item.path) 
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-2 border-blue-400 text-blue-400" 
                    : "text-gray-300 hover:text-white"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 neural-glass-hover"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        {/* Top Bar */}
        <header className="neural-glass border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="neural-glass-hover"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="text-sm text-gray-400">
              Welcome back, {user?.user_metadata?.first_name || 'User'}!
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
