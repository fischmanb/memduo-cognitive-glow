
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import NeuralBackground from "../components/NeuralBackground";
import { useAuth } from "../contexts/AuthContext";

const PasswordEntry = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const { login } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    
    if (!success) {
      setError('Invalid access code. Please verify and try again.');
      setPassword('');
    }
    
    setIsSubmitting(false);
  };

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
                    className="h-20 w-auto mb-3"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                    }}
                  />
                  <div className="mt-3">
                    <p className="text-xs leading-relaxed text-gray-400">
                      The world's first{" "}
                      <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent font-medium">
                        co-evolving intelligence scaffold
                      </span>
                      .
                    </p>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    Private Access
                  </span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Enter your access code to continue to the MemDuo demonstration interface.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Enter your access code"
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
                      Verifying Access...
                    </span>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                        Enter Demo
                      </span>
                      <Lock className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-6">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Access codes are provided exclusively for demonstration purposes.
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
