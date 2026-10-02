import { Fragment } from "react";
import { DemoControls, PageHeader, Takeaways } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { PaginationDemo } from "@/components/pagination/PaginationDemo";
import { pageMetadata } from "@/lib/og";

export const metadata = pageMetadata("/pagination");

export default function PaginationPage() {
  return (
    <>
      <PageHeader n="05" title="Pagination is a data structure, not a hand-written loop">
        GraphQL connections model a list as edges with opaque cursors, plus <code className="font-mono">pageInfo</code>.
        Relay keeps the connection as a record in the store and appends each page to it. Load a few pages and watch the
        strip grow, colored by the request that brought each edge in.
      </PageHeader>
      <div className="space-y-4">
        <DemoControls />
        <RelayBoundary>
          <PaginationDemo />
        </RelayBoundary>
      </div>
      <Takeaways
        items={[
          <Fragment key="1">Cursors are stable positions. Inserting a post at the top doesn&apos;t shift the next page the way offset pagination does.</Fragment>,
          <Fragment key="2">One fragment covers the first render and every later page. The compiler derives the pagination query, so the two can&apos;t drift apart.</Fragment>,
          <Fragment key="3">Because the connection lives in the store, a mutation can append or prepend an edge (<code className="font-mono">@appendEdge</code>) and the list updates without a refetch.</Fragment>,
        ]}
      />
    </>
  );
}
