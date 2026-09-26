"use client";

import { useSyncExternalStore } from "react";
import type { LogEvent } from "relay-runtime";

type RecordSource = { getRecordIDs(): string[]; get(id: string): unknown };

// A tiny external store fed by Relay's `log` hook and by our network layer.
// Every visualization in the app reads from here instead of reaching into
// Relay internals directly.

export type OperationEntry = {
  id: number;
  name: string;
  kind: string;
  docId: string | null;
  variables: Record<string, unknown>;
  startedAt: number;
  endedAt: number | null;
  status: "in-flight" | "ok" | "error";
  requestBytes: number;
  responseBytes: number;
  response: unknown;
  error?: string;
  /** One entry per payload; @defer/@stream operations have several. */
  chunks: { at: number; bytes: number; labels: string[] }[];
};

export type Chunk = OperationEntry["chunks"][number];

export type RecordSnapshot = Record<string, Record<string, unknown>>;

export type StoreUpdate = {
  id: number;
  at: number;
  source: string;
  optimistic: boolean;
  updatedRecordIDs: string[];
  diff: { id: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null }[];
};

export type TimelineEvent = {
  id: number;
  at: number;
  kind: "execute.start" | "optimistic" | "network.start" | "network.next" | "network.error" | "publish" | "notify" | "rollback";
  label: string;
  operation?: string;
};

export type DemoSettings = { latency: number; fail: boolean };

type State = {
  operations: OperationEntry[];
  storeUpdates: StoreUpdate[];
  timeline: TimelineEvent[];
  records: RecordSnapshot;
  settings: DemoSettings;
  epoch: number;
};

const initialState: State = {
  operations: [],
  storeUpdates: [],
  timeline: [],
  records: {},
  settings: { latency: 250, fail: false },
  epoch: 0,
};
let state: State = initialState;

const listeners = new Set<() => void>();
let seq = 0;
let getSource: (() => RecordSource) | null = null;
let pendingOptimistic = false;

let scheduled = false;

// Relay can log while React is rendering (a query starting inside
// useLazyLoadQuery), so subscribers are notified on a microtask.
function set(patch: Partial<State>) {
  state = { ...state, ...patch, epoch: state.epoch + 1 };
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    listeners.forEach((l) => l());
  });
}

export const inspector = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,

  attachSource(fn: () => RecordSource) {
    getSource = fn;
  },

  setSettings(patch: Partial<DemoSettings>) {
    set({ settings: { ...state.settings, ...patch } });
  },

  clear() {
    set({ operations: [], storeUpdates: [], timeline: [] });
  },

  startOperation(entry: Omit<OperationEntry, "id" | "endedAt" | "status" | "responseBytes" | "response" | "chunks">) {
    const id = ++seq;
    set({
      operations: [{ ...entry, id, endedAt: null, status: "in-flight" as const, responseBytes: 0, response: null, chunks: [] }, ...state.operations].slice(0, 80),
    });
    return id;
  },

  addChunk(id: number, chunk: Chunk) {
    set({ operations: state.operations.map((op) => (op.id === id ? { ...op, chunks: [...op.chunks, chunk] } : op)) });
  },

  endOperation(id: number, patch: Partial<OperationEntry>) {
    set({ operations: state.operations.map((op) => (op.id === id ? { ...op, endedAt: performance.now(), ...patch } : op)) });
  },

  pushTimeline(kind: TimelineEvent["kind"], label: string, operation?: string) {
    set({ timeline: [...state.timeline, { id: ++seq, at: performance.now(), kind, label, operation }].slice(-60) });
  },

  // Relay's LogFunction. Wired into both the Environment and the Store.
  log(event: LogEvent) {
    switch (event.name) {
      case "execute.start":
        if (event.params.operationKind === "mutation") inspector.pushTimeline("execute.start", "commitMutation()", event.params.name);
        break;
      case "execute.next.start": {
        const params = event.operation.request.node.params;
        if (params.operationKind === "mutation") {
          const errors = (event.response as { errors?: { message: string }[] }).errors;
          inspector.pushTimeline(
            errors?.length ? "network.error" : "network.next",
            errors?.length ? `server rejected it: ${errors[0].message}` : "server payload received",
            params.name,
          );
        }
        break;
      }
      case "execute.error":
        inspector.pushTimeline("network.error", event.error.message.split("\n")[0], undefined);
        break;
      case "store.publish":
        pendingOptimistic = event.optimistic;
        if (event.optimistic) inspector.pushTimeline("optimistic", "optimistic update applied");
        break;
      case "store.restore":
        inspector.pushTimeline("rollback", "optimistic layer rolled back");
        break;
      case "store.notify.complete": {
        const next = snapshot();
        // Records are immutable, so a new reference means a change. This also
        // catches records reverted when an optimistic layer is rolled back,
        // which updatedRecordIDs doesn't always list.
        const changed = new Set<string>(event.updatedRecordIDs as unknown as Set<string>);
        for (const id of new Set([...Object.keys(state.records), ...Object.keys(next)])) {
          if (state.records[id] !== next[id]) changed.add(id);
        }
        const ids = [...changed];
        const diff = ids.map((id) => ({ id, before: state.records[id] ?? null, after: next[id] ?? null }));
        const source = event.sourceOperation?.request.node.params.name ?? (pendingOptimistic ? "optimistic" : "local update");
        const update: StoreUpdate = {
          id: ++seq,
          at: performance.now(),
          source,
          optimistic: pendingOptimistic,
          updatedRecordIDs: ids,
          diff,
        };
        pendingOptimistic = false;
        set({ records: next, storeUpdates: ids.length ? [update, ...state.storeUpdates].slice(0, 40) : state.storeUpdates });
        if (ids.length) inspector.pushTimeline("notify", `${ids.length} record${ids.length === 1 ? "" : "s"} changed → subscribers notified`, source);
        break;
      }
    }
  },
};

function snapshot(): RecordSnapshot {
  if (!getSource) return {};
  const source = getSource();
  const out: RecordSnapshot = {};
  for (const id of source.getRecordIDs()) {
    const rec = source.get(id);
    if (rec) out[id] = rec as unknown as Record<string, unknown>;
  }
  return out;
}

export function refreshRecords() {
  set({ records: snapshot() });
}

export function useInspector<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    inspector.subscribe,
    () => select(state),
    // Hydration must match the server render, which never saw any Relay activity.
    () => select(initialState),
  );
}
