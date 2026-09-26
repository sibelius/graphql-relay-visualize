import { Fragment } from "react";
import { schemaGraph } from "@/server/schemaGraph";
import { PageHeader, Takeaways } from "@/components/ui";
import { SchemaExplorer } from "@/components/schema/SchemaExplorer";

export const metadata = { title: "Schema graph · Relay, visualized" };

export default function SchemaPage() {
  return (
    <>
      <PageHeader n="07" title="The schema is a typed graph of your product">
        Every type, field and relationship this app&apos;s GraphQL server exposes, read through introspection. This is the
        contract the Relay compiler validated every fragment against, and what editors use for autocomplete. Click a
        type to see its fields; toggle the Relay plumbing (connections, edges, mutation payloads) on and off.
      </PageHeader>
      <SchemaExplorer types={schemaGraph()} />
      <Takeaways
        items={[
          <Fragment key="1">The frontend doesn&apos;t guess what an endpoint returns. It asks for fields of types that exist, and tooling knows the answer before any request is made.</Fragment>,
          <Fragment key="2">Relay&apos;s conventions show up as shape: the <code className="font-mono">Node</code> interface gives every entity a global id (that&apos;s what makes normalization and refetching generic), and connections standardize lists.</Fragment>,
          <Fragment key="3">One graph serves every screen. New UI needs usually mean new fragments over existing types, not new endpoints.</Fragment>,
        ]}
      />
    </>
  );
}
