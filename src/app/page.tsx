import Link from "next/link";
import { NAV } from "@/components/shell/nav";
import { Pipeline } from "@/components/viz/Pipeline";
import { pageMetadata } from "@/lib/og";

export const metadata = pageMetadata("/");

const WHY: Record<string, string> = {
  "/network": "Nested data in one request. Watch a REST waterfall and N+1 fetches race a single GraphQL query.",
  "/colocation": "Components declare exactly the fields they render. X-ray the UI to see fragments compose into one query.",
  "/store": "Responses are trees; Relay's store is a graph. See duplicates collapse into one record per ID.",
  "/consistency": "Like a post once and every view of it updates — optimistically, with rollback, re-rendering only subscribers.",
  "/pagination": "Connections, edges and cursors as a live diagram. Relay generates the pagination query for you.",
  "/compiler": "Side by side: the fragment you write and the artifact, types and persisted id the compiler emits.",
  "/schema": "The schema is a typed graph of your domain. Explore it the way tools do, through introspection.",
  "/vs-rest": "Hand-rolled REST, React Query, BFFs and tRPC next to Relay. Watch frontend code and endpoints pile up as requirements grow.",
  "/vs-apollo": "Compiler, masking, generated pagination, declarative store updates: what Relay does that Apollo doesn't, and where Apollo is the easier choice.",
  "/advanced": "@defer and @stream running live, server-component preloading, @required and @catch, plus the lesser-known features worth knowing.",
};

export default function Home() {
  return (
    <div>
      <header className="max-w-3xl animate-rise">
        <div className="mb-3 font-mono text-xs text-accent">graphql + relay, visualized</div>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          See what Relay does for your data, one mechanism at a time.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
          Each page runs a real Relay 21 environment against a real GraphQL server in this Next.js app. The diagrams are
          drawn from Relay&apos;s own log events and store, so what you see is what the runtime actually did.
        </p>
      </header>

      <div className="mt-10 rounded-2xl border border-line bg-panel p-4 sm:p-6">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">The loop, end to end</div>
        <Pipeline />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.filter((n) => n.href !== "/").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-faint"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-accent">{item.n}</span>
              <span className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink">→</span>
            </div>
            <div className="mt-3 font-medium">{item.label}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{WHY[item.href]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
