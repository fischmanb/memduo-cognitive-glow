
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
}

interface Edge {
  from: number;
  to: number;
  opacity: number;
  pulsePhase: number;
  colorIndex: number;
  lastColorChange: number;
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

    // Generate connected graph - REVERTED TO PREVIOUS STRUCTURE
    const generateConnectedGraph = () => {
      const nodeCount = 15;
      
      // Create nodes with animation properties
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 8 + Math.random() * 8,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          colorIndex: Math.floor(Math.random() * colors.length),
          lastColorChange: 0
        });
      }

      // Create minimum spanning tree to ensure connectivity
      const edges: Edge[] = [];
      const connected = new Set([0]); // Start with first node
      const unconnected = new Set(Array.from({length: nodeCount}, (_, i) => i).slice(1));

      // Build MST
      while (unconnected.size > 0) {
        let minDist = Infinity;
        let bestConnection: {from: number, to: number} | null = null;

        for (const connectedNode of connected) {
          for (const unconnectedNode of unconnected) {
            const dist = Math.sqrt(
              Math.pow(nodes[connectedNode].x - nodes[unconnectedNode].x, 2) +
              Math.pow(nodes[connectedNode].y - nodes[unconnectedNode].y, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              bestConnection = {from: connectedNode, to: unconnectedNode};
            }
          }
        }

        if (bestConnection) {
          edges.push({
            from: bestConnection.from, 
            to: bestConnection.to, 
            opacity: 0.8,
            pulsePhase: Math.random() * Math.PI * 2,
            colorIndex: Math.floor(Math.random() * colors.length),
            lastColorChange: 0
          });
          nodes[bestConnection.from].connections.push(bestConnection.to);
          nodes[bestConnection.to].connections.push(bestConnection.from);
          connected.add(bestConnection.to);
          unconnected.delete(bestConnection.to);
        }
      }

      // Add additional edges to ensure >85% nodes have 2+ connections
      const targetConnections = Math.ceil(nodeCount * 0.85);
      let nodesWithTwoPlus = nodes.filter(n => n.connections.length >= 2).length;

      while (nodesWithTwoPlus < targetConnections) {
        // Find nodes with < 2 connections
        const needMore = nodes.filter(n => n.connections.length < 2);
        if (needMore.length === 0) break;

        for (const node of needMore) {
          // Find closest unconnected node
          let closestDist = Infinity;
          let closestNode = -1;

          for (let i = 0; i < nodeCount; i++) {
            if (i === node.id || node.connections.includes(i)) continue;
            
            const dist = Math.sqrt(
              Math.pow(node.x - nodes[i].x, 2) +
              Math.pow(node.y - nodes[i].y, 2)
            );
            
            if (dist < closestDist && dist < 300) { // Reasonable visual distance
              closestDist = dist;
              closestNode = i;
            }
          }

          if (closestNode !== -1) {
            edges.push({
              from: node.id, 
              to: closestNode, 
              opacity: 0.7,
              pulsePhase: Math.random() * Math.PI * 2,
              colorIndex: Math.floor(Math.random() * colors.length),
              lastColorChange: 0
            });
            node.connections.push(closestNode);
            nodes[closestNode].connections.push(node.id);
          }
        }

        nodesWithTwoPlus = nodes.filter(n => n.connections.length >= 2).length;
      }

      nodesRef.current = nodes;
      edgesRef.current = edges;
    };

    generateConnectedGraph();

    // Animation loop
    const animate = () => {
      timeRef.current += 0.02;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Update node positions and animations
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Update pulse phase
        node.pulsePhase += 0.05;

        // Change color periodically
        if (timeRef.current - node.lastColorChange > 3 + Math.random() * 4) {
          node.colorIndex = (node.colorIndex + 1) % colors.length;
          node.color = colors[node.colorIndex];
          node.lastColorChange = timeRef.current;
        }
      });

      // Update edge animations
      edges.forEach(edge => {
        edge.pulsePhase += 0.03;
        
        // Change edge color periodically
        if (timeRef.current - edge.lastColorChange > 2 + Math.random() * 3) {
          edge.colorIndex = (edge.colorIndex + 1) % colors.length;
          edge.lastColorChange = timeRef.current;
        }
      });

      // Draw edges with pulsing effect
      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        // Pulsing opacity
        const pulseOpacity = 0.3 + 0.5 * Math.sin(edge.pulsePhase);
        const edgeColor = colors[edge.colorIndex];
        
        // Extract RGB values for dynamic opacity
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pulseOpacity})`;
        ctx.lineWidth = 2 + Math.sin(edge.pulsePhase) * 0.5;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = edgeColor;
        ctx.shadowBlur = 5 + Math.sin(edge.pulsePhase) * 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw nodes with pulsing effect
      nodes.forEach(node => {
        // Pulsing size
        const pulseSize = node.size + Math.sin(node.pulsePhase) * 3;
        const pulseOpacity = 0.7 + 0.3 * Math.sin(node.pulsePhase * 1.5);
        
        // Node fill with pulsing opacity
        const r = parseInt(node.color.slice(1, 3), 16);
        const g = parseInt(node.color.slice(3, 5), 16);
        const b = parseInt(node.color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseOpacity})`;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        
        // Add glow effect
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8 + Math.sin(node.pulsePhase) * 4;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    console.log('Animated connected graph generated successfully');

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
