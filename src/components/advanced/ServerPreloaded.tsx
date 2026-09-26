"use client";

import { useState } from "react";
import { RelayEnvironmentProvider, graphql, useLazyLoadQuery } from "react-relay";
import { createOperationDescriptor, getRequest, type Environment, type GraphQLResponse } from "relay-runtime";
import type { ServerPreloadedQuery } from "@/__generated__/ServerPreloadedQuery.graphql";
import { createEnvironment, getEnvironment } from "@/relay/environment";
import { useInspector } from "@/relay/inspector";
import { Avatar, Stat } from "../ui";
import { LikeButton } from "../consistency/LikeButton";

export const serverPreloadedQuery = graphql`
  query ServerPreloadedQuery {
    feed(first: 4) {
      edges {
        node {
          id
          title
          author {
            name
            avatarColor
          }
          ...LikeButton_post
        }
      }
    }
  }
`;

const hydrated = new WeakMap<Environment, Set<string>>();

/** Writes the server's payload into the store once, before the first read. */
function useHydrate(environment: Environment, response: GraphQLResponse) {
  const done = hydrated.get(environment) ?? new Set<string>();
  hydrated.set(environment, done);
  const key = JSON.stringify(response);
  if (!done.has(key)) {
    done.add(key);
    const operation = createOperationDescriptor(getRequest(serverPreloadedQuery), {});
    environment.commitPayload(operation, (response as { data: never }).data);
    environment.retain(operation);
  }
}

export function ServerPreloaded({ response, serverMs, renderedAt }: { response: GraphQLResponse; serverMs: number; renderedAt: string }) {
  // During SSR each request gets a throwaway environment; in the browser we
  // hydrate the app's shared one so the devtools and other pages see it.
  const [environment] = useState(() => (typeof window === "undefined" ? createEnvironment({ attach: false }) : getEnvironment()));
  useHydrate(environment, response);
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Feed serverMs={serverMs} renderedAt={renderedAt} />
    </RelayEnvironmentProvider>
  );
}

function Feed({ serverMs, renderedAt }: { serverMs: number; renderedAt: string }) {
  const data = useLazyLoadQuery<ServerPreloadedQuery>(serverPreloadedQuery, {}, { fetchPolicy: "store-only" });
  const clientFetches = useInspector((s) => s.operations.filter((o) => o.name === "ServerPreloadedQuery").length);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Executed on the server" value={`${serverMs} ms`} />
        <Stat label="Client requests for this query" value={clientFetches} tone={clientFetches === 0 ? "good" : "bad"} />
        <Stat label="Rendered at" value={<span className="text-sm">{renderedAt}</span>} />
      </div>
      <ul className="space-y-1.5">
        {data.feed.edges?.map((e) =>
          e?.node ? (
            <li key={e.node.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm">
              <Avatar name={e.node.author.name} color={e.node.author.avatarColor} size={20} />
              <span className="min-w-0 flex-1 truncate">{e.node.title}</span>
              <LikeButton post={e.node} />
            </li>
          ) : null,
        )}
      </ul>
      <p className="text-xs leading-relaxed text-muted">
        This list was in the HTML before any JavaScript ran. The like buttons still work: the server&apos;s payload was
        written into the client store, so mutations, the devtools drawer and every other page share it.
      </p>
    </div>
  );
}
