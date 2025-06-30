
import { Eye, Brain, Settings } from "lucide-react";

const Features = () => {
  // Force a complete re-render with different data structure
  const featureData = [
    {
      IconComponent: Brain,
      heading: "Dynamic Contradiction Handling", 
      text: "Surfaces critical drift before to protect your short and long-term goals.",
      label: "brain outline icon"
    },
    {
      IconComponent: Settings,
      heading: "Ownable Knowledge", 
      text: "Your private, customizable library seeded with timeless humanist thought.",
      label: "settings outline icon"
    },
    {
      IconComponent: Eye,
      heading: "Stateful, Adaptive & Transparent Reasoning",
      text: "Persistent, contextual memory enables fully auditable decisions.",
      label: "eye outline icon"
    }
  ];

  console.log("FORCE REFRESH - Features rendering:", featureData.map(f => f.IconComponent.displayName || f.IconComponent.name || 'unknown'));
  console.log("Current timestamp:", Date.now());

  return (
    <section className="relative z-10 py-20 px-4 snap-start">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {featureData.map((item, idx) => {
            const { IconComponent, heading, text, label } = item;
            return (
              <div 
                key={`feature-${idx}-${Date.now()}`}
                className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <IconComponent 
                    className="w-8 h-8 text-[#4A90E2]" 
                    strokeWidth={2}
                    fill="none"
                    stroke="currentColor"
                    aria-label={label}
                    style={{ 
                      background: 'transparent !important',
                      backgroundColor: 'transparent !important'
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {heading}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
