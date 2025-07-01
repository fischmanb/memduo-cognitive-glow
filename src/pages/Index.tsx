
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Shield, Eye, User, Mail, MessageSquare, CheckCircle, ChevronDown, Loader2, Sparkles, Network, GitBranch, Zap, Users, Building, GraduationCap, Newspaper, TrendingUp, LogOut } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";
import NeuralBackground from "../components/NeuralBackground";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [useCase, setUseCase] = useState('');
  const [timeline, setTimeline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      const viewportHeight = window.innerHeight;
      const formSectionStart = viewportHeight * 3;
      const formSectionEnd = viewportHeight * 4;
      
      if (currentScrollY >= formSectionStart - 100 && currentScrollY < formSectionEnd) {
        setShowFloatingCTA(false);
      } else {
        setShowFloatingCTA(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getFormProgress = () => {
    const totalFields = 8;
    const completedFields = [firstName, lastName, email, role, organization, researchArea, useCase, timeline]
      .filter(field => field.trim().length > 0).length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = [firstName, lastName, email, role];
    const missingFields = requiredFields.some(field => !field.trim());
    
    if (missingFields) {
      toast({
        title: "Required fields missing",
        description: "Please complete all required fields to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('waitlist_submissions')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          interest: JSON.stringify({
            role: role.trim(),
            organization: organization.trim(),
            researchArea: researchArea.trim(),
            useCase: useCase.trim(),
            timeline: timeline.trim()
          })
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already registered",
            description: "Your application is already in our system. We'll be in touch soon.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        supabase.functions.invoke('notify-waitlist-submission', {
          body: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            role: role.trim(),
            organization: organization.trim(),
            researchArea: researchArea.trim(),
            useCase: useCase.trim(),
            timeline: timeline.trim()
          }
        }).catch(emailError => {
          console.error('Failed to send notification email:', emailError);
        });

        toast({
          title: "Application received",
          description: "Thank you for your interest. We'll review your application and be in touch within 48 hours.",
        });
        
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setRole('');
        setOrganization('');
        setResearchArea('');
        setUseCase('');
        setTimeline('');
        setStep(1);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error processing your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToNext = (sectionNumber: number) => {
    const targetY = window.innerHeight * sectionNumber;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-x-hidden">
      <BackgroundVideo />
      <NeuralBackground mousePosition={mousePosition} scrollY={scrollY} />
      
      {/* Dynamic Mouse Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 197, 253, 0.06), transparent 40%)`
        }}
      />
      
      {/* Logout Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="neural-glass text-white border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-sm"
        >
          <LogOut size={16} className="mr-2" />
          Exit
        </Button>
      </div>
      
      {/* Premium Floating CTA */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-700 ${
        showFloatingCTA 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-12 pointer-events-none'
      }`}>
        <Button
          onClick={() => scrollToNext(3)}
          className="neural-glass-premium text-white font-bold px-8 py-4 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Request Demo Access
          </span>
          <Sparkles className="ml-2 w-4 h-4" />
        </Button>
      </div>
      
      {/* Hero Section - Enhanced */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-emerald-400/30 rounded-full scale-150 blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-1000 animate-pulse-slow"></div>
            
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-64 sm:h-80 md:h-96 lg:h-[36rem] xl:h-[44rem] w-auto mx-auto animate-fade-in transition-all duration-1000 group-hover:scale-105 relative z-10"
              style={{
                filter: 'drop-shadow(0 12px 48px rgba(147, 197, 253, 0.3)) drop-shadow(0 0 80px rgba(139, 92, 246, 0.2))',
              }}
            />
            
            {/* Orbital Elements */}
            <div className="absolute top-1/4 -left-12 w-3 h-3 bg-cyan-400/60 rounded-full animate-bounce-slow" />
            <div className="absolute bottom-1/4 -right-16 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce-slow delay-300" />
            <div className="absolute top-1/2 -right-8 w-1 h-1 bg-emerald-400/60 rounded-full animate-bounce-slow delay-700" />
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="neural-glass p-4 group relative overflow-hidden" 
            onClick={() => scrollToNext(1)}
          >
            <ChevronDown size={24} className="text-white transition-transform group-hover:translate-y-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
          </button>
        </div>
      </section>

      {/* Philosophy Section - Enhanced */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-7xl mx-auto animate-fade-in">
          <div className="neural-glass-premium p-12 sm:p-16 md:p-24 relative overflow-hidden">
            {/* Neural Connection Lines */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,20 Q50,10 100,30" stroke="url(#gradient1)" strokeWidth="0.2" fill="none" opacity="0.6" />
                <path d="M0,60 Q50,80 100,50" stroke="url(#gradient2)" strokeWidth="0.2" fill="none" opacity="0.4" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="space-y-12 relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black space-y-6" style={{
                lineHeight: '0.85',
                letterSpacing: '-0.025em',
              }}>
                <div className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-none">
                  Epistemic Evolution
                </div>
                <div className="bg-gradient-to-r from-cyan-200 via-purple-200 to-emerald-200 bg-clip-text text-transparent leading-none">
                  Through Contradiction
                </div>
              </h1>
              
              <div className="max-w-5xl mx-auto space-y-8">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-100/90 font-light leading-relaxed">
                  Not an assistant. Not a search engine. An 
                  <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent font-medium"> evolving intelligence scaffold</span>
                  —built to reason, adapt, contradict, and co-develop its cognitive structure in tandem with you.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GitBranch className="text-cyan-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-cyan-200 mb-2">Fluid Processing</h3>
                    <p className="text-gray-300 text-sm">Beliefs weighted, not accepted or rejected</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Network className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">Belief Geometry</h3>
                    <p className="text-gray-300 text-sm">Soft arbitration scaling across hypotheses</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="text-emerald-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-200 mb-2">Mutual Adaptation</h3>
                    <p className="text-gray-300 text-sm">Bidirectional cognitive growth tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="neural-glass p-4 group" 
            onClick={() => scrollToNext(2)}
          >
            <ChevronDown size={24} className="text-white transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-16">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="neural-glass-premium neural-glass-hover p-10 text-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield size={40} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">
                  Contradiction Protocol
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  Every contradiction becomes epistemic gold. The system flags discrepancies, reallocates arbitration cycles, and surfaces tensions for collaborative exploration.
                </p>
                <div className="text-cyan-400 text-sm font-medium">
                  "Contradiction is the catalyst"
                </div>
              </div>
            </div>

            <div className="neural-glass-premium neural-glass-hover p-10 text-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain size={40} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">
                  Structured Reflexivity
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  The Belief Graph tracks confidence history, co-references, and source trails. Every belief exists in epistemic zones: Stable, Tenuous, Disputed, or Latent.
                </p>
                <div className="text-purple-400 text-sm font-medium">
                  "Truth is not a destination. It is a field."
                </div>
              </div>
            </div>

            <div className="neural-glass-premium neural-glass-hover p-10 text-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">
                  Computational Elasticity
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  Dynamic resource allocation based on epistemic potential. When novelty or stakes spike, the system stretches—fluidly, probabilistically, transparently.
                </p>
                <div className="text-emerald-400 text-sm font-medium">
                  "Intelligence is a function of continuous adaptation"
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="neural-glass-premium p-16 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent opacity-60" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent opacity-60" />
              <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent opacity-60" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-gray-100/95 mb-8">
                This is not intelligence-as-a-service. It is 
                <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent font-medium"> cognition as collaboration</span>.
              </p>
              <p className="text-xl text-gray-300/80 font-light">
                The operating system for mutual enhancement.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="neural-glass p-4 group" 
            onClick={() => scrollToNext(3)}
          >
            <ChevronDown size={24} className="text-white transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </section>

      {/* Premium Demo Request Form */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 py-16 min-h-screen">
        <div className="max-w-3xl mx-auto w-full">
          <div className="neural-glass-premium relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
              <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
              <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
            </div>
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="text-center mb-12">
                <div className="inline-block p-6 rounded-3xl neural-glass mb-6">
                  <img 
                    src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                    alt="MemDuo" 
                    className="h-16 sm:h-20 w-auto"
                  />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight text-white">
                  Private Demo Access
                </h2>
                <p className="text-xl text-gray-300 mb-4 leading-relaxed">
                  Exclusive opportunities for select researchers, media, and investors to experience the next-generation intelligence scaffold.
                </p>
                <p className="text-lg text-gray-400">
                  Applications reviewed within 48 hours
                </p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-between text-sm text-gray-200 mb-4">
                  <span className="font-medium">Application Progress</span>
                  <span className={`font-bold text-lg ${getFormProgress() === 100 ? 'text-emerald-300' : 'text-cyan-300'}`}>
                    {getFormProgress()}% Complete
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 h-3 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${getFormProgress()}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                          <User size={16} className="text-cyan-400" />
                          First Name *
                        </label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="neural-input py-4 rounded-xl font-medium"
                            placeholder="Enter your first name"
                            required
                          />
                          {firstName && (
                            <CheckCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                          <User size={16} className="text-cyan-400" />
                          Last Name *
                        </label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="neural-input py-4 rounded-xl font-medium"
                            placeholder="Enter your last name"
                            required
                          />
                          {lastName && (
                            <CheckCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <Mail size={16} className="text-cyan-400" />
                        Email Address *
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="neural-input py-4 rounded-xl font-medium"
                          placeholder="your@organization.com"
                          required
                        />
                        {email && (
                          <CheckCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="role" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <Building size={16} className="text-cyan-400" />
                        Professional Role *
                      </label>
                      <Select value={role} onValueChange={setRole} required>
                        <SelectTrigger className="neural-input py-4 rounded-xl font-medium">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="neural-glass border-white/20">
                          <SelectItem value="researcher">Researcher / Academic</SelectItem>
                          <SelectItem value="investor">Investor / VC</SelectItem>
                          <SelectItem value="journalist">Journalist / Media</SelectItem>
                          <SelectItem value="technologist">Technologist / Engineer</SelectItem>
                          <SelectItem value="entrepreneur">Entrepreneur / Founder</SelectItem>
                          <SelectItem value="consultant">Consultant / Advisor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full neural-glass-premium neural-glass-hover text-white font-bold py-4 text-lg group relative overflow-hidden"
                        disabled={!firstName || !lastName || !email || !role}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                          Continue Application
                        </span>
                        <ChevronDown className="ml-2 w-5 h-5 rotate-[-90deg]" />
                      </Button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label htmlFor="organization" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <Building size={16} className="text-purple-400" />
                        Organization / Institution
                      </label>
                      <Input
                        id="organization"
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="neural-input py-4 rounded-xl font-medium"
                        placeholder="Your organization name"
                      />
                    </div>

                    <div>
                      <label htmlFor="researchArea" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <GraduationCap size={16} className="text-purple-400" />
                        Research Area / Focus
                      </label>
                      <Select value={researchArea} onValueChange={setResearchArea}>
                        <SelectTrigger className="neural-input py-4 rounded-xl font-medium">
                          <SelectValue placeholder="Select your area of focus" />
                        </SelectTrigger>
                        <SelectContent className="neural-glass border-white/20">
                          <SelectItem value="ai-safety">AI Safety & Alignment</SelectItem>
                          <SelectItem value="cognitive-science">Cognitive Science</SelectItem>
                          <SelectItem value="epistemology">Epistemology & Philosophy</SelectItem>
                          <SelectItem value="machine-learning">Machine Learning Research</SelectItem>
                          <SelectItem value="neuroscience">Neuroscience</SelectItem>
                          <SelectItem value="psychology">Psychology</SelectItem>
                          <SelectItem value="investment">Investment & Markets</SelectItem>
                          <SelectItem value="technology">Technology Development</SelectItem>
                          <SelectItem value="media">Media & Journalism</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="useCase" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <MessageSquare size={16} className="text-purple-400" />
                        Intended Use Case
                      </label>
                      <Textarea
                        id="useCase"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        className="neural-input min-h-[120px] p-4 rounded-xl font-medium"
                        placeholder="How do you envision using MemDuo's cognitive partnership capabilities in your work?"
                        maxLength={300}
                      />
                      <div className="mt-2 text-xs text-gray-400 text-right">
                        {useCase.length}/300 characters
                      </div>
                    </div>

                    <div>
                      <label htmlFor="timeline" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <TrendingUp size={16} className="text-purple-400" />
                        Timeline Interest
                      </label>
                      <Select value={timeline} onValueChange={setTimeline}>
                        <SelectTrigger className="neural-input py-4 rounded-xl font-medium">
                          <SelectValue placeholder="When would you like access?" />
                        </SelectTrigger>
                        <SelectContent className="neural-glass border-white/20">
                          <SelectItem value="immediate">Immediate (Next 2 weeks)</SelectItem>
                          <SelectItem value="short-term">Short-term (1-2 months)</SelectItem>
                          <SelectItem value="medium-term">Medium-term (3-6 months)</SelectItem>
                          <SelectItem value="long-term">Long-term (6+ months)</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1 neural-glass text-white border-white/20 hover:border-white/40 py-4"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 neural-glass-premium neural-glass-hover text-white font-bold py-4 text-lg group relative overflow-hidden"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting Application...
                          </span>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                              Submit Application
                            </span>
                            <Sparkles className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}

                <div className="text-center pt-6">
                  <p className="text-gray-400 text-base leading-relaxed">
                    Your information is used exclusively for demo access coordination and product updates.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-16 px-4 text-center neural-glass-premium">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-block p-4 neural-glass rounded-2xl mb-4">
              <img 
                src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                alt="MemDuo" 
                className="h-12 w-auto"
              />
            </div>
          </div>
          <p className="text-gray-400 text-lg mb-4">
            Intelligence scaffolding for epistemic evolution
          </p>
          <p className="text-gray-500 text-base">
            © 2025 MemDuo.com — Advanced Cognitive Partnership
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
