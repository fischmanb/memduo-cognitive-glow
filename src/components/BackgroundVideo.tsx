import { useState, useEffect, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  connections: number[];
  pulsePhase: number;
  colorIndex: number;
  lastColorChange: number;
  isHub: boolean;
  layer: number;
}

interface Edge {
  from: number;
  to: number;
  opacity: number;
  pulsePhase: number;
  colorIndex: number;
  lastColorChange: number;
  strength: number;
}

const BackgroundVideo = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationFallback, setAnimationFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const timeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const performanceCheckRef = useRef<number>(Date.now());

  const colors = ["#00ffff", "#00ccff", "#33aaff", "#6699ff", "#9966ff", "#9b59ff"];

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const slowConnections = ['slow-2g', '2g'];
      const effectiveSpeed = connection.downlink || 0;
      if (slowConnections.includes(connection.effectiveType) || effectiveSpeed < 1) {
        setIsSlowConnection(true);
      }
    }

    // Performance check timeout - fallback to static background if animation isn't working
    const performanceTimeout = setTimeout(() => {
      if (frameCountRef.current < 10) {
        console.warn('Animation performance check failed, using fallback');
        setAnimationFallback(true);
      }
    }, 3000);

    return () => clearTimeout(performanceTimeout);
  }, []);

  useEffect(() => {
    if (isSlowConnection || prefersReducedMotion || animationFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available, using fallback');
      setAnimationFallback(true);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available, using fallback');
      setAnimationFallback(true);
      return;
    }

    // Set canvas size
    const updateCanvasSize = () => {
      try {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } catch (error) {
        console.warn('Failed to set canvas size, using fallback');
        setAnimationFallback(true);
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate biologically-inspired neural network
    const generateNeuralNetwork = () => {
      try {
        const nodeCount = 30; // Reduced from 40 for better performance
        const hubRatio = 0.15;
        const layers = 3;
        
        // Create nodes with biological properties
        const nodes: Node[] = [];
        for (let i = 0; i < nodeCount; i++) {
          const layer = Math.floor(i / (nodeCount / layers));
          const isHub = Math.random() < hubRatio;
          
          nodes.push({
            id: i,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.1, // Slower movement
            vy: (Math.random() - 0.5) * 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: isHub ? 6 + Math.random() * 3 : 3 + Math.random() * 2,
            connections: [],
            pulsePhase: Math.random() * Math.PI * 2,
            colorIndex: Math.floor(Math.random() * colors.length),
            lastColorChange: 0,
            isHub,
            layer
          });
        }

        const edges: Edge[] = [];
        
        // Create hub connections (hubs connect to many nodes)
        const hubs = nodes.filter(n => n.isHub);
        const regularNodes = nodes.filter(n => !n.isHub);
        
        hubs.forEach(hub => {
          const targetConnections = 4 + Math.floor(Math.random() * 4); // Reduced connections
          const availableNodes = nodes.filter(n => n.id !== hub.id);
          
          availableNodes.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(hub.x - a.x, 2) + Math.pow(hub.y - a.y, 2));
            const distB = Math.sqrt(Math.pow(hub.x - b.x, 2) + Math.pow(hub.y - b.y, 2));
            return (distA + Math.random() * 200) - (distB + Math.random() * 200);
          });
          
          for (let i = 0; i < Math.min(targetConnections, availableNodes.length); i++) {
            const target = availableNodes[i];
            if (!hub.connections.includes(target.id)) {
              const strength = hub.isHub && target.isHub ? 0.8 : 0.6;
              
              edges.push({
                from: hub.id,
                to: target.id,
                opacity: strength,
                pulsePhase: Math.random() * Math.PI * 2,
                colorIndex: Math.floor(Math.random() * colors.length),
                lastColorChange: 0,
                strength
              });
              
              hub.connections.push(target.id);
              target.connections.push(hub.id);
            }
          }
        });
        
        // Create local clustering
        regularNodes.forEach(node => {
          if (node.connections.length < 2) {
            const targetConnections = 1 + Math.floor(Math.random() * 2); // Reduced connections
            const nearbyNodes = nodes
              .filter(n => n.id !== node.id && !node.connections.includes(n.id))
              .sort((a, b) => {
                const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2));
                const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2));
                return distA - distB;
              });
            
            for (let i = 0; i < Math.min(targetConnections, nearbyNodes.length); i++) {
              const target = nearbyNodes[i];
              const strength = 0.4 + Math.random() * 0.3;
              
              edges.push({
                from: node.id,
                to: target.id,
                opacity: strength,
                pulsePhase: Math.random() * Math.PI * 2,
                colorIndex: Math.floor(Math.random() * colors.length),
                lastColorChange: 0,
                strength
              });
              
              node.connections.push(target.id);
              target.connections.push(node.id);
            }
          }
        });

        nodesRef.current = nodes;
        edgesRef.current = edges;
        console.log('Neural network generated successfully');
      } catch (error) {
        console.warn('Failed to generate neural network, using fallback:', error);
        setAnimationFallback(true);
      }
    };

    generateNeuralNetwork();

    // Animation loop with performance monitoring
    const animate = () => {
      try {
        frameCountRef.current++;
        timeRef.current += 0.008; // Slower time progression
        
        // Performance check every 60 frames
        if (frameCountRef.current % 60 === 0) {
          const now = Date.now();
          const fps = 60000 / (now - performanceCheckRef.current);
          performanceCheckRef.current = now;
          
          // If FPS is too low, switch to fallback
          if (fps < 15) {
            console.warn('Low FPS detected, switching to fallback');
            setAnimationFallback(true);
            return;
          }
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nodes = nodesRef.current;
        const edges = edgesRef.current;

        // Update node positions and neural activity
        nodes.forEach(node => {
          node.x += node.vx;
          node.y += node.vy;

          // Bounce off edges
          if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
          if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

          // Keep in bounds
          node.x = Math.max(0, Math.min(canvas.width, node.x));
          node.y = Math.max(0, Math.min(canvas.height, node.y));

          // Neural firing patterns
          node.pulsePhase += node.isHub ? 0.02 : 0.015;

          // Color changes
          const activityRate = node.isHub ? 8 : 10;
          if (timeRef.current - node.lastColorChange > activityRate + Math.random() * 5) {
            node.colorIndex = (node.colorIndex + 1) % colors.length;
            node.color = colors[node.colorIndex];
            node.lastColorChange = timeRef.current;
          }
        });

        // Update synaptic activity
        edges.forEach(edge => {
          edge.pulsePhase += 0.008 + (edge.strength * 0.01);
          
          const plasticityRate = 5 + Math.random() * 4;
          if (timeRef.current - edge.lastColorChange > plasticityRate) {
            edge.colorIndex = (edge.colorIndex + 1) % colors.length;
            edge.lastColorChange = timeRef.current;
          }
        });

        // Draw synaptic connections
        edges.forEach(edge => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          
          const transmissionIntensity = 0.2 + edge.strength * 0.3 * (Math.sin(edge.pulsePhase) * 0.5 + 0.5);
          const edgeColor = colors[edge.colorIndex];
          
          const r = parseInt(edgeColor.slice(1, 3), 16);
          const g = parseInt(edgeColor.slice(3, 5), 16);
          const b = parseInt(edgeColor.slice(5, 7), 16);
          
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${transmissionIntensity})`;
          ctx.lineWidth = 0.3 + edge.strength * 0.5;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        });

        // Draw neurons
        nodes.forEach(node => {
          const firingIntensity = node.size + Math.sin(node.pulsePhase) * (node.isHub ? 1.5 : 1);
          const neuralActivity = 0.6 + 0.4 * (Math.sin(node.pulsePhase) * 0.5 + 0.5);
          
          const r = parseInt(node.color.slice(1, 3), 16);
          const g = parseInt(node.color.slice(3, 5), 16);
          const b = parseInt(node.color.slice(5, 7), 16);
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${neuralActivity})`;
          ctx.strokeStyle = node.color;
          ctx.lineWidth = node.isHub ? 1 : 0.8;
          
          ctx.shadowBlur = 0;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, firingIntensity, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          if (node.isHub) {
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.arc(node.x, node.y, firingIntensity + 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Animation error, switching to fallback:', error);
        setAnimationFallback(true);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isSlowConnection, prefersReducedMotion, animationFallback]);

  // Fallback for slow connections, reduced motion, or performance issues
  if (isSlowConnection || prefersReducedMotion || animationFallback) {
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
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ background: '#000000' }}
      />
      
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
