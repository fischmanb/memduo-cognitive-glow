
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

    // Check connection speed - but don't disable animation for Safari automatically
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && !isSafariBrowser) {
      const slowConnections = ['slow-2g', '2g'];
      const effectiveSpeed = connection.downlink || 0;
      if (slowConnections.includes(connection.effectiveType) || effectiveSpeed < 1) {
        setIsSlowConnection(true);
      }
    }

    // Only disable for very old Safari versions or extremely slow devices
    if (isSafariBrowser && window.devicePixelRatio > 2.5) {
      setIsSlowConnection(true);
    }
  }, []);

  useEffect(() => {
    if (isSlowConnection || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Safari-optimized canvas context
    const contextOptions = isSafari ? {
      alpha: true,
      desynchronized: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default' as const
    } : {
      alpha: true,
      willReadFrequently: false,
      powerPreference: 'high-performance' as const
    };

    const ctx = canvas.getContext('2d', contextOptions) as CanvasRenderingContext2D | null;
    
    if (!ctx) return;

    console.log('Starting Safari-optimized animation setup');

    // Safari-optimized canvas sizing
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Safari optimization - use lower DPR for better performance
      const safeDpr = isSafari ? Math.min(dpr, 1.5) : dpr;
      
      canvas.width = rect.width * safeDpr;
      canvas.height = rect.height * safeDpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(safeDpr, safeDpr);
      
      // Safari-specific rendering optimizations
      if (isSafari) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate neural network - Safari optimized
    const generateNeuralNetwork = () => {
      const nodeCount = isSafari ? 18 : 25;
      const hubRatio = 0.15;
      const layers = 3;
      
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        const layer = Math.floor(i / (nodeCount / layers));
        const isHub = Math.random() < hubRatio;
        
        nodes.push({
          id: i,
          x: Math.random() * (canvas.style.width ? parseInt(canvas.style.width) : window.innerWidth),
          y: Math.random() * (canvas.style.height ? parseInt(canvas.style.height) : window.innerHeight),
          vx: (Math.random() - 0.5) * (isSafari ? 0.15 : 0.2),
          vy: (Math.random() - 0.5) * (isSafari ? 0.15 : 0.2),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: isHub ? (isSafari ? 5 : 6) + Math.random() * 2 : (isSafari ? 2.5 : 3) + Math.random() * 1.5,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          colorIndex: Math.floor(Math.random() * colors.length),
          lastColorChange: 0,
          isHub,
          layer
        });
      }

      const edges: Edge[] = [];
      
      // Create connections with Safari optimization
      const hubs = nodes.filter(n => n.isHub);
      const regularNodes = nodes.filter(n => !n.isHub);
      
      hubs.forEach(hub => {
        const targetConnections = isSafari ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
        const availableNodes = nodes.filter(n => n.id !== hub.id);
        
        availableNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(hub.x - a.x, 2) + Math.pow(hub.y - a.y, 2));
          const distB = Math.sqrt(Math.pow(hub.x - b.x, 2) + Math.pow(hub.y - b.y, 2));
          return (distA + Math.random() * 200) - (distB + Math.random() * 200);
        });
        
        for (let i = 0; i < Math.min(targetConnections, availableNodes.length); i++) {
          const target = availableNodes[i];
          if (!hub.connections.includes(target.id)) {
            const strength = hub.isHub && target.isHub ? 0.7 : 0.5;
            
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
      
      regularNodes.forEach(node => {
        if (node.connections.length < 2) {
          const targetConnections = 1 + Math.floor(Math.random() * (isSafari ? 1 : 2));
          const nearbyNodes = nodes
            .filter(n => n.id !== node.id && !node.connections.includes(n.id))
            .sort((a, b) => {
              const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2));
              const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2));
              return distA - distB;
            });
          
          for (let i = 0; i < Math.min(targetConnections, nearbyNodes.length); i++) {
            const target = nearbyNodes[i];
            const strength = 0.3 + Math.random() * 0.2;
            
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
      console.log('Safari-optimized neural network generated with', nodes.length, 'nodes and', edges.length, 'edges');
    };

    generateNeuralNetwork();

    // Safari-optimized animation loop
    const animate = () => {
      const animationSpeed = isSafari ? 0.008 : 0.01;
      timeRef.current += animationSpeed;
      
      const canvasWidth = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
      const canvasHeight = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
      
      // Safari-optimized clearing
      if (isSafari) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Update node positions with Safari optimization
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= canvasWidth) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvasHeight) node.vy *= -1;

        node.x = Math.max(0, Math.min(canvasWidth, node.x));
        node.y = Math.max(0, Math.min(canvasHeight, node.y));

        const pulseSpeed = isSafari ? 0.015 : 0.03;
        node.pulsePhase += node.isHub ? pulseSpeed : pulseSpeed * 0.7;

        const activityRate = isSafari ? 15 : 8;
        if (timeRef.current - node.lastColorChange > activityRate + Math.random() * 5) {
          node.colorIndex = (node.colorIndex + 1) % colors.length;
          node.color = colors[node.colorIndex];
          node.lastColorChange = timeRef.current;
        }
      });

      // Update edges with Safari optimization
      edges.forEach(edge => {
        const pulseSpeed = isSafari ? 0.008 : 0.01;
        edge.pulsePhase += pulseSpeed + (edge.strength * pulseSpeed);
        
        const plasticityRate = isSafari ? 12 : 5;
        if (timeRef.current - edge.lastColorChange > plasticityRate + Math.random() * 4) {
          edge.colorIndex = (edge.colorIndex + 1) % colors.length;
          edge.lastColorChange = timeRef.current;
        }
      });

      // Draw connections with Safari optimization
      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        const transmissionIntensity = 0.15 + edge.strength * (isSafari ? 0.25 : 0.3) * (Math.sin(edge.pulsePhase) * 0.5 + 0.5);
        const edgeColor = colors[edge.colorIndex];
        
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${transmissionIntensity})`;
        ctx.lineWidth = 0.2 + edge.strength * (isSafari ? 0.4 : 0.5);
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Draw nodes with Safari optimization
      nodes.forEach(node => {
        const firingIntensity = node.size + Math.sin(node.pulsePhase) * (node.isHub ? (isSafari ? 1.2 : 1.5) : (isSafari ? 0.8 : 1));
        const neuralActivity = 0.5 + 0.4 * (Math.sin(node.pulsePhase) * 0.5 + 0.5);
        
        const r = parseInt(node.color.slice(1, 3), 16);
        const g = parseInt(node.color.slice(3, 5), 16);
        const b = parseInt(node.color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${neuralActivity})`;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = node.isHub ? (isSafari ? 0.8 : 1) : (isSafari ? 0.6 : 0.8);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, firingIntensity, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        if (node.isHub) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
          ctx.lineWidth = 0.2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, firingIntensity + (isSafari ? 2 : 3), 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Use requestAnimationFrame for all browsers including Safari
      animationRef.current = requestAnimationFrame(animate);
    };

    console.log('Starting Safari-compatible animation');
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isSlowConnection, prefersReducedMotion, isSafari]);

  // Only show fallback for actual slow connections or reduced motion preference
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
