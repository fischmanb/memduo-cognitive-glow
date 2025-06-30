
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
  const [isSafari, setIsSafari] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const timeRef = useRef<number>(0);

  const colors = ["#00ffff", "#00ccff", "#33aaff", "#6699ff", "#9966ff", "#9b59ff"];

  useEffect(() => {
    // Check for Safari browser
    const userAgent = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent) || 
                          /iPad|iPhone|iPod/.test(userAgent);
    setIsSafari(isSafariBrowser);

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

    // Safari performance optimization
    if (isSafariBrowser && window.devicePixelRatio > 1) {
      setIsSlowConnection(true);
    }
  }, []);

  useEffect(() => {
    if (isSlowConnection || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      // Safari optimization
      willReadFrequently: false,
      powerPreference: 'high-performance'
    }) as CanvasRenderingContext2D | null;
    
    if (!ctx) return;

    console.log('Starting animation setup');

    // Set canvas size with device pixel ratio support
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Safari optimization - limit DPR for performance
      const safeDpr = isSafari ? Math.min(dpr, 2) : dpr;
      
      canvas.width = rect.width * safeDpr;
      canvas.height = rect.height * safeDpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(safeDpr, safeDpr);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate biologically-inspired neural network
    const generateNeuralNetwork = () => {
      const nodeCount = isSafari ? 20 : 25; // Reduce nodes for Safari
      const hubRatio = 0.15;
      const layers = 3;
      
      // Create nodes with biological properties
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        const layer = Math.floor(i / (nodeCount / layers));
        const isHub = Math.random() < hubRatio;
        
        nodes.push({
          id: i,
          x: Math.random() * (canvas.style.width ? parseInt(canvas.style.width) : window.innerWidth),
          y: Math.random() * (canvas.style.height ? parseInt(canvas.style.height) : window.innerHeight),
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
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
        const targetConnections = 3 + Math.floor(Math.random() * 3);
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
          const targetConnections = 1 + Math.floor(Math.random() * 2);
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
      console.log('Neural network generated with', nodes.length, 'nodes and', edges.length, 'edges');
    };

    generateNeuralNetwork();

    // Animation loop with Safari optimizations
    const animate = () => {
      const animationSpeed = isSafari ? 0.005 : 0.01;
      timeRef.current += animationSpeed;
      
      // Clear with solid background for better performance
      const canvasWidth = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
      const canvasHeight = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Update node positions and neural activity
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvasWidth) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvasHeight) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvasWidth, node.x));
        node.y = Math.max(0, Math.min(canvasHeight, node.y));

        // Neural firing patterns - slower for Safari
        const pulseSpeed = isSafari ? 0.02 : 0.03;
        node.pulsePhase += node.isHub ? pulseSpeed : pulseSpeed * 0.7;

        // Color changes - less frequent for Safari
        const activityRate = isSafari ? 12 : 8;
        if (timeRef.current - node.lastColorChange > activityRate + Math.random() * 5) {
          node.colorIndex = (node.colorIndex + 1) % colors.length;
          node.color = colors[node.colorIndex];
          node.lastColorChange = timeRef.current;
        }
      });

      // Update synaptic activity
      edges.forEach(edge => {
        const pulseSpeed = isSafari ? 0.005 : 0.01;
        edge.pulsePhase += pulseSpeed + (edge.strength * pulseSpeed);
        
        const plasticityRate = isSafari ? 8 : 5;
        if (timeRef.current - edge.lastColorChange > plasticityRate + Math.random() * 4) {
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
        
        // Parse hex color with Safari compatibility
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
        
        // Parse hex color with Safari compatibility
        const r = parseInt(node.color.slice(1, 3), 16);
        const g = parseInt(node.color.slice(3, 5), 16);
        const b = parseInt(node.color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${neuralActivity})`;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = node.isHub ? 1 : 0.8;
        
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

      // Use appropriate animation method for Safari
      if (isSafari) {
        // Use setTimeout for Safari for better performance
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 16);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    console.log('Starting animation');
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isSlowConnection, prefersReducedMotion, isSafari]);

  // Fallback for slow connections, reduced motion, or Safari with performance issues
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
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ 
          background: '#000000',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Overlay for text legibility with Safari compatibility */}
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
