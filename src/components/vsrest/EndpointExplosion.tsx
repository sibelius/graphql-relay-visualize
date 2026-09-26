"use client";

import { useState } from "react";
import clsx from "clsx";
import { Panel, Stat } from "../ui";

// Each screen, in the order a product typically ships them, with the REST
// endpoints it calls. `added` marks endpoints created specifically for it.
const SCREENS = [
  { name: "Feed", rest: ["GET /posts", "GET /users/:id"], added: [], fragments: ["FeedRow_post", "AuthorName_user"] },
  { name: "Post page", rest: ["GET /posts/:id", "GET /posts/:id/comments", "GET /users/:id"], added: [], fragments: ["PostCard_post", "CommentItem_comment"] },
  { name: "Profile", rest: ["GET /users/:id", "GET /users/:id/posts", "GET /users/:id/followers"], added: [], fragments: ["ViewerBar_user", "PostTitle_post"] },
  { name: "Mobile feed", rest: ["GET /mobile/feed"], added: ["GET /mobile/feed"], fragments: ["FeedRow_post"] },
  { name: "Notifications", rest: ["GET /notifications", "GET /posts/:id", "GET /users/:id"], added: ["GET /notifications"], fragments: ["Notification_item", "AuthorName_user"] },
  { name: "Feed v2 + previews", rest: ["GET /feed?include=author,comments"], added: ["GET /feed?include=author,comments"], fragments: ["PostCard_post"] },
  { name: "Top-post widget", rest: ["GET /stats/top-post"], added: ["GET /stats/top-post"], fragments: ["MiniLikes_post"] },
  { name: "Search", rest: ["GET /search/posts?q=", "GET /search/users?q=", "GET /users/:id"], added: ["GET /search/posts?q=", "GET /search/users?q="], fragments: ["PostTitle_post", "AuthorName_user"] },
] as const;

const TYPES = ["Query", "User", "Post", "Comment", "Notification"];

export function EndpointExplosion() {
  const [count, setCount] = useState(4);
  const [mode, setMode] = useState<"rest" | "graphql">("rest");
  const [hover, setHover] = useState<number | null>(null);
  const screens = SCREENS.slice(0, count);

  const endpoints = [...new Set(screens.flatMap((s) => s.rest))];
  const rowH = 34;
  const leftX = 150;
  const rightX = 560;
  const height = Math.max(screens.length, mode === "rest" ? endpoints.length : TYPES.length, 4) * rowH + 30;
  // Center each column vertically.
  const yOf = (i: number, n: number) => (height - (n - 1) * rowH) / 2 + i * rowH;

  const newestAdded = new Set<string>(screens.at(-1)?.added ?? []);
  const fragmentsTotal = new Set(screens.flatMap((s) => s.fragments)).size;

  return (
    <Panel
      title="Ship screens, count endpoints"
      right={
        <div className="flex gap-1 rounded-lg border border-line bg-bg p-0.5 text-xs">
          {(["rest", "graphql"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={clsx("rounded-md px-2.5 py-1", mode === m ? "bg-panel-2 text-ink" : "text-muted")}
            >
              {m === "rest" ? "REST" : "GraphQL + Relay"}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm text-muted">
          Screens shipped
          <input
            type="range"
            min={1}
            max={SCREENS.length}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-48 accent-[var(--color-accent)]"
          />
          <span className="font-mono text-ink">{count}</span>
        </label>
        <span className="text-xs text-faint">Newest: {screens.at(-1)?.name}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 760 ${height}`} className="min-w-[640px]" role="img" aria-label="Screens connected to the endpoints they call">
            {mode === "rest"
              ? screens.flatMap((s, si) =>
                  s.rest.map((e) => {
                    const ei = endpoints.indexOf(e);
                    const y1 = yOf(si, screens.length);
                    const y2 = yOf(ei, endpoints.length);
                    const hot = hover === si;
                    return (
                      <path
                        key={`${s.name}-${e}`}
                        d={`M ${leftX} ${y1} C ${(leftX + rightX) / 2} ${y1}, ${(leftX + rightX) / 2} ${y2}, ${rightX} ${y2}`}
                        fill="none"
                        stroke={hot ? "#60a5fa" : "#2f3748"}
                        strokeWidth={hot ? 2 : 1.2}
                        opacity={hover != null && !hot ? 0.35 : 1}
                      />
                    );
                  }),
                )
              : screens.map((s, si) => {
                  const y1 = yOf(si, screens.length);
                  const y2 = height / 2;
                  const hot = hover === si;
                  return (
                    <path
                      key={s.name}
                      d={`M ${leftX} ${y1} C 260 ${y1}, 260 ${y2}, 330 ${y2}`}
                      fill="none"
                      stroke={hot ? "#e535ab" : "#2f3748"}
                      strokeWidth={hot ? 2 : 1.2}
                    />
                  );
                })}

            {mode === "graphql" &&
              TYPES.map((t, ti) => {
                const y = yOf(ti, TYPES.length);
                return <path key={t} d={`M 450 ${height / 2} C 510 ${height / 2}, 510 ${y}, ${rightX} ${y}`} fill="none" stroke="#2f3748" strokeWidth={1.2} />;
              })}

            {screens.map((s, si) => {
              const y = yOf(si, screens.length);
              const isNew = si === screens.length - 1;
              return (
                <g key={s.name} onMouseEnter={() => setHover(si)} onMouseLeave={() => setHover(null)} className="cursor-default">
                  <rect x={10} y={y - 12} width={leftX - 10} height={24} rx={6} fill={isNew ? "#f26b0022" : "#171b24"} stroke={isNew ? "#f26b00" : "#242a38"} />
                  <text x={20} y={y + 4} fill="#e7e9f0" fontSize={11.5}>
                    {s.name}
                  </text>
                </g>
              );
            })}

            {mode === "rest" ? (
              endpoints.map((e, ei) => {
                const y = yOf(ei, endpoints.length);
                const fresh = newestAdded.has(e);
                return (
                  <g key={e}>
                    <rect x={rightX} y={y - 12} width={190} height={24} rx={6} fill={fresh ? "#fbbf2418" : "#171b24"} stroke={fresh ? "#fbbf24" : "#242a38"} />
                    <text x={rightX + 10} y={y + 4} fill={fresh ? "#fbbf24" : "#8a93a8"} fontSize={10.5} fontFamily="var(--font-mono)">
                      {e.length > 28 ? e.slice(0, 27) + "…" : e}
                    </text>
                  </g>
                );
              })
            ) : (
              <>
                <rect x={330} y={height / 2 - 16} width={120} height={32} rx={8} fill="#e535ab1c" stroke="#e535ab" />
                <text x={390} y={height / 2 + 4} textAnchor="middle" fill="#e535ab" fontSize={12} fontFamily="var(--font-mono)">
                  POST /graphql
                </text>
                {TYPES.map((t, ti) => {
                  const y = yOf(ti, TYPES.length);
                  return (
                    <g key={t}>
                      <rect x={rightX} y={y - 12} width={130} height={24} rx={6} fill="#171b24" stroke="#242a38" />
                      <text x={rightX + 10} y={y + 4} fill="#38bdf8" fontSize={11}>
                        {t}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        <div className="grid content-start gap-2">
          {mode === "rest" ? (
            <>
              <Stat label="Endpoints the frontend depends on" value={endpoints.length} tone="bad" />
              <Stat label="Created for a single screen" value={screens.flatMap((s) => s.added).length} tone="bad" />
              <Stat label="Requests to render the newest screen" value={screens.at(-1)?.rest.length ?? 0} />
              <p className="text-xs leading-relaxed text-muted">
                Yellow endpoints were added for the newest screen. Each one needs backend work, docs, versioning, and
                frontend fetch, cache and type code, and none can be deleted while an old app version still calls it.
              </p>
            </>
          ) : (
            <>
              <Stat label="Endpoints the frontend depends on" value={1} tone="good" />
              <Stat label="Fragments across all screens" value={fragmentsTotal} />
              <Stat label="Requests to render any screen" value={1} tone="good" />
              <p className="text-xs leading-relaxed text-muted">
                A new screen is a new composition of fragments over types that already exist. The backend changes only
                when the product needs genuinely new data, not a new shape of existing data.
              </p>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
