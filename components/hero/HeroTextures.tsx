export default function HeroTextures() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Transformer architecture diagram */}
      <svg
        className="absolute hidden lg:block"
        style={{ right: "10%", top: "12%", width: 200, height: 300, opacity: 0.06 }}
        viewBox="0 0 200 280"
      >
        {[
          [8, 28, "Output Prob.", 55],
          [48, 24, "Softmax", 55],
          [84, 28, "Multi-Head Attn", 48],
          [124, 28, "Feed Forward", 48],
          [164, 28, "Multi-Head Attn", 48],
          [204, 28, "Feed Forward", 48],
        ].map(([y, h, t, x], i) => (
          <g key={i}>
            <rect
              x={x as number}
              y={y as number}
              width={(x as number) < 55 ? 104 : 90}
              height={h as number}
              rx="4"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />
            <text
              x="100"
              y={(y as number) + (h as number) * 0.65}
              textAnchor="middle"
              fontSize="8"
              fill="#1A1A1A"
              fontFamily="monospace"
            >
              {t as string}
            </text>
          </g>
        ))}
        <rect x="55" y="244" width="90" height="24" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
        <text x="100" y="260" textAnchor="middle" fontSize="8" fill="#1A1A1A" fontFamily="monospace">
          Embedding
        </text>
        {[
          [36, 48], [72, 84], [112, 124], [152, 164], [192, 204], [232, 244],
        ].map(([a, b], i) => (
          <line key={i} x1="100" y1={a} x2="100" y2={b} stroke="#1A1A1A" strokeWidth="1" />
        ))}
      </svg>

      {/* Go board */}
      <svg
        className="absolute hidden lg:block"
        style={{ left: "55%", bottom: "6%", width: 170, height: 170, opacity: 0.05 }}
        viewBox="0 0 190 190"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <line x1={15 + i * 18} y1="15" x2={15 + i * 18} y2="177" stroke="#1A1A1A" strokeWidth=".8" />
            <line x1="15" y1={15 + i * 18} x2="177" y2={15 + i * 18} stroke="#1A1A1A" strokeWidth=".8" />
          </g>
        ))}
        {[
          [51, 51, 1], [87, 69, 0], [69, 87, 1],
          [105, 51, 0], [87, 105, 1], [123, 87, 0],
        ].map(([x, y, f], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={7}
            fill={f ? "#1A1A1A" : "none"}
            stroke="#1A1A1A"
            strokeWidth={f ? 0 : 1.5}
          />
        ))}
      </svg>

      {/* Attention code snippet */}
      <pre
        className="absolute hidden lg:block font-mono text-[10px] leading-relaxed text-primary"
        style={{ left: "5%", bottom: "15%", opacity: 0.05, transform: "rotate(-2deg)", whiteSpace: "pre" }}
      >
        {`def attention(Q, K, V):
    scores = Q @ K.transpose(-2, -1)
    scores /= math.sqrt(d_k)
    return F.softmax(scores) @ V`}
      </pre>
    </div>
  );
}
