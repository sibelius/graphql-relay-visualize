import { Fragment } from "react";
import { codeToHtml } from "shiki";
import { PageHeader, Takeaways } from "@/components/ui";
import { ComplexityModel } from "@/components/vsrest/ComplexityModel";
import { EndpointExplosion } from "@/components/vsrest/EndpointExplosion";
import { SAMPLES } from "./samples";
import { pageMetadata } from "@/lib/og";

export const metadata = pageMetadata("/vs-rest");

export default async function VsRestPage() {
  const samples = await Promise.all(
    SAMPLES.map(async (s) => ({
      ...s,
      html: await codeToHtml(s.code, { lang: s.lang, theme: "github-dark-default" }),
      lines: s.code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//")).length,
    })),
  );

  return (
    <>
      <PageHeader n="08" title="Where the complexity goes: REST, its helpers, and Relay">
        Every approach has to solve the same problems: nested data, caching, consistency, optimistic UI, pagination and
        types. The question is who solves them: your frontend code, a new backend endpoint, a library you configure, or a
        declaration the framework acts on. Toggle requirements to see how the bill changes.
      </PageHeader>

      <div className="space-y-10">
        <ComplexityModel />

        <div>
          <h2 className="mb-1 text-xl font-semibold tracking-tight">The endpoint explosion</h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted">
            REST endpoints are shaped by the first screen that needed them. As screens multiply, you either chain
            generic endpoints (waterfalls and over-fetching) or add screen-specific ones (a growing surface to version
            and keep alive). Drag the slider and flip between the two models.
          </p>
          <EndpointExplosion />
        </div>

        <div>
          <h2 className="mb-1 text-xl font-semibold tracking-tight">The same feature, three ways</h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted">
            A post page with its author and commenters, plus a like button that must stay correct in the feed, the
            sidebar and the page itself. Code lines exclude comments.
          </p>
          <div className="grid gap-4 xl:grid-cols-3">
            {samples.map((s) => (
              <section key={s.key} className="flex min-w-0 flex-col rounded-xl border border-line bg-panel">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <h3 className={`text-xs font-semibold tracking-wide uppercase ${s.key === "relay" ? "text-accent" : "text-muted"}`}>{s.title}</h3>
                  <span className="font-mono text-[11px] text-faint">{s.lines} lines</span>
                </div>
                <div
                  className="max-h-[620px] overflow-auto p-4 font-mono text-[11px] leading-relaxed [&_pre]:!bg-transparent"
                  dangerouslySetInnerHTML={{ __html: s.html }}
                />
              </section>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-panel p-5">
            <div className="mb-2 font-mono text-xs text-ok">where REST / tRPC are the better call</div>
            <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted">
              <li>Small apps with a handful of screens and little shared data.</li>
              <li>Public, cache-heavy APIs where HTTP/CDN caching per URL matters most.</li>
              <li>File uploads, webhooks and streaming media: plain HTTP is simpler there.</li>
              <li>A TypeScript monorepo where tRPC&apos;s inferred types cover you with zero schema tooling.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-panel p-5">
            <div className="mb-2 font-mono text-xs text-accent">where GraphQL + Relay pays off</div>
            <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted">
              <li>Many screens over the same entities, built by several teams.</li>
              <li>Mobile and web clients that need different shapes of the same data.</li>
              <li>Heavily interactive UIs where one change must show up everywhere, instantly.</li>
              <li>Long-lived products where refactoring components mustn&apos;t mean renegotiating endpoints.</li>
            </ul>
          </div>
        </div>
      </div>

      <Takeaways
        items={[
          <Fragment key="1">The complexity doesn&apos;t vanish with GraphQL. It moves into a schema on the server and a compiler on the client, both written once instead of per screen.</Fragment>,
          <Fragment key="2">Libraries like TanStack Query solve caching and request state well. What they can&apos;t know is that <code className="font-mono">[&quot;post&quot;, id]</code> and the feed contain the same object. A normalized store can.</Fragment>,
          <Fragment key="3">BFFs and tRPC fix round trips by moving aggregation to the server, and pay for it with an endpoint or procedure per screen.</Fragment>,
        ]}
      />
    </>
  );
}
