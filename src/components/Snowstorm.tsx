import { useEffect, useRef, useState } from 'react';

export default function Snowstorm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('ice-intro') === '1';
    if (reduce || seen) { setDone(true); return; }
    sessionStorage.setItem('ice-intro', '1');

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    const flakes = Array.from({ length: 220 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.6 + 0.6, s: Math.random() * 2 + 1.5, drift: Math.random() * 1.5 + 0.8,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (const f of flakes) {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        f.y += f.s; f.x += f.drift; // diagonal "blown" snow
        if (f.y > h) { f.y = -5; f.x = Math.random() * w; }
        if (f.x > w) f.x = -5;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const timer = window.setTimeout(() => setDone(true), 1200);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, []);

  if (done) return null;
  return (
    <div
      className="snow-overlay"
      onAnimationEnd={(e) => { if (e.animationName === 'snowOut') setDone(true); }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <span className="snow-mark" aria-hidden="true">IceGames</span>
      <style>{`
        .snow-overlay { position: fixed; inset: 0; z-index: 100; background:
          radial-gradient(60% 60% at 50% 40%, #ffffff, #dcebf8 60%, #c6def2);
          animation: snowOut 0.6s ease 1.2s forwards; }
        .snow-mark { position: absolute; inset: 0; display: grid; place-items: center;
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: clamp(1.5rem, 6vw, 3rem);
          color: #0a1a2b; letter-spacing: 0.02em; }
        @keyframes snowOut { to { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}
