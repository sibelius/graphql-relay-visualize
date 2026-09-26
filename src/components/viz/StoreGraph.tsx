"use client";

import { memo, useMemo } from "react";
import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import clsx from "clsx";
import type { RecordSnapshot } from "@/relay/inspector";
import { decodeId } from "../ui";

export const TYPE_COLORS: Record<string, string> = {
  __Root: "#f26b00",
  Post: "#38bdf8",
  User: "#34d399",
  Comment: "#a78bfa",
};
export const typeColor = (t: string | undefined) => (t && TYPE_COLORS[t]) || "#5a6275";

type Ref = { __ref: string };
type Refs = { __refs: string[] };
const isRef = (v: unknown): v is Ref => !!v && typeof v === "object" && "__ref" in v;
const isRefs = (v: unknown): v is Refs => !!v && typeof v === "object" && "__refs" in v;
const INTERNAL = /^(__id|__typename|__fragments.*|__invalidated.*)$/;

export const isConnectionInternal = (id: string, rec?: Record<string, unknown>) =>
  id !== "client:root" && (id.startsWith("client:") || /Connection$|Edge$|PageInfo$/.test(String(rec?.__typename ?? "")));

export function recordLinks(rec: Record<string, unknown>) {
  const links: { field: string; to: string }[] = [];
  for (const [field, value] of Object.entries(rec)) {
    if (isRef(value)) links.push({ field, to: value.__ref });
    else if (isRefs(value)) value.__refs.forEach((to, i) => to && links.push({ field: `${field}[${i}]`, to }));
  }
  return links;
}

/** Records reachable from client:root through the given root field keys. */
export function reachable(records: RecordSnapshot, rootFieldPrefixes: string[] | null) {
  const seen = new Set<string>();
  const root = records["client:root"];
  if (!root) return seen;
  seen.add("client:root");
  const stack = recordLinks(root)
    .filter((l) => !rootFieldPrefixes || rootFieldPrefixes.some((p) => l.field.startsWith(p)))
    .map((l) => l.to);
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id) || !records[id]) continue;
    seen.add(id);
    stack.push(...recordLinks(records[id]).map((l) => l.to));
  }
  return seen;
}

type RecordNodeData = {
  id: string;
  typename: string;
  fields: [string, string][];
  extra: number;
  highlighted: boolean;
  dimmed: boolean;
  pulse: number;
};

const NODE_W = 230;
const nodeHeight = (fieldCount: number) => 34 + Math.max(fieldCount, 1) * 17 + 10;

export function StoreGraph({
  records,
  scope,
  showInternals,
  highlightId,
  pulseIds,
  pulseKey,
  onHover,
  height = 620,
}: {
  records: RecordSnapshot;
  scope: Set<string> | null;
  showInternals: boolean;
  highlightId: string | null;
  pulseIds: string[];
  pulseKey: number;
  onHover?: (id: string | null) => void;
  height?: number;
}) {
  const { nodes, edges } = useMemo(() => {
    const ids = Object.keys(records).filter((id) => !scope || scope.has(id));
    const visible = new Set(ids.filter((id) => showInternals || !isConnectionInternal(id, records[id])));

    // When connection records are hidden, follow through them to the next visible record.
    const targetsOf = (id: string, seen = new Set<string>()): { field: string; to: string; via: boolean }[] => {
      const rec = records[id];
      if (!rec) return [];
      const out: { field: string; to: string; via: boolean }[] = [];
      for (const link of recordLinks(rec)) {
        if (visible.has(link.to)) out.push({ field: link.field, to: link.to, via: false });
        else if (records[link.to] && !seen.has(link.to) && (!scope || scope.has(link.to))) {
          seen.add(link.to);
          for (const t of targetsOf(link.to, seen)) out.push({ field: link.field.replace(/\[\d+\]$/, ""), to: t.to, via: true });
        }
      }
      return out;
    };

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 14, ranksep: 70, marginx: 10, marginy: 10 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodes: Node<RecordNodeData>[] = [];
    for (const id of visible) {
      const rec = records[id];
      const entries = Object.entries(rec).filter(([k]) => !INTERNAL.test(k));
      const fields: [string, string][] = entries.map(([k, v]) => [
        k,
        isRef(v) ? `→ ${short(v.__ref)}` : isRefs(v) ? `→ [${v.__refs.length}]` : JSON.stringify(v)?.slice(0, 28) ?? "null",
      ]);
      const shown = fields.slice(0, 7);
      g.setNode(id, { width: NODE_W, height: nodeHeight(shown.length) });
      nodes.push({
        id,
        type: "record",
        position: { x: 0, y: 0 },
        data: {
          id,
          typename: String(rec.__typename ?? ""),
          fields: shown,
          extra: fields.length - shown.length,
          highlighted: id === highlightId,
          dimmed: highlightId != null && id !== highlightId,
          pulse: pulseIds.includes(id) ? pulseKey : 0,
        },
      });
    }

    const edges: Edge[] = [];
    const seenEdge = new Set<string>();
    for (const id of visible) {
      for (const t of targetsOf(id)) {
        const key = `${id}->${t.to}:${t.field}`;
        if (seenEdge.has(key)) continue;
        seenEdge.add(key);
        g.setEdge(id, t.to);
        const hot = highlightId != null && (id === highlightId || t.to === highlightId);
        edges.push({
          id: key,
          source: id,
          target: t.to,
          label: t.field.length > 26 ? t.field.slice(0, 25) + "…" : t.field,
          labelStyle: { fill: hot ? "#e7e9f0" : "#8a93a8", fontSize: 10, fontFamily: "var(--font-mono)" },
          labelBgStyle: { fill: "#11141b" },
          style: {
            stroke: hot ? "#f26b00" : "#3a4254",
            strokeWidth: hot ? 2 : 1.2,
            strokeDasharray: t.via ? "4 4" : undefined,
          },
          animated: hot,
        });
      }
    }

    dagre.layout(g);
    for (const n of nodes) {
      const p = g.node(n.id);
      n.position = { x: p.x - p.width / 2, y: p.y - p.height / 2 };
    }
    return { nodes, edges };
  }, [records, scope, showInternals, highlightId, pulseIds, pulseKey]);

  // Remount (and re-fit the viewport) only when the graph's shape changes.
  const layoutKey = `${nodes.length}:${edges.length}:${showInternals}`;

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-line bg-bg/60">
      <ReactFlow
        key={layoutKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.15}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeMouseEnter={(_, n) => onHover?.(n.id)}
        onNodeMouseLeave={() => onHover?.(null)}
      >
        <Background color="#1c2130" gap={20} />
        <Controls showInteractive={false} className="[&_button]:!border-line [&_button]:!bg-panel-2 [&_button]:!fill-muted" />
      </ReactFlow>
    </div>
  );
}

function short(id: string) {
  const d = decodeId(id);
  return d.length > 20 ? d.slice(0, 19) + "…" : d;
}

const RecordNode = memo(function RecordNode({ data }: NodeProps<Node<RecordNodeData>>) {
  const color = data.id === "client:root" ? TYPE_COLORS.__Root : typeColor(data.typename);
  return (
    <div
      key={data.pulse}
      className={clsx(
        "rounded-lg border bg-panel text-[10.5px] shadow-lg transition-opacity",
        data.pulse ? "animate-flash" : "",
        data.dimmed ? "opacity-40" : "opacity-100",
      )}
      style={{ width: NODE_W, borderColor: data.highlighted ? color : "#242a38" }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2 rounded-t-lg px-2.5 py-1.5" style={{ background: `${color}22` }}>
        <span className="truncate font-mono font-semibold" style={{ color }}>
          {decodeId(data.id)}
        </span>
        <span className="shrink-0 text-faint">{data.typename}</span>
      </div>
      <div className="px-2.5 py-1.5 font-mono">
        {data.fields.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 leading-[17px]">
            <span className="truncate text-muted">{k}</span>
            <span className={clsx("shrink-0 truncate", v.startsWith("→") ? "text-accent" : "text-ink")}>{v}</span>
          </div>
        ))}
        {data.extra > 0 && <div className="text-faint">+{data.extra} more</div>}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

const nodeTypes = { record: RecordNode };
