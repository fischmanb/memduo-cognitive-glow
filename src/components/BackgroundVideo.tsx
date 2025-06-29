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
          
          // Load particles with intelligent adaptive graph configuration
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
                  value: 35,
                  density: { 
                    enable: true,
                    width: 1920,
                    height: 1080
                  }
                },
                color: { 
                  value: ["#00ffff", "#00ccff", "#33aaff", "#6699ff", "#9966ff", "#9b59ff"]
                },
                shape: { 
                  type: "circle" 
                },
                size: { 
                  value: { min: 4, max: 8 },
                  animation: {
                    enable: true,
                    speed: 1,
                    size_min: 3,
                    sync: false
                  }
                },
                opacity: { 
                  value: { min: 0.7, max: 1.0 },
                  animation: { 
                    enable: true,
                    speed: 0.8,
                    opacity_min: 0.5,
                    sync: false
                  }
                },
                stroke: {
                  width: 0
                },
                links: {
                  enable: true,
                  distance: 150,
                  color: {
                    value: "#00ffff"
                  },
                  opacity: 0.8,
                  width: 1.5,
                  warp: false,
                  triangles: {
                    enable: false
                  }
                },
                move: { 
                  enable: true, 
                  speed: 0.8,
                  direction: "none",
                  outModes: {
                    default: "bounce"
                  },
                  attract: {
                    enable: true,
                    rotate: {
                      x: 600,
                      y: 1200
                    }
                  }
                }
              },
              interactivity: {
                detectsOn: "window",
                events: {
                  onHover: {
                    enable: true,
                    mode: ["grab", "bubble"],
                    parallax: {
                      enable: false,
                      force: 60,
                      smooth: 10
                    }
                  },
                  onClick: {
                    enable: true,
                    mode: "push"
                  },
                  resize: {
                    delay: 0.5,
                    enable: true
                  }
                },
                modes: {
                  grab: {
                    distance: 200,
                    links: {
                      blink: false,
                      consent: false,
                      opacity: 0.9,
                      color: "#9b59ff"
                    }
                  },
                  bubble: {
                    distance: 150,
                    size: 12,
                    duration: 0.4,
                    opacity: 1,
                    color: "#9b59ff",
                    mix: false
                  },
                  push: {
                    default: true,
                    groups: [],
                    quantity: 2
                  }
                }
              }
            }
          });
          
          setParticlesLoaded(true);
          console.log('Adaptive graph particles loaded successfully');
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
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.9) 80%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
