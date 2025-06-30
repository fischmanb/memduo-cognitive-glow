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
      
      {/* Clean Glassmorphic Floating CTA */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-700 ease-out transform ${
        showFloatingCTA 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
      }`}>
        <Button
          onClick={() => scrollToNext(3)}
          className="backdrop-blur-[20px] bg-white/12 text-white hover:bg-white/20 font-medium px-6 py-3 text-sm transition-all duration-500 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] rounded-2xl min-h-[48px] touch-manipulation backdrop-saturate-150"
        >
          <span className="relative z-10 whitespace-nowrap">Request Access</span>
        </Button>
      </div>
      
      {/* View 1 - Clean Logo Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 backdrop-blur-[24px] bg-white/5 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem] w-auto mx-auto animate-fade-in transition-all duration-700 group-hover:scale-105 relative z-10"
              style={{
                filter: 'drop-shadow(0 8px 32px rgba(74, 144, 226, 0.2)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6))',
              }}
            />
          </div>
        </div>
        
        {/* Clean Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-4 hover:scale-110 transition-all duration-500 min-h-[48px] min-w-[48px] flex items-center justify-center backdrop-blur-[16px] bg-white/8 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/12 backdrop-saturate-150" 
            onClick={() => scrollToNext(1)}
          >
            <ChevronDown 
              size={24} 
              className="text-white/80 hover:text-white transition-colors duration-500 opacity-80 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 2 - Clean Heading Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-5xl mx-auto animate-fade-in">
          <div className="backdrop-blur-[24px] bg-white/8 rounded-3xl p-8 sm:p-12 md:p-16 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-saturate-150">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold space-y-3 sm:space-y-4 md:space-y-6" style={{
                lineHeight: '1.1',
                paddingTop: '0.1em',
                paddingBottom: '0.1em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }}>
                <div className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-700">
                  Meet Your Cognitive
                </div>
                <div className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-700 delay-100">
                  Growth Partner
                </div>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200/90 font-light max-w-4xl mx-auto leading-relaxed transform hover:scale-105 transition-all duration-500 px-2">
                A secure, general‑purpose companion that learns with you and maintains epistemic fidelity.
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-4 hover:scale-110 transition-all duration-500 min-h-[48px] min-w-[48px] flex items-center justify-center backdrop-blur-[16px] bg-white/8 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/12 backdrop-saturate-150" 
            onClick={() => scrollToNext(2)}
          >
            <ChevronDown 
              size={24} 
              className="text-white/80 hover:text-white transition-colors duration-500 opacity-80 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 3 - Clean Features Section */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-12">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            <div className="group backdrop-blur-[20px] bg-white/8 rounded-2xl p-8 text-center transition-all duration-700 hover:bg-white/12 hover:shadow-[0_20px_64px_rgba(0,0,0,0.5)] hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation backdrop-saturate-150" style={{ animation: 'fade-in-up 0.8s ease-out 0s forwards' }}>
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_12px_32px_rgba(74,144,226,0.4)] group-hover:shadow-[0_16px_48px_rgba(74,144,226,0.5)] relative overflow-hidden backdrop-blur-[16px]" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.25) 0%, rgba(46, 91, 186, 0.25) 100%)',
              }}>
                <Shield size={32} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-white leading-tight min-h-[4rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Design Your Own<br />
                  Intelligence
                </span>
              </h3>
              <p className="text-gray-200/80 leading-relaxed transition-colors duration-300 group-hover:text-gray-100 text-base md:text-lg">
                Private customizable cognition seeded with timeless humanist thought.
              </p>
            </div>

            <div className="group backdrop-blur-[20px] bg-white/8 rounded-2xl p-8 text-center transition-all duration-700 hover:bg-white/12 hover:shadow-[0_20px_64px_rgba(0,0,0,0.5)] hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation backdrop-saturate-150" style={{ animation: 'fade-in-up 0.8s ease-out 0.2s forwards' }}>
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_12px_32px_rgba(74,144,226,0.4)] group-hover:shadow-[0_16px_48px_rgba(74,144,226,0.5)] relative overflow-hidden backdrop-blur-[16px]" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.25) 0%, rgba(46, 91, 186, 0.25) 100%)',
              }}>
                <Brain size={32} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-white leading-tight min-h-[4rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Dynamic Contradiction<br />
                  Handling
                </span>
              </h3>
              <p className="text-gray-200/80 leading-relaxed transition-colors duration-300 group-hover:text-gray-100 text-base md:text-lg">
                Proactively surfaces critical drift to protect you, your goals and principles.
              </p>
            </div>

            <div className="group backdrop-blur-[20px] bg-white/8 rounded-2xl p-8 text-center transition-all duration-700 hover:bg-white/12 hover:shadow-[0_20px_64px_rgba(0,0,0,0.5)] hover:-translate-y-2 animate-fade-in opacity-0 transform translate-y-8 touch-manipulation backdrop-saturate-150" style={{ animation: 'fade-in-up 0.8s ease-out 0.4s forwards' }}>
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_12px_32px_rgba(74,144,226,0.4)] group-hover:shadow-[0_16px_48px_rgba(74,144,226,0.5)] relative overflow-hidden backdrop-blur-[16px]" style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.25) 0%, rgba(46, 91, 186, 0.25) 100%)',
              }}>
                <Eye size={32} className="text-[#4A90E2] relative z-10 transition-all duration-500 group-hover:rotate-12" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-white leading-tight min-h-[4rem] flex items-center justify-center px-2 transition-colors duration-300 group-hover:text-[#4A90E2]">
                <span className="block text-center">
                  Transparent Stateful<br />
                  Reasoning
                </span>
              </h3>
              <p className="text-gray-200/80 leading-relaxed transition-colors duration-300 group-hover:text-gray-100 text-base md:text-lg">
                Persistent, contextual memory enables fully auditable decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Clean Summary Card */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-[24px] bg-white/12 rounded-3xl p-8 sm:p-12 animate-fade-in transform hover:scale-105 transition-all duration-700 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)] group backdrop-saturate-150">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-gray-100 leading-relaxed group-hover:text-white transition-colors duration-500">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom">
          <button 
            className="cursor-pointer touch-manipulation p-4 hover:scale-110 transition-all duration-500 min-h-[48px] min-w-[48px] flex items-center justify-center backdrop-blur-[16px] bg-white/8 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/12 backdrop-saturate-150" 
            onClick={() => scrollToNext(3)}
          >
            <ChevronDown 
              size={24} 
              className="text-white/80 hover:text-white transition-colors duration-500 opacity-80 hover:opacity-100"
            />
          </button>
        </div>
      </section>

      {/* View 4 - Form Section with Functional Borders */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 py-8 min-h-screen">
        <div className="max-w-lg mx-auto w-full">
          <Card className="backdrop-blur-[24px] bg-white/10 relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)] rounded-3xl backdrop-saturate-150">
            
            <CardContent className="p-6 sm:p-8 relative">
              {/* Clean Logo Container */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-2xl backdrop-blur-[20px] bg-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:bg-white/16 transition-all duration-500 backdrop-saturate-150">
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

              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-medium mb-4 text-gray-100 leading-relaxed px-2">
                  Private demo opportunities for select researchers, media, and investors.
                </h2>
              </div>

              {/* Clean Progress Bar */}
              <div className="text-center mb-6">
                <div className="mt-2 mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-200/80 mb-3">
                    <span>Complete your application</span>
                    <span className={`transition-colors duration-300 font-medium ${getFormProgress() === 100 ? 'text-emerald-400' : 'text-[#4A90E2]'}`}>
                      {getFormProgress()}% complete
                    </span>
                  </div>
                  <div className="w-full backdrop-blur-[12px] bg-white/10 rounded-full h-3 overflow-hidden backdrop-saturate-150">
                    <div 
                      className="bg-gradient-to-r from-[#4A90E2] via-[#5BA3F5] to-[#2E5BBA] h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-[0_0_20px_rgba(74,144,226,0.5)]"
                      style={{ width: `${getFormProgress()}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                        <User size={16} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                        First Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="backdrop-blur-[16px] bg-white/10 border border-white/30 text-white placeholder-gray-300/70 focus:border-[#4A90E2]/80 focus:bg-white/15 focus:shadow-[0_0_32px_rgba(74,144,226,0.3)] transition-all duration-500 pl-4 pr-12 py-4 rounded-xl text-sm hover:border-white/40 hover:bg-white/12 min-h-[52px] touch-manipulation backdrop-saturate-150"
                          placeholder="Enter your first name"
                          required
                        />
                        {firstName && (
                          <CheckCircle size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                        )}
                      </div>
                    </div>
                    <div className="group">
                      <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                        <User size={16} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                        Last Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="backdrop-blur-[16px] bg-white/10 border border-white/30 text-white placeholder-gray-300/70 focus:border-[#4A90E2]/80 focus:bg-white/15 focus:shadow-[0_0_32px_rgba(74,144,226,0.3)] transition-all duration-500 pl-4 pr-12 py-4 rounded-xl text-sm hover:border-white/40 hover:bg-white/12 min-h-[52px] touch-manipulation backdrop-saturate-150"
                          placeholder="Enter your last name"
                          required
                        />
                        {lastName && (
                          <CheckCircle size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                    <Mail size={16} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="backdrop-blur-[16px] bg-white/10 border border-white/30 text-white placeholder-gray-300/70 focus:border-[#4A90E2]/80 focus:bg-white/15 focus:shadow-[0_0_32px_rgba(74,144,226,0.3)] transition-all duration-500 pl-4 pr-12 py-4 rounded-xl text-sm hover:border-white/40 hover:bg-white/12 min-h-[52px] touch-manipulation backdrop-saturate-150"
                      placeholder="your@email.com"
                      required
                    />
                    {email && (
                      <CheckCircle size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 animate-fade-in" />
                    )}
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="interest" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3 transition-colors duration-300 group-focus-within:text-[#4A90E2]">
                    <MessageSquare size={16} className="text-[#4A90E2] transition-transform duration-300 group-focus-within:scale-110" />
                    Tell us about your interest
                    <span className="text-gray-300/60 text-sm">(optional)</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="backdrop-blur-[16px] bg-white/10 border border-white/30 text-white placeholder-gray-300/70 focus:border-[#4A90E2]/80 focus:bg-white/15 focus:shadow-[0_0_32px_rgba(74,144,226,0.3)] transition-all duration-500 min-h-[100px] p-4 rounded-xl text-sm resize-none hover:border-white/40 hover:bg-white/12 touch-manipulation backdrop-saturate-150"
                      placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                      maxLength={150}
                    />
                    <div className="absolute bottom-3 right-4 text-xs text-gray-300/60 backdrop-blur-[12px] bg-white/10 px-3 py-1 rounded-full transition-colors duration-300">
                      <span className={interest.length > 140 ? 'text-amber-400' : ''}>{interest.length}/150</span>
                    </div>
                  </div>
                </div>
                
                {/* Clean Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full backdrop-blur-[20px] bg-white/15 hover:bg-white/25 disabled:bg-white/8 text-white font-semibold py-4 text-base transition-all duration-500 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] rounded-2xl min-h-[56px] touch-manipulation group backdrop-saturate-150"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
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

                <div className="text-center pt-3">
                  <p className="text-gray-300/70 text-sm px-2 leading-relaxed">
                    We use your email only to share demo access and updates.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="relative z-10 py-8 px-4 text-center backdrop-blur-[20px] bg-white/8 backdrop-saturate-150">
        <p className="text-gray-400/80 text-sm">
          © 2025 MemDuo.com
        </p>
      </footer>
    </div>
  );
};

export default Index;
