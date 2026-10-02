import { Fragment } from "react";
import { codeToHtml } from "shiki";
import { PageHeader, Takeaways } from "@/components/ui";
import { FeatureCompare } from "@/components/vsapollo/FeatureCompare";
import { APOLLO_WINS, FEATURES } from "./features";
import { pageMetadata } from "@/lib/og";

export const metadata = pageMetadata("/vs-apollo");

const hl = (code: string) => codeToHtml(code, { lang: "tsx", theme: "github-dark-default" });

export default async function VsApolloPage() {
  const features = await Promise.all(
    FEATURES.map(async (f) => ({ ...f, relayHtml: await hl(f.relay.code), apolloHtml: await hl(f.apollo.code) })),
  );

  return (
    <>
      <PageHeader n="09" title="Relay vs Apollo: two answers to the same problem">
        Both are mature GraphQL clients with normalized caches, Suspense hooks and optimistic updates. The difference is
        philosophy. Apollo is a runtime library you configure. Relay puts a compiler in front of the runtime and asks your
        schema to follow a few conventions, and in exchange it can do work Apollo leaves to you. Compared against
        Relay 21 and Apollo Client 4.3; pick a row to see both sides in code.
      </PageHeader>

      <FeatureCompare features={features} />

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="mb-2 font-mono text-xs text-ok">where Apollo is the easier choice</div>
          <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted">
            {APOLLO_WINS.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="mb-2 font-mono text-xs text-accent">what both do well</div>
          <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted">
            <li>A normalized cache keyed by entity id (Relay: global id; Apollo: __typename + id or keyFields).</li>
            <li>Optimistic responses that roll back on error.</li>
            <li>Suspense-first hooks and query preloading before render.</li>
            <li>@defer and @stream against spec-compatible servers.</li>
            <li>SSR and Next.js App Router support.</li>
          </ul>
        </div>
      </div>

      <Takeaways
        items={[
          <Fragment key="1">Relay&apos;s edge comes from knowing every query at build time: validation, types, persisted ids, generated pagination and masking all fall out of that.</Fragment>,
          <Fragment key="2">Apollo has been closing gaps (data masking, <code className="font-mono">useFragment</code>, @defer/@stream), usually as opt-in features on top of a flexible runtime.</Fragment>,
          <Fragment key="3">Relay asks more of the schema (Node, connections, mutation payloads). If you control the server, that&apos;s cheap. If you don&apos;t, Apollo&apos;s flexibility matters more.</Fragment>,
        ]}
      />
    </>
  );
}
