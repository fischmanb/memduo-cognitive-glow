
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Eye, Shield } from "lucide-react";
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

  const features = [
    {
      icon: Brain,
      title: "Stateful, Adaptive & Transparent Memory",
      description: "See what it remembers and why it matters."
    },
    {
      icon: Eye,
      title: "Real‑Time Insight",
      description: "Surfaces contradictions before they derail your short and long-term goals."
    },
    {
      icon: Shield,
      title: "Ownable Knowledge",
      description: "Your private, customizable library seeded with timeless humanist thought."
    }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundVideo />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 snap-start">
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
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/30 border-gray-800 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8 text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-6 text-[#68d5c4]" />
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit Section */}
      <section className="relative z-10 py-20 px-4 snap-start">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/20 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 animate-fade-in">
            <p className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed">
              MemDuo grows alongside you—adapting its knowledge, staying aligned with your short‑ and long‑term intent, and never hallucinating, always and by design.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section className="relative z-10 py-20 px-4 snap-start">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Private demo opportunities for selected researchers, media, and pre‑seed investors.
            </h2>
          </div>
          
          <Card className="bg-black/30 border-gray-800 backdrop-blur-sm">
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
                      className="bg-black/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#68d5c4]"
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
                      className="bg-black/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#68d5c4]"
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
                    className="bg-black/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#68d5c4] min-h-[120px]"
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
                  className="w-full bg-[#68d5c4] hover:bg-[#5bc4b1] text-black font-semibold py-3 text-lg transition-all duration-200"
                >
                  {isSubmitting ? 'Joining Queue...' : 'Request to Join Private Demo Queue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 text-center border-t border-gray-800">
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
