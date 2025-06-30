
import { Eye, Brain, Settings } from "lucide-react";

const Features = () => {
  console.log("=== FEATURES COMPONENT DEBUG ===");
  console.log("Brain icon:", Brain);
  console.log("Settings icon:", Settings);
  console.log("Eye icon:", Eye);
  console.log("Are they functions?", typeof Brain, typeof Settings, typeof Eye);
  
  const features = [
    {
      icon: "brain",
      IconComponent: Brain,
      title: "Dynamic Contradiction Handling",
      description: "Surfaces critical drift before to protect your short and long-term goals."
    },
    {
      icon: "settings", 
      IconComponent: Settings,
      title: "Ownable Knowledge",
      description: "Your private, customizable library seeded with timeless humanist thought."
    },
    {
      icon: "eye",
      IconComponent: Eye, 
      title: "Stateful, Adaptive & Transparent Reasoning",
      description: "Persistent, contextual memory enables fully auditable decisions."
    }
  ];

  return (
    <section className="relative z-10 py-20 px-4 snap-start">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.IconComponent;
            console.log(`Rendering feature ${index}:`, feature.icon, Icon);
            
            return (
              <div 
                key={feature.icon}
                className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-[#4A90E2]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  {Icon && (
                    <Icon 
                      size={32}
                      className="text-[#4A90E2]" 
                      strokeWidth={2}
                    />
                  )}
                  {!Icon && (
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs">
                      ?
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
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
