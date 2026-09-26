"use client";

import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import clsx from "clsx";
import persisted from "../../../persisted_queries.json";
import type { ColocationDemoQuery as QueryType } from "@/__generated__/ColocationDemoQuery.graphql";
import { Panel } from "../ui";
import { PostCard } from "./PostCard";
import { ViewerBar } from "./ViewerBar";
import { FRAGMENT_COLORS, XRayContext, sanitize, selectionOutline, unwrap, useInspected } from "./xray";

const query = graphql`
  query ColocationDemoQuery {
    viewer {
      ...ViewerBar_user
    }
    feed(first: 2) {
      edges {
        node {
          id
          ...PostCard_post
        }
      }
    }
  }
`;

export function ColocationDemo() {
  const data = useLazyLoadQuery<QueryType>(query, {});
  const [xray, setXray] = useState(true);
  const [tab, setTab] = useState<"query" | "inspect">("inspect");

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel
        title="The UI"
        right={
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={xray} onChange={(e) => setXray(e.target.checked)} className="accent-[var(--color-accent)]" />
            X-ray fragments
          </label>
        }
      >
        <XRayContext.Provider value={xray}>
          <div className="space-y-5 pt-2">
            <ViewerBar viewer={data.viewer} />
            {data.feed.edges?.map((e) => (e?.node ? <PostCard key={e.node.id} post={e.node} /> : null))}
          </div>
        </XRayContext.Provider>
      </Panel>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex gap-1 self-start rounded-lg border border-line bg-panel p-1 text-sm">
          {(
            [
              ["inspect", "Hover inspector"],
              ["query", "Query the compiler built"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={clsx("rounded-md px-3 py-1", tab === key ? "bg-panel-2 text-ink" : "text-muted hover:text-ink")}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "inspect" ? <HoverInspector enabled={xray} /> : <ComposedQuery />}
      </div>
    </div>
  );
}

function HoverInspector({ enabled }: { enabled: boolean }) {
  const inspected = useInspected();
  if (!inspected) {
    return (
      <Panel title="Hover a component">
        <p className="text-sm leading-relaxed text-muted">
          {enabled ? "Hover any outlined component on the left." : "Turn on X-ray, then hover any component on the left."}{" "}
          You&apos;ll see the fragment it declared, the opaque reference its parent handed it, and the data{" "}
          <code className="font-mono text-ink">useFragment</code> resolved from the store.
        </p>
        <FragmentLegend />
      </Panel>
    );
  }
  const color = FRAGMENT_COLORS[inspected.name];
  const outline = selectionOutline(inspected.fragment.selections as never);
  return (
    <>
      <Panel title={<span style={{ color }}>{`<${inspected.component} />`}</span>} right={<span className="font-mono text-[11px] text-faint">{inspected.name}</span>}>
        <div className="mb-2 text-xs text-faint">declares exactly these fields</div>
        <pre className="font-mono text-[12px] leading-relaxed">
          {outline.map((l, i) => (
            <div key={i} style={{ paddingLeft: l.depth * 16, color: l.spread ? FRAGMENT_COLORS[l.spread] : undefined }}>
              {l.text}
            </div>
          ))}
        </pre>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="props from the parent">
          <div className="mb-2 text-xs text-faint">an opaque fragment reference — no fields readable</div>
          <Json value={sanitize(inspected.fragmentRef)} />
        </Panel>
        <Panel title="useFragment() returns">
          <div className="mb-2 text-xs text-faint">only its own fields; children&apos;s fields stay masked</div>
          <Json value={sanitize(inspected.data)} />
        </Panel>
      </div>
    </>
  );
}

function ComposedQuery() {
  const id = (unwrap(query) as unknown as { params: { id: string } }).params.id;
  const text = (persisted as Record<string, string>)[id] ?? "";
  const blocks = text.split(/\n(?=fragment )/);
  return (
    <Panel title="One query, stitched from six components" right={<span className="font-mono text-[11px] text-faint">md5 {id.slice(0, 8)}…</span>}>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        No component wrote this query. The compiler walked the fragment spreads from the root, validated every field against
        the schema, and persisted the result. The browser only ever sends the id.
      </p>
      <div className="space-y-2">
        {blocks.map((block, i) => {
          const name = block.match(/^(?:query|fragment) (\w+)/)?.[1] ?? "";
          const color = FRAGMENT_COLORS[name] ?? "#8a93a8";
          return (
            <pre key={i} className="overflow-x-auto rounded-lg border-l-2 bg-panel-2/60 py-2 pr-2 pl-3 font-mono text-[11.5px] leading-relaxed" style={{ borderColor: color }}>
              {block.trim().split("\n").map((line, j) => (
                <div key={j}>
                  {line.split(/(\.\.\.\w+)/).map((part, k) => {
                    const spread = part.startsWith("...") ? part.slice(3) : null;
                    if (spread) return <span key={k} style={{ color: FRAGMENT_COLORS[spread] }} className="font-semibold">{part}</span>;
                    if (j === 0) return <span key={k} style={{ color }}>{part}</span>;
                    return <span key={k} className="text-muted">{part}</span>;
                  })}
                </div>
              ))}
            </pre>
          );
        })}
      </div>
    </Panel>
  );
}

function FragmentLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {Object.entries(FRAGMENT_COLORS).map(([name, color]) => (
        <span key={name} className="flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
          <span className="size-2 rounded-full" style={{ background: color }} />
          {name}
        </span>
      ))}
    </div>
  );
}

export function Json({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
