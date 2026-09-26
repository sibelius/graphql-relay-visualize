# Relay, visualized

An interactive Next.js app that shows — with live diagrams, not slides — what GraphQL and Relay actually do for a React app.

Every page runs a real **Relay 21** environment against a real **GraphQL (graphql-js 17)** server living in this app's API routes. The visualizations are drawn from Relay's own `log` events and from the live store (`environment.getStore().getSource()`), so what you see is what the runtime did.

## Pages

| # | Page | What you can see |
|---|------|------------------|
| 01 | **One round trip** | A measured race: REST waterfall + N+1 author requests vs a single GraphQL query. Gantt timeline, bytes, over-fetched fields. |
| 02 | **Colocation & masking** | X-ray mode outlines every component with its fragment. Hover to see the opaque fragment ref vs what `useFragment` returns; view the query the compiler stitched together. |
| 03 | **Normalized store** | The response tree next to the store's record graph (React Flow + dagre). Duplicates collapse into one record; a second query merges into existing records. |
| 04 | **Optimistic & consistent** | One post rendered by three components. Like it: optimistic update, server commit or rollback, a store diff, and render counters showing only readers re-render. |
| 05 | **Connections** | `usePaginationFragment` + `@connection` drawn as edges, cursors and `pageInfo`, colored by the page that fetched them, plus the generated refetch query. |
| 06 | **The compiler** | For every artifact: the `graphql` literal you wrote, the generated TS types, the persisted operation text and the runtime artifact. |
| 07 | **Schema graph** | The schema via introspection as a navigable type graph, with Relay plumbing (connections, payloads) toggleable. |
| 08 | **vs REST & friends** | A requirements × approaches matrix (fetch, TanStack Query, BFF, tRPC, Relay) driving a complexity chart, an "endpoint explosion" diagram, and the same feature written three ways. |
| 09 | **Relay vs Apollo** | 14 capabilities compared against Relay 21 and Apollo Client 4.3 (default / opt-in / tooling / hand-written), each with code for both sides. |
| 10 | **Advanced Relay** | `@defer` and `@stream` running live over NDJSON, React Server Component preloading into the Relay store, `@required` / `@catch`, and more. |

A persistent **Relay devtools** drawer at the bottom lists every operation (request/response bytes, timing) and every store update.

## How it works

- **Server**: `src/server/schema.ts` is a code-first graphql-js schema using `graphql-relay` helpers (Node interface, global ids, connections, Relay mutations) over an in-memory dataset. `/api/graphql` executes with `legacyExecuteIncrementally`, so `@defer`/`@stream` stream back as newline-delimited JSON.
- **Persisted queries**: `relay-compiler` persists every operation to `persisted_queries.json`. The browser only sends `{ doc_id, variables }`.
- **Network layer**: `src/relay/environment.ts` returns a Relay `Observable`, parses the NDJSON stream and converts each incremental payload into the per-fragment responses Relay's executor expects.
- **Inspector**: `src/relay/inspector.ts` is a tiny external store fed by Relay's `log` hook (`execute.*`, `store.publish`, `store.notify.complete`, …) that every visualization reads.
- **Latency & failures**: the slider and "reject mutations" toggle send `x-demo-latency` / `x-demo-fail` headers, so the demos behave the same at any network speed.

## Run it

```bash
pnpm install
pnpm dev        # prints the schema, runs relay-compiler --watch (needs watchman) and next dev
```

```bash
pnpm build && pnpm start
```

Requires Node 24 (the schema script uses Node's built-in TypeScript type stripping).

Data lives in memory: mutations reset when the server restarts (`POST /api/reset` resets it too). On serverless hosting, each instance has its own copy.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Relay 21 (`react-relay`, `relay-compiler`, SWC plugin) · graphql-js 17 · graphql-relay · Tailwind CSS 4 · React Flow + dagre · Shiki
