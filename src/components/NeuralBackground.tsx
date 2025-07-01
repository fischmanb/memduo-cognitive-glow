
import React from 'react';

interface NeuralBackgroundProps {
  mousePosition: { x: number; y: number };
  scrollY: number;
}

const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ mousePosition, scrollY }) => {
  const nodes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + (i * 15) % 80,
    y: 15 + (i * 20) % 70,
    size: 2 + (i % 3),
    color: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'purple' : 'emerald'
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 197, 253, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 197, 253, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      />
      
      {/* Neural Nodes */}
      <svg className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection Lines */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((otherNode, j) => {
            const distance = Math.sqrt(
              Math.pow((node.x - otherNode.x), 2) + Math.pow((node.y - otherNode.y), 2)
            );
            if (distance < 30) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${otherNode.x}%`}
                  y2={`${otherNode.y}%`}
                  stroke={`url(#gradient-${node.color}-${otherNode.color})`}
                  strokeWidth="0.5"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              );
            }
            return null;
          })
        )}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill={
              node.color === 'cyan' ? '#06b6d4' :
              node.color === 'purple' ? '#8b5cf6' : '#10b981'
            }
            filter="url(#glow)"
            opacity="0.6"
            className="animate-pulse"
            style={{ animationDelay: `${node.id * 0.3}s` }}
          />
        ))}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient-purple-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient-emerald-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NeuralBackground;
