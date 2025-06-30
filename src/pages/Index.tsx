
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Eye, User, Mail, MessageSquare, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(true);
  const [isSafari, setIsSafari] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect Safari
    const userAgent = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent) || 
                          /iPad|iPhone|iPod/.test(userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  console.log('Index component rendered - bleeding-edge glassmorphic design');

  const getFormProgress = () => {
    const fields = [firstName, lastName, email];
    const completedFields = fields.filter(field => field.trim().length > 0).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide your first name, last name, and email address.",
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
          interest: interest.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Email already registered",
            description: "This email is already on the waitlist. We'll be in touch!",
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
            interest: interest.trim() || null
          }
        }).catch(emailError => {
          console.error('Failed to send notification email:', emailError);
        });

        toast({
          title: "Welcome to the queue!",
          description: "We'll contact you when demo opportunities become available.",
        });
        
        setFirstName('');
        setLastName('');
        setEmail('');
        setInterest('');
      }
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fourthViewStart = viewportHeight * 3;
      const fourthViewEnd = viewportHeight * 4;
      
      setHasScrolled(scrollY > 50);
      
      if (scrollY >= fourthViewStart - 100 && scrollY < fourthViewEnd) {
        setShowFloatingCTA(false);
      } else {
        setShowFloatingCTA(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = (sectionNumber: number) => {
    const targetY = window.innerHeight * sectionNumber;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden">
      <BackgroundVideo />
      
      {/* Enhanced Bleeding-Edge Floating CTA */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-1000 ease-out transform ${
        showFloatingCTA 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-12 scale-90 pointer-events-none'
      }`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-700 animate-pulse"></div>
          <Button
            onClick={() => scrollToNext(3)}
            className="relative backdrop-blur-[32px] bg-gradient-to-r from-white/20 to-white/5 text-white hover:from-white/30 hover:to-white/10 font-bold px-8 py-4 text-sm transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(139,92,246,0.5)] rounded-3xl min-h-[56px] touch-manipulation backdrop-saturate-200 hover:scale-110 active:scale-95"
          >
            <span className="relative z-10 whitespace-nowrap bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Request Access
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </Button>
        </div>
      </div>
      
      {/* Revolutionary Logo Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            {/* Prismatic Aura */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-full scale-150 blur-[60px] opacity-50 group-hover:opacity-80 transition-all duration-1500 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-600/20 rounded-full scale-125 blur-[40px] opacity-60 group-hover:opacity-90 transition-all duration-1000"></div>
            
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-64 sm:h-80 md:h-96 lg:h-[36rem] xl:h-[44rem] w-auto mx-auto animate-fade-in transition-all duration-1000 group-hover:scale-110 relative z-10 drop-shadow-[0_0_80px_rgba(139,92,246,0.6)]"
              style={{
                filter: 'drop-shadow(0 12px 48px rgba(74, 144, 226, 0.4)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.3)) drop-shadow(0 0 80px rgba(59, 130, 246, 0.2))',
              }}
            />
          </div>
        </div>
        
        {/* Futuristic Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
            <button 
              className="relative cursor-pointer touch-manipulation p-6 hover:scale-125 transition-all duration-700 min-h-[64px] min-w-[64px] flex items-center justify-center backdrop-blur-[32px] bg-white/10 rounded-full shadow-[0_12px_48px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.3)] hover:bg-white/20 backdrop-saturate-200" 
              onClick={() => scrollToNext(1)}
            >
              <ChevronDown 
                size={28} 
                className="text-white transition-all duration-700 group-hover:text-cyan-300 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Ultra-Modern Heading Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          <div className="relative group">
            {/* Multi-layered Glass Morphism */}
            <div className="absolute inset-0 backdrop-blur-[48px] bg-gradient-to-br from-white/15 via-white/5 to-white/10 rounded-[3rem] shadow-[0_25px_100px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-saturate-200"></div>
            <div className="absolute inset-2 backdrop-blur-[24px] bg-gradient-to-tl from-white/8 via-transparent to-white/12 rounded-[2.5rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"></div>
            
            {/* Prismatic Edge Lighting */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>
            
            <div className="relative p-12 sm:p-16 md:p-20">
              <div className="space-y-8 sm:space-y-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black space-y-4 sm:space-y-6 md:space-y-8" style={{
                  lineHeight: '0.9',
                  letterSpacing: '-0.02em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>
                  <div className="bg-gradient-to-r from-white via-cyan-100 via-purple-100 to-white bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-1000 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                    Meet Your Cognitive
                  </div>
                  <div className="bg-gradient-to-r from-cyan-200 via-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-1000 delay-100 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    Growth Partner
                  </div>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-100 font-light max-w-5xl mx-auto leading-relaxed transform hover:scale-105 transition-all duration-700 px-4 drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  A secure, general‑purpose companion that learns with you and maintains 
                  <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent font-medium"> epistemic fidelity</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
            <button 
              className="relative cursor-pointer touch-manipulation p-6 hover:scale-125 transition-all duration-700 min-h-[64px] min-w-[64px] flex items-center justify-center backdrop-blur-[32px] bg-white/10 rounded-full shadow-[0_12px_48px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.3)] hover:bg-white/20 backdrop-saturate-200" 
              onClick={() => scrollToNext(2)}
            >
              <ChevronDown 
                size={28} 
                className="text-white transition-all duration-700 group-hover:text-cyan-300 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Cutting-Edge Features Section */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-16">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Feature Card 1 - Enhanced Glassmorphism */}
            <div className="group relative backdrop-blur-[40px] bg-gradient-to-br from-white/15 via-white/5 to-white/12 rounded-3xl p-10 text-center transition-all duration-1000 hover:from-white/25 hover:via-white/10 hover:to-white/20 hover:shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(139,92,246,0.4)] hover:-translate-y-4 animate-fade-in touch-manipulation backdrop-saturate-200">
              {/* Prismatic Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-10 rounded-3xl flex items-center justify-center group-hover:scale-125 transition-all duration-700 shadow-[0_15px_60px_rgba(74,144,226,0.6)] group-hover:shadow-[0_20px_80px_rgba(74,144,226,0.8)] relative overflow-hidden backdrop-blur-[24px]" style={{
                  background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(59, 130, 246, 0.4) 100%)',
                }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Shield size={40} className="text-white relative z-10 transition-all duration-700 group-hover:rotate-12 drop-shadow-[0_0_20px_rgba(74,144,226,0.8)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-tight min-h-[5rem] flex items-center justify-center px-2 transition-all duration-500 group-hover:text-cyan-200">
                  <span className="block text-center bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    Design Your Own<br />
                    Intelligence
                  </span>
                </h3>
                <p className="text-gray-200 leading-relaxed transition-all duration-500 group-hover:text-gray-100 text-lg md:text-xl drop-shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  Private customizable cognition seeded with timeless humanist thought.
                </p>
              </div>
            </div>

            <div className="group relative backdrop-blur-[40px] bg-gradient-to-br from-white/15 via-white/5 to-white/12 rounded-3xl p-10 text-center transition-all duration-1000 hover:from-white/25 hover:via-white/10 hover:to-white/20 hover:shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(139,92,246,0.4)] hover:-translate-y-4 animate-fade-in touch-manipulation backdrop-saturate-200" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-500/30 to-cyan-400/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-10 rounded-3xl flex items-center justify-center group-hover:scale-125 transition-all duration-700 shadow-[0_15px_60px_rgba(74,144,226,0.6)] group-hover:shadow-[0_20px_80px_rgba(74,144,226,0.8)] relative overflow-hidden backdrop-blur-[24px]" style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(74, 144, 226, 0.4) 100%)',
                }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Brain size={40} className="text-white relative z-10 transition-all duration-700 group-hover:rotate-12 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-tight min-h-[5rem] flex items-center justify-center px-2 transition-all duration-500 group-hover:text-pink-200">
                  <span className="block text-center bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                    Dynamic Contradiction<br />
                    Handling
                  </span>
                </h3>
                <p className="text-gray-200 leading-relaxed transition-all duration-500 group-hover:text-gray-100 text-lg md:text-xl drop-shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  Proactively surfaces critical drift to protect you, your goals and principles.
                </p>
              </div>
            </div>

            <div className="group relative backdrop-blur-[40px] bg-gradient-to-br from-white/15 via-white/5 to-white/12 rounded-3xl p-10 text-center transition-all duration-1000 hover:from-white/25 hover:via-white/10 hover:to-white/20 hover:shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(139,92,246,0.4)] hover:-translate-y-4 animate-fade-in touch-manipulation backdrop-saturate-200" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-cyan-500/30 to-purple-400/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-10 rounded-3xl flex items-center justify-center group-hover:scale-125 transition-all duration-700 shadow-[0_15px_60px_rgba(74,144,226,0.6)] group-hover:shadow-[0_20px_80px_rgba(74,144,226,0.8)] relative overflow-hidden backdrop-blur-[24px]" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(16, 185, 129, 0.4) 50%, rgba(139, 92, 246, 0.4) 100%)',
                }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Eye size={40} className="text-white relative z-10 transition-all duration-700 group-hover:rotate-12 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-tight min-h-[5rem] flex items-center justify-center px-2 transition-all duration-500 group-hover:text-cyan-200">
                  <span className="block text-center bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    Transparent Stateful<br />
                    Reasoning
                  </span>
                </h3>
                <p className="text-gray-200 leading-relaxed transition-all duration-500 group-hover:text-gray-100 text-lg md:text-xl drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  Persistent, contextual memory enables fully auditable decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revolutionary Summary Card */}
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-1000"></div>
            <div className="relative backdrop-blur-[48px] bg-gradient-to-br from-white/20 via-white/5 to-white/15 rounded-[3rem] p-12 sm:p-16 animate-fade-in transform hover:scale-105 transition-all duration-1000 hover:shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_80px_rgba(139,92,246,0.4)] backdrop-saturate-200">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed group-hover:text-white transition-colors duration-700 bg-gradient-to-r from-gray-100 via-cyan-100 via-purple-100 to-gray-100 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
            <button 
              className="relative cursor-pointer touch-manipulation p-6 hover:scale-125 transition-all duration-700 min-h-[64px] min-w-[64px] flex items-center justify-center backdrop-blur-[32px] bg-white/10 rounded-full shadow-[0_12px_48px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.3)] hover:bg-white/20 backdrop-saturate-200" 
              onClick={() => scrollToNext(3)}
            >
              <ChevronDown 
                size={28} 
                className="text-white transition-all duration-700 group-hover:text-cyan-300 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Ultra-Premium Form Section */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 py-12 min-h-screen">
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative group">
            {/* Multi-layered Glass Container */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-1000"></div>
            
            <Card className="relative backdrop-blur-[48px] bg-gradient-to-br from-white/20 via-white/5 to-white/15 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_80px_rgba(139,92,246,0.4)] rounded-[3rem] backdrop-saturate-200">
              
              <CardContent className="p-8 sm:p-12 relative">
                {/* Futuristic Logo Container */}
                <div className="text-center mb-8">
                  <div className="relative group inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-700"></div>
                    <div className="relative p-6 rounded-3xl backdrop-blur-[32px] bg-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.3)] hover:bg-white/25 transition-all duration-700 backdrop-saturate-200">
                      <img 
                        src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                        alt="MemDuo" 
                        className="h-16 sm:h-20 w-auto transition-transform duration-700 hover:scale-110 drop-shadow-[0_0_40px_rgba(139,92,246,0.6)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6 leading-relaxed px-2 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    Private demo opportunities for select researchers, media, and investors.
                  </h2>
                </div>

                {/* Holographic Progress Bar */}
                <div className="text-center mb-8">
                  <div className="mt-4 mb-8">
                    <div className="flex items-center justify-between text-sm text-gray-200 mb-4">
                      <span className="font-medium">Complete your application</span>
                      <span className={`transition-all duration-500 font-bold text-lg ${getFormProgress() === 100 ? 'text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'text-cyan-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]'}`}>
                        {getFormProgress()}% complete
                      </span>
                    </div>
                    <div className="relative w-full backdrop-blur-[16px] bg-white/10 rounded-full h-4 overflow-hidden backdrop-saturate-200">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.8)]"
                        style={{ width: `${getFormProgress()}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/50 via-purple-300/50 to-pink-300/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="firstName" className="flex items-center gap-3 text-sm font-bold text-gray-200 mb-4 transition-all duration-500 group-focus-within:text-cyan-300 group-focus-within:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                          <User size={18} className="text-cyan-400 transition-all duration-500 group-focus-within:scale-125 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                          First Name *
                        </label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="backdrop-blur-[24px] bg-white/10 border-2 border-white/20 text-white placeholder-gray-300/70 focus:border-cyan-400/80 focus:bg-white/20 focus:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-700 pl-4 pr-14 py-5 rounded-2xl text-base hover:border-white/40 hover:bg-white/15 min-h-[60px] touch-manipulation backdrop-saturate-200 font-medium"
                            placeholder="Enter your first name"
                            required
                          />
                          {firstName && (
                            <CheckCircle size={24} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                          )}
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="lastName" className="flex items-center gap-3 text-sm font-bold text-gray-200 mb-4 transition-all duration-500 group-focus-within:text-cyan-300 group-focus-within:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                          <User size={18} className="text-cyan-400 transition-all duration-500 group-focus-within:scale-125 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                          Last Name *
                        </label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="backdrop-blur-[24px] bg-white/10 border-2 border-white/20 text-white placeholder-gray-300/70 focus:border-cyan-400/80 focus:bg-white/20 focus:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-700 pl-4 pr-14 py-5 rounded-2xl text-base hover:border-white/40 hover:bg-white/15 min-h-[60px] touch-manipulation backdrop-saturate-200 font-medium"
                            placeholder="Enter your last name"
                            required
                          />
                          {lastName && (
                            <CheckCircle size={24} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="email" className="flex items-center gap-3 text-sm font-bold text-gray-200 mb-4 transition-all duration-500 group-focus-within:text-cyan-300 group-focus-within:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      <Mail size={18} className="text-cyan-400 transition-all duration-500 group-focus-within:scale-125 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                      Email Address *
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="backdrop-blur-[24px] bg-white/10 border-2 border-white/20 text-white placeholder-gray-300/70 focus:border-cyan-400/80 focus:bg-white/20 focus:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-700 pl-4 pr-14 py-5 rounded-2xl text-base hover:border-white/40 hover:bg-white/15 min-h-[60px] touch-manipulation backdrop-saturate-200 font-medium"
                        placeholder="your@email.com"
                        required
                      />
                      {email && (
                        <CheckCircle size={24} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                      )}
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="interest" className="flex items-center gap-3 text-sm font-bold text-gray-200 mb-4 transition-all duration-500 group-focus-within:text-cyan-300 group-focus-within:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      <MessageSquare size={18} className="text-cyan-400 transition-all duration-500 group-focus-within:scale-125 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                      Tell us about your interest
                      <span className="text-gray-300/60 text-sm font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Textarea
                        id="interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="backdrop-blur-[24px] bg-white/10 border-2 border-white/20 text-white placeholder-gray-300/70 focus:border-cyan-400/80 focus:bg-white/20 focus:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-700 min-h-[120px] p-5 rounded-2xl text-base resize-none hover:border-white/40 hover:bg-white/15 touch-manipulation backdrop-saturate-200 font-medium"
                        placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                        maxLength={150}
                      />
                      <div className="absolute bottom-4 right-5 text-xs font-bold backdrop-blur-[16px] bg-white/15 px-4 py-2 rounded-full transition-all duration-500 backdrop-saturate-200">
                        <span className={`${interest.length > 140 ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-gray-300'} transition-all duration-300`}>{interest.length}/150</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Revolutionary Submit Button */}
                  <div className="pt-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-all duration-700"></div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full backdrop-blur-[32px] bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 disabled:from-white/5 disabled:to-white/5 text-white font-black py-6 text-lg transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(139,92,246,0.6)] rounded-3xl min-h-[72px] touch-manipulation backdrop-saturate-200 hover:scale-105 active:scale-95"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-4">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                              <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                                Joining Queue...
                              </span>
                            </>
                          ) : (
                            <span className="bg-gradient-to-r from-white via-cyan-100 via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                              Request Early Access
                            </span>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-gray-300/80 text-base px-4 leading-relaxed font-light">
                      We use your email only to share demo access and updates.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Futuristic Footer */}
      <footer className="relative z-10 py-12 px-4 text-center backdrop-blur-[32px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-saturate-200">
        <p className="text-gray-400 text-base font-light">
          © 2025 MemDuo.com
        </p>
      </footer>
    </div>
  );
};

export default Index;
