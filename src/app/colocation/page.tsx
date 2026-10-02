import { Fragment } from "react";
import { PageHeader, Takeaways } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { ColocationDemo } from "@/components/colocation/ColocationDemo";
import { pageMetadata } from "@/lib/og";

export const metadata = pageMetadata("/colocation");

export default function ColocationPage() {
  return (
    <>
      <PageHeader n="02" title="Every component declares its own data">
        Each component below sits next to a GraphQL fragment listing exactly the fields it renders. Parents spread their
        children&apos;s fragments without knowing what&apos;s inside them. Relay&apos;s <em>data masking</em> enforces
        this at runtime: a component can only read the fields it asked for.
      </PageHeader>
      <RelayBoundary>
        <ColocationDemo />
      </RelayBoundary>
      <Takeaways
        items={[
          <Fragment key="1">Delete a field from a child&apos;s fragment and nothing else changes. Nobody has to hunt down which query fetches it, because the fragment is the query.</Fragment>,
          <Fragment key="2">Masking means a parent can&apos;t come to depend on data its child fetched. Refactors stay local, and unused fields can be deleted safely.</Fragment>,
          <Fragment key="3"><code className="font-mono">AuthorLine</code> is reused by posts and comments. Its fragment travels with it, so every screen that renders it fetches the right fields.</Fragment>,
        ]}
      />
    </>
  );
}
