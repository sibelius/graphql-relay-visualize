import { Fragment } from "react";
import { DemoControls, PageHeader, Takeaways } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { WaterfallDemo } from "@/components/network/WaterfallDemo";

export const metadata = { title: "One round trip · Relay, visualized" };

export default function NetworkPage() {
  return (
    <>
      <PageHeader n="01" title="One round trip instead of a waterfall">
        A screen showing a user, their posts, and each post&apos;s comments with commenter avatars. With REST, every level
        of nesting waits for the one above it, and each comment triggers another request for its author. With GraphQL
        the client describes the whole tree once and the server resolves it next to the data.
      </PageHeader>
      <div className="space-y-4">
        <DemoControls />
        <RelayBoundary>
          <WaterfallDemo />
        </RelayBoundary>
      </div>
      <Takeaways
        items={[
          <Fragment key="1">Latency multiplies with depth on REST: four levels means four sequential round trips before the screen can paint. Push the latency slider up and watch the gap widen.</Fragment>,
          <Fragment key="2">REST endpoints return whole resources. The GraphQL response contains only the fields the UI selected, so bytes on the wire track what you actually render.</Fragment>,
          <Fragment key="3">No hand-written orchestration: no <code className="font-mono">Promise.all</code>, no dedupe cache, no loading state per level. Relay sends one query and suspends once.</Fragment>,
        ]}
      />
    </>
  );
}
