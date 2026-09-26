"use client";

import { Environment, Network, Observable, RecordSource, Store, type FetchFunction, type GraphQLResponse } from "relay-runtime";
import { inspector } from "./inspector";

const utf8 = new TextEncoder();

type Incremental = { data?: unknown; items?: unknown[]; path: (string | number)[]; label?: string; errors?: unknown[] };
type Payload = { data?: unknown; errors?: { message: string }[]; incremental?: Incremental[]; hasNext?: boolean; extensions?: unknown };

/** Converts one server payload into the per-fragment responses Relay's executor consumes. */
function toRelayResponses(payload: Payload): GraphQLResponse[] {
  if (!payload.incremental) return [payload as GraphQLResponse];
  const out: GraphQLResponse[] = [];
  for (const inc of payload.incremental) {
    if (inc.items) {
      // Stream payloads point at the index of their first item; Relay wants one response per item.
      const base = inc.path.slice(0, -1);
      const start = Number(inc.path.at(-1));
      inc.items.forEach((item, i) =>
        out.push({ data: item, path: [...base, start + i], label: inc.label, extensions: { is_final: false } } as unknown as GraphQLResponse),
      );
    } else {
      out.push({ data: inc.data, path: inc.path, label: inc.label, errors: inc.errors } as unknown as GraphQLResponse);
    }
  }
  return out;
}

const fetchFn: FetchFunction = (params, variables) =>
  Observable.create<GraphQLResponse>((sink) => {
    // The compiler persisted every operation at build time, so the request
    // carries an md5 id instead of the query text.
    const body = JSON.stringify(params.id ? { doc_id: params.id, variables } : { query: params.text, variables });
    const { latency, fail } = inspector.get().settings;
    const opId = inspector.startOperation({
      name: params.name,
      kind: params.operationKind,
      docId: params.id ?? null,
      variables,
      startedAt: performance.now(),
      requestBytes: utf8.encode(body).length,
    });
    const controller = new AbortController();

    (async () => {
      const res = await fetch("/api/graphql", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-demo-latency": String(latency),
          ...(fail && params.operationKind === "mutation" ? { "x-demo-fail": "1" } : {}),
        },
        body,
      });

      const payloads: Payload[] = [];
      let bytes = 0;
      const emit = (text: string) => {
        bytes += utf8.encode(text).length;
        const payload = JSON.parse(text) as Payload;
        payloads.push(payload);
        inspector.addChunk(opId, { at: performance.now(), bytes: utf8.encode(text).length, labels: payload.incremental?.map((i) => i.label ?? "") ?? [] });
        if (payload.errors?.length && payload.data == null && !payload.incremental) throw new Error(payload.errors[0].message);
        for (const r of toRelayResponses(payload)) sink.next(r);
      };

      if (res.headers.get("content-type")?.includes("ndjson") && res.body) {
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.trim()) emit(line);
          }
        }
      } else {
        emit(await res.text());
      }

      const errors = payloads.flatMap((p) => p.errors ?? []);
      inspector.endOperation(opId, {
        status: errors.length ? "error" : "ok",
        responseBytes: bytes,
        response: payloads.length === 1 ? payloads[0] : payloads,
        error: errors[0]?.message,
      });
      sink.complete();
    })().catch((e: Error) => {
      if (e.name === "AbortError") return;
      inspector.endOperation(opId, { status: "error", error: e.message });
      sink.error(e);
    });

    return () => controller.abort();
  });

export function createEnvironment({ attach = true }: { attach?: boolean } = {}) {
  const log = inspector.log;
  const store = new Store(new RecordSource(), { log } as ConstructorParameters<typeof Store>[1]);
  const env = new Environment({ network: Network.create(fetchFn), store, log, isServer: typeof window === "undefined" });
  if (attach) inspector.attachSource(() => store.getSource());
  return env;
}

let environment: Environment | null = null;

export function getEnvironment() {
  return (environment ??= createEnvironment());
}
