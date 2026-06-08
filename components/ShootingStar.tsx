"use client";

import { useEffect, useRef } from "react";

interface StarConfig {
  sxRatio: number; syRatio: number;
  exRatio: number; eyRatio: number;
  offset: number;  // 사이클 내 시작 오프셋 (ms)
  tail: number;
  lineWidth: number;
}

const STARS: StarConfig[] = [
  // 첫 번째: 우측 상단 → 좌측 하단
  { sxRatio: 0.92, syRatio: 0.04, exRatio: 0.05, eyRatio: 0.78, offset: 0,    tail: 160, lineWidth: 1.8 },
  // 두 번째: 약간 안쪽에서 시작, 0.6초 뒤에 출발
  { sxRatio: 0.80, syRatio: 0.10, exRatio: 0.12, eyRatio: 0.65, offset: 600,  tail: 120, lineWidth: 1.4 },
];

const CYCLE    = 5000;
const DURATION = 900;

function drawStar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  star: StarConfig,
  elapsed: number
) {
  const t = (elapsed - star.offset + CYCLE) % CYCLE;
  if (t >= DURATION) return;

  const p = t / DURATION;
  const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

  const sx = canvas.width  * star.sxRatio;
  const sy = canvas.height * star.syRatio;
  const ex = canvas.width  * star.exRatio;
  const ey = canvas.height * star.eyRatio;

  const hx = sx + (ex - sx) * ease;
  const hy = sy + (ey - sy) * ease;

  const dx = ex - sx, dy = ey - sy;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;

  const tx = hx - ux * star.tail;
  const ty = hy - uy * star.tail;

  const opacity = p < 0.15
    ? p / 0.15
    : p > 0.75
    ? 1 - (p - 0.75) / 0.25
    : 1;

  const grad = ctx.createLinearGradient(tx, ty, hx, hy);
  grad.addColorStop(0,   `rgba(255,255,255,0)`);
  grad.addColorStop(0.6, `rgba(255,255,255,${opacity * 0.35})`);
  grad.addColorStop(1,   `rgba(255,255,255,${opacity * 0.92})`);

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = grad;
  ctx.lineWidth = star.lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 6);
  glow.addColorStop(0, `rgba(255,255,255,${opacity * 0.9})`);
  glow.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.beginPath();
  ctx.arc(hx, hy, 6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(hx, hy, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.fill();
}

export default function ShootingStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const cvs = canvas;

    function draw(timestamp: number) {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const elapsed = timestamp % CYCLE;
      for (const star of STARS) drawStar(ctx, cvs, star, elapsed);
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hidden lg:block"
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
