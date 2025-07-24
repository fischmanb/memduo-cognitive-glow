import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordEntry from '../pages/PasswordEntry';

console.log('🏠 HomePage: Component loading...');

const HomePage = () => {
  console.log('🏠 HomePage: Component rendering...');
  
  let authData;
  try {
    authData = useAuth();
    console.log('🏠 HomePage: useAuth successful:', { isAuthenticated: authData.isAuthenticated, isLoading: authData.isLoading });
  } catch (error) {
    console.error('🏠 HomePage: useAuth failed:', error);
    throw error;
  }
  
  const { isAuthenticated, isLoading } = authData;

  useEffect(() => {
    // If authenticated, redirect to dashboard (but not if they're trying to access admin)
    if (isAuthenticated && !isLoading) {
      const currentPath = window.location.pathname;
      console.log('🏠 HomePage: User authenticated, current path:', currentPath);
      if (!currentPath.startsWith('/admin')) {
        console.log('🔄 Redirecting to dashboard...');
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