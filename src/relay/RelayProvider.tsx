"use client";

import { Suspense, useSyncExternalStore, type ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { getEnvironment } from "./environment";

const noop = () => () => {};

// Relay here talks to a relative /api/graphql URL, so the Relay-driven parts of
// each page render on the client only. The static shell still server-renders.
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function RelayProvider({ children }: { children: ReactNode }) {
  return <RelayEnvironmentProvider environment={getEnvironment()}>{children}</RelayEnvironmentProvider>;
}

export function RelayBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const isClient = useIsClient();
  const loading = fallback ?? <Loading />;
  if (!isClient) return <>{loading}</>;
  return <Suspense fallback={loading}>{children}</Suspense>;
}

export function Loading({ label = "Fetching with Relay…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-panel p-6 text-sm text-muted">
      <span className="size-2 animate-ping rounded-full bg-accent" />
      {label}
    </div>
  );
}
