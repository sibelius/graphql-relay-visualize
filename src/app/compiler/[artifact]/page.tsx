import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { codeToHtml } from "shiki";
import { listArtifacts, readArtifact } from "@/server/artifacts";
import { PageHeader, Takeaways } from "@/components/ui";
import { formatBytes } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => listArtifacts().map((artifact) => ({ artifact }));
export const generateMetadata = async ({ params }: { params: Promise<{ artifact: string }> }) => ({
  title: `${(await params).artifact} · The compiler · Relay, visualized`,
});

const KIND_COLOR = { query: "text-info", fragment: "text-f2", mutation: "text-gql", refetchable: "text-f3" } as const;
const highlight = (code: string, lang: "graphql" | "ts") => codeToHtml(code, { lang, theme: "github-dark-default" });

export default async function CompilerPage({ params }: { params: Promise<{ artifact: string }> }) {
  const { artifact } = await params;
  const names = listArtifacts();
  if (!names.includes(artifact)) notFound();
  const all = names.map(readArtifact);
  const a = all.find((x) => x.name === artifact)!;

  const [sourceHtml, typesHtml, codeHtml, opHtml] = await Promise.all([
    a.source ? highlight(a.source.text, "graphql") : null,
    highlight(a.types, "ts"),
    highlight(a.code, "ts"),
    a.operationText ? highlight(a.operationText, "graphql") : null,
  ]);

  const opBytes = a.operationText ? new TextEncoder().encode(a.operationText).length : 0;
  const idBytes = a.persistedId ? new TextEncoder().encode(JSON.stringify({ doc_id: a.persistedId })).length : 0;

  return (
    <>
      <PageHeader n="06" title="The compiler does the work before your app runs">
        <code className="font-mono">relay-compiler</code> reads every <code className="font-mono">graphql</code> tag in
        the project, validates it against <code className="font-mono">schema.graphql</code>, and writes an artifact per
        fragment and operation: a precomputed runtime AST, TypeScript types, and (here) a persisted query id. Pick any
        artifact this app generated.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto rounded-xl border border-line bg-panel p-2 lg:sticky lg:top-4">
          {(["query", "fragment", "mutation", "refetchable"] as const).map((kind) => (
            <div key={kind} className="mb-2">
              <div className={clsx("px-2 py-1 font-mono text-[10px] tracking-wide uppercase", KIND_COLOR[kind])}>{kind}</div>
              {all
                .filter((x) => x.kind === kind)
                .map((x) => (
                  <Link
                    key={x.name}
                    href={`/compiler/${x.name}`}
                    className={clsx(
                      "block truncate rounded-md px-2 py-1 font-mono text-[11.5px]",
                      x.name === a.name ? "bg-panel-2 text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {x.name}
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Tile label="Kind" value={<span className={KIND_COLOR[a.kind]}>{a.kind}</span>} />
            <Tile label="Artifact size" value={formatBytes(new TextEncoder().encode(a.code).length)} />
            <Tile label="Operation text" value={a.operationText ? formatBytes(opBytes) : "—"} />
            <Tile label="What the browser sends" value={a.persistedId ? formatBytes(idBytes) + " + vars" : "—"} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Code
              title="1 · You write"
              right={a.source?.file ?? (a.kind === "refetchable" ? "generated from @refetchable" : "")}
              html={sourceHtml}
              empty="The compiler wrote this one entirely: it comes from a @refetchable directive on a fragment, with no source literal."
            />
            <Code title="2 · Types you import" right={`${a.name}.graphql.ts`} html={typesHtml} />
          </div>

          {opHtml && (
            <Code
              title="3 · Operation text, persisted at build time"
              right={<span className="font-mono">md5 {a.persistedId}</span>}
              html={opHtml}
              note="Fragments from every component are inlined into one document. It lives in persisted_queries.json on the server; the client only knows the hash."
            />
          )}
          <Code
            title={`${opHtml ? "4" : "3"} · Runtime artifact`}
            right="imported in place of the graphql`` tag"
            html={codeHtml}
            note="A preprocessed AST, so there's no GraphQL parsing in the browser. The reader part tells useFragment what to read; the normalization part tells the store how to write."
            tall
          />
        </div>
      </div>

      <Takeaways
        items={[
          <Fragment key="1">A typo in a field name fails the build, not the user&apos;s session. Every fragment is checked against the schema on every save.</Fragment>,
          <Fragment key="2">Types come from the fragment rather than the whole schema, so a component&apos;s <code className="font-mono">data</code> type has exactly the fields it asked for.</Fragment>,
          <Fragment key="3">Persisted queries ship for free: smaller requests, cacheable GETs, and a server that can refuse any query it didn&apos;t compile.</Fragment>,
        ]}
      />
    </>
  );
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2">
      <div className="text-[11px] tracking-wide text-faint uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-base">{value}</div>
    </div>
  );
}

function Code({
  title,
  right,
  html,
  note,
  empty,
  tall,
}: {
  title: string;
  right?: React.ReactNode;
  html: string | null;
  note?: string;
  empty?: string;
  tall?: boolean;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{title}</h2>
        <span className="truncate text-[11px] text-faint">{right}</span>
      </div>
      {note && <p className="px-4 pt-3 text-xs leading-relaxed text-muted">{note}</p>}
      {html ? (
        <div
          className={clsx("overflow-auto p-4 font-mono text-[11.5px] leading-relaxed [&_pre]:!bg-transparent", tall ? "max-h-[560px]" : "max-h-[420px]")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="p-4 text-sm text-faint">{empty}</p>
      )}
    </section>
  );
}
