"use client";

import { useEffect, useRef, useCallback } from "react";

export default function HeroRunner() {
  const ref = useRef<HTMLCanvasElement>(null);
  const anim = useRef<number>(0);
  const scrollX = useRef(0);
  const botRef = useRef({ y: 0, vy: 0, grounded: true, frame: 0, ft: 0, cooldown: 0 });
  const scoreRef = useRef(0);
  const partsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
  const collRef = useRef(new Set<string>());
  const mouthRef = useRef(0);

  const LOOP = 2000;
  const OBS = [400, 800, 1200, 1650];
  const COINS: [number, number][] = [
    [180, 1], [240, 1], [540, 0], [600, 0], [660, 0],
    [950, 1], [1010, 1], [1370, 0], [1430, 0], [1800, 1], [1860, 1],
  ];

  const GHOST_COLORS = ["#DC2626", "#FF69B4", "#00BFFF", "#FFA500"];

  const drawPacman = (
    ctx: CanvasRenderingContext2D, x: number, y: number,
    frame: number, jumping: boolean, sz: number, mouthOpen: number
  ) => {
    const s = sz;
    ctx.save();
    ctx.translate(x, y);

    if (!jumping) {
      ctx.beginPath();
      ctx.ellipse(0, s * 0.55, s * 0.4, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fill();
    }

    const mouth = mouthOpen * 0.8;
    const wobble = Math.sin(frame * 0.5) * 0.05;

    ctx.beginPath();
    ctx.arc(0, wobble * s, s * 0.45, mouth + 0.01, Math.PI * 2 - mouth - 0.01);
    ctx.lineTo(0, wobble * s);
    ctx.closePath();
    ctx.fillStyle = "#E8A820";
    ctx.fill();

    const eyeX = s * 0.08;
    const eyeY = -s * 0.18 + wobble * s;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + s * 0.02, eyeY - s * 0.02, s * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();

    ctx.restore();
  };

  const drawDot = (
    ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, isPower: boolean
  ) => {
    const r = isPower ? sz * 0.25 : sz * 0.12;
    if (isPower) {
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232,168,32,0.06)";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isPower ? "#FDE68A" : "#E8A820";
    ctx.fill();
  };

  const drawGhost = (
    ctx: CanvasRenderingContext2D, x: number, y: number,
    sz: number, colorIdx: number, frame: number
  ) => {
    const s = sz;
    const gc = GHOST_COLORS[colorIdx % 4];
    const wobble = Math.sin(frame * 0.3 + colorIdx) * s * 0.03;
    ctx.save();
    ctx.translate(x, y + wobble);

    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.38, Math.PI, 0);
    ctx.lineTo(s * 0.38, s * 0.25);
    const segs = 5;
    const segW = (s * 0.76) / segs;
    for (let i = 0; i < segs; i++) {
      const bx = s * 0.38 - i * segW;
      const waveY = i % 2 === 0 ? s * 0.35 : s * 0.25;
      ctx.lineTo(bx - segW / 2, waveY);
      ctx.lineTo(bx - segW, s * 0.25);
    }
    ctx.closePath();
    ctx.fillStyle = gc;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-s * 0.13, -s * 0.12, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.13, -s * 0.12, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s * 0.16, -s * 0.1, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.1, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A";
    ctx.fill();

    ctx.restore();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const draw = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const speed = 0.8;
    scrollX.current += speed;
    const sx = scrollX.current;
    const groundY = h * 0.78;
    const botX = w * 0.18;
    const sz = Math.max(18, Math.min(32, w * 0.03));
    const jumpH = h * 0.14;

    const bot = botRef.current;
    if (!bot.y) bot.y = groundY;

    if (bot.cooldown > 0) bot.cooldown -= speed;
    if (bot.grounded && bot.cooldown <= 0) {
      let nearestDist = Infinity;
      for (let offset = 0; offset <= 1; offset++) {
        const base = Math.floor(sx / LOOP) * LOOP + offset * LOOP;
        for (const ox of OBS) {
          const screenX = base + ox - sx;
          const dist = screenX - botX;
          if (dist > 0 && dist < nearestDist) nearestDist = dist;
        }
        for (const [cx, air] of COINS) {
          if (!air) continue;
          const screenX = base + cx - sx;
          const dist = screenX - botX;
          if (dist > 0 && dist < nearestDist) nearestDist = dist;
        }
      }
      if (nearestDist < 28 && nearestDist > 0) {
        bot.vy = -Math.sqrt(2 * 0.18 * jumpH);
        bot.grounded = false;
        bot.cooldown = 50;
      }
    }

    if (!bot.grounded) {
      bot.vy += 0.18;
      bot.y += bot.vy;
      if (bot.y >= groundY) {
        bot.y = groundY;
        bot.vy = 0;
        bot.grounded = true;
      }
    }

    bot.ft += speed;
    if (bot.ft > 8) {
      bot.frame++;
      bot.ft = 0;
    }

    // Ground line
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "#C8C4BA";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY + sz * 0.5);
    ctx.lineTo(w, groundY + sz * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Background nodes
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 12; i++) {
      const nx = ((i * 147 + sx * 0.04) % (w + 200)) - 100;
      const ny = h * 0.18 + Math.sin(i * 2.1 + sx * 0.002) * h * 0.07;
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#1A1A1A";
      ctx.fill();
      if (i < 11) {
        const nx2 = (((i + 1) * 147 + sx * 0.04) % (w + 200)) - 100;
        const ny2 = h * 0.18 + Math.sin((i + 1) * 2.1 + sx * 0.002) * h * 0.07;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx2, ny2);
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    const parts = partsRef.current;
    const coll = collRef.current;
    const cycle = Math.floor(sx / LOOP);

    for (let offset = 0; offset <= 1; offset++) {
      const base = cycle * LOOP + offset * LOOP;

      for (let oi = 0; oi < OBS.length; oi++) {
        const screenX = base + OBS[oi] - sx;
        if (screenX > -60 && screenX < w + 60) {
          drawGhost(ctx, screenX, groundY - sz * 0.2, sz, oi, bot.frame);
        }
      }

      for (let ci = 0; ci < COINS.length; ci++) {
        const [cx, air] = COINS[ci];
        const screenX = base + cx - sx;
        if (screenX < -60 || screenX > w + 60) continue;

        const coinCycle = Math.floor((base + cx) / LOOP);
        const key = `${coinCycle}_${ci}`;
        const coinY = air ? groundY - jumpH * 0.45 : groundY - sz * 0.8;
        const bob = Math.sin(sx * 0.02 + cx * 0.01) * 3;

        const dx = Math.abs(screenX - botX);
        const dy = Math.abs(coinY + bob - (bot.y - sz * 0.3));
        if (dx < sz * 1.5 && dy < sz * 1.5 && !coll.has(key)) {
          coll.add(key);
          scoreRef.current++;
          mouthRef.current = 1;
          for (let p = 0; p < 6; p++) {
            parts.push({
              x: screenX,
              y: coinY,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.7) * 3,
              life: 1,
            });
          }
        }

        if (!coll.has(key)) drawDot(ctx, screenX, coinY + bob, sz, !!air);
      }
    }

    if (coll.size > 200) {
      const arr = Array.from(coll);
      for (let i = 0; i < 100; i++) coll.delete(arr[i]);
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life -= 0.02;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = "#E8A820";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (mouthRef.current > 0) mouthRef.current = Math.max(0, mouthRef.current - 0.04);

    drawPacman(ctx, botX, bot.y, bot.frame, !bot.grounded, sz, mouthRef.current);

    anim.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    // Pause animation when hero is not visible
    const canvas = ref.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          anim.current = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(anim.current);
        }
      },
      { threshold: 0 }
    );

    observer.observe(canvas);
    anim.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(anim.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
