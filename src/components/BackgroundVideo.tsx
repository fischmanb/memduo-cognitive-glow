
import { useState, useEffect } from 'react';

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const slowConnections = ['slow-2g', '2g', '3g'];
      if (slowConnections.includes(connection.effectiveType)) {
        setIsSlowConnection(true);
      }
    }

    // Fallback for slow loading
    const timer = setTimeout(() => {
      if (!videoLoaded) {
        setIsSlowConnection(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [videoLoaded]);

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
    <>
      <div className="fixed inset-0 w-full h-full z-0">
        <svg
          className="w-full h-full animate-pulse"
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#68d5c4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#68d5c4" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="connectionGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#68d5c4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#68d5c4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#68d5c4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Background */}
          <rect width="100%" height="100%" fill="#000" />
          
          {/* Animated network nodes */}
          <g className="animate-pulse">
            <circle cx="150" cy="100" r="3" fill="url(#nodeGlow)">
              <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="400" cy="150" r="4" fill="url(#nodeGlow)">
              <animate attributeName="r" values="3;6;3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="650" cy="200" r="2" fill="url(#nodeGlow)">
              <animate attributeName="r" values="1;4;1" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="350" r="3" fill="url(#nodeGlow)">
              <animate attributeName="r" values="2;5;2" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="600" cy="400" r="4" fill="url(#nodeGlow)">
              <animate attributeName="r" values="3;6;3" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="450" r="2" fill="url(#nodeGlow)">
              <animate attributeName="r" values="1;4;1" dur="4.2s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* Animated connections */}
          <g stroke="url(#connectionGlow)" strokeWidth="1" fill="none">
            <line x1="150" y1="100" x2="400" y2="150">
              <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
            </line>
            <line x1="400" y1="150" x2="650" y2="200">
              <animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="350" x2="600" y2="400">
              <animate attributeName="stroke-opacity" values="0.1;0.7;0.1" dur="2.5s" repeatCount="indefinite" />
            </line>
            <line x1="150" y1="100" x2="300" y2="350">
              <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="3.8s" repeatCount="indefinite" />
            </line>
            <line x1="400" y1="150" x2="300" y2="350">
              <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="3.2s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </div>
      
      {/* Overlay for text legibility */}
      <div className="fixed inset-0 bg-black/70 z-0" />
    </>
  );
};

export default BackgroundVideo;
