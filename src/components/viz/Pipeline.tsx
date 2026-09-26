const STAGES = [
  { title: "Components", sub: ["declare fragments", "next to the JSX"], color: "#38bdf8", href: "/colocation" },
  { title: "Compiler", sub: ["validates vs schema,", "emits types + artifacts"], color: "#a78bfa", href: "/compiler" },
  { title: "Network", sub: ["1 request, carrying", "only an md5 query id"], color: "#e535ab", href: "/network" },
  { title: "Store", sub: ["normalizes the tree", "into records by ID"], color: "#f26b00", href: "/store" },
  { title: "Subscriptions", sub: ["only components that", "read changed records"], color: "#34d399", href: "/consistency" },
];

export function Pipeline() {
  const w = 150;
  const gap = 36;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${total} 170`} className="min-w-[720px]" role="img" aria-label="Relay data flow: components declare fragments, the compiler builds a query, one network request, a normalized store, and precise re-renders">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#5a6275" />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const x = i * (w + gap);
          return (
            <a key={s.title} href={s.href}>
              <g className="cursor-pointer [&:hover_rect]:stroke-[#e7e9f0]">
                <rect x={x} y={20} width={w} height={86} rx={12} fill="#171b24" stroke="#242a38" />
                <rect x={x} y={20} width={4} height={86} rx={2} fill={s.color} />
                <text x={x + 16} y={48} fill="#e7e9f0" fontSize={14} fontWeight={600}>
                  {s.title}
                </text>
                {s.sub.map((line, j) => (
                  <text key={j} x={x + 16} y={70 + j * 16} fill="#8a93a8" fontSize={11.5}>
                    {line}
                  </text>
                ))}
              </g>
              {i < STAGES.length - 1 && (
                <line x1={x + w + 4} y1={63} x2={x + w + gap - 4} y2={63} stroke="#5a6275" strokeWidth={1.5} markerEnd="url(#arrow)" />
              )}
            </a>
          );
        })}
        <path
          d={`M ${total - w / 2} 108 V 140 H ${w / 2} V 110`}
          fill="none"
          stroke="#f26b00"
          strokeWidth={1.5}
          strokeDasharray="5 6"
          markerEnd="url(#arrow)"
        >
          <animate attributeName="stroke-dashoffset" from="22" to="0" dur="1.2s" repeatCount="indefinite" />
        </path>
        <text x={total / 2} y={160} textAnchor="middle" fill="#8a93a8" fontSize={11.5}>
          mutations and refetches write to the same store — the UI re-renders from it, never from the response
        </text>
      </svg>
    </div>
  );
}
