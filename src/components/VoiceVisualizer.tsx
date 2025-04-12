
import React, { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  active: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 10;
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener("resize", handleResize);
    
    let bars: number[] = [];
    const barCount = 60;
    
    for (let i = 0; i < barCount; i++) {
      bars.push(Math.random() * 0.8 + 0.2); // Initial random heights between 0.2 and 1
    }
    
    const draw = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update bar heights if active
      if (active) {
        bars = bars.map(() => 
          Math.min(1, Math.max(0.2, Math.random() * 0.8 + 0.2))
        );
      } else {
        // If not active, gradually reduce heights
        bars = bars.map(height => 
          Math.max(0.1, height * 0.95)
        );
      }
      
      // Draw circular visualizer
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(155, 135, 245, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw pulsing inner circle
      ctx.beginPath();
      const pulsingRadius = maxRadius * 0.4 * (active ? (0.8 + Math.sin(Date.now() / 500) * 0.2) : 0.8);
      ctx.arc(centerX, centerY, pulsingRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(155, 135, 245, 0.3)";
      ctx.fill();
      
      // Draw visualization bars
      const barWidth = 3;
      ctx.lineWidth = barWidth;
      
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const height = bars[i] * maxRadius * 0.5;
        
        const innerX = centerX + Math.cos(angle) * maxRadius * 0.5;
        const innerY = centerY + Math.sin(angle) * maxRadius * 0.5;
        
        const outerX = centerX + Math.cos(angle) * (maxRadius * 0.5 + height);
        const outerY = centerY + Math.sin(angle) * (maxRadius * 0.5 + height);
        
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        
        // Gradient color
        const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
        gradient.addColorStop(0, "rgba(155, 135, 245, 0.5)");
        gradient.addColorStop(1, "rgba(155, 135, 245, 0.8)");
        ctx.strokeStyle = gradient;
        
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full" 
    />
  );
};

export default VoiceVisualizer;
