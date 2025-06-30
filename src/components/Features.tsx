
import { Eye, Brain, Settings } from "lucide-react";

const Features = () => {
  // Completely new structure to force refresh
  const iconData = [
    {
      Component: Brain,
      title: "Dynamic Contradiction Handling", 
      desc: "Surfaces critical drift before to protect your short and long-term goals.",
      id: "brain-feature"
    },
    {
      Component: Settings,
      title: "Ownable Knowledge", 
      desc: "Your private, customizable library seeded with timeless humanist thought.",
      id: "settings-feature"
    },
    {
      Component: Eye,
      title: "Stateful, Adaptive & Transparent Reasoning",
      desc: "Persistent, contextual memory enables fully auditable decisions.",
      id: "eye-feature"
    }
  ];

  console.log("NEW FEATURES COMPONENT - Icons:", iconData.map(item => item.Component.name));
  console.log("Component render time:", new Date().toISOString());

  return (
    <section className="relative z-10 py-20 px-4 snap-start">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {iconData.map((item) => {
            const IconComp = item.Component;
            return (
              <div 
                key={item.id}
                className="group bg-white/5 backdrop-blur-md border-2 border-gray-700 rounded-lg p-8 text-center transition-all duration-500 hover:bg-white/8 hover:border-[#4A90E2]/40 hover:shadow-lg hover:shadow-[#4A90E2]/20 hover:-translate-y-1 animate-fade-in"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <IconComp 
                    size={32}
                    className="text-[#4A90E2]" 
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.desc}
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
