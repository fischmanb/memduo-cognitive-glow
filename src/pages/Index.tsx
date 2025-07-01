import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      
      {/* Unified Floating CTA - using glass-unified */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-700 ${
        showFloatingCTA 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-12 pointer-events-none'
      }`}>
        <Button
          onClick={() => scrollToNext(3)}
          className="glass-unified glass-unified-hover text-white font-bold px-6 py-3"
        >
          <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Request Access
          </span>
        </Button>
      </div>
      
      {/* Revolutionary Logo Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-full scale-150 blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-1000"></div>
            
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-64 sm:h-80 md:h-96 lg:h-[36rem] xl:h-[44rem] w-auto mx-auto animate-fade-in transition-all duration-1000 group-hover:scale-105 relative z-10"
              style={{
                filter: 'drop-shadow(0 8px 32px rgba(139, 92, 246, 0.4))',
              }}
            />
          </div>
        </div>
        
        {/* Unified Scroll Indicator - using glass-unified */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="glass-unified glass-unified-hover p-4" 
            onClick={() => scrollToNext(1)}
          >
            <ChevronDown size={24} className="text-white" />
          </button>
        </div>
      </section>

      {/* Ultra-Modern Heading Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          <div className="glass-unified p-12 sm:p-16 md:p-20">
            <div className="space-y-8 sm:space-y-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black space-y-4 sm:space-y-6 md:space-y-8" style={{
                lineHeight: '0.9',
                letterSpacing: '-0.02em',
              }}>
                <div className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  Meet Your Cognitive
                </div>
                <div className="bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Growth Partner
                </div>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-100 font-light max-w-5xl mx-auto leading-relaxed">
                A secure, general‑purpose companion that learns with you and maintains 
                <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent font-medium"> epistemic fidelity</span>.
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="glass-unified glass-unified-hover p-4" 
            onClick={() => scrollToNext(2)}
          >
            <ChevronDown size={24} className="text-white" />
          </button>
        </div>
      </section>

      {/* Unified Features Section - ALL cards use glass-unified */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-16">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Feature Card 1 - Unified Styling */}
            <div className="glass-unified glass-unified-hover p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Design Your Own Intelligence
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Private customizable cognition seeded with timeless humanist thought.
              </p>
            </div>

            <div className="glass-unified glass-unified-hover p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                <Brain size={32} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Dynamic Contradiction Handling
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Proactively surfaces critical drift to protect you, your goals and principles.
              </p>
            </div>

            <div className="glass-unified glass-unified-hover p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                <Eye size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Transparent Stateful Reasoning
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Persistent, contextual memory enables fully auditable decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Unified Summary Card - using glass-unified */}
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-unified p-12 sm:p-16">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-gray-100">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            className="glass-unified glass-unified-hover p-4" 
            onClick={() => scrollToNext(3)}
          >
            <ChevronDown size={24} className="text-white" />
          </button>
        </div>
      </section>

      {/* Unified Form Section - using glass-unified */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 py-12 min-h-screen">
        <div className="max-w-2xl mx-auto w-full">
          <div className="glass-unified">
            <div className="p-8 sm:p-12">
              {/* Prominent Logo */}
              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-2xl glass-unified">
                  <img 
                    src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
                    alt="MemDuo" 
                    className="h-16 sm:h-20 w-auto"
                  />
                </div>
              </div>

              {/* Highly Readable Heading */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 leading-tight text-white">
                  Private demo opportunities for select researchers, media, and investors.
                </h2>
              </div>

              {/* Progress Bar */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-between text-sm text-gray-200 mb-4">
                  <span className="font-medium">Complete your application</span>
                  <span className={`font-bold text-lg ${getFormProgress() === 100 ? 'text-emerald-300' : 'text-cyan-300'}`}>
                    {getFormProgress()}% complete
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${getFormProgress()}%` }}
                  />
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="py-4 rounded-xl font-medium"
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
                        className="py-4 rounded-xl font-medium"
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
                      className="py-4 rounded-xl font-medium"
                      placeholder="your@email.com"
                      required
                    />
                    {email && (
                      <CheckCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="interest" className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                    <MessageSquare size={16} className="text-cyan-400" />
                    Tell us about your interest
                    <span className="text-gray-400 text-sm font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="min-h-[100px] p-4 rounded-xl font-medium"
                      placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                      maxLength={150}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
                      <span className={`${interest.length > 140 ? 'text-amber-300' : 'text-gray-400'}`}>{interest.length}/150</span>
                    </div>
                  </div>
                </div>
                
                {/* Unified Submit Button - using glass-unified */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full glass-unified glass-unified-hover text-white font-bold py-4 text-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining Queue...
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                        Request Early Access
                      </span>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-400 text-base leading-relaxed">
                    We use your email only to share demo access and updates.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Footer - using glass-unified */}
      <footer className="relative z-10 py-12 px-4 text-center glass-unified">
        <p className="text-gray-400 text-base">
          © 2025 MemDuo.com
        </p>
      </footer>
    </div>
  );
};

export default Index;
