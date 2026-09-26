"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Feature, Level } from "@/app/vs-apollo/features";

export type HighlightedFeature = Feature & { relayHtml: string; apolloHtml: string };

// Order and colors validated for CVD separation on the dark surface (dataviz validator).
export const LEVELS: Record<Level, { label: string; icon: string; color: string }> = {
  default: { label: "built in, on by default", icon: "✓", color: "#199e70" },
  optin: { label: "built in, opt-in", icon: "◐", color: "#3987e5" },
  tooling: { label: "separate tooling", icon: "⚙", color: "#c98500" },
  manual: { label: "you write it", icon: "✎", color: "#9085e9" },
  none: { label: "not available", icon: "–", color: "#e66767" },
};
const ORDER: Level[] = ["default", "optin", "tooling", "manual", "none"];
const GROUPS = ["All", "Build time", "Data flow", "Updates", "Loading", "Errors"] as const;

export function FeatureCompare({ features }: { features: HighlightedFeature[] }) {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const [onlyUnique, setOnlyUnique] = useState(false);
  const [selected, setSelected] = useState(features.find((f) => f.key === "pagination")?.key ?? features[0].key);

  const shown = features.filter((f) => (group === "All" || f.group === group) && (!onlyUnique || f.unique));
  const current = features.find((f) => f.key === selected) ?? shown[0];

  const coverage = useMemo(
    () =>
      (["relay", "apollo"] as const).map((lib) => ({
        lib,
        counts: ORDER.map((level) => ({ level, n: features.filter((f) => f[lib].level === level).length })),
      })),
    [features],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-panel p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">What you get out of the box · {features.length} capabilities</h2>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted">
            {ORDER.map((l) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: LEVELS[l].color }} />
                {LEVELS[l].label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {coverage.map((row) => (
            <div key={row.lib} className="grid grid-cols-[110px_1fr] items-center gap-3">
              <span className={clsx("text-sm", row.lib === "relay" ? "text-accent" : "text-ink")}>
                {row.lib === "relay" ? "Relay 21" : "Apollo Client 4"}
              </span>
              <div className="flex h-7 gap-[2px] overflow-hidden rounded-[4px]">
                {row.counts
                  .filter((c) => c.n > 0)
                  .map((c) => (
                    <div
                      key={c.level}
                      title={`${LEVELS[c.level].label}: ${c.n}`}
                      className="flex items-center justify-center text-[11px] font-semibold text-white"
                      style={{ width: `${(c.n / features.length) * 100}%`, background: LEVELS[c.level].color }}
                    >
                      {c.n}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={clsx("rounded-full border px-3 py-1 text-xs", group === g ? "border-faint bg-panel-2 text-ink" : "border-line text-muted hover:text-ink")}
          >
            {g}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={onlyUnique} onChange={(e) => setOnlyUnique(e.target.checked)} className="accent-[var(--color-accent)]" />
          only what Apollo has no equivalent for
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="grid grid-cols-[1fr_120px_120px] gap-2 border-b border-line px-4 py-2 text-[11px] text-faint">
            <span>Capability</span>
            <span className="text-accent">Relay</span>
            <span>Apollo</span>
          </div>
          {shown.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSelected(f.key)}
              className={clsx(
                "grid w-full grid-cols-[1fr_120px_120px] items-center gap-2 border-b border-line/60 px-4 py-2 text-left text-sm transition-colors",
                current?.key === f.key ? "bg-panel-2" : "hover:bg-panel-2/50",
              )}
            >
              <span className="min-w-0">
                <span className="block text-ink">{f.title}</span>
                <span className="text-[10.5px] text-faint">
                  {f.group}
                  {f.unique && <span className="ml-1.5 text-accent">· Relay-only</span>}
                </span>
              </span>
              <LevelChip level={f.relay.level} />
              <LevelChip level={f.apollo.level} />
            </button>
          ))}
          {shown.length === 0 && <p className="p-4 text-sm text-faint">Nothing in this group.</p>}
        </div>

        {current && (
          <div className="flex min-w-0 animate-rise flex-col gap-3 self-start xl:sticky xl:top-4" key={current.key}>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{current.title}</h3>
              {current.unique && <span className="text-xs text-accent">No first-party Apollo equivalent</span>}
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Side name="Relay" accent level={current.relay.level} summary={current.relay.summary} html={current.relayHtml} />
              <Side name="Apollo Client" level={current.apollo.level} summary={current.apollo.summary} html={current.apolloHtml} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LevelChip({ level }: { level: Level }) {
  const l = LEVELS[level];
  return (
    <span
      className="inline-flex items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-[10.5px] text-ink"
      style={{ borderColor: l.color + "66", background: l.color + "1f" }}
    >
      <span style={{ color: l.color }}>{l.icon}</span>
      {l.label.replace("built in, ", "")}
    </span>
  );
}

function Side({ name, level, summary, html, accent }: { name: string; level: Level; summary: string; html: string; accent?: boolean }) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className={clsx("text-xs font-semibold tracking-wide uppercase", accent ? "text-accent" : "text-muted")}>{name}</span>
        <LevelChip level={level} />
      </div>
      <p className="px-4 pt-3 text-sm leading-relaxed text-muted">{summary}</p>
      <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed [&_pre]:!bg-transparent" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
