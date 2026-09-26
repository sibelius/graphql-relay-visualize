import { Fragment } from "react";
import { DemoControls, PageHeader, Takeaways } from "@/components/ui";
import { RelayBoundary } from "@/relay/RelayProvider";
import { ConsistencyDemo } from "@/components/consistency/ConsistencyDemo";

export const metadata = { title: "Optimistic & consistent · Relay, visualized" };

export default function ConsistencyPage() {
  return (
    <>
      <PageHeader n="04" title="Update once. Every view agrees. Only readers re-render.">
        The first post is on screen three times, through three different components. Like it from any of them: the
        mutation writes one <code className="font-mono">Post</code> record, and Relay notifies exactly the components
        whose fragments read the fields that changed. The render counters show it. Titles never re-render on a like.
      </PageHeader>
      <div className="space-y-4">
        <DemoControls showFail />
        <RelayBoundary>
          <ConsistencyDemo />
        </RelayBoundary>
      </div>
      <Takeaways
        items={[
          <Fragment key="1">No prop drilling, no global state, no refetch. The mutation response has the same shape as the store, so Relay merges it and every subscriber sees it.</Fragment>,
          <Fragment key="2">Optimistic responses make the UI feel instant at any latency. Turn on server failure and Relay reverts the optimistic layer on its own.</Fragment>,
          <Fragment key="3">Subscriptions are per fragment, not per query. A like re-renders the <code className="font-mono">LikeButton</code>s and the widget, not the list or the titles.</Fragment>,
        ]}
      />
    </>
  );
}
