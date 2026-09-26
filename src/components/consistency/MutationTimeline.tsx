"use client";

import clsx from "clsx";
import { useInspector, type TimelineEvent } from "@/relay/inspector";
import { Panel, decodeId } from "../ui";

const KIND: Record<TimelineEvent["kind"], { color: string; tag: string }> = {
  "execute.start": { color: "#8a93a8", tag: "start" },
  optimistic: { color: "#fbbf24", tag: "optimistic" },
  "network.start": { color: "#60a5fa", tag: "network" },
  "network.next": { color: "#60a5fa", tag: "server" },
  "network.error": { color: "#f87171", tag: "error" },
  publish: { color: "#34d399", tag: "publish" },
  notify: { color: "#34d399", tag: "notify" },
  rollback: { color: "#a78bfa", tag: "revert" },
};

/** Events since the most recent user action (the click that started a mutation). */
function useLastSession() {
  const timeline = useInspector((s) => s.timeline);
  let start = -1;
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (timeline[i].kind === "execute.start" && timeline[i].label !== "commitMutation()") {
      start = i;
      break;
    }
  }
  return start === -1 ? [] : timeline.slice(start).filter((e) => e.label !== "commitMutation()");
}

export function MutationTimeline() {
  const events = useLastSession();
  const t0 = events[0]?.at ?? 0;
  const span = Math.max((events.at(-1)?.at ?? t0) - t0, 1);

  return (
    <Panel title="Mutation lifecycle" right={<span className="text-[11px] text-faint">from Relay&apos;s log events</span>}>
      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-faint">Click any ♡ or rename the viewer to trace the lifecycle.</p>
      ) : (
        <>
          <div className="relative mx-2 mt-2 mb-6 h-8">
            <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
            {events.map((e) => (
              <span
                key={e.id}
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-panel"
                style={{ left: `${((e.at - t0) / span) * 100}%`, background: KIND[e.kind].color }}
                title={e.label}
              />
            ))}
            <span className="absolute -bottom-4 left-0 font-mono text-[10px] text-faint">0 ms</span>
            <span className="absolute right-0 -bottom-4 font-mono text-[10px] text-faint">{Math.round(span)} ms</span>
          </div>
          <ol className="space-y-1.5">
            {events.map((e) => (
              <li key={e.id} className="grid animate-rise grid-cols-[64px_84px_1fr] items-center gap-2 text-xs">
                <span className="text-right font-mono text-faint tabular-nums">+{Math.round(e.at - t0)} ms</span>
                <span
                  className="rounded px-1.5 py-0.5 text-center font-mono text-[10px]"
                  style={{ color: KIND[e.kind].color, background: KIND[e.kind].color + "1a" }}
                >
                  {KIND[e.kind].tag}
                </span>
                <span className={clsx(e.kind === "network.error" ? "text-bad" : "text-ink")}>{e.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            The UI updated at <span className="text-warn">optimistic</span>, before the network round trip. When the
            server answered, Relay removed its optimistic layer and applied the real payload. If they differ (or the server
            fails) the UI converges to the server&apos;s truth on its own.
          </p>
        </>
      )}
    </Panel>
  );
}

export function StoreDiff() {
  // Only mutation-driven updates; the initial query write would drown them out.
  const updates = useInspector((s) => s.storeUpdates)
    .filter((u) => u.optimistic || u.source.endsWith("Mutation"))
    .slice(0, 4);
  return (
    <Panel title="Store diff" right={<span className="text-[11px] text-faint">records the update touched</span>}>
      {updates.length === 0 ? (
        <p className="py-6 text-center text-sm text-faint">No store updates yet.</p>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <div key={u.id} className="animate-rise rounded-lg border border-line bg-panel-2/40 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className={clsx("rounded px-1.5 py-0.5 font-mono text-[10px]", u.optimistic ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok")}>
                  {u.optimistic ? "optimistic" : "server"}
                </span>
                <span className="text-muted">{u.source}</span>
              </div>
              {u.diff.every((d) => changedKeys(d).length === 0) && (
                <p className="text-xs text-muted">
                  No field changed in this step: the store already matched it, so no subscriber re-rendered.
                </p>
              )}
              {u.diff.map((d) => {
                const keys = changedKeys(d);
                if (keys.length === 0) return null;
                return (
                  <div key={d.id} className="font-mono text-[11px]">
                    <span className="text-info">{decodeId(d.id)}</span>
                    {keys.map((k) => (
                      <div key={k} className="pl-3">
                        <span className="text-muted">{k}: </span>
                        <span className="text-bad line-through">{JSON.stringify(d.before?.[k]) ?? "∅"}</span>
                        <span className="text-faint"> → </span>
                        <span className="text-ok">{JSON.stringify(d.after?.[k]) ?? "∅"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

type Diff = { id: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null };

// Fields that actually changed, ignoring Relay's internal keys and the
// mutation's own client:local:* payload records.
function changedKeys(d: Diff) {
  if (d.id.startsWith("client:local") || d.id === "client:root") return [];
  return [...new Set([...Object.keys(d.before ?? {}), ...Object.keys(d.after ?? {})])].filter(
    (k) => !k.startsWith("__") && JSON.stringify(d.before?.[k]) !== JSON.stringify(d.after?.[k]),
  );
}
