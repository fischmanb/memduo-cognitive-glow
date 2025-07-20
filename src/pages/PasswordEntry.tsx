import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, AlertCircle, Mail } from "lucide-react";
import NeuralBackground from "../components/NeuralBackground";
import { useAuth } from "../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { AdminAuthProvider, useAdminAuth } from "../contexts/AdminAuthContext";
import { apiClient } from "../lib/api";

// AdminContent component for PasswordEntry
const AdminContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="absolute top-4 right-4">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Close Admin Login
          </Button>
        </div>
        <AdminLogin />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <AdminDashboard />
    </div>
  );
};

const PasswordEntry = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [typedSequence, setTypedSequence] = useState('');
  const { setBackendAuth } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Secret admin access: Shift + "NOBLESSEOBLIGE" + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(true);
        return;
      }

      if (shiftPressed) {
        if (e.key === 'Enter') {
          if (typedSequence.toLowerCase() === 'noblesseoblige') {
            setShowAdminLogin(true);
          }
          setTypedSequence('');
        } else if (e.key.length === 1) {
          setTypedSequence(prev => prev + e.key);
        }
      }

      if (e.key === 'Escape') {
        setShowAdminLogin(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
        setTypedSequence('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shiftPressed, typedSequence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Check for the 256-character master code
      const masterCode = "xN$Z3m*Pu9!q67VMEkDyYhBp2WAfsRt#XLbgUcJzFo81^rCnQa@e4+svK!THdM%iL5wNzE_jX^9&RGUu#ybVm$PqoYCZtlMBhf7nADJrx%S*83EWKgT+p3HRdkA$_zFNjvVBwX95q!4YeTruXKJ*Q^gmLhAZ8os1MF^RW2&uUEPqNDJbGh6LVz";
      
      if (password.trim() === masterCode) {
        // Demo access with master code
        localStorage.setItem('memduo_demo_mode', 'true');
        localStorage.setItem('memduo_demo_email', email.trim() || 'demo@memduo.com');
        window.location.href = '/dashboard';
        return;
      }

      // Try backend authentication if email is provided
      if (email.trim()) {
        try {
          const response = await apiClient.login({
            email: email.trim(),
            password: password.trim()
          });
          
          if (response.access_token) {
            // Store backend token and user info
            localStorage.setItem('memduo_token', response.access_token);
            localStorage.setItem('memduo_backend_auth', 'true');
            localStorage.setItem('memduo_user_email', email.trim());
            
            if (response.user) {
              localStorage.setItem('memduo_user_data', JSON.stringify(response.user));
            }
            
            // Set backend auth state
            setBackendAuth(true, response.user || null);
            
            window.location.href = '/dashboard';
            return;
          }
        } catch (backendError) {
          console.error('Backend authentication failed:', backendError);
          // Fall through to error handling
        }
      }

      // If neither demo code nor backend auth worked
      setError('Invalid access code or credentials. Please verify and try again.');
      setPassword('');
      
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
      setPassword('');
    }
    
    setIsSubmitting(false);
  };

  if (showAdminLogin) {
    return (
      <AdminAuthProvider>
        <AdminContent onClose={() => setShowAdminLogin(false)} />
      </AdminAuthProvider>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      <NeuralBackground mousePosition={mousePosition} scrollY={scrollY} />
      
      {/* Dynamic Mouse Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 197, 253, 0.04), transparent 40%)`
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="neural-glass-premium relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
              <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
              <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
            </div>
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="text-center mb-8">
                <div className="inline-block p-6 rounded-2xl mb-6 neural-glass backdrop-filter backdrop-blur-24 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-black/50 border border-white/20 shadow-2xl">
                  <img 
                    src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                    alt="MemDuo" 
                    className="h-20 w-auto"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                    }}
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    Private Access
                  </span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Enter your access code or backend credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                    <Mail size={16} className="text-cyan-400" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neural-input py-4 rounded-xl font-medium"
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                    <Lock size={16} className="text-cyan-400" />
                    Access Code
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="neural-input py-4 pr-12 rounded-xl font-medium"
                      placeholder="Enter master code or backend password"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !password.trim()}
                  className="w-full neural-glass-premium neural-glass-hover text-white font-bold py-4 text-lg group relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                        Enter MemDuo
                      </span>
                      <Lock className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-6 space-y-3">
                <p className="text-gray-400 text-sm">
                  For all inquiries, click here:{" "}
                  <a 
                    href="mailto:info@memduo.com" 
                    className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Contact Us
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordEntry;
