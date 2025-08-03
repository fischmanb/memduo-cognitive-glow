import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordEntry from '../pages/PasswordEntry';
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, X } from "lucide-react";

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [shiftPressed, setShiftPressed] = useState(false);
  const [typedSequence, setTypedSequence] = useState('');
  const [showDirectSignup, setShowDirectSignup] = useState(false);

  const DIRECT_SIGNUP_SEQUENCE = 'GO';

  useEffect(() => {
    console.log('🚀 HomePage: Setting up event listeners...');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('🎯 Key pressed:', e.key, 'Shift pressed:', shiftPressed, 'Current sequence:', typedSequence);
      
      if (e.key === 'Shift') {
        setShiftPressed(true);
      } else if (e.key === 'Escape' && showDirectSignup) {
        setShowDirectSignup(false);
      } else if (shiftPressed) {
        if (e.key === 'Enter') {
          console.log('🔍 Checking sequence - typed:', typedSequence.toUpperCase(), 'target:', DIRECT_SIGNUP_SEQUENCE);
          if (typedSequence.toUpperCase() === DIRECT_SIGNUP_SEQUENCE) {
            console.log('✅ Direct signup sequence matched!');
            setShowDirectSignup(true);
            setTypedSequence('');
          }
        } else if (e.key.length === 1) {
          const newSequence = typedSequence + e.key.toUpperCase();
          console.log('📝 Adding character, new sequence:', newSequence);
          setTypedSequence(prev => prev + e.key.toUpperCase());
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
        setTypedSequence(''); // Clear sequence when shift is released
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log('✅ HomePage: Event listeners added successfully');
    
    return () => {
      console.log('🧹 HomePage: Cleaning up event listeners...');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shiftPressed, typedSequence, showDirectSignup]);

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
    return (
      <>
        <PasswordEntry />
        
        {/* Secret Direct Signup Modal - Triggered by SHIFT + "GO" + ENTER */}
        {showDirectSignup && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="neural-glass-premium max-w-md w-full relative">
              <Button
                onClick={() => setShowDirectSignup(false)}
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white/5 backdrop-blur-md border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200 rounded-lg px-3 py-2"
              >
                <X size={16} />
              </Button>
              
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <Users className="text-emerald-400" size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  Direct Account Creation
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Bypass the waitlist and create your MemDuo account immediately. This option is available for authorized users and beta testers.
                </p>
                
                <Button
                  onClick={() => {
                    // Set secret access token before navigation
                    sessionStorage.setItem('memduoSecretAccess', 'granted');
                    setShowDirectSignup(false);
                    window.location.href = '/signup';
                  }}
                  className="w-full neural-glass-premium neural-glass-hover text-white font-bold py-4 text-lg group relative overflow-hidden mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-cyan-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    Create Account Now
                  </span>
                  <ChevronDown className="ml-2 w-5 h-5 rotate-[-90deg]" />
                </Button>
                
                <p className="text-xs text-gray-500">
                  Secret access detected • No approval required
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default HomePage;