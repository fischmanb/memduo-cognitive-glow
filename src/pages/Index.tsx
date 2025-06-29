import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Eye } from "lucide-react";
import BackgroundVideo from "../components/BackgroundVideo";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide your first name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Welcome to the queue!",
        description: "We'll contact you when demo opportunities become available.",
      });
      setFirstName('');
      setEmail('');
      setInterest('');
      setIsSubmitting(false);
      console.log('Waitlist submission:', { firstName, email, interest });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundVideo />
      
      {/* Hero Section */}
      <section className="relative z-10 flex items-center justify-center px-4 snap-start" style={{ minHeight: '100vh', paddingTop: '15vh' }}>
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            Meet Your Cognitive Growth Partner
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
            A secure, general‑purpose companion that learns with you and maintains epistemic fidelity.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 snap-start">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #374151',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.5s ease',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fade-in 0.8s ease-out 0s forwards'
            }} className="hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1">
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px auto',
                borderRadius: '8px',
                background: 'rgba(104, 213, 196, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(104, 213, 196, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(104, 213, 196, 0.1)'
              }} className="group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 group-hover:shadow-[#68d5c4]/15">
                <Brain size={32} color="#68d5c4" strokeWidth={2} fill="none" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Dynamic Contradiction Handling
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Surfaces critical drift before to protect your short and long-term goals.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #374151',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.5s ease',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fade-in 0.8s ease-out 0.2s forwards'
            }} className="hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1">
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px auto',
                borderRadius: '8px',
                background: 'rgba(104, 213, 196, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(104, 213, 196, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(104, 213, 196, 0.1)'
              }} className="group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 group-hover:shadow-[#68d5c4]/15">
                <Shield size={32} color="#68d5c4" strokeWidth={2} fill="none" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Design Your Own Intelligence
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Your private, customizable library seeded with timeless humanist thought.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #374151',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.5s ease',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fade-in 0.8s ease-out 0.4s forwards'
            }} className="hover:bg-white/8 hover:border-[#68d5c4]/40 hover:shadow-lg hover:shadow-[#68d5c4]/20 hover:-translate-y-1">
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px auto',
                borderRadius: '8px',
                background: 'rgba(104, 213, 196, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(104, 213, 196, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(104, 213, 196, 0.1)'
              }} className="group-hover:bg-[#68d5c4]/20 group-hover:border-[#68d5c4]/50 group-hover:scale-110 group-hover:shadow-[#68d5c4]/15">
                <Eye size={32} color="#68d5c4" strokeWidth={2} fill="none" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Stateful, Adaptive & Transparent Reasoning
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Persistent, contextual memory enables fully auditable decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit Section */}
      <section className="relative z-10 py-20 px-4 snap-start">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 animate-fade-in glassmorphic-card">
            <p className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed">
              MemDuo grows alongside you — adapting its knowledge, staying aligned with your short and long‑term intent, and never hallucinating by design.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section className="relative z-10 py-20 px-4 snap-start">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Private demo opportunities for select researchers, media, and pre‑seed investors.
            </h2>
          </div>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-md glassmorphic-card">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 backdrop-blur-sm transition-all duration-300"
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 backdrop-blur-sm transition-all duration-300"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-gray-300 mb-2">
                    Tell us about your interest (optional, max 150 words)
                  </label>
                  <Textarea
                    id="interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#68d5c4] focus:bg-white/10 backdrop-blur-sm transition-all duration-300 min-h-[120px]"
                    placeholder="What draws you to MemDuo? How might you use it in your work or research?"
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {interest.length}/150 characters
                  </p>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#68d5c4] hover:bg-[#5bc4b1] text-[#0b0d10] font-semibold py-3 text-lg transition-all duration-300 border border-[#68d5c4]/30 backdrop-blur-sm shadow-lg hover:shadow-[#68d5c4]/25"
                >
                  {isSubmitting ? 'Joining Queue...' : 'Request Early Access'}
                </Button>
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
