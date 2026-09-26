"use client";

import { useEffect, useRef, useState } from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import clsx from "clsx";
import type { WaterfallDemoQuery as QueryType, WaterfallDemoQuery$data } from "@/__generated__/WaterfallDemoQuery.graphql";
import { inspector, useInspector } from "@/relay/inspector";
import { Avatar, Button, Panel, Stat, formatBytes } from "../ui";

const query = graphql`
  query WaterfallDemoQuery($username: String!) {
    user(username: $username) {
      name
      avatarColor
      posts(first: 4) {
        edges {
          node {
            id
            title
            comments(first: 5) {
              edges {
                node {
                  id
                  body
                  author {
                    name
                    avatarColor
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

type Req = { id: number; label: string; depth: number; start: number; end: number | null; bytes: number };
type Run = { t0: number; rest: Req[]; gql: Req | null; restDone: number | null; gqlDone: number | null };

const utf8 = new TextEncoder();

export function WaterfallDemo() {
  const environment = useRelayEnvironment();
  const latency = useInspector((s) => s.settings.latency);
  const [dedupe, setDedupe] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [now, setNow] = useState(0);
  const [restSample, setRestSample] = useState<Record<string, unknown> | null>(null);
  const [gqlData, setGqlData] = useState<WaterfallDemoQuery$data | null>(null);
  const running = run != null && (run.restDone == null || run.gqlDone == null);
  const runRef = useRef<Run | null>(null);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  function update(fn: (r: Run) => Run) {
    runRef.current = fn(runRef.current!);
    setRun(runRef.current);
  }

  async function race() {
    const t0 = performance.now();
    runRef.current = { t0, rest: [], gql: null, restDone: null, gqlDone: null };
    setRun(runRef.current);
    setGqlData(null);
    let seq = 0;

    const get = async <T,>(url: string, label: string, depth: number): Promise<T> => {
      const id = ++seq;
      update((r) => ({ ...r, rest: [...r.rest, { id, label, depth, start: performance.now(), end: null, bytes: 0 }] }));
      const res = await fetch(`${url}?latency=${latency}`);
      const text = await res.text();
      const end = performance.now();
      update((r) => ({ ...r, rest: r.rest.map((q) => (q.id === id ? { ...q, end, bytes: utf8.encode(text).length } : q)) }));
      return JSON.parse(text) as T;
    };

    const restFlow = async () => {
      const user = await get<Record<string, unknown>>("/api/rest/users/u1", "GET /users/u1", 0);
      setRestSample(user);
      const posts = await get<{ id: string }[]>("/api/rest/users/u1/posts", "GET /users/u1/posts", 1);
      const commentLists = await Promise.all(
        posts.map((p) => get<{ authorId: string }[]>(`/api/rest/posts/${p.id}/comments`, `GET /posts/${p.id}/comments`, 2)),
      );
      const authorIds = commentLists.flat().map((c) => c.authorId);
      const toFetch = dedupe ? [...new Set(authorIds)] : authorIds;
      await Promise.all(toFetch.map((id) => get(`/api/rest/users/${id}`, `GET /users/${id}`, 3)));
      update((r) => ({ ...r, restDone: performance.now() }));
    };

    const gqlFlow = async () => {
      const start = performance.now();
      update((r) => ({ ...r, gql: { id: 0, label: "POST /api/graphql", depth: 0, start, end: null, bytes: 0 } }));
      const data = await fetchQuery<QueryType>(environment, query, { username: "ada" }, { fetchPolicy: "network-only" }).toPromise();
      const op = inspector.get().operations.find((o) => o.name === "WaterfallDemoQuery");
      const end = performance.now();
      setGqlData(data ?? null);
      update((r) => ({ ...r, gql: { ...r.gql!, end, bytes: op?.responseBytes ?? 0 }, gqlDone: end }));
    };

    await Promise.all([restFlow(), gqlFlow()]);
  }

  const clock = running ? now : Math.max(run?.restDone ?? 0, run?.gqlDone ?? 0);
  const span = run ? Math.max(clock - run.t0, 1) : 1;
  const restBytes = run?.rest.reduce((a, r) => a + r.bytes, 0) ?? 0;
  const restMs = run?.restDone ? Math.round(run.restDone - run.t0) : null;
  const gqlMs = run?.gqlDone && run.gql ? Math.round(run.gqlDone - run.gql.start) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={race} disabled={running}>
          {running ? "Racing…" : run ? "Race again" : "▶ Race REST vs GraphQL"}
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} className="accent-[var(--color-accent)]" />
          Dedupe author requests on the REST side (hand-written client cache)
        </label>
      </div>

      <Panel
        title="Request timeline"
        right={<span className="font-mono text-[11px] text-faint">{run ? `${Math.round(span)} ms` : "idle"}</span>}
      >
        {!run && (
          <p className="py-8 text-center text-sm text-faint">
            Race both clients to draw the timeline. Each bar is a real request to this app&apos;s API routes.
          </p>
        )}
        {run && (
          <div className="space-y-5">
            <Lane title="REST" subtitle="user → posts → comments per post → author per comment" color="var(--color-info)">
              {run.rest.map((r) => (
                <Bar key={r.id} req={r} t0={run.t0} span={span} clock={clock} color="var(--color-info)" />
              ))}
            </Lane>
            <Lane title="GraphQL + Relay" subtitle="one query, the server resolves the whole tree" color="var(--color-gql)">
              {run.gql && <Bar req={run.gql} t0={run.t0} span={span} clock={clock} color="var(--color-gql)" />}
            </Lane>
          </div>
        )}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="REST requests" value={run ? run.rest.length : "–"} tone={run ? "bad" : undefined} />
        <Stat label="GraphQL requests" value={run?.gql ? 1 : "–"} tone={run ? "good" : undefined} />
        <Stat
          label="Time to all data"
          value={
            <span>
              <span className="text-info">{restMs ?? "…"}</span>
              <span className="text-faint"> vs </span>
              <span className="text-gql">{gqlMs ?? "…"}</span>
              <span className="text-xs text-faint"> ms</span>
            </span>
          }
        />
        <Stat
          label="Bytes downloaded"
          value={
            <span>
              <span className="text-info">{run ? formatBytes(restBytes) : "…"}</span>
              <span className="text-faint"> vs </span>
              <span className="text-gql">{run?.gql?.bytes ? formatBytes(run.gql.bytes) : "…"}</span>
            </span>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="REST: GET /users/u1" right={<span className="text-[11px] text-faint">dimmed = fetched but never rendered</span>}>
          {restSample ? <OverFetchJson value={restSample} used={["name", "avatarColor"]} /> : <Hint />}
        </Panel>
        <Panel title="GraphQL: the rendered result" right={<span className="text-[11px] text-faint">exactly the selected fields</span>}>
          {gqlData?.user ? <Rendered data={gqlData} /> : <Hint />}
        </Panel>
      </div>
    </div>
  );
}

function Lane({ title, subtitle, color, children }: { title: string; subtitle: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="size-2 rounded-full" style={{ background: color }} />
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-faint">{subtitle}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Bar({ req, t0, span, clock, color }: { req: Req; t0: number; span: number; clock: number; color: string }) {
  const left = ((req.start - t0) / span) * 100;
  const width = (((req.end ?? clock) - req.start) / span) * 100;
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-3 text-[11px]">
      <span className="truncate font-mono text-muted" style={{ paddingLeft: req.depth * 10 }}>
        {req.label}
      </span>
      <div className="relative h-4 rounded bg-panel-2/60">
        <div
          className={clsx("absolute inset-y-0 rounded", req.end == null && "animate-pulse")}
          style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%`, background: color, opacity: req.end == null ? 0.5 : 0.9 }}
        />
        {req.end != null && (
          <span className="absolute top-1/2 -translate-y-1/2 pl-1 font-mono text-[10px] text-faint" style={{ left: `${Math.min(left + width, 88)}%` }}>
            {Math.round(req.end - req.start)}ms · {formatBytes(req.bytes)}
          </span>
        )}
      </div>
    </div>
  );
}

function OverFetchJson({ value, used }: { value: Record<string, unknown>; used: string[] }) {
  const keys = Object.keys(value);
  const wasted = keys.filter((k) => !used.includes(k)).length;
  return (
    <div>
      <div className="mb-3 text-xs text-muted">
        <span className="text-bad">{wasted}</span> of {keys.length} top-level fields are unused — and this is 1 of many requests.
      </div>
      <pre className="font-mono text-[11.5px] leading-relaxed">
        {"{\n"}
        {keys.map((k) => (
          <div key={k} className={used.includes(k) ? "text-ink" : "text-faint/70 line-through decoration-bad/40"}>
            {"  "}
            <span className={used.includes(k) ? "text-accent" : undefined}>&quot;{k}&quot;</span>: {JSON.stringify(value[k])}
          </div>
        ))}
        {"}"}
      </pre>
    </div>
  );
}

function Rendered({ data }: { data: WaterfallDemoQuery$data }) {
  const user = data.user!;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <Avatar name={user.name} color={user.avatarColor} />
        <span className="font-medium">{user.name}</span>
      </div>
      {user.posts.edges?.map((e) =>
        e?.node ? (
          <div key={e.node.id} className="rounded-lg border border-line p-3">
            <div className="font-medium">{e.node.title}</div>
            <div className="mt-2 space-y-1.5">
              {e.node.comments.edges?.map((c) =>
                c?.node ? (
                  <div key={c.node.id} className="flex items-center gap-2 text-xs text-muted">
                    <Avatar name={c.node.author.name} color={c.node.author.avatarColor} size={18} />
                    <span className="text-ink">{c.node.author.name}</span> {c.node.body}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function Hint() {
  return <p className="py-6 text-center text-sm text-faint">Run the race to fill this in.</p>;
}
