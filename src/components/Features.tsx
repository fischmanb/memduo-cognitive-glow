
import { Eye, Shield, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Eye,
      title: "Dynamic Contradiction Handling",
      description: "Surfaces critical drift before to protect your short and long-term goals.",
      ariaLabel: "eye outline icon"
    },
    {
      icon: Shield,
      title: "Ownable Knowledge", 
      description: "Your private, customizable library seeded with timeless humanist thought.",
      ariaLabel: "shield outline icon"
    },
    {
      icon: Zap,
      title: "Stateful, Adaptive & Transparent Reasoning",
      description: "Persistent, contextual memory enables fully auditable decisions.",
      ariaLabel: "zap outline icon"
    }
  ];

  return (
    <section className="relative z-10 py-20 px-4 snap-start">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-[#4A90E2]/15 backdrop-blur-sm border-2 border-[#4A90E2]/30 flex items-center justify-center group-hover:bg-[#4A90E2]/20 group-hover:border-[#4A90E2]/50 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#4A90E2]/10 group-hover:shadow-[#4A90E2]/15">
                <feature.icon 
                  className="w-8 h-8 text-[#4A90E2]" 
                  strokeWidth={2}
                  aria-label={feature.ariaLabel}
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
