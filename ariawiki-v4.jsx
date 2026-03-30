import { useState, useEffect, useRef, useCallback } from "react";

const CARDS = [
  { title: "Constitutional AI", titleZh: "Constitutional AI：通过AI反馈实现无害性", takeaway: "How AI systems can be trained to be helpful, harmless, and honest", collection: "Papers", difficulty: "Advanced", status: "done", date: "Mar 2026", lang: "EN", coverBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", coverLabel: "ANTHROPIC" },
  { title: "How Cursor built a $B AI editor", titleZh: "Cursor 如何打造十亿美元 AI 编辑器", takeaway: "Deep dive into the product decisions behind Cursor's meteoric rise", collection: "Tech Blogs", difficulty: "Intermediate", status: "reading", date: "Mar 2026", lang: "EN", coverBg: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #3a3a3a 100%)", coverLabel: "CURSOR" },
  { title: "Perplexity product teardown", titleZh: "Perplexity 产品拆解：重新思考搜索", takeaway: "How Perplexity rethought search with AI-first UX patterns", collection: "Products", difficulty: "Intermediate", status: "insight", date: "Feb 2026", lang: "EN", coverBg: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)", coverLabel: "PERPLEXITY" },
  { title: "Approximate Q-learning", titleZh: "10分钟理解近似Q学习", takeaway: "Breaking down feature-based reinforcement learning with clear examples", collection: "TIL", difficulty: "Beginner", status: "done", date: "Feb 2026", lang: "EN", coverBg: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)", coverLabel: "Q-LEARNING" },
  { title: "10 papers for LLM alignment", titleZh: "理解 LLM 对齐的 10 篇论文", takeaway: "A curated reading path from RLHF basics to constitutional AI", collection: "Curated Lists", difficulty: "Intermediate", status: "revisit", date: "Jan 2026", lang: "EN", coverBg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)", coverLabel: "ALIGNMENT" },
  { title: "Anthropic interpretability", titleZh: "Anthropic 模型可解释性研究", takeaway: "New research on understanding what happens inside neural networks", collection: "Tech Blogs", difficulty: "Advanced", status: "reading", date: "Jan 2026", lang: "EN", coverBg: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #4a1942 100%)", coverLabel: "ANTHROPIC" },
];

const FILTERS = ["All", "Papers", "Tech Blogs", "Products", "TIL", "Curated Lists"];
const STATUS_ICONS = { reading: "📖", done: "✅", revisit: "🔁", insight: "💡" };
const COL_COLORS = { Papers: { bg: "#EEF2FF", text: "#4338CA" }, "Tech Blogs": { bg: "#FFF7ED", text: "#B45309" }, Products: { bg: "#ECFDF5", text: "#059669" }, TIL: { bg: "#F5F3FF", text: "#7C3AED" }, "Curated Lists": { bg: "#FEF2F2", text: "#DC2626" } };
const DIFF_COLORS = { Beginner: { bg: "#ECFDF5", text: "#065F46" }, Intermediate: { bg: "#FFF7ED", text: "#92400E" }, Advanced: { bg: "#FEF2F2", text: "#991B1B" } };

/* ===================== HERO RUNNER ===================== */
function HeroRunner() {
  const ref = useRef(null);
  const anim = useRef(null);
  const scrollX = useRef(0);
  const botRef = useRef({ y: 0, vy: 0, grounded: true, frame: 0, ft: 0, cooldown: 0 });
  const scoreRef = useRef(0);
  const partsRef = useRef([]);
  const collRef = useRef(new Set());

  // Fixed level pattern that loops
  const LOOP = 2000;
  const OBS = [400, 800, 1200, 1650];
  const COINS = [[180,1],[240,1],[540,0],[600,0],[660,0],[950,1],[1010,1],[1370,0],[1430,0],[1800,1],[1860,1]];

  // Pac-Man — mouth opens when eating
  const mouthRef = useRef(0); // 0 = closed, decays from 1

  const drawPacman = (ctx, x, y, frame, jumping, sz, mouthOpen) => {
    const s = sz;
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    if (!jumping) {
      ctx.beginPath(); ctx.ellipse(0, s * 0.55, s * 0.4, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.04)"; ctx.fill();
    }

    // Mouth angle: 0 when closed, up to 0.8 rad when open
    const mouth = mouthOpen * 0.8;
    const wobble = Math.sin(frame * 0.5) * 0.05; // subtle body bounce

    // Body — classic pac-man circle with wedge mouth
    ctx.beginPath();
    ctx.arc(0, wobble * s, s * 0.45, mouth + 0.01, Math.PI * 2 - mouth - 0.01);
    ctx.lineTo(0, wobble * s);
    ctx.closePath();
    ctx.fillStyle = "#E8A820";
    ctx.fill();

    // Eye
    const eyeX = s * 0.08;
    const eyeY = -s * 0.18 + wobble * s;
    ctx.beginPath(); ctx.arc(eyeX, eyeY, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A"; ctx.fill();
    ctx.beginPath(); ctx.arc(eyeX + s * 0.02, eyeY - s * 0.02, s * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF"; ctx.fill();

    ctx.restore();
  };

  // Pac-dot — small circle, or power pellet (larger, glowing)
  const drawDot = (ctx, x, y, sz, isPower) => {
    const r = isPower ? sz * 0.25 : sz * 0.12;
    if (isPower) {
      ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232,168,32,0.06)"; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isPower ? "#FDE68A" : "#E8A820"; ctx.fill();
  };

  // Ghost — classic shape
  const GHOST_COLORS = ["#DC2626", "#FF69B4", "#00BFFF", "#FFA500"];
  const drawGhost = (ctx, x, y, sz, colorIdx, frame) => {
    const s = sz;
    const gc = GHOST_COLORS[colorIdx % 4];
    const wobble = Math.sin(frame * 0.3 + colorIdx) * s * 0.03;
    ctx.save();
    ctx.translate(x, y + wobble);

    // Body — dome top + wavy bottom
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.38, Math.PI, 0); // dome
    ctx.lineTo(s * 0.38, s * 0.25);
    // Wavy bottom
    const segs = 5;
    const segW = (s * 0.76) / segs;
    for (let i = 0; i < segs; i++) {
      const bx = s * 0.38 - i * segW;
      const waveY = (i % 2 === 0) ? s * 0.35 : s * 0.25;
      ctx.lineTo(bx - segW / 2, waveY);
      ctx.lineTo(bx - segW, s * 0.25);
    }
    ctx.closePath();
    ctx.fillStyle = gc;
    ctx.fill();

    // Eyes
    ctx.beginPath(); ctx.arc(-s * 0.13, -s * 0.12, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF"; ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.13, -s * 0.12, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF"; ctx.fill();
    // Pupils — looking left (toward pac-man)
    ctx.beginPath(); ctx.arc(-s * 0.16, -s * 0.1, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A"; ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.1, -s * 0.1, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A1A"; ctx.fill();

    ctx.restore();
  };

  const draw = useCallback(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);

    const speed = 0.8;
    scrollX.current += speed;
    const sx = scrollX.current;
    const groundY = h * 0.78;
    const botX = w * 0.18;
    const sz = Math.max(18, Math.min(32, w * 0.03)); // character scale
    const jumpH = h * 0.14;

    const bot = botRef.current;
    if (!bot.y) bot.y = groundY;

    // Auto-jump logic: check nearest obstacle
    if (bot.cooldown > 0) bot.cooldown -= speed;
    if (bot.grounded && bot.cooldown <= 0) {
      let nearestDist = Infinity;
      for (let offset = 0; offset <= 1; offset++) {
        const base = Math.floor(sx / LOOP) * LOOP + offset * LOOP;
        for (const ox of OBS) {
          const screenX = (base + ox) - sx;
          const dist = screenX - botX;
          if (dist > 0 && dist < nearestDist) nearestDist = dist;
        }
        // Also jump for airborne coins
        for (const [cx, air] of COINS) {
          if (!air) continue;
          const screenX = (base + cx) - sx;
          const dist = screenX - botX;
          if (dist > 0 && dist < nearestDist) nearestDist = dist;
        }
      }
      // Jump when obstacle/coin is approaching
      if (nearestDist < 28 && nearestDist > 0) {
        bot.vy = -Math.sqrt(2 * 0.18 * jumpH); // v = sqrt(2*g*h)
        bot.grounded = false;
        bot.cooldown = 50; // frames cooldown after this jump
      }
    }

    // Physics
    if (!bot.grounded) {
      bot.vy += 0.18; // gravity
      bot.y += bot.vy;
      if (bot.y >= groundY) {
        bot.y = groundY;
        bot.vy = 0;
        bot.grounded = true;
      }
    }

    // Animation frame
    bot.ft += speed;
    if (bot.ft > 8) { bot.frame++; bot.ft = 0; }

    // === DRAW ===
    // Ground
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "#C8C4BA"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY + sz * 0.5); ctx.lineTo(w, groundY + sz * 0.5); ctx.stroke();
    ctx.setLineDash([]);

    // Background nodes (very faint)
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 12; i++) {
      const nx = ((i * 147 + sx * 0.04) % (w + 200)) - 100;
      const ny = h * 0.18 + Math.sin(i * 2.1 + sx * 0.002) * h * 0.07;
      ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fillStyle = "#1A1A1A"; ctx.fill();
      if (i < 11) {
        const nx2 = (((i+1)*147+sx*0.04)%(w+200))-100;
        const ny2 = h*0.18+Math.sin((i+1)*2.1+sx*0.002)*h*0.07;
        ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(nx2,ny2); ctx.strokeStyle="#1A1A1A"; ctx.lineWidth=0.4; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Draw items
    const parts = partsRef.current;
    const coll = collRef.current;
    const cycle = Math.floor(sx / LOOP);

    for (let offset = 0; offset <= 1; offset++) {
      const base = cycle * LOOP + offset * LOOP;

      // Obstacles — ghosts
      for (let oi = 0; oi < OBS.length; oi++) {
        const screenX = (base + OBS[oi]) - sx;
        if (screenX > -60 && screenX < w + 60) {
          drawGhost(ctx, screenX, groundY - sz * 0.2, sz, oi, bot.frame);
        }
      }

      // Coins
      for (let ci = 0; ci < COINS.length; ci++) {
        const [cx, air] = COINS[ci];
        const screenX = (base + cx) - sx;
        if (screenX < -60 || screenX > w + 60) continue;

        const coinCycle = Math.floor((base + cx) / LOOP);
        const key = `${coinCycle}_${ci}`;
        const coinY = air ? groundY - jumpH * 0.45 : groundY - sz * 0.8;
        const bob = Math.sin(sx * 0.02 + cx * 0.01) * 3;

        // Collection
        const dx = Math.abs(screenX - botX);
        const dy = Math.abs((coinY + bob) - (bot.y - sz * 0.3));
        if (dx < sz * 1.5 && dy < sz * 1.5 && !coll.has(key)) {
          coll.add(key);
          scoreRef.current++;
          mouthRef.current = 1; // open mouth!
          for (let p = 0; p < 6; p++) {
            parts.push({ x: screenX, y: coinY, vx: (Math.random()-.5)*3, vy: (Math.random()-.7)*3, life: 1 });
          }
        }

        if (!coll.has(key)) drawDot(ctx, screenX, coinY + bob, sz, air);
      }
    }

    // Clean old keys
    if (coll.size > 200) {
      const arr = [...coll]; 
      for (let i = 0; i < 100; i++) coll.delete(arr[i]);
    }

    // Particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= 0.02;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = "#E8A820"; ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Mouth decay
    if (mouthRef.current > 0) mouthRef.current = Math.max(0, mouthRef.current - 0.04);

    // Pac-Man
    drawPacman(ctx, botX, bot.y, bot.frame, !bot.grounded, sz, mouthRef.current);


    anim.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => { anim.current = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim.current); }, [draw]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ===================== MAIN ===================== */
export default function AriaWiki() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lang, setLang] = useState("en");
  const [scrollY, setScrollY] = useState(0);
  const [viewHover, setViewHover] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => { if (cursorRef.current) cursorRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`; };
    const onOver = (e) => { if (e.target.closest("[data-hover]") && cursorRef.current) cursorRef.current.classList.add("ch"); };
    const onOut = (e) => { if (e.target.closest("[data-hover]") && cursorRef.current) cursorRef.current.classList.remove("ch"); };
    const onScroll = () => setScrollY(window.scrollY);
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseover", onOver); document.removeEventListener("mouseout", onOut); window.removeEventListener("scroll", onScroll); };
  }, []);

  const filtered = activeFilter === "All" ? CARDS : CARDS.filter(c => c.collection === activeFilter);

  return (
    <div style={{ fontFamily: '"DM Sans","Noto Sans SC",sans-serif', background: "#FAF9F6", minHeight: "100vh", cursor: "none" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&family=DM+Mono:wght@400;500&family=Noto+Sans+SC:wght@300;400;500;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`
        .cc{position:fixed;top:0;left:0;width:18px;height:18px;border-radius:50%;background:#E8A820;pointer-events:none;z-index:9999;will-change:transform;transition:width .2s,height .2s;mix-blend-mode:multiply;opacity:.9}
        .cc.ch{width:44px;height:44px}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes heroReveal{from{opacity:0;transform:translateY(50px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes subtitleIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .ci{transition:transform .35s cubic-bezier(.4,0,.2,1),box-shadow .35s cubic-bezier(.4,0,.2,1)}.ci:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .nl{position:relative}.nl::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:#E8A820;transition:width .3s cubic-bezier(.4,0,.2,1)}.nl:hover::after{width:100%}
        .fp{transition:all .2s}.fp:hover{background:#ece8df!important}
        .vb{transition:all .4s cubic-bezier(.4,0,.2,1);overflow:hidden}.vb:hover{transform:scale(1.06)}
      `}</style>

      <div ref={cursorRef} className="cc" />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px,4vw,56px)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrollY > 60 ? "rgba(250,249,246,.92)" : "transparent", backdropFilter: scrollY > 60 ? "blur(14px)" : "none", borderBottom: scrollY > 60 ? "1px solid rgba(0,0,0,.05)" : "1px solid transparent", transition: "all .35s" }}>
        <div data-hover style={{ fontFamily: '"DM Mono",monospace', fontSize: 15, fontWeight: 500, color: "#1A1A1A", cursor: "none" }}>ariawiki.com</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Library", "Search", "Dashboard", "Roadmap"].map(i => <a key={i} data-hover className="nl" style={{ fontSize: 14, color: "#6A6A62", textDecoration: "none", cursor: "none" }}>{i}</a>)}
          <button data-hover onClick={() => setLang(lang === "en" ? "zh" : "en")} style={{ fontSize: 12, color: "#6A6A62", background: "none", border: "1px solid #d4d0c8", borderRadius: 20, padding: "4px 14px", cursor: "none", fontFamily: '"DM Mono",monospace' }}>{lang === "en" ? "中文" : "EN"}</button>
        </div>
      </nav>

      {/* HERO with AI Runner as background */}
      <section style={{ position: "relative", height: "100vh", minHeight: 680, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 clamp(24px,4vw,56px)" }}>
        {/* Subtle dot texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,#b8b0a0 .7px,transparent .7px)", backgroundSize: "14px 14px", opacity: .05 }} />

        {/* Faint AI background textures */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <svg style={{ position: "absolute", right: "10%", top: "12%", width: 200, height: 300, opacity: .06 }} viewBox="0 0 200 280">
            {[[8,28,"Output Prob.",55],[48,24,"Softmax",55],[84,28,"Multi-Head Attn",48],[124,28,"Feed Forward",48],[164,28,"Multi-Head Attn",48],[204,28,"Feed Forward",48]].map(([y,h,t,x],i) => <g key={i}><rect x={x} y={y} width={x < 55 ? 104 : 90} height={h} rx="4" fill="none" stroke="#1A1A1A" strokeWidth="1.5" /><text x="100" y={y + h * .65} textAnchor="middle" fontSize="8" fill="#1A1A1A" fontFamily="monospace">{t}</text></g>)}
            <rect x="55" y="244" width="90" height="24" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="1.5" /><text x="100" y="260" textAnchor="middle" fontSize="8" fill="#1A1A1A" fontFamily="monospace">Embedding</text>
            {[[36,48],[72,84],[112,124],[152,164],[192,204],[232,244]].map(([a,b],i) => <line key={i} x1="100" y1={a} x2="100" y2={b} stroke="#1A1A1A" strokeWidth="1" />)}
          </svg>
          <svg style={{ position: "absolute", left: "55%", bottom: "6%", width: 170, height: 170, opacity: .05 }} viewBox="0 0 190 190">
            {Array.from({ length: 10 }).map((_, i) => <g key={i}><line x1={15 + i * 18} y1="15" x2={15 + i * 18} y2="177" stroke="#1A1A1A" strokeWidth=".8" /><line x1="15" y1={15 + i * 18} x2="177" y2={15 + i * 18} stroke="#1A1A1A" strokeWidth=".8" /></g>)}
            {[[51,51,1],[87,69,0],[69,87,1],[105,51,0],[87,105,1],[123,87,0]].map(([x,y,f],i) => <circle key={i} cx={x} cy={y} r={7} fill={f ? "#1A1A1A" : "none"} stroke="#1A1A1A" strokeWidth={f ? 0 : 1.5} />)}
          </svg>
          <pre style={{ position: "absolute", left: "5%", bottom: "15%", fontFamily: '"DM Mono",monospace', fontSize: 10, lineHeight: 1.6, color: "#1A1A1A", opacity: .05, transform: "rotate(-2deg)", whiteSpace: "pre" }}>{`def attention(Q, K, V):
    scores = Q @ K.transpose(-2, -1)
    scores /= math.sqrt(d_k)
    return F.softmax(scores) @ V`}</pre>
        </div>

        {/* AI Runner — HERO BACKGROUND */}
        <HeroRunner />

        {/* Hero text — on top */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 700 }}>
          <h1 style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontSize: "clamp(52px,7vw,88px)", fontWeight: 400, lineHeight: 1.05, color: "#1A1A1A", margin: 0, letterSpacing: "-.03em", animation: "heroReveal 1.1s cubic-bezier(.22,1,.36,1) .3s both" }}>
            What will we<br />learn today<span style={{ color: "#E8A820" }}>?</span>
          </h1>
          <p style={{ fontSize: 17, color: "#6A6A62", marginTop: 28, fontWeight: 300, animation: "subtitleIn .8s cubic-bezier(.22,1,.36,1) .7s both" }}>A personal AI learning library</p>
          <p style={{ fontSize: 15, color: "#9A9A92", marginTop: 6, fontWeight: 300, animation: "subtitleIn .8s cubic-bezier(.22,1,.36,1) .9s both" }}>一个个人 AI 学习知识库</p>
        </div>

        {/* View Latest */}
        <div data-hover className="vb" onMouseEnter={() => setViewHover(true)} onMouseLeave={() => setViewHover(false)} style={{
          position: "absolute", right: "clamp(24px,6vw,80px)", top: "28%",
          width: 96, height: 96, borderRadius: "50%", background: "#1A1A1A",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
          cursor: "none", animation: "fadeIn .8s ease 1s both", zIndex: 10,
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: CARDS[0].coverBg, opacity: viewHover ? 1 : 0, transition: "opacity .4s" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "4px 4px" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
          </div>
          <span style={{ color: "#FAF9F6", fontSize: 11, fontWeight: 500, textAlign: "center", lineHeight: 1.2, position: "relative", zIndex: 1, padding: "0 8px" }}>{viewHover ? CARDS[0].title : "View latest"}</span>
          <svg style={{ position: "relative", zIndex: 1 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAF9F6" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "fadeIn .8s ease 1.4s both", zIndex: 10 }}>
          <span style={{ fontSize: 11, color: "#B0AA9E", fontFamily: '"DM Mono",monospace', letterSpacing: ".12em", textTransform: "uppercase" }}>Explore</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0AA9E" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* LIBRARY */}
      <section style={{ padding: "80px clamp(24px,4vw,56px) 120px", maxWidth: 1200, margin: "0 auto", borderTop: "1px solid #E8E6E0" }}>
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 26, fontWeight: 400, color: "#1A1A1A", margin: 0, fontFamily: '"Instrument Serif",Georgia,serif' }}>Library <span style={{ color: "#B0AA9E" }}>/ 知识库</span></h2>
          <div style={{ width: 40, height: 2, background: "#E8A820", marginTop: 14, borderRadius: 1 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map(f => <button key={f} data-hover className="fp" onClick={() => setActiveFilter(f)} style={{ padding: "6px 18px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: activeFilter === f ? 500 : 400, fontFamily: '"DM Sans",sans-serif', background: activeFilter === f ? "#E8A820" : "#EFEDE6", color: activeFilter === f ? "#1A1A1A" : "#7A7A72", cursor: "none" }}>{f}</button>)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#9A9A92", fontFamily: '"DM Mono",monospace' }}>Newest <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A92" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 22 }}>
          {filtered.map((card, i) => (
            <div key={i} data-hover className="ci" style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #E8E6E0", cursor: "none", animation: `cardIn .45s cubic-bezier(.22,1,.36,1) ${i * .07}s both` }}>
              <div style={{ height: 172, background: card.coverBg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px)", backgroundSize: "5px 5px" }} />
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.6)", letterSpacing: ".14em", position: "relative" }}>{card.coverLabel}</span>
              </div>
              <div style={{ padding: "14px 18px 18px" }}>
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, fontFamily: '"DM Mono",monospace', padding: "2px 10px", borderRadius: 12, background: COL_COLORS[card.collection]?.bg, color: COL_COLORS[card.collection]?.text, marginBottom: 8 }}>{card.collection}</span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", margin: "0 0 5px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{lang === "zh" ? card.titleZh : card.title}</h3>
                <p style={{ fontSize: 13, color: "#9A9A92", margin: "0 0 12px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{card.takeaway}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, fontFamily: '"DM Mono",monospace', padding: "2px 8px", borderRadius: 8, background: DIFF_COLORS[card.difficulty]?.bg, color: DIFF_COLORS[card.difficulty]?.text }}>{card.difficulty}</span>
                  <span style={{ fontSize: 13 }}>{STATUS_ICONS[card.status]}</span>
                  <span style={{ fontSize: 12, color: "#B0AA9E", fontFamily: '"DM Mono",monospace', marginLeft: "auto" }}>{card.date}</span>
                  <span style={{ fontSize: 11, color: "#B0AA9E", fontFamily: '"DM Mono",monospace', border: "1px solid #E0DDD6", padding: "1px 6px", borderRadius: 4 }}>{card.lang}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #E8E6E0", padding: "28px clamp(24px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 13, color: "#B0AA9E", fontFamily: '"DM Mono",monospace' }}>ariawiki.com — personal AI learning library</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["GitHub", "X", "Email"].map(l => <a key={l} data-hover style={{ fontSize: 13, color: "#B0AA9E", textDecoration: "none", fontFamily: '"DM Mono",monospace', cursor: "none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
