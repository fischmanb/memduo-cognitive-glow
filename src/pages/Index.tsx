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

  console.log('Index component rendered - mobile optimized with improved touch navigation');

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
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundVideo />
      
      {/* Mobile-Optimized Floating CTA */}
      <div className={`fixed top-3 right-3 z-50 transition-all duration-500 transform ${
        showFloatingCTA 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-8 scale-90 pointer-events-none'
      }`}>
        <Button
          onClick={() => scrollToNext(3)}
          className="bg-gradient-to-r from-[#4A90E2]/20 to-[#2E5BBA]/20 backdrop-blur-md border-2 border-[#4A90E2]/40 text-white hover:from-[#4A90E2]/30 hover:to-[#2E5BBA]/30 hover:border-[#4A90E2]/60 font-medium px-3 py-2 text-xs transition-all duration-500 shadow-xl shadow-[#4A90E2]/20 hover:shadow-[#4A90E2]/30 rounded-lg hover:scale-105 active:scale-95 group min-h-[44px] touch-manipulation"
        >
          <span className="relative z-10 whitespace-nowrap">Request Access</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Button>
      </div>
      
      {/* View 1 - Mobile-Optimized Logo Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem] w-auto mx-auto animate-fade-in transition-all duration-700 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 24px rgba(74, 144, 226, 0.15)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/5 to-transparent rounded-full blur-3xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </div>
        </div>
        
        {/* Enhanced mobile chevron positioning */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-6 hover:scale-110 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center" 
            onClick={() => scrollToNext(1)}
          >
            <ChevronDown 
              size={32} 
              className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-500 opacity-70 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 2 - Mobile-Optimized Heading Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-5xl mx-auto animate-fade-in">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold space-y-3 sm:space-y-4 md:space-y-6" style={{
              lineHeight: '1.1',
              paddingTop: '0.1em',
              paddingBottom: '0.1em',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>
              <div className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-700">
                Meet Your Cognitive
              </div>
              <div className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-700 delay-100">
                Growth Partner
              </div>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed transform hover:scale-105 transition-all duration-500 px-2">
              A secure, general‑purpose companion that learns with you and maintains epistemic fidelity.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-6 hover:scale-110 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center" 
            onClick={() => scrollToNext(2)}
          >
            <ChevronDown 
              size={32} 
              className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-500 opacity-70 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 3 - Mobile-Optimized Features Section */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-12">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            <div className="group backdrop-blur-lg border-2 border-gray-700/60 rounded-xl p-6 text-center transition-all duration-700 hover:bg-white/10 hover:border-[#4A90E2]/50 hover:shadow-2xl hover:shadow-[#4A90E2]/25 hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation" style={{ animation: 'fade-in-up 0.8s ease-out 0s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 shadow-lg shadow-[#4A90E2]/20 group-hover:shadow-[#4A90E2]/40 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(46, 91, 186, 0.15) 100%)',
                border: '2px solid rgba(74, 144, 226, 0.3)'
              }}>
                <Shield size={28} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={2} />
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Design Your Own<br />
                  Intelligence
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed transition-colors duration-300 group-hover:text-gray-200 text-sm md:text-base">
                Private customizable cognition seeded with timeless humanist thought.
              </p>
            </div>

            <div className="group backdrop-blur-lg border-2 border-gray-700/60 rounded-xl p-6 text-center transition-all duration-700 hover:bg-white/10 hover:border-[#4A90E2]/50 hover:shadow-2xl hover:shadow-[#4A90E2]/25 hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 shadow-lg shadow-[#4A90E2]/20 group-hover:shadow-[#4A90E2]/40 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(46, 91, 186, 0.15) 100%)',
                border: '2px solid rgba(74, 144, 226, 0.3)'
              }}>
                <Brain size={28} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={2} />
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Dynamic Contradiction<br />
                  Handling
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed transition-colors duration-300 group-hover:text-gray-200 text-sm md:text-base">
                Proactively surfaces critical drift to protect you, your goals and principles.
              </p>
            </div>

            <div className="group backdrop-blur-lg border-2 border-gray-700/60 rounded-xl p-6 text-center transition-all duration-700 hover:bg-white/10 hover:border-[#4A90E2]/50 hover:shadow-2xl hover:shadow-[#4A90E2]/25 hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation" style={{ animation: 'fade-in-up 0.8s ease-out 0.4s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 shadow-lg shadow-[#4A90E2]/20 group-hover:shadow-[#4A90E2]/40 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(46, 91, 186, 0.15) 100%)',
                border: '2px solid rgba(74, 144, 226, 0.3)'
              }}>
                <Eye size={28} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={2} />
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Transparent Stateful<br />
                  Reasoning
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed transition-colors duration-300 group-hover:text-gray-200 text-sm md:text-base">
                Persistent, contextual memory enables fully auditable decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 animate-fade-in transform hover:scale-105 transition-all duration-700 hover:shadow-2xl hover:shadow-[#4A90E2]/10 group">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-500">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-6 hover:scale-110 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center" 
            onClick={() => scrollToNext(3)}
          >
            <ChevronDown 
              size={32} 
              className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-500 opacity-70 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 4 - Enhanced Mobile Form Section */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 py-8 min-h-screen">
        <div className="max-w-lg mx-auto w-full">
          <Card className="border-[#4A90E2]/30 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 rounded-2xl hover:border-[#4A90E2]/50">
            
            <CardContent className="p-5 sm:p-6 relative">
              <div className="text-center mb-4">
                <div className="inline-block p-3 rounded-xl backdrop-blur-md bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-[#4A90E2]/30 shadow-xl hover:border-[#4A90E2]/50 transition-all duration-500">
                  <img 
                    src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                    alt="MemDuo" 
                    className="h-12 sm:h-16 w-auto transition-transform duration-500 hover:scale-110"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(74, 144, 226, 0.4)) drop-shadow(0 2px 8px rgba(74, 144, 226, 0.2)) drop-shadow(0 0 2px rgba(74, 144, 226, 0.6))',
                    }}
                  />
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-base sm:text-lg font-medium mb-3 text-slate-200 leading-relaxed px-2">
                  Private demo opportunities for select researchers, media, and investors.
                </h2>
              </div>

              <div className="text-center mb-4">
                <div className="mt-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span>Complete your application</span>
                    <span className={`transition-colors duration-300 font-medium ${getFormProgress() === 100 ? 'text-emerald-400' : 'text-[#4A90E2]'}`}>
                      {getFormProgress()}% complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 backdrop-blur-sm overflow-hidden border border-slate-600/30">
                    <div 
                      className="bg-gradient-to-r from-[#4A90E2] via-[#5BA3F5] to-[#2E5BBA] h-2 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                      style={{ width: `${getFormProgress()}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group">
                      <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                        <User size={14} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                        First Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-slate-800/80 border-2 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4A90E2] focus:bg-slate-800/90 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-500 pl-4 pr-10 py-3 rounded-lg text-sm hover:border-slate-500/70 hover:bg-slate-800/85 min-h-[48px] touch-manipulation"
                          placeholder="Enter your first name"
                          required
                        />
                        {firstName && (
                          <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                        )}
                      </div>
                    </div>
                    <div className="group">
                      <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                        <User size={14} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                        Last Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-slate-800/80 border-2 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4A90E2] focus:bg-slate-800/90 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-500 pl-4 pr-10 py-3 rounded-lg text-sm hover:border-slate-500/70 hover:bg-slate-800/85 min-h-[48px] touch-manipulation"
                          placeholder="Enter your last name"
                          required
                        />
                        {lastName && (
                          <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                    <Mail size={14} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/80 border-2 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4A90E2] focus:bg-slate-800/90 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-500 pl-4 pr-10 py-3 rounded-lg text-sm hover:border-slate-500/70 hover:bg-slate-800/85 min-h-[48px] touch-manipulation"
                      placeholder="your@email.com"
                      required
                    />
                    {email && (
                      <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                    )}
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="interest" className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                    <MessageSquare size={14} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                    Tell us about your interest
                    <span className="text-slate-400 text-sm">(optional)</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="bg-slate-800/80 border-2 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4A90E2] focus:bg-slate-800/90 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-500 min-h-[80px] p-4 rounded-lg text-sm resize-none hover:border-slate-500/70 hover:bg-slate-800/85 touch-manipulation"
                      placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                      maxLength={150}
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-slate-400 bg-slate-900/70 backdrop-blur-sm px-2 py-1 rounded transition-colors duration-300">
                      <span className={interest.length > 140 ? 'text-amber-400' : ''}>{interest.length}/150</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#3A7BC8] via-[#365AA0] to-[#1E4B9A] hover:from-[#2E6BB5] hover:via-[#2B4E8A] hover:to-[#143A82] disabled:from-[#4A90E2]/50 disabled:to-[#2E5BBA]/50 text-white font-semibold py-4 text-base transition-all duration-500 border-0 backdrop-blur-sm shadow-2xl hover:shadow-[#4A90E2]/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 rounded-xl relative overflow-hidden group min-h-[52px] touch-manipulation"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Joining Queue...
                        </>
                      ) : (
                        'Request Early Access'
                      )}
                    </span>
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-slate-400 text-sm px-2 leading-relaxed">
                    We use your email only to share demo access and updates.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile-Optimized Footer */}
      <footer className="relative z-10 py-8 px-4 text-center border-t border-white/20 backdrop-blur-sm">
        <p className="text-gray-600 text-xs">
          © 2025 MemDuo.com
        </p>
      </footer>
    </div>
  );
};

export default Index;
