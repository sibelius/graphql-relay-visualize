"use client";

import { memo, useMemo, useState } from "react";
import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import clsx from "clsx";
import type { SchemaType } from "@/server/schemaGraph";
import { Panel } from "../ui";

const KIND_COLOR: Record<string, string> = {
  Query: "#f26b00",
  Mutation: "#e535ab",
  object: "#38bdf8",
  interface: "#34d399",
  input: "#a78bfa",
  union: "#fbbf24",
};
const colorOf = (t: SchemaType) => KIND_COLOR[t.name] ?? (t.plumbing ? "#5a6275" : KIND_COLOR[t.kind]);

type TypeNodeData = { type: SchemaType; selected: boolean; related: boolean; dim: boolean; fields: SchemaType["fields"] };
const W = 210;
const MAX_FIELDS = 9;

export function SchemaExplorer({ types }: { types: SchemaType[] }) {
  const [plumbing, setPlumbing] = useState(false);
  const [selected, setSelected] = useState<string | null>("Post");
  const visible = useMemo(() => types.filter((t) => plumbing || !t.plumbing), [types, plumbing]);
  const byName = useMemo(() => new Map(types.map((t) => [t.name, t])), [types]);

  // With plumbing hidden, follow Connection → Edge → node so Query.feed still points at Post.
  const resolveTarget = useMemo(() => {
    const visibleNames = new Set(visible.map((t) => t.name));
    const resolve = (name: string, seen = new Set<string>()): string | null => {
      if (visibleNames.has(name)) return name;
      if (seen.has(name)) return null;
      seen.add(name);
      const t = byName.get(name);
      const next = t?.fields.find((f) => f.name === "edges" || f.name === "node" || (t.name.endsWith("Payload") && f.target))?.target;
      return next ? resolve(next, seen) : null;
    };
    return resolve;
  }, [visible, byName]);

  const { nodes, edges } = useMemo(() => {
    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 70, marginx: 10, marginy: 10 });
    g.setDefaultEdgeLabel(() => ({}));
    const edges: Edge[] = [];
    const neighbours = new Set<string>();
    for (const t of visible) {
      for (const f of t.fields) {
        const target = f.target ? resolveTarget(f.target) : null;
        if (!target || target === t.name) continue;
        const hot = selected === t.name || selected === target;
        if (hot) neighbours.add(t.name === selected ? target : t.name);
        const via = f.target !== target;
        edges.push({
          id: `${t.name}.${f.name}`,
          source: t.name,
          target,
          label: f.name,
          labelStyle: { fill: hot ? "#e7e9f0" : "#5a6275", fontSize: 10, fontFamily: "var(--font-mono)" },
          labelBgStyle: { fill: "#0a0c11" },
          style: { stroke: hot ? colorOf(t) : "#2c3345", strokeWidth: hot ? 1.8 : 1, strokeDasharray: via ? "4 4" : undefined },
          animated: hot,
        });
        g.setEdge(t.name, target, {}, f.name);
      }
      for (const i of t.interfaces) {
        edges.push({
          id: `${t.name}~${i}`,
          source: t.name,
          target: i,
          label: "implements",
          labelStyle: { fill: "#34d399", fontSize: 10 },
          labelBgStyle: { fill: "#0a0c11" },
          style: { stroke: "#34d39955", strokeDasharray: "2 3" },
        });
        g.setEdge(t.name, i, {}, "implements");
      }
    }
    const nodes: Node<TypeNodeData>[] = visible.map((t) => {
      const fields = t.fields.slice(0, MAX_FIELDS);
      g.setNode(t.name, { width: W, height: 34 + fields.length * 16 + (t.fields.length > MAX_FIELDS ? 16 : 0) + 8 });
      return {
        id: t.name,
        type: "type",
        position: { x: 0, y: 0 },
        data: {
          type: t,
          fields,
          selected: selected === t.name,
          related: neighbours.has(t.name),
          dim: selected != null && selected !== t.name && !neighbours.has(t.name),
        },
      };
    });
    dagre.layout(g);
    for (const n of nodes) {
      const p = g.node(n.id);
      n.position = { x: p.x - p.width / 2, y: p.y - p.height / 2 };
    }
    return { nodes, edges };
  }, [visible, selected, resolveTarget]);

  const current = selected ? byName.get(selected) : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Panel
        title={`${visible.length} types`}
        right={
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
            <input type="checkbox" checked={plumbing} onChange={(e) => setPlumbing(e.target.checked)} className="accent-[var(--color-accent)]" />
            show Relay plumbing
          </label>
        }
        bodyClassName="p-0"
      >
        <div className="h-[720px]">
          <ReactFlow
            key={String(plumbing)}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.06 }}
            minZoom={0.2}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, n) => setSelected((s) => (s === n.id ? null : n.id))}
            onPaneClick={() => setSelected(null)}
              >
            <Background color="#1c2130" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </Panel>

      <Panel title={current ? current.name : "Pick a type"}>
        {current ? (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="rounded px-1.5 py-0.5 font-mono" style={{ color: colorOf(current), background: colorOf(current) + "1f" }}>
                {current.kind}
              </span>
              {current.interfaces.map((i) => (
                <span key={i} className="rounded bg-ok/10 px-1.5 py-0.5 font-mono text-ok">
                  implements {i}
                </span>
              ))}
            </div>
            {current.description && <p className="text-muted">{current.description}</p>}
            <ul className="space-y-2">
              {current.fields.map((f) => (
                <li key={f.name} className="font-mono text-[11.5px]">
                  <div>
                    <span className="text-ink">{f.name}</span>
                    {f.args.length > 0 && <span className="text-faint">({f.args.join(", ")})</span>}
                    <span className="text-faint">: </span>
                    {f.target ? (
                      <button type="button" onClick={() => setSelected(resolveTarget(f.target!) ?? f.target)} className="text-info hover:underline">
                        {f.type}
                      </button>
                    ) : (
                      <span className="text-accent">{f.type}</span>
                    )}
                  </div>
                  {f.description && <div className="font-sans text-xs text-faint">{f.description}</div>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted">Click a node in the graph to inspect it.</p>
        )}
      </Panel>
    </div>
  );
}

const TypeNode = memo(function TypeNode({ data }: NodeProps<Node<TypeNodeData>>) {
  const color = colorOf(data.type);
  return (
    <div
      className={clsx("cursor-pointer rounded-lg border bg-panel text-[10.5px] shadow-lg transition-opacity", data.dim && "opacity-30")}
      style={{ width: W, borderColor: data.selected ? color : data.related ? color + "88" : "#242a38" }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between rounded-t-lg px-2.5 py-1.5" style={{ background: color + "22" }}>
        <span className="font-semibold" style={{ color }}>
          {data.type.name}
        </span>
        <span className="text-faint">{data.type.kind}</span>
      </div>
      <div className="px-2.5 py-1 font-mono">
        {data.fields.map((f) => (
          <div key={f.name} className="flex justify-between gap-2 leading-4">
            <span className="truncate text-muted">{f.name}</span>
            <span className={clsx("shrink-0 truncate", f.target ? "text-info" : "text-faint")}>{f.type.replace(/[!\[\]]/g, "")}</span>
          </div>
        ))}
        {data.type.fields.length > MAX_FIELDS && <div className="text-faint">+{data.type.fields.length - MAX_FIELDS} more</div>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

const nodeTypes = { type: TypeNode };
