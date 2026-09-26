"use client";

import { Suspense, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import type { DeferDemoOnQuery } from "@/__generated__/DeferDemoOnQuery.graphql";
import type { DeferDemoOffQuery } from "@/__generated__/DeferDemoOffQuery.graphql";
import type { DeferDemo_post$key } from "@/__generated__/DeferDemo_post.graphql";
import type { DeferDemoInsights_post$key } from "@/__generated__/DeferDemoInsights_post.graphql";
import { Loading } from "@/relay/RelayProvider";
import { Avatar, Button } from "../ui";
import { ChunkTimeline } from "./ChunkTimeline";

const onQuery = graphql`
  query DeferDemoOnQuery($id: ID!) {
    post(id: $id) {
      ...DeferDemo_post
      ...DeferDemoInsights_post @defer(label: "insights")
    }
  }
`;

const offQuery = graphql`
  query DeferDemoOffQuery($id: ID!) {
    post(id: $id) {
      ...DeferDemo_post
      ...DeferDemoInsights_post
    }
  }
`;

const postFragment = graphql`
  fragment DeferDemo_post on Post {
    title
    excerpt
    author {
      name
      avatarColor
    }
  }
`;

// insights takes ~1.2s on the server.
const insightsFragment = graphql`
  fragment DeferDemoInsights_post on Post {
    insights {
      readMinutes
      wordCount
      sentiment
      related
    }
  }
`;

export function DeferDemo() {
  const [run, setRun] = useState<{ n: number; defer: boolean } | null>(null);
  // A different post each run, so the deferred data is never already in the store.
  const id = run ? btoa(`Post:p${(run.n % 20) + 1}`) : "";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setRun((r) => ({ n: (r?.n ?? 0) + 1, defer: true }))}>
            Load with @defer
          </Button>
          <Button onClick={() => setRun((r) => ({ n: (r?.n ?? 0) + 1, defer: false }))}>Load without</Button>
        </div>
        <div className="min-h-64">
          {run ? (
            <Suspense key={run.n} fallback={<Loading label={run.defer ? "Waiting for the first payload…" : "Waiting for the whole response (~1.2 s)…"} />}>
              {run.defer ? <OnQuery id={id} /> : <OffQuery id={id} />}
            </Suspense>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-6 text-sm text-faint">
              Load the same screen both ways. With <code className="font-mono">@defer</code>, the post paints as soon as the fast
              fields resolve and the slow insights stream in afterwards, in the same HTTP response.
            </p>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-panel-2/30 p-4">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Payloads over one request</div>
        <ChunkTimeline operation="DeferDemoOnQuery" compareTo="DeferDemoOffQuery" />
      </div>
    </div>
  );
}

function OnQuery({ id }: { id: string }) {
  const data = useLazyLoadQuery<DeferDemoOnQuery>(onQuery, { id }, { fetchPolicy: "network-only" });
  if (!data.post) return null;
  return (
    <PostView post={data.post}>
      <Suspense fallback={<InsightsSkeleton />}>
        <Insights post={data.post} />
      </Suspense>
    </PostView>
  );
}

function OffQuery({ id }: { id: string }) {
  const data = useLazyLoadQuery<DeferDemoOffQuery>(offQuery, { id }, { fetchPolicy: "network-only" });
  if (!data.post) return null;
  return (
    <PostView post={data.post}>
      <Insights post={data.post} />
    </PostView>
  );
}

function PostView({ post, children }: { post: DeferDemo_post$key; children: React.ReactNode }) {
  const data = useFragment(postFragment, post);
  return (
    <article className="animate-rise space-y-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center gap-2 text-sm">
        <Avatar name={data.author.name} color={data.author.avatarColor} size={22} />
        {data.author.name}
      </div>
      <h3 className="font-medium">{data.title}</h3>
      <p className="text-sm text-muted">{data.excerpt}</p>
      {children}
    </article>
  );
}

function Insights({ post }: { post: DeferDemoInsights_post$key }) {
  const { insights } = useFragment(insightsFragment, post);
  return (
    <div className="animate-rise rounded-lg border border-ok/30 bg-ok/5 p-3 text-xs">
      <div className="mb-1.5 font-semibold text-ok">Insights · the slow part</div>
      <div className="text-muted">
        {insights.readMinutes} min read · {insights.wordCount} words · {insights.sentiment}
      </div>
      <div className="mt-1.5 text-faint">Related: {insights.related.join(" · ")}</div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="rounded-lg border border-dashed border-line p-3 text-xs text-faint">
      <div className="mb-2 h-2.5 w-28 animate-pulse rounded bg-panel-2" />
      <div className="h-2.5 w-52 animate-pulse rounded bg-panel-2" />
      <div className="mt-2">deferred fragment still on its way…</div>
    </div>
  );
}
