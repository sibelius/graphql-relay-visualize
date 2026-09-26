import { Fragment } from "react";
import { PageHeader, Takeaways } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { StoreDemo } from "@/components/store/StoreDemo";

export const metadata = { title: "Normalized store · Relay, visualized" };

export default function StorePage() {
  return (
    <>
      <PageHeader n="03" title="Responses are trees. The store is a graph.">
        When a response arrives, Relay walks it and writes every object with an <code className="font-mono">id</code>{" "}
        into a flat map of records keyed by that id. Nested objects become references. This is the live store of this
        tab, drawn directly from <code className="font-mono">environment.getStore().getSource()</code>.
      </PageHeader>
      <RelayBoundary>
        <StoreDemo />
      </RelayBoundary>
      <Takeaways
        items={[
          <Fragment key="1">One record per entity means one source of truth. Rename a user and every post, comment and avatar that references them is correct, with no manual cache syncing.</Fragment>,
          <Fragment key="2">Queries with different shapes share records. The second query adds fields to an existing <code className="font-mono">User</code> rather than creating a stale copy.</Fragment>,
          <Fragment key="3">Connections are records too (toggle them on). That&apos;s how Relay can append a page of edges or insert a new comment without refetching the list.</Fragment>,
        ]}
      />
    </>
  );
}
