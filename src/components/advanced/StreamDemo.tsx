"use client";

import { Suspense, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import type { StreamDemoOnQuery } from "@/__generated__/StreamDemoOnQuery.graphql";
import type { StreamDemoOffQuery } from "@/__generated__/StreamDemoOffQuery.graphql";
import { Loading } from "@/relay/RelayProvider";
import { Avatar, Button } from "../ui";
import { ChunkTimeline } from "./ChunkTimeline";

const onQuery = graphql`
  query StreamDemoOnQuery {
    activity @stream(initialCount: 1, label: "activity") {
      id
      message
      actor {
        name
        avatarColor
      }
    }
  }
`;

const offQuery = graphql`
  query StreamDemoOffQuery {
    activity {
      id
      message
      actor {
        name
        avatarColor
      }
    }
  }
`;

export function StreamDemo() {
  const [run, setRun] = useState<{ n: number; stream: boolean } | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setRun((r) => ({ n: (r?.n ?? 0) + 1, stream: true }))}>
            Load with @stream
          </Button>
          <Button onClick={() => setRun((r) => ({ n: (r?.n ?? 0) + 1, stream: false }))}>Load without</Button>
        </div>
        <div className="min-h-64">
          {run ? (
            <Suspense key={run.n} fallback={<Loading label={run.stream ? "Waiting for the first item…" : "Waiting for all 8 items (~3.2 s)…"} />}>
              {run.stream ? <OnList /> : <OffList />}
            </Suspense>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-6 text-sm text-faint">
              The <code className="font-mono">activity</code> resolver produces one item every ~400 ms. Without{" "}
              <code className="font-mono">@stream</code> the list waits for the last one.
            </p>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-panel-2/30 p-4">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Payloads over one request</div>
        <ChunkTimeline operation="StreamDemoOnQuery" compareTo="StreamDemoOffQuery" />
      </div>
    </div>
  );
}

type Item = { readonly id: string; readonly message: string; readonly actor: { readonly name: string; readonly avatarColor: string } };

function OnList() {
  const data = useLazyLoadQuery<StreamDemoOnQuery>(onQuery, {}, { fetchPolicy: "network-only" });
  return <ActivityList items={data.activity} streaming={data.activity.length < 8} />;
}

function OffList() {
  const data = useLazyLoadQuery<StreamDemoOffQuery>(offQuery, {}, { fetchPolicy: "network-only" });
  return <ActivityList items={data.activity} streaming={false} />;
}

function ActivityList({ items, streaming }: { items: readonly Item[]; streaming: boolean }) {
  const t0 = useRef(performance.now());
  const seen = useRef(new Map<string, number>());
  items.forEach((i) => !seen.current.has(i.id) && seen.current.set(i.id, performance.now() - t0.current));
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex animate-rise items-center gap-2.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm">
          <Avatar name={item.actor.name} color={item.actor.avatarColor} size={20} />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium">{item.actor.name}</span> <span className="text-muted">{item.message}</span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-faint">+{Math.round(seen.current.get(item.id) ?? 0)}ms</span>
        </li>
      ))}
      {streaming && <li className="animate-pulse px-3 py-2 text-xs text-faint">more items streaming…</li>}
    </ul>
  );
}
