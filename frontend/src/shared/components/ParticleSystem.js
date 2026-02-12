import React, { useEffect, useRef } from 'react';

const ParticleSystem = ({ type = 'success', active = false }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Criar partículas baseado no tipo
    const createParticles = () => {
      const particles = [];
      const count = type === 'success' ? 50 : type === 'achievement' ? 100 : 30;
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: type === 'achievement' ? canvas.height : Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: type === 'achievement' ? -Math.random() * 8 - 2 : (Math.random() - 0.5) * 4,
          size: Math.random() * 6 + 2,
          color: getParticleColor(type),
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          life: 1
        });
      }
      return particles;
    };

    const getParticleColor = (type) => {
      const colors = {
        success: ['#6BCB77', '#4CAF50', '#FFD93D'],
        error: ['#FF6B6B', '#d32f2f', '#FF9B9B'],
        achievement: ['#FFD93D', '#FFC107', '#FF9B9B', '#667eea'],
        combo: ['#667eea', '#764ba2', '#6BCB77']
      };
      const colorArray = colors[type] || colors.success;
      return colorArray[Math.floor(Math.random() * colorArray.length)];
    };

    particlesRef.current = createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        // Atualizar posição
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravidade
        particle.rotation += particle.rotationSpeed;
        particle.life -= 0.01;
        particle.alpha = particle.life;

        // Desenhar partícula
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        if (type === 'achievement') {
          // Estrelas para conquistas
          drawStar(ctx, 0, 0, 5, particle.size, particle.size / 2, particle.color);
        } else {
          // Círculos para outros tipos
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        return particle.life > 0 && particle.y < canvas.height + 50;
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, type]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

export default ParticleSystem;
