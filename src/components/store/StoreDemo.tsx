"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchQuery, graphql, useLazyLoadQuery, useRelayEnvironment } from "react-relay";
import type { StoreDemoQuery as QueryType } from "@/__generated__/StoreDemoQuery.graphql";
import type { StoreDemoProfileQuery } from "@/__generated__/StoreDemoProfileQuery.graphql";
import { refreshRecords, useInspector } from "@/relay/inspector";
import { Button, Panel, Stat, decodeId } from "../ui";
import { StoreGraph, reachable, typeColor } from "../viz/StoreGraph";

const query = graphql`
  query StoreDemoQuery {
    feed(first: 3) {
      edges {
        node {
          title
          likeCount
          author {
            name
            avatarColor
          }
          comments(first: 2) {
            edges {
              node {
                body
                author {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

// A second, unrelated query that selects more fields of a user already in the store.
const profileQuery = graphql`
  query StoreDemoProfileQuery {
    user(username: "alan") {
      bio
      location
      followerCount
    }
  }
`;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export function StoreDemo() {
  useLazyLoadQuery<QueryType>(query, {}, { fetchPolicy: "store-and-network" });
  const environment = useRelayEnvironment();
  const records = useInspector((s) => s.records);
  const operations = useInspector((s) => s.operations);
  const updates = useInspector((s) => s.storeUpdates);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showInternals, setShowInternals] = useState(false);
  const [wholeStore, setWholeStore] = useState(false);
  const [merged, setMerged] = useState(false);

  useEffect(() => refreshRecords(), []);

  const response = operations.find((o) => o.name === "StoreDemoQuery" && o.status === "ok")?.response as { data: Json } | undefined;
  const scope = useMemo(
    () => (wholeStore ? null : reachable(records, merged ? ["feed(first:3)", 'user(username:"alan")'] : ["feed(first:3)"])),
    [records, wholeStore, merged],
  );

  const counts = useMemo(() => {
    const ids: string[] = [];
    const walk = (v: Json) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") {
        if (typeof v.id === "string") ids.push(v.id);
        Object.values(v).forEach(walk);
      }
    };
    if (response) walk(response.data);
    const freq = new Map<string, number>();
    ids.forEach((id) => freq.set(id, (freq.get(id) ?? 0) + 1));
    return { objects: ids.length, unique: freq.size, freq };
  }, [response]);

  const latest = updates[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Objects with an id in the response" value={counts.objects || "…"} />
        <Stat label="Unique records in the store" value={counts.unique || "…"} tone="good" />
        <Stat label="Duplicates collapsed" value={counts.objects ? counts.objects - counts.unique : "…"} tone="good" />
        <Stat label="Records in scope" value={scope ? scope.size : Object.keys(records).length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
        <Panel title="Network response · a tree" bodyClassName="max-h-[640px] overflow-auto">
          <p className="mb-3 text-xs leading-relaxed text-muted">
            The same user can appear many times in one response. Hover an id to find its single record in the graph.
          </p>
          {response ? (
            <div className="font-mono text-[11px] leading-relaxed">
              <JsonTree value={response.data} hovered={hovered} onHover={setHovered} freq={counts.freq} />
            </div>
          ) : (
            <p className="text-sm text-faint">Waiting for the response…</p>
          )}
        </Panel>

        <Panel
          title="Relay store · a graph of records"
          right={
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <Toggle checked={showInternals} onChange={setShowInternals}>
                connection records
              </Toggle>
              <Toggle checked={wholeStore} onChange={setWholeStore}>
                whole store
              </Toggle>
            </div>
          }
        >
          <StoreGraph
            records={records}
            scope={scope}
            showInternals={showInternals}
            highlightId={hovered}
            onHover={setHovered}
            pulseIds={latest?.updatedRecordIDs ?? []}
            pulseKey={latest?.id ?? 0}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              onClick={async () => {
                await fetchQuery<StoreDemoProfileQuery>(environment, profileQuery, {}, { fetchPolicy: "network-only" }).toPromise();
                setMerged(true);
              }}
            >
              Run a second query for Alan&apos;s profile
            </Button>
            <span className="text-xs text-faint">
              {merged
                ? "Its fields merged into the existing User record (it flashed) instead of creating a copy."
                : "A different query, a different shape — watch where its data lands."}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--color-accent)]" />
      {children}
    </label>
  );
}

function JsonTree({
  value,
  hovered,
  onHover,
  freq,
  depth = 0,
  name,
}: {
  value: Json;
  hovered: string | null;
  onHover: (id: string | null) => void;
  freq: Map<string, number>;
  depth?: number;
  name?: string;
}) {
  const pad = { paddingLeft: depth ? 14 : 0 };
  const label = name != null ? <span className="text-muted">{name}: </span> : null;
  if (Array.isArray(value)) {
    return (
      <div style={pad}>
        {label}
        <span className="text-faint">[</span>
        {value.map((v, i) => (
          <JsonTree key={i} value={v} hovered={hovered} onHover={onHover} freq={freq} depth={depth + 1} />
        ))}
        <span className="text-faint">]</span>
      </div>
    );
  }
  if (value && typeof value === "object") {
    const id = typeof value.id === "string" ? value.id : null;
    const typename = id ? decodeId(id).split(":")[0] : undefined;
    const color = typeColor(typename);
    const hot = id != null && id === hovered;
    return (
      <div
        style={{ ...pad, ...(id ? { borderLeft: `2px solid ${hot ? color : color + "44"}`, background: hot ? color + "14" : undefined } : {}) }}
        className={id ? "my-0.5 rounded-r" : undefined}
      >
        {label}
        {id && (
          <button
            type="button"
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            className="mr-1 rounded px-1 font-semibold"
            style={{ color, background: color + "1f" }}
          >
            {decodeId(id)}
            {(freq.get(id) ?? 0) > 1 && <span className="ml-1 text-bad">×{freq.get(id)}</span>}
          </button>
        )}
        {Object.entries(value)
          .filter(([k]) => k !== "id")
          .map(([k, v]) =>
            v && typeof v === "object" ? (
              <JsonTree key={k} name={k} value={v} hovered={hovered} onHover={onHover} freq={freq} depth={depth + 1} />
            ) : (
              <div key={k} style={{ paddingLeft: 14 }}>
                <span className="text-muted">{k}: </span>
                <span className="text-ink">{JSON.stringify(v)}</span>
              </div>
            ),
          )}
      </div>
    );
  }
  return <span>{JSON.stringify(value)}</span>;
}
