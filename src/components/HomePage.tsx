import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordEntry from '../pages/PasswordEntry';

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to dashboard (but not if they're trying to access admin)
    if (isAuthenticated && !isLoading) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/admin')) {
        window.location.href = '/dashboard';
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show the access gate (password entry)
  if (!isAuthenticated) {
    return <PasswordEntry />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default HomePage;