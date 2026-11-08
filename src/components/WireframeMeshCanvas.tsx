'use client';

import React, { useEffect, useRef } from 'react';

export const WireframeMeshCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const cols = 12;
    const rows = 6;
    const points: Array<{
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      phase: number;
      speed: number;
    }> = [];

    const initPoints = () => {
      points.length = 0;
      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitterX = c === 0 || c === cols - 1 ? 0 : (Math.random() - 0.5) * cellW * 0.6;
          const jitterY = r === 0 || r === rows - 1 ? 0 : (Math.random() - 0.5) * cellH * 0.6;
          const bx = c * cellW + jitterX;
          const by = r * cellH + jitterY;
          points.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            phase: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.01,
          });
        }
      }
    };

    initPoints();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initPoints();
    };

    window.addEventListener('resize', handleResize);

    let tick = 0;
    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // Gently animate mesh vertices
      for (const p of points) {
        p.x = p.baseX + Math.sin(tick * p.speed + p.phase) * 12;
        p.y = p.baseY + Math.cos(tick * p.speed + p.phase) * 10;
      }

      // Draw triangulated wireframe polygons
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const tl = points[r * cols + c];
          const tr = points[r * cols + c + 1];
          const bl = points[(r + 1) * cols + c];
          const br = points[(r + 1) * cols + c + 1];

          const shade1 = 0.03 + 0.04 * Math.abs(Math.sin(r * 0.7 + c * 0.5 + tick * 0.005));
          const shade2 = 0.02 + 0.04 * Math.abs(Math.cos(r * 0.5 + c * 0.8 + tick * 0.004));

          // Triangle 1
          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y);
          ctx.lineTo(tr.x, tr.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(16, 185, 129, ${shade1})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Triangle 2
          ctx.beginPath();
          ctx.moveTo(tr.x, tr.y);
          ctx.lineTo(br.x, br.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(16, 185, 129, ${shade2})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
};
