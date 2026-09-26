"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Panel } from "../ui";

type Cell = "you" | "backend" | "lib" | "auto";

const APPROACHES = [
  { key: "fetch", label: "fetch + useEffect", sub: "REST, hand-rolled" },
  { key: "query", label: "TanStack Query", sub: "REST + a cache library" },
  { key: "bff", label: "BFF per screen", sub: "REST shaped for each view" },
  { key: "trpc", label: "tRPC", sub: "typed RPC + TanStack Query" },
  { key: "relay", label: "GraphQL + Relay", sub: "fragments + compiler" },
] as const;
type ApproachKey = (typeof APPROACHES)[number]["key"];

const REQUIREMENTS: { key: string; label: string; cells: Record<ApproachKey, Cell>; notes: Partial<Record<ApproachKey, string>> }[] = [
  {
    key: "nested",
    label: "Nested data in one round trip",
    cells: { fetch: "you", query: "you", bff: "backend", trpc: "backend", relay: "auto" },
    notes: {
      fetch: "Chain awaits, Promise.all each level, handle partial failure.",
      query: "Dependent queries with enabled: flags; still one round trip per level.",
      bff: "A new aggregate endpoint per screen.",
      trpc: "A new procedure that joins the data server-side.",
      relay: "Nest selections; the server resolves the tree.",
    },
  },
  {
    key: "exact",
    label: "Fetch only what the view renders",
    cells: { fetch: "you", query: "you", bff: "backend", trpc: "backend", relay: "auto" },
    notes: {
      fetch: "Add ?fields= params and keep them in sync with the UI by hand.",
      query: "Same: the endpoint decides the shape.",
      bff: "Tailor each endpoint; mobile and web drift into separate endpoints.",
      trpc: "Tailor each procedure's select.",
      relay: "Fragments are the field list, so unused fields disappear with the component.",
    },
  },
  {
    key: "cache",
    label: "Cache + request dedupe",
    cells: { fetch: "you", query: "lib", bff: "lib", trpc: "lib", relay: "auto" },
    notes: {
      fetch: "A Map keyed by URL, TTLs, in-flight promise sharing.",
      query: "Query keys you design and keep consistent.",
      relay: "Normalized store by global id, with GC.",
    },
  },
  {
    key: "consistency",
    label: "Same entity stays consistent across views",
    cells: { fetch: "you", query: "you", bff: "you", trpc: "you", relay: "auto" },
    notes: {
      fetch: "Event bus or global store, synced by hand.",
      query: "Invalidate every key that might contain the entity, or setQueryData on each.",
      bff: "Each screen caches its own copy of the entity.",
      trpc: "utils.invalidate() on every procedure that returns it.",
      relay: "One record per id; the mutation response updates every subscriber.",
    },
  },
  {
    key: "optimistic",
    label: "Optimistic update + rollback",
    cells: { fetch: "you", query: "lib", bff: "you", trpc: "lib", relay: "auto" },
    notes: {
      query: "onMutate snapshot, patch each cache key, restore onError.",
      trpc: "Same onMutate/onError dance, per procedure.",
      relay: "Pass optimisticResponse; rollback is automatic.",
    },
  },
  {
    key: "pagination",
    label: "Cursor pagination",
    cells: { fetch: "you", query: "lib", bff: "you", trpc: "lib", relay: "auto" },
    notes: {
      query: "useInfiniteQuery + getNextPageParam + flattening pages.",
      relay: "@connection + usePaginationFragment; the query is generated.",
    },
  },
  {
    key: "types",
    label: "End-to-end types",
    cells: { fetch: "you", query: "you", bff: "you", trpc: "auto", relay: "auto" },
    notes: {
      fetch: "Hand-written interfaces that silently drift from the API.",
      query: "OpenAPI codegen if the backend maintains a spec.",
      trpc: "Inferred from the router (TypeScript on both sides).",
      relay: "Generated per fragment from the schema, any backend language.",
    },
  },
  {
    key: "ownership",
    label: "Components declare their own data",
    cells: { fetch: "you", query: "lib", bff: "you", trpc: "lib", relay: "auto" },
    notes: {
      fetch: "Props drilled from a page-level fetch.",
      query: "Hooks per component, but each is its own request (or a waterfall).",
      bff: "The endpoint shape couples to the screen, not the component.",
      relay: "Fragments compose into one query; masking keeps them independent.",
    },
  },
];

const CELL: Record<Cell, { label: string; icon: string; cls: string; weight: number }> = {
  you: { label: "you write it", icon: "✎", cls: "bg-bad/10 text-bad border-bad/30", weight: 40 },
  backend: { label: "new endpoint", icon: "⇄", cls: "bg-warn/10 text-warn border-warn/30", weight: 18 },
  lib: { label: "library + glue", icon: "◐", cls: "bg-info/10 text-info border-info/30", weight: 14 },
  auto: { label: "declarative", icon: "✓", cls: "bg-ok/10 text-ok border-ok/30", weight: 3 },
};

const BAR = "#dd6200";

export function ComplexityModel() {
  const [enabled, setEnabled] = useState(() => new Set(REQUIREMENTS.map((r) => r.key)));
  const [hover, setHover] = useState<{ approach: ApproachKey; req: string } | null>(null);
  const [barHover, setBarHover] = useState<ApproachKey | null>(null);

  const totals = useMemo(
    () =>
      APPROACHES.map((a) => {
        const reqs = REQUIREMENTS.filter((r) => enabled.has(r.key));
        return {
          ...a,
          loc: reqs.reduce((sum, r) => sum + CELL[r.cells[a.key]].weight, 0),
          counts: reqs.reduce((acc, r) => ({ ...acc, [r.cells[a.key]]: (acc[r.cells[a.key]] ?? 0) + 1 }), {} as Partial<Record<Cell, number>>),
        };
      }),
    [enabled],
  );
  const max = Math.max(...totals.map((t) => t.loc), 1);
  const note = hover ? REQUIREMENTS.find((r) => r.key === hover.req)?.notes[hover.approach] : null;

  const toggle = (key: string) =>
    setEnabled((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-4">
      <Panel
        title="Who handles each requirement?"
        right={
          <div className="hidden flex-wrap gap-3 text-[11px] md:flex">
            {(Object.keys(CELL) as Cell[]).map((c) => (
              <span key={c} className="flex items-center gap-1 text-muted">
                <span className={clsx("rounded border px-1", CELL[c].cls)}>{CELL[c].icon}</span>
                {CELL[c].label}
              </span>
            ))}
          </div>
        }
        bodyClassName="overflow-x-auto p-0"
      >
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2.5 text-xs font-medium text-faint">Requirement (click to toggle)</th>
              {APPROACHES.map((a) => (
                <th key={a.key} className={clsx("px-2 py-2.5 text-xs font-medium", a.key === "relay" ? "text-accent" : "text-muted")}>
                  {a.label}
                  <div className="font-normal text-faint">{a.sub}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REQUIREMENTS.map((r) => {
              const on = enabled.has(r.key);
              return (
                <tr key={r.key} className={clsx("border-b border-line/60 transition-opacity", !on && "opacity-35")}>
                  <td className="px-4 py-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={on} onChange={() => toggle(r.key)} className="accent-[var(--color-accent)]" />
                      <span className="text-ink">{r.label}</span>
                    </label>
                  </td>
                  {APPROACHES.map((a) => {
                    const c = CELL[r.cells[a.key]];
                    const active = hover?.approach === a.key && hover.req === r.key;
                    return (
                      <td key={a.key} className="px-2 py-2">
                        <button
                          type="button"
                          onMouseEnter={() => setHover({ approach: a.key, req: r.key })}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover({ approach: a.key, req: r.key })}
                          className={clsx("flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-[11px]", c.cls, active && "ring-1 ring-ink/40")}
                        >
                          <span>{c.icon}</span>
                          {c.label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="min-h-12 border-t border-line px-4 py-3 text-xs text-muted">
          {note ?? (hover ? "Handled the same way as the neighbouring cells." : "Hover a cell to see what that approach actually asks of you.")}
        </div>
      </Panel>

      <Panel
        title="Frontend code you maintain for the checked requirements"
        right={<span className="text-[11px] text-faint">illustrative model, see note below</span>}
      >
        <div className="space-y-2.5" role="img" aria-label="Horizontal bar chart of estimated frontend lines of code per approach">
          {totals.map((t) => (
            <div
              key={t.key}
              className="relative grid grid-cols-[150px_1fr] items-center gap-3"
              onMouseEnter={() => setBarHover(t.key)}
              onMouseLeave={() => setBarHover(null)}
            >
              <span className={clsx("truncate text-sm", t.key === "relay" ? "text-ink" : "text-muted")}>{t.label}</span>
              <div className="relative flex h-7 items-center">
                <div
                  className="h-5 rounded-r-[4px] transition-[width] duration-500"
                  style={{ width: `${(t.loc / max) * 88}%`, minWidth: 3, background: BAR, opacity: barHover && barHover !== t.key ? 0.45 : 1 }}
                />
                <span className="pl-2 font-mono text-xs text-ink tabular-nums">~{t.loc} lines</span>
              </div>
              {barHover === t.key && (
                <div className="pointer-events-none absolute top-full left-[150px] z-10 mt-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs shadow-xl">
                  <div className="mb-1 font-medium text-ink">{t.label}</div>
                  {(Object.keys(CELL) as Cell[])
                    .filter((c) => t.counts[c])
                    .map((c) => (
                      <div key={c} className="flex justify-between gap-6 text-muted">
                        <span>
                          {CELL[c].icon} {CELL[c].label} × {t.counts[c]}
                        </span>
                        <span className="font-mono text-ink">{(t.counts[c] ?? 0) * CELL[c].weight}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Model: each <span className="text-bad">you write it</span> cell ≈ 40 lines of frontend code, a{" "}
          <span className="text-warn">new endpoint</span> ≈ 18 frontend lines (plus backend work not counted here),{" "}
          <span className="text-info">library + glue</span> ≈ 14, <span className="text-ok">declarative</span> ≈ 3 (a directive or an
          option). These are rough weights for comparing shapes, not a benchmark. The code samples below show where they come from.
        </p>
      </Panel>
    </div>
  );
}
