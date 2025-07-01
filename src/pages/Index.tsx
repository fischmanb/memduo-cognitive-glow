import { useState, useEffect } from 'react';
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeuralBackground from "../components/NeuralBackground";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const { logout } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Neural Background */}
      <NeuralBackground mousePosition={mousePosition} scrollY={scrollY} />
      
      {/* Dynamic Mouse Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 197, 253, 0.04), transparent 40%)`
        }}
      />

      {/* Exit Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          onClick={logout}
          variant="outline"
          className="neural-glass-premium border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          <LogOut className="mr-2 w-4 h-4" />
          Exit
        </Button>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center h-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            MemDuo Demonstration Interface
          </h1>
          <p className="text-gray-300">Explore the possibilities of AI-driven memory enhancement.</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
            Unlock the Power of Memory with AI
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-12">
            MemDuo is a revolutionary platform that combines cutting-edge AI technology with proven memory techniques to help you learn faster and remember more.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-gradient-to-br from-purple-600 to-cyan-500 text-white">
              Learn More
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:border-white/30">
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                What is MemDuo?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                MemDuo leverages advanced AI algorithms to personalize your learning experience, making it more efficient and effective. Whether you're studying for exams, learning a new language, or just want to improve your memory, MemDuo is here to help.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-yellow-500 bg-clip-text text-transparent mb-4">
                Key Features
              </h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Personalized Learning Paths</li>
                <li>AI-Powered Memory Techniques</li>
                <li>Progress Tracking and Analytics</li>
                <li>Interactive Exercises and Quizzes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Private Demo Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent mb-6">
            Experience MemDuo in Action
          </h3>
          <p className="text-gray-300 leading-relaxed mb-12">
            This private demonstration interface showcases the core functionalities of MemDuo. Explore the AI-driven memory enhancement tools and discover how MemDuo can transform your learning journey.
          </p>
          <Button className="bg-gradient-to-br from-red-500 to-purple-500 text-white">
            Start Exploring
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 text-center">
        <p className="text-gray-500">
          &copy; 2024 MemDuo. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
