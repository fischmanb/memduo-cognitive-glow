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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const timeRef = useRef<number>(0);

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
  }, []);

  useEffect(() => {
    if (isSlowConnection || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate biologically-inspired neural network
    const generateNeuralNetwork = () => {
      const nodeCount = 40; // Doubled from 20
      const hubRatio = 0.15; // 15% of nodes are hubs
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
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: isHub ? 12 + Math.random() * 8 : 6 + Math.random() * 6,
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
        // Each hub connects to 6-12 other nodes
        const targetConnections = 6 + Math.floor(Math.random() * 7);
        const availableNodes = nodes.filter(n => n.id !== hub.id);
        
        // Sort by distance and connection preference
        availableNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(hub.x - a.x, 2) + Math.pow(hub.y - a.y, 2));
          const distB = Math.sqrt(Math.pow(hub.x - b.x, 2) + Math.pow(hub.y - b.y, 2));
          
          // Prefer closer nodes but with some randomness
          return (distA + Math.random() * 200) - (distB + Math.random() * 200);
        });
        
        for (let i = 0; i < Math.min(targetConnections, availableNodes.length); i++) {
          const target = availableNodes[i];
          if (!hub.connections.includes(target.id)) {
            const strength = hub.isHub && target.isHub ? 0.9 : 0.7;
            
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
      
      // Create local clustering (small-world properties)
      regularNodes.forEach(node => {
        if (node.connections.length < 2) {
          // Find 2-4 nearby nodes to connect
          const targetConnections = 2 + Math.floor(Math.random() * 3);
          const nearbyNodes = nodes
            .filter(n => n.id !== node.id && !node.connections.includes(n.id))
            .sort((a, b) => {
              const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2));
              const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2));
              return distA - distB;
            });
          
          for (let i = 0; i < Math.min(targetConnections, nearbyNodes.length); i++) {
            const target = nearbyNodes[i];
            const strength = 0.5 + Math.random() * 0.3;
            
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
      
      // Add some long-range connections (like corpus callosum)
      const longRangeConnections = Math.floor(nodeCount * 0.1);
      for (let i = 0; i < longRangeConnections; i++) {
        const node1 = nodes[Math.floor(Math.random() * nodeCount)];
        const node2 = nodes[Math.floor(Math.random() * nodeCount)];
        
        if (node1.id !== node2.id && !node1.connections.includes(node2.id)) {
          const strength = 0.4 + Math.random() * 0.4;
          
          edges.push({
            from: node1.id,
            to: node2.id,
            opacity: strength,
            pulsePhase: Math.random() * Math.PI * 2,
            colorIndex: Math.floor(Math.random() * colors.length),
            lastColorChange: 0,
            strength
          });
          
          node1.connections.push(node2.id);
          node2.connections.push(node1.id);
        }
      }

      nodesRef.current = nodes;
      edgesRef.current = edges;
    };

    generateNeuralNetwork();

    // Animation loop with neural-like activity
    const animate = () => {
      timeRef.current += 0.02;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
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

        // Neural firing patterns (faster for hubs)
        node.pulsePhase += node.isHub ? 0.08 : 0.05;

        // Color changes based on neural activity
        const activityRate = node.isHub ? 2 : 4;
        if (timeRef.current - node.lastColorChange > activityRate + Math.random() * 3) {
          node.colorIndex = (node.colorIndex + 1) % colors.length;
          node.color = colors[node.colorIndex];
          node.lastColorChange = timeRef.current;
        }
      });

      // Update synaptic activity
      edges.forEach(edge => {
        // Synaptic transmission speed varies by connection strength
        edge.pulsePhase += 0.02 + (edge.strength * 0.04);
        
        // Synaptic plasticity - connections change over time
        const plasticityRate = 1.5 + Math.random() * 2;
        if (timeRef.current - edge.lastColorChange > plasticityRate) {
          edge.colorIndex = (edge.colorIndex + 1) % colors.length;
          edge.lastColorChange = timeRef.current;
        }
      });

      // Draw synaptic connections with activity-based rendering
      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        // Neural transmission visualization
        const transmissionIntensity = 0.2 + edge.strength * 0.6 * Math.sin(edge.pulsePhase);
        const edgeColor = colors[edge.colorIndex];
        
        // Extract RGB values
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${transmissionIntensity})`;
        ctx.lineWidth = 1 + edge.strength * 2 + Math.sin(edge.pulsePhase) * 0.5;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        
        // Reduced synaptic glow
        ctx.shadowColor = edgeColor;
        ctx.shadowBlur = 2 + edge.strength * 2 + Math.sin(edge.pulsePhase) * 1; // Reduced from 3 + 5 + 2
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw neurons with biological characteristics
      nodes.forEach(node => {
        // Neural firing visualization
        const firingIntensity = node.size + Math.sin(node.pulsePhase) * (node.isHub ? 5 : 3);
        const neuralActivity = 0.6 + 0.4 * Math.sin(node.pulsePhase * (node.isHub ? 1.5 : 1));
        
        // Extract RGB values
        const r = parseInt(node.color.slice(1, 3), 16);
        const g = parseInt(node.color.slice(3, 5), 16);
        const b = parseInt(node.color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${neuralActivity})`;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = node.isHub ? 3 : 2;
        
        // Reduced neural glow based on activity
        ctx.shadowColor = node.color;
        ctx.shadowBlur = (node.isHub ? 6 : 4) + Math.sin(node.pulsePhase) * (node.isHub ? 3 : 2); // Reduced from 12/8 + 6/4
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, firingIntensity, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Hub nodes get extra visual emphasis
        if (node.isHub) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, firingIntensity + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    console.log('Neural network visualization generated successfully');

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isSlowConnection, prefersReducedMotion]);

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
