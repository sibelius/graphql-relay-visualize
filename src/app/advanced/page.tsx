import type { ReactNode } from "react";
import ServerPreloadedQuery from "@/__generated__/ServerPreloadedQuery.graphql";
import { executePersisted } from "@/server/execute";
import { DemoControls, PageHeader } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { DeferDemo } from "@/components/advanced/DeferDemo";
import { StreamDemo } from "@/components/advanced/StreamDemo";
import { RequiredCatchDemo } from "@/components/advanced/RequiredCatchDemo";
import { ServerPreloaded } from "@/components/advanced/ServerPreloaded";

export const metadata = { title: "Advanced Relay · Relay, visualized" };
export const dynamic = "force-dynamic";

const SECTIONS = [
  ["defer", "@defer"],
  ["stream", "@stream"],
  ["rsc", "Server components"],
  ["required", "@required & @catch"],
  ["more", "More hidden gems"],
] as const;

export default async function AdvancedPage() {
  // Runs during the server render: the query executes in-process, and only its
  // JSON payload is sent to the client component.
  const { response, serverMs } = await executePersisted(ServerPreloadedQuery);
  const renderedAt = new Date().toLocaleTimeString("en-US", { hour12: false });

  return (
    <>
      <PageHeader n="10" title="The features people don't know Relay has">
        Incremental delivery, server-side preloading, and field-level error handling. The first four sections run live
        against this app&apos;s server. It speaks <code className="font-mono">@defer</code>/<code className="font-mono">@stream</code>{" "}
        through graphql-js 17, streaming newline-delimited JSON that the Relay network layer feeds to the executor payload
        by payload.
      </PageHeader>

      <nav className="sticky top-0 z-30 -mx-4 mb-8 flex gap-1 overflow-x-auto border-b border-line bg-bg/90 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-md px-2.5 py-1 font-mono text-xs text-muted hover:bg-panel-2 hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        <DemoControls />

        <Section id="defer" title="@defer: paint the fast part now, stream the slow part in">
          Mark a fragment spread with <code className="font-mono">@defer</code> and the server sends it as a later payload
          of the same response. The component reading it suspends on its own, so only that part of the UI shows a
          placeholder. No second query, no waterfall, no loading flags.
        </Section>
        <RelayBoundary>
          <DeferDemo />
        </RelayBoundary>

        <Section id="stream" title="@stream: render list items as the server produces them">
          <code className="font-mono">@stream(initialCount: 1)</code> sends the first item with the initial payload and every
          later item as soon as its resolver yields. Relay appends each one to the same list record. For connections there&apos;s{" "}
          <code className="font-mono">@stream_connection</code>.
        </Section>
        <RelayBoundary>
          <StreamDemo />
        </RelayBoundary>

        <Section id="rsc" title="Server components: preload on the server, hydrate the store">
          This page is a React Server Component. It executed <code className="font-mono">ServerPreloadedQuery</code>{" "}
          in-process while rendering, then handed the raw payload to a client component that commits it to the Relay store
          before reading. The data is in the first HTML byte, and the client never refetches.
        </Section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ServerPreloaded response={response} serverMs={serverMs} renderedAt={renderedAt} />
          <pre className="overflow-x-auto rounded-xl border border-line bg-panel p-4 font-mono text-[11.5px] leading-relaxed text-muted">
            {`// app/advanced/page.tsx  (server component)
import Query from "@/__generated__/ServerPreloadedQuery.graphql";

export default async function Page() {
  const { response } = await executePersisted(Query);
  return <ServerPreloaded response={response} />;
}

// ServerPreloaded.tsx  ("use client")
const op = createOperationDescriptor(getRequest(query), {});
environment.commitPayload(op, response.data);   // once
environment.retain(op);                          // keep it from GC

useLazyLoadQuery(query, {}, { fetchPolicy: "store-only" });`}
          </pre>
        </div>

        <Section id="required" title="@required & @catch: nullability you can reason about">
          GraphQL makes almost everything nullable so one failing field doesn&apos;t fail the whole response. Relay gives
          components two ways to say what they actually need, and the generated types follow.
        </Section>
        <RelayBoundary>
          <RequiredCatchDemo />
        </RelayBoundary>

        <Section id="more" title="More hidden gems">
          Not every feature needs a live demo to make the case. These are the ones teams discover late and wish they had
          known about earlier.
        </Section>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {GEMS.map((g) => (
            <div key={g.title} className="flex flex-col rounded-xl border border-line bg-panel p-4">
              <div className="font-mono text-sm text-accent">{g.title}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.body}</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-panel-2/60 p-2.5 font-mono text-[10.5px] leading-relaxed text-ink">{g.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} className="max-w-3xl scroll-mt-16">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

const GEMS = [
  {
    title: "Relay Resolvers",
    body: "Model derived and client-only state as fields in the schema. Components read them through fragments like any server field, and live resolvers can subscribe to an external store.",
    // "@" is interpolated so relay-compiler doesn't parse this sample as a real resolver.
    code: `/**
 * ${"@"}relayField User.initials: String
 * ${"@"}rootFragment UserInitialsFragment
 */
export function initials(key) { … }`,
  },
  {
    title: "@module / @match (3D)",
    body: "Data-driven dependencies: for a union or interface, the server picks which component renders each member, and Relay loads just that component's code with the data.",
    code: `attachment {
  ...ImageAttachment_a @module(name: "ImageAttachment")
  ...VideoAttachment_a @module(name: "VideoAttachment")
}`,
  },
  {
    title: "EntryPoints",
    body: "Declare a route's queries and its component together, then start loading both on hover or navigation, before React renders anything. Render-as-you-fetch at the route level.",
    code: `const ref = loadEntryPoint(env, PostEntryPoint, { id });
<EntryPointContainer entryPointReference={ref} />`,
  },
  {
    title: "@alias (enforced in Relay 21)",
    body: "A spread whose type might not match (a Post fragment on a Node field) must be aliased, so it becomes a nullable property instead of silently reading nothing. This app hit that compile error while being built.",
    code: `node(id: $id) {
  ...PostCard_post @alias(as: "post")
}
// data.node.post: PostCard_post$key | null`,
  },
  {
    title: "@throwOnFieldError + @semanticNonNull",
    body: "Opt a fragment into throwing field errors to the nearest error boundary. Fields the schema marks @semanticNonNull (null only on error) then get non-null types.",
    code: `# schema
type User { name: String @semanticNonNull }

fragment Profile_user on User @throwOnFieldError {
  name   # string, not string | null
}`,
  },
  {
    title: "@inline + readInlineData",
    body: "Read a fragment outside React (in a sort comparator, analytics call or utility) without subscribing or rendering, and keep the same masking and colocation.",
    code: `const post = readInlineData(
  graphql\`fragment rank_post on Post @inline { likeCount }\`,
  ref,
);`,
  },
  {
    title: "Declarative store directives",
    body: "Update connections straight from the mutation response. No updater function and no store-traversal code.",
    code: `addComment(input: $input) {
  commentEdge @appendEdge(connections: $conns) { … }
}
deletePost(input: $i) { id @deleteRecord }`,
  },
  {
    title: "@updatable + typed local writes",
    body: "When you do need to write to the store imperatively, @updatable fragments and queries give you a typed, assignable proxy instead of string-keyed record APIs.",
    code: `const { updatableData } = store.readUpdatableQuery(q, {});
updatableData.viewer.name = "Ada";`,
  },
  {
    title: "Garbage collection & invalidation",
    body: "Relay reference-counts every query. Records nothing retains are collected, and invalidateStore() or invalidateRecord() mark data stale so the next read refetches.",
    code: `new Store(source, { gcReleaseBufferSize: 10 });
commitLocalUpdate(env, s => s.invalidateStore());`,
  },
] satisfies { title: string; body: string; code: string }[];
