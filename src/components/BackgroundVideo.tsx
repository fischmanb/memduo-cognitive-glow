
import { useState, useEffect } from 'react';

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const slowConnections = ['slow-2g', '2g'];
      if (slowConnections.includes(connection.effectiveType)) {
        setIsSlowConnection(true);
      }
    }
  }, []);

  if (isSlowConnection) {
    return (
      <div 
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23068d9d' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#000'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/70" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#68d5c4" stopOpacity="1" />
            <stop offset="50%" stopColor="#68d5c4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#68d5c4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="connectionGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#68d5c4" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#68d5c4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#68d5c4" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated network nodes */}
        <g filter="url(#glow)">
          <circle cx="300" cy="200" r="4" fill="url(#nodeGlow)">
            <animate attributeName="r" values="2;8;2" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="800" cy="300" r="5" fill="url(#nodeGlow)">
            <animate attributeName="r" values="3;10;3" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;1;0.4" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="1300" cy="250" r="3" fill="url(#nodeGlow)">
            <animate attributeName="r" values="2;7;2" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="600" r="6" fill="url(#nodeGlow)">
            <animate attributeName="r" values="4;12;4" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;1;0.3" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="1100" cy="700" r="4" fill="url(#nodeGlow)">
            <animate attributeName="r" values="2;9;2" dur="4.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;1;0.4" dur="4.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="800" r="3" fill="url(#nodeGlow)">
            <animate attributeName="r" values="1;6;1" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="1500" cy="600" r="5" fill="url(#nodeGlow)">
            <animate attributeName="r" values="3;11;3" dur="5.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;1;0.3" dur="5.5s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Animated connections */}
        <g stroke="url(#connectionGlow)" strokeWidth="2" fill="none" filter="url(#glow)">
          <line x1="300" y1="200" x2="800" y2="300">
            <animate attributeName="stroke-opacity" values="0.1;0.8;0.1" dur="4s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;3;1" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="800" y1="300" x2="1300" y2="250">
            <animate attributeName="stroke-opacity" values="0.2;0.9;0.2" dur="5s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;4;1" dur="5s" repeatCount="indefinite" />
          </line>
          <line x1="600" y1="600" x2="1100" y2="700">
            <animate attributeName="stroke-opacity" values="0.1;0.7;0.1" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;2;1" dur="3.5s" repeatCount="indefinite" />
          </line>
          <line x1="300" y1="200" x2="600" y2="600">
            <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="6s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;3;1" dur="6s" repeatCount="indefinite" />
          </line>
          <line x1="800" y1="300" x2="600" y2="600">
            <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="4.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;2;1" dur="4.5s" repeatCount="indefinite" />
          </line>
          <line x1="1100" y1="700" x2="1500" y2="600">
            <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="5.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;3;1" dur="5.5s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="800" x2="600" y2="600">
            <animate attributeName="stroke-opacity" values="0.1;0.6;0.1" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="1;2;1" dur="3s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
      
      {/* Glassmorphic overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-[1px]" />
    </div>
  );
};

export default BackgroundVideo;
