
import { useState, useEffect } from 'react';

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const slowConnections = ['slow-2g', '2g'];
      const effectiveSpeed = connection.downlink || 0; // Speed in Mbps
      if (slowConnections.includes(connection.effectiveType) || effectiveSpeed < 1) {
        setIsSlowConnection(true);
      }
    }
  }, []);

  // Fallback for slow connections or reduced motion
  if (isSlowConnection || prefersReducedMotion) {
    return (
      <div 
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.9) 80%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23068d9d' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0b0d10'
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {/* TODO: Replace this with actual video when provided */}
      {/* 
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(65%)' }}
        autoPlay 
        muted 
        loop 
        playsInline
        aria-label="Background video of animated graph"
      >
        <source src="/path-to-your-video.webm" type="video/webm" />
        <source src="/path-to-your-video.mp4" type="video/mp4" />
      </video>
      */}
      
      {/* Temporary animated SVG background - will be replaced by video */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950">
        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 1920 1080"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="connectionGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated network nodes */}
          <g>
            <circle cx="300" cy="200" r="3" fill="url(#nodeGlow)">
              <animate attributeName="r" values="2;6;2" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="800" cy="300" r="4" fill="url(#nodeGlow)">
              <animate attributeName="r" values="3;8;3" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="1300" cy="250" r="2" fill="url(#nodeGlow)">
              <animate attributeName="r" values="1;5;1" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="600" cy="600" r="5" fill="url(#nodeGlow)">
              <animate attributeName="r" values="4;10;4" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="1100" cy="700" r="3" fill="url(#nodeGlow)">
              <animate attributeName="r" values="2;7;2" dur="4.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="800" r="2" fill="url(#nodeGlow)">
              <animate attributeName="r" values="1;4;1" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="1500" cy="600" r="4" fill="url(#nodeGlow)">
              <animate attributeName="r" values="3;9;3" dur="5.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="5.5s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* Animated connections */}
          <g stroke="url(#connectionGlow)" strokeWidth="1" fill="none">
            <line x1="300" y1="200" x2="800" y2="300">
              <animate attributeName="stroke-opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;2;0.5" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="800" y1="300" x2="1300" y2="250">
              <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="5s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;2.5;0.5" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="600" y1="600" x2="1100" y2="700">
              <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;1.5;0.5" dur="3.5s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="200" x2="600" y2="600">
              <animate attributeName="stroke-opacity" values="0.2;0.4;0.2" dur="6s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;2;0.5" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="800" y1="300" x2="600" y2="600">
              <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="4.5s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;1.5;0.5" dur="4.5s" repeatCount="indefinite" />
            </line>
            <line x1="1100" y1="700" x2="1500" y2="600">
              <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="5.5s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;2;0.5" dur="5.5s" repeatCount="indefinite" />
            </line>
            <line x1="200" y1="800" x2="600" y2="600">
              <animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.5;1.5;0.5" dur="3s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </div>
      
      {/* Overlay for text legibility */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.9) 80%)'
        }}
      />
    </div>
  );
};

export default BackgroundVideo;
