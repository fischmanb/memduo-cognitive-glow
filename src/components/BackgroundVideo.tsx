
import { useState, useEffect, useRef } from 'react';
import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [particlesLoaded, setParticlesLoaded] = useState(false);

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
    if (!isSlowConnection && !prefersReducedMotion && !particlesLoaded) {
      const initParticles = async () => {
        try {
          // Initialize tsParticles engine
          await loadSlim(tsParticles);
          
          // Load particles with correct API usage
          await tsParticles.load({
            id: "graphBG",
            options: {
              fullScreen: { 
                enable: true,
                zIndex: -1 
              },
              detectRetina: true,
              background: { 
                color: "#000000" 
              },
              fpsLimit: 60,
              particles: {
                number: { 
                  value: 12,
                  density: { 
                    enable: true,
                    area: 800
                  }
                },
                color: { 
                  value: ["#00e5ff", "#9b59ff", "#68d5c4"] 
                },
                shape: { 
                  type: "circle" 
                },
                size: { 
                  value: { min: 2, max: 6 }
                },
                opacity: { 
                  value: 0.8,
                  animation: { 
                    enable: true,
                    speed: 0.5,
                    minimumValue: 0.3
                  }
                },
                links: {
                  enable: true,
                  distance: 150,
                  color: "#68d5c4",
                  opacity: 0.4,
                  width: 1
                },
                move: { 
                  enable: true, 
                  speed: 1,
                  direction: "none",
                  random: true,
                  straight: false,
                  outModes: {
                    default: "bounce"
                  }
                }
              },
              interactivity: {
                detectsOn: "canvas",
                events: {
                  onHover: {
                    enable: true,
                    mode: "grab"
                  },
                  resize: {
                    enable: true
                  }
                },
                modes: {
                  grab: {
                    distance: 140,
                    links: {
                      opacity: 1
                    }
                  }
                }
              }
            }
          });
          
          setParticlesLoaded(true);
          console.log('tsParticles loaded successfully');
        } catch (error) {
          console.error('Failed to load tsParticles:', error);
        }
      };

      initParticles();
    }
  }, [isSlowConnection, prefersReducedMotion, particlesLoaded]);

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
      <div id="graphBG" className="fixed inset-0 z-0" />
      
      {/* Overlay for text legibility */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 80%)',
          pointerEvents: 'none'
        }}
      />
    </>
  );
};

export default BackgroundVideo;
