
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Eye, User, Mail, MessageSquare, CheckCircle, ChevronDown } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  console.log('Index component rendered - feature title updated to Transparent Stateful Reasoning');

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

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundVideo />
      
      {/* Combined Header and Hero Section - Centered in viewport */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Logo */}
          <div className="mb-5">
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo" 
              className="h-80 w-auto mx-auto"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
              }}
            />
          </div>
          
          {/* Header Text */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Meet Your Cognitive Growth Partner
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed mb-8">
              A secure, general‑purpose companion that learns with you and maintains epistemic fidelity.
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="animate-bounce absolute bottom-8">
          <ChevronDown 
            size={32} 
            className="text-gray-400 hover:text-[#68d5c4] transition-colors duration-300 cursor-pointer opacity-70"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12 px-4 snap-start">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#68d5c4]/15 backdrop-blur-sm border-2 border-[#68d5c4]/30 flex items-center justify-center group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#68d5c4]/10 group-hover:shadow-[#68d5c4]/15">
                <Shield size={32} className="text-[#68d5c4]" strokeWidth={2} />
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

            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0.2s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#68d5c4]/15 backdrop-blur-sm border-2 border-[#68d5c4]/30 flex items-center justify-center group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#68d5c4]/10 group-hover:shadow-[#68d5c4]/15">
                <Brain size={32} className="text-[#68d5c4]" strokeWidth={2} />
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

            <div className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1 animate-fade-in opacity-0" style={{ animation: 'fade-in 0.8s ease-out 0.4s forwards' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#68d5c4]/15 backdrop-blur-sm border-2 border-[#68d5c4]/30 flex items-center justify-center group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#68d5c4]/10 group-hover:shadow-[#68d5c4]/15">
                <Eye size={32} className="text-[#68d5c4]" strokeWidth={2} />
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
      </section>

      {/* Benefit Section */}
      <section className="relative z-10 py-12 px-4 snap-start">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 animate-fade-in glassmorphic-card">
            <p className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating — by design.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Waitlist Form Section */}
      <section className="relative z-10 py-12 px-4 snap-start">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md glassmorphic-card relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#68d5c4]/5 via-transparent to-white/5 pointer-events-none"></div>
            
            <CardContent className="p-10 relative">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-light mb-4 text-white leading-tight">
                  Private demo opportunities for select researchers, media, and investors.
                </h2>
                
                {/* Progress indicator */}
                <div className="mt-6 mb-2">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Complete your application</span>
                    <span>{getFormProgress()}% complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-[#68d5c4] to-[#5bc4b1] h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getFormProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Fields Group */}
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3 transition-colors group-focus-within:text-[#68d5c4]">
                        <User size={16} className="text-[#68d5c4]" />
                        First Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 focus:shadow-lg focus:shadow-[#68d5c4]/20 backdrop-blur-sm transition-all duration-300 pl-4 pr-10 py-3 rounded-lg text-base"
                          placeholder="Enter your first name"
                          required
                        />
                        {firstName && (
                          <CheckCircle size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#68d5c4] animate-scale-in" />
                        )}
                      </div>
                    </div>
                    <div className="group">
                      <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3 transition-colors group-focus-within:text-[#68d5c4]">
                        <User size={16} className="text-[#68d5c4]" />
                        Last Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 focus:shadow-lg focus:shadow-[#68d5c4]/20 backdrop-blur-sm transition-all duration-300 pl-4 pr-10 py-3 rounded-lg text-base"
                          placeholder="Enter your last name"
                          required
                        />
                        {lastName && (
                          <CheckCircle size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#68d5c4] animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Field Group */}
                <div className="group">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3 transition-colors group-focus-within:text-[#68d5c4]">
                    <Mail size={16} className="text-[#68d5c4]" />
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 focus:shadow-lg focus:shadow-[#68d5c4]/20 backdrop-blur-sm transition-all duration-300 pl-4 pr-10 py-3 rounded-lg text-base"
                      placeholder="your@email.com"
                      required
                    />
                    {email && (
                      <CheckCircle size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#68d5c4] animate-scale-in" />
                    )}
                  </div>
                </div>
                
                {/* Interest Field Group */}
                <div className="group">
                  <label htmlFor="interest" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3 transition-colors group-focus-within:text-[#68d5c4]">
                    <MessageSquare size={16} className="text-[#68d5c4]" />
                    Tell us about your interest
                    <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 focus:shadow-lg focus:shadow-[#68d5c4]/20 backdrop-blur-sm transition-all duration-300 min-h-[140px] p-4 rounded-lg text-base resize-none"
                      placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                      maxLength={150}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                      {interest.length}/150
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#68d5c4] to-[#5bc4b1] hover:from-[#5bc4b1] hover:to-[#4fb69e] text-[#0b0d10] font-semibold py-4 text-lg transition-all duration-300 border-0 backdrop-blur-sm shadow-2xl hover:shadow-[#68d5c4]/30 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg relative overflow-hidden group"
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
