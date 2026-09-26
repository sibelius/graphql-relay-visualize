"use client";

import { useInspector } from "@/relay/inspector";
import { formatBytes } from "../ui";

/** Draws when each payload of the latest run of an operation arrived. */
export function ChunkTimeline({ operation, compareTo }: { operation: string; compareTo?: string }) {
  const ops = useInspector((s) => s.operations);
  const latest = ops.find((o) => o.name === operation);
  const other = compareTo ? ops.find((o) => o.name === compareTo) : undefined;
  const rows = [latest, other].filter(Boolean) as NonNullable<typeof latest>[];
  if (rows.length === 0) return <p className="py-3 text-xs text-faint">Run it to see payloads arrive over time.</p>;

  const span = Math.max(
    ...rows.map((r) => Math.max(...r.chunks.map((c) => c.at - r.startedAt), (r.endedAt ?? performance.now()) - r.startedAt)),
    1,
  );

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id}>
          <div className="mb-1 flex justify-between font-mono text-[11px]">
            <span className="text-ink">{r.name}</span>
            <span className="text-faint">
              {r.chunks.length} payload{r.chunks.length === 1 ? "" : "s"} · {r.status === "in-flight" ? "streaming…" : `${Math.round((r.endedAt ?? 0) - r.startedAt)} ms`}
            </span>
          </div>
          <div className="relative h-7 rounded bg-panel-2/60">
            <div className="absolute inset-y-3 left-0 h-px bg-line" style={{ width: `${(((r.endedAt ?? performance.now()) - r.startedAt) / span) * 100}%` }} />
            {r.chunks.map((c, i) => (
              <span
                key={i}
                className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 animate-rise flex-col items-center"
                style={{ left: `${Math.min(((c.at - r.startedAt) / span) * 100, 99)}%` }}
                title={`${Math.round(c.at - r.startedAt)} ms · ${formatBytes(c.bytes)} ${c.labels.join(", ")}`}
              >
                <span className={`size-3 rounded-full ring-4 ring-panel ${i === 0 ? "bg-accent" : "bg-ok"}`} />
              </span>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[10px] text-faint">
            {r.chunks.map((c, i) => (
              <span key={i}>
                <span className={i === 0 ? "text-accent" : "text-ok"}>#{i + 1}</span> +{Math.round(c.at - r.startedAt)}ms
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
