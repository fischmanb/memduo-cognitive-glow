
import { useState, useEffect, useRef } from 'react';
import { tsParticles } from '@tsparticles/engine';

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptLoadedRef = useRef(false);

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

  useEffect(() => {
    // Load tsParticles and initialize
    if (!isSlowConnection && !prefersReducedMotion && !scriptLoadedRef.current) {
      const loadTsParticles = async () => {
        try {
          await tsParticles.load({
            id: "graphBG",
            options: {
              fullScreen: { zIndex: -1 },
              detectRetina: true,
              background: { color: "#000" },
              fpsLimit: 30,
              particles: {
                number: { value: 8, density: { enable: false } },
                color: { value: ["#00e5ff", "#9b59ff"] },
                shape: { type: "circle" },
                size: { value: 4 },
                opacity: { value: 0.8, animation: { speed: 0.2 } },
                links: {
                  enable: true,
                  distance: 150,
                  color: { value: ["#00e5ff", "#9b59ff"] },
                  opacity: 0.6,
                  width: 1
                },
                move: { enable: true, speed: 0.3, random: true, outMode: "bounce" }
              }
            }
          });
          
          scriptLoadedRef.current = true;
        } catch (error) {
          console.error('Failed to load tsParticles:', error);
        }
      };

      loadTsParticles();
    }
  }, [isSlowConnection, prefersReducedMotion]);

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
    <>
      <canvas 
        id="graphBG" 
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ display: prefersReducedMotion ? 'none' : 'block' }}
      />
      
      {/* Overlay for text legibility */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.9) 80%)'
        }}
      />
    </>
  );
};

export default BackgroundVideo;
