import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Eye, User, Mail, MessageSquare, CheckCircle, ChevronDown } from "lucide-react";
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
  const { toast } = useToast();

  console.log('Index component rendered - restructured into 4 full-viewport views');

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
          // Unique constraint violation (duplicate email)
          toast({
            title: "Email already registered",
            description: "This email is already on the waitlist. We'll be in touch!",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        // Send notification email (don't await to avoid blocking the user)
        supabase.functions.invoke('notify-waitlist-submission', {
          body: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            interest: interest.trim() || null
          }
        }).catch(emailError => {
          console.error('Failed to send notification email:', emailError);
          // Don't show error to user since their submission was successful
        });

        toast({
          title: "Welcome to the queue!",
          description: "We'll contact you when demo opportunities become available.",
        });
        
        // Clear form on success
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
      const fourthViewStart = viewportHeight * 3; // 4th view starts at 3 viewport heights
      const fourthViewEnd = viewportHeight * 4; // 4th view ends at 4 viewport heights
      
      // Hide button when in 4th view (form section)
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
      
      {/* Fixed Request Early Access Button - Top Right */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
        showFloatingCTA ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <Button
          onClick={() => scrollToNext(3)}
          className="bg-[#4A90E2]/25 backdrop-blur-sm border-2 border-[#4A90E2]/30 text-white hover:bg-[#4A90E2]/30 hover:border-[#4A90E2]/50 font-medium px-6 py-3 text-sm transition-all duration-300 shadow-lg shadow-[#4A90E2]/10 hover:shadow-[#4A90E2]/15 rounded-lg hover:scale-105"
        >
          Request Early Access
        </Button>
      </div>
      
      {/* View 1 - ATF: Just the Logo */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <img 
            src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
            alt="MemDuo" 
            className="h-[29rem] md:h-[38.6rem] lg:h-[48.3rem] w-auto mx-auto animate-fade-in"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
            }}
          />
        </div>
        
        {/* Scroll indicator - Fixed positioning */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown 
            size={32} 
            className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-300 cursor-pointer opacity-70"
            onClick={() => scrollToNext(1)}
          />
        </div>
      </section>

      {/* View 2 - Heading & Subheading */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight space-y-6">
              <div className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Meet Your Cognitive
              </div>
              <div className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Growth Partner
              </div>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
              A secure, general‑purpose companion that learns with you and maintains epistemic fidelity.
            </p>
          </div>
        </div>
        
        {/* Scroll indicator - Fixed positioning */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown 
            size={32} 
            className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-300 cursor-pointer opacity-70"
            onClick={() => scrollToNext(2)}
          />
        </div>
      </section>

      {/* View 3 - Features & Benefits */}
      <section className="relative z-10 flex flex-col justify-center px-4 min-h-screen py-16">
        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#4A90E2]/15 backdrop-blur-sm border-2 border-[#4A90E2]/30 flex items-center justify-center group-hover:bg-[#4A90E2]/20 group-hover:border-[#4A90E2]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#4A90E2]/10 group-hover:shadow-[#4A90E2]/15">
                <Shield size={32} className="text-[#4A90E2]" strokeWidth={2} />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2">
                <span className="block text-center whitespace-nowrap">
                  Design Your Own<br />
                  Intelligence
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Private customizable cognition seeded with timeless humanist thought.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0.2s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#4A90E2]/15 backdrop-blur-sm border-2 border-[#4A90E2]/30 flex items-center justify-center group-hover:bg-[#4A90E2]/20 group-hover:border-[#4A90E2]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#4A90E2]/10 group-hover:shadow-[#4A90E2]/15">
                <Brain size={32} className="text-[#4A90E2]" strokeWidth={2} />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2">
                <span className="block text-center whitespace-nowrap">
                  Dynamic Contradiction<br />
                  Handling
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Proactively surfaces critical drift to protect you, your goals and principles.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0.4s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#4A90E2]/15 backdrop-blur-sm border-2 border-[#4A90E2]/30 flex items-center justify-center group-hover:bg-[#4A90E2]/20 group-hover:border-[#4A90E2]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#4A90E2]/10 group-hover:shadow-[#4A90E2]/15">
                <Eye size={32} className="text-[#4A90E2]" strokeWidth={2} />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-white leading-tight min-h-[3.5rem] flex items-center justify-center px-2">
                <span className="block text-center whitespace-nowrap">
                  Transparent Stateful<br />
                  Reasoning
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Persistent, contextual memory enables fully auditable decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Benefit Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 animate-fade-in glassmorphic-card">
            <p className="text-xl md:text-2xl font-light text-gray-200 leading-relaxed">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
            </p>
          </div>
        </div>

        {/* Scroll indicator - Fixed positioning */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown 
            size={32} 
            className="text-gray-400 hover:text-[#4A90E2] transition-colors duration-300 cursor-pointer opacity-70"
            onClick={() => scrollToNext(3)}
          />
        </div>
      </section>

      {/* View 4 - Demo Form */}
      <section className="relative z-10 flex flex-col justify-center items-center px-4 min-h-screen py-12">
        <div className="max-w-xl mx-auto w-full">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md glassmorphic-card relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/5 via-transparent to-white/5 pointer-events-none"></div>
            
            <CardContent className="p-6 relative">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-light mb-3 text-white leading-tight">
                  Private demo opportunities for select researchers, media, and investors.
                </h2>
                
                {/* Progress indicator */}
                <div className="mt-4 mb-2">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Complete your application</span>
                    <span>{getFormProgress()}% complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-[#4A90E2] to-[#2E5BBA] h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getFormProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields Group */}
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="group">
                      <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-[#4A90E2]">
                        <User size={16} className="text-[#4A90E2]" />
                        First Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#4A90E2] focus:bg-white/10 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-300 pl-3 pr-10 py-2 rounded-lg text-sm"
                          placeholder="Enter your first name"
                          required
                        />
                        {firstName && (
                          <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4A90E2] animate-scale-in" />
                        )}
                      </div>
                    </div>
                    <div className="group">
                      <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-[#4A90E2]">
                        <User size={16} className="text-[#4A90E2]" />
                        Last Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#4A90E2] focus:bg-white/10 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-300 pl-3 pr-10 py-2 rounded-lg text-sm"
                          placeholder="Enter your last name"
                          required
                        />
                        {lastName && (
                          <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4A90E2] animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Field Group */}
                <div className="group">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-[#4A90E2]">
                    <Mail size={16} className="text-[#4A90E2]" />
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#4A90E2] focus:bg-white/10 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-300 pl-3 pr-10 py-2 rounded-lg text-sm"
                      placeholder="your@email.com"
                      required
                    />
                    {email && (
                      <CheckCircle size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4A90E2] animate-scale-in" />
                    )}
                  </div>
                </div>
                
                {/* Interest Field Group */}
                <div className="group">
                  <label htmlFor="interest" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-[#4A90E2]">
                    <MessageSquare size={16} className="text-[#4A90E2]" />
                    Tell us about your interest
                    <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#4A90E2] focus:bg-white/10 focus:shadow-lg focus:shadow-[#4A90E2]/20 backdrop-blur-sm transition-all duration-300 min-h-[80px] p-3 rounded-lg text-sm resize-none"
                      placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                      maxLength={150}
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-500 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                      {interest.length}/150
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Submit Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#4A90E2] to-[#2E5BBA] hover:from-[#3A7BC8] hover:to-[#1E4B9A] text-white font-semibold py-3 text-base transition-all duration-300 border-0 backdrop-blur-sm shadow-2xl hover:shadow-[#4A90E2]/30 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg relative overflow-hidden group"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Joining Queue...
                        </>
                      ) : (
                        'Request Early Access'
                      )}
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 text-center border-t border-white/10">
        <p className="text-gray-400 text-sm">
          We use your email only to share demo access and updates.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          © 2024 MemDuo.com
        </p>
      </footer>
    </div>
  );
};

export default Index;
