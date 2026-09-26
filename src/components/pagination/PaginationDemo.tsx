"use client";

import { useMemo, useRef, useState } from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import clsx from "clsx";
import persisted from "../../../persisted_queries.json";
import RefetchQuery from "@/__generated__/PaginationListRefetchQuery.graphql";
import type { PaginationDemoQuery as QueryType } from "@/__generated__/PaginationDemoQuery.graphql";
import type { PaginationList_query$key } from "@/__generated__/PaginationList_query.graphql";
import type { PaginationListRefetchQuery } from "@/__generated__/PaginationListRefetchQuery.graphql";
import { useInspector } from "@/relay/inspector";
import { Avatar, Button, Panel, Stat } from "../ui";
import { unwrap } from "../colocation/xray";

const query = graphql`
  query PaginationDemoQuery {
    ...PaginationList_query
  }
`;

const fragment = graphql`
  fragment PaginationList_query on Query
  @argumentDefinitions(count: { type: "Int", defaultValue: 3 }, cursor: { type: "String" })
  @refetchable(queryName: "PaginationListRefetchQuery") {
    feed(first: $count, after: $cursor) @connection(key: "PaginationList_feed") {
      totalCount
      edges {
        cursor
        node {
          id
          title
          likeCount
          author {
            name
            avatarColor
          }
        }
      }
    }
  }
`;

const PAGE_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#22d3ee", "#f26b00", "#e535ab"];
const CONNECTION_ID = "client:root:__PaginationList_feed_connection";

const decodeCursor = (c: string | null | undefined) => {
  if (!c) return "null";
  try {
    return atob(c);
  } catch {
    return c;
  }
};

export function PaginationDemo() {
  const root = useLazyLoadQuery<QueryType>(query, {});
  const { data, loadNext, hasNext, isLoadingNext, refetch } = usePaginationFragment<PaginationListRefetchQuery, PaginationList_query$key>(
    fragment,
    root,
  );
  const [pageSize, setPageSize] = useState(3);
  const records = useInspector((s) => s.records);
  const ops = useInspector((s) => s.operations).filter((o) => o.name.startsWith("Pagination"));

  // Remember which page brought each edge in, to color the strip.
  const pageOf = useRef(new Map<string, number>());
  const pages = useRef(0);
  const edges = data.feed.edges ?? [];
  const unseen = edges.filter((e) => e?.node && !pageOf.current.has(e.node.id));
  if (unseen.length) {
    unseen.forEach((e) => pageOf.current.set(e!.node!.id, pages.current));
    pages.current += 1;
  }

  const connection = records[CONNECTION_ID] as Record<string, unknown> | undefined;
  const pageInfoId = (connection?.pageInfo as { __ref?: string } | undefined)?.__ref;
  const pageInfo = pageInfoId ? records[pageInfoId] : undefined;
  const endCursor = pageInfo?.endCursor as string | undefined;
  const refetchId = (unwrap(RefetchQuery) as unknown as { params: { id: string } }).params.id;
  const refetchText = (persisted as Record<string, string>)[refetchId] ?? "";

  const lastVars = useMemo(() => ops.find((o) => o.name === "PaginationListRefetchQuery")?.variables, [ops]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={!hasNext || isLoadingNext}
          onClick={() => loadNext(pageSize)}
        >
          {isLoadingNext ? "Loading…" : hasNext ? `loadNext(${pageSize})` : "No more pages"}
        </Button>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1 text-xs">
          {[1, 2, 3, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPageSize(n)}
              className={clsx("rounded-md px-2 py-0.5 font-mono", pageSize === n ? "bg-panel-2 text-ink" : "text-muted")}
            >
              {n}
            </button>
          ))}
          <span className="px-1 text-faint">page size</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            pageOf.current.clear();
            pages.current = 0;
            refetch({ count: 3, cursor: null }, { fetchPolicy: "network-only" });
          }}
        >
          ↺ refetch from the start
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Edges in the connection" value={edges.length} />
        <Stat label="Total posts on the server" value={data.feed.totalCount} />
        <Stat label="Pages fetched" value={pages.current} />
        <Stat label="hasNextPage" value={String(hasNext)} tone={hasNext ? "good" : "bad"} />
      </div>

      <Panel title="The connection record in the store" right={<span className="font-mono text-[11px] text-faint">{CONNECTION_ID}</span>}>
        <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
          <div className="flex w-48 shrink-0 flex-col justify-between rounded-lg border border-accent/40 bg-accent/5 p-3 font-mono text-[11px]">
            <div>
              <div className="font-semibold text-accent">PostConnection</div>
              <div className="mt-2 text-muted">
                edges: <span className="text-ink">[{edges.length}]</span>
              </div>
              <div className="text-muted">
                totalCount: <span className="text-ink">{data.feed.totalCount}</span>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-line bg-bg/60 p-2">
              <div className="text-faint">pageInfo</div>
              <div className="text-muted">
                hasNextPage: <span className={hasNext ? "text-ok" : "text-bad"}>{String(hasNext)}</span>
              </div>
              <div className="text-muted">
                endCursor: <span className="text-accent">{decodeCursor(endCursor)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {edges.map((e, i) => {
              if (!e?.node) return null;
              const page = pageOf.current.get(e.node.id) ?? 0;
              const color = PAGE_COLORS[page % PAGE_COLORS.length];
              const isEnd = e.cursor === endCursor;
              return (
                <div
                  key={e.node.id}
                  className="flex w-40 shrink-0 animate-rise flex-col rounded-lg border bg-panel-2/60 p-2.5 font-mono text-[10.5px]"
                  style={{ borderColor: color + "88" }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color }}>edges[{i}]</span>
                    <span className="rounded px-1 text-[9.5px] text-black" style={{ background: color }}>
                      page {page + 1}
                    </span>
                  </div>
                  <div className={clsx("mt-1.5", isEnd ? "text-accent" : "text-faint")}>cursor: {decodeCursor(e.cursor)}</div>
                  <div className="mt-1.5 line-clamp-2 font-sans text-xs text-ink">{e.node.title}</div>
                  {isEnd && <div className="mt-1 text-[9.5px] text-accent">↑ endCursor — next page starts after this</div>}
                </div>
              );
            })}
            {hasNext && (
              <button
                type="button"
                onClick={() => loadNext(pageSize)}
                disabled={isLoadingNext}
                className="flex h-full min-h-28 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-xs text-faint hover:border-faint hover:text-ink"
              >
                {isLoadingNext ? "fetching…" : `+ ${pageSize} more`}
              </button>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="The list component">
          <ul className="space-y-1.5">
            {edges.map((e) =>
              e?.node ? (
                <li key={e.node.id} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="h-6 w-1 rounded-full"
                    style={{ background: PAGE_COLORS[(pageOf.current.get(e.node.id) ?? 0) % PAGE_COLORS.length] }}
                  />
                  <Avatar name={e.node.author.name} color={e.node.author.avatarColor} size={20} />
                  <span className="truncate">{e.node.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-faint">♥ {e.node.likeCount}</span>
                </li>
              ) : null,
            )}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            The component just maps over <code className="font-mono text-ink">data.feed.edges</code>. It never merges pages, tracks cursors or
            dedupes items. <code className="font-mono text-ink">@connection</code> tells Relay to append each page into the same record.
          </p>
        </Panel>
        <Panel title="Generated by the compiler" right={<span className="font-mono text-[11px] text-faint">PaginationListRefetchQuery</span>}>
          <p className="mb-3 text-xs leading-relaxed text-muted">
            <code className="font-mono text-ink">@refetchable</code> made the compiler write this query for you. Each{" "}
            <code className="font-mono text-ink">loadNext</code> sends it with the current end cursor:
          </p>
          <pre className="mb-3 rounded-lg bg-panel-2/60 p-2.5 font-mono text-[11px] text-accent">
            variables: {JSON.stringify(lastVars ?? { count: pageSize, cursor: endCursor ?? null })}
          </pre>
          <pre className="max-h-72 overflow-auto rounded-lg bg-panel-2/60 p-2.5 font-mono text-[11px] leading-relaxed text-muted">{refetchText}</pre>
        </Panel>
      </div>
    </div>
  );
}
