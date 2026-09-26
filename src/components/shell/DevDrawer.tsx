"use client";

import { useState } from "react";
import clsx from "clsx";
import { inspector, useInspector, type OperationEntry } from "@/relay/inspector";
import { decodeId, formatBytes } from "../ui";

// A miniature Relay DevTools: every operation that went over the wire and
// every store update, straight from the environment's log.
export function DevDrawer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const operations = useInspector((s) => s.operations);
  const updates = useInspector((s) => s.storeUpdates);
  const records = useInspector((s) => s.records);
  const recordCount = Object.keys(records).length;
  const inFlight = operations.filter((o) => o.status === "in-flight").length;
  const current = operations.find((o) => o.id === selected) ?? null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:left-64">
      <div className={clsx("border-t border-line bg-panel/95 backdrop-blur", open ? "h-[340px]" : "h-9")}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-full items-center gap-4 px-4 text-xs text-muted hover:text-ink"
        >
          <span className="font-semibold tracking-wide text-ink uppercase">Relay devtools</span>
          <span className="flex items-center gap-1.5">
            <span className={clsx("size-1.5 rounded-full", inFlight ? "animate-pulse bg-accent" : "bg-ok")} />
            {operations.length} operations{inFlight ? ` · ${inFlight} in flight` : ""}
          </span>
          <span>{recordCount} records in store</span>
          <span>{updates.length} store updates</span>
          <span className="ml-auto">{open ? "▾ hide" : "▴ show"}</span>
        </button>
        {open && (
          <div className="grid h-[calc(340px-36px)] grid-cols-1 gap-px border-t border-line bg-line md:grid-cols-[1.2fr_1fr_1fr]">
            <div className="overflow-auto bg-panel">
              <div className="sticky top-0 flex items-center justify-between bg-panel px-3 py-1.5 text-[11px] text-faint uppercase">
                Network
                <button type="button" className="normal-case hover:text-ink" onClick={() => inspector.clear()}>
                  clear
                </button>
              </div>
              {operations.length === 0 && <Empty>No operations yet.</Empty>}
              {operations.map((op) => (
                <OperationRow key={op.id} op={op} active={op.id === selected} onClick={() => setSelected(op.id)} />
              ))}
            </div>
            <div className="overflow-auto bg-panel">
              <div className="sticky top-0 bg-panel px-3 py-1.5 text-[11px] text-faint uppercase">
                {current ? `${current.name} · response` : "Response"}
              </div>
              {current ? (
                <pre className="px-3 pb-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted">
                  {JSON.stringify(current.response, null, 2)}
                </pre>
              ) : (
                <Empty>Select an operation.</Empty>
              )}
            </div>
            <div className="overflow-auto bg-panel">
              <div className="sticky top-0 bg-panel px-3 py-1.5 text-[11px] text-faint uppercase">Store updates</div>
              {updates.length === 0 && <Empty>No updates yet.</Empty>}
              {updates.map((u) => (
                <div key={u.id} className="border-b border-line/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={clsx("rounded px-1 font-mono text-[10px]", u.optimistic ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok")}>
                      {u.optimistic ? "optimistic" : "commit"}
                    </span>
                    <span className="truncate text-ink">{u.source}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {u.updatedRecordIDs.slice(0, 12).map((id) => (
                      <span key={id} className="rounded bg-panel-2 px-1 font-mono text-[10px] text-muted">
                        {decodeId(id)}
                      </span>
                    ))}
                    {u.updatedRecordIDs.length > 12 && <span className="text-faint">+{u.updatedRecordIDs.length - 12}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OperationRow({ op, active, onClick }: { op: OperationEntry; active: boolean; onClick: () => void }) {
  const ms = op.endedAt ? Math.round(op.endedAt - op.startedAt) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("flex w-full items-center gap-2 border-b border-line/60 px-3 py-1.5 text-left text-xs", active ? "bg-panel-2" : "hover:bg-panel-2/60")}
    >
      <span
        className={clsx(
          "w-14 shrink-0 rounded px-1 text-center font-mono text-[10px]",
          op.kind === "mutation" ? "bg-gql/15 text-gql" : "bg-info/15 text-info",
        )}
      >
        {op.kind}
      </span>
      <span className="min-w-0 flex-1 truncate text-ink">{op.name}</span>
      <span className="font-mono text-[10px] text-faint" title="request body size — only the persisted id and variables">
        ↑{formatBytes(op.requestBytes)}
      </span>
      <span className="font-mono text-[10px] text-faint">↓{formatBytes(op.responseBytes)}</span>
      <span className={clsx("w-12 text-right font-mono text-[10px]", op.status === "error" ? "text-bad" : op.status === "in-flight" ? "text-accent" : "text-muted")}>
        {ms == null ? "…" : `${ms}ms`}
      </span>
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-4 text-xs text-faint">{children}</div>;
}
