import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Index from '../pages/Index';

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      window.location.href = '/dashboard';
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

  // If not authenticated, show the waitlist/demo page
  if (!isAuthenticated) {
    return <Index />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default HomePage;