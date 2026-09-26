"use client";

import { graphql, useLazyLoadQuery } from "react-relay";
import type { ConsistencyDemoQuery as QueryType } from "@/__generated__/ConsistencyDemoQuery.graphql";
import { Panel } from "../ui";
import { AuthorName } from "./AuthorName";
import { FeedRow } from "./FeedRow";
import { HeroPost } from "./HeroPost";
import { MiniLikes } from "./MiniLikes";
import { MutationTimeline, StoreDiff } from "./MutationTimeline";
import { RenameForm } from "./RenameForm";

// The first post is selected twice — once under an alias — and rendered by
// three different components. They all read the same Post record.
const query = graphql`
  query ConsistencyDemoQuery {
    viewer {
      ...AuthorName_user
      ...RenameForm_user
    }
    pinned: feed(first: 1) {
      edges {
        node {
          id
          ...HeroPost_post
          ...MiniLikes_post
        }
      }
    }
    feed(first: 5) {
      edges {
        node {
          id
          ...FeedRow_post
        }
      }
    }
  }
`;

export function ConsistencyDemo() {
  const data = useLazyLoadQuery<QueryType>(query, {});
  const pinned = data.pinned.edges?.[0]?.node;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel title="Feed · 5 posts" right={<span className="text-[11px] text-faint">flash = that component re-rendered</span>}>
          <div className="space-y-2">
            {data.feed.edges?.map((e) => (e?.node ? <FeedRow key={e.node.id} post={e.node} /> : null))}
          </div>
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel title="Same post, elsewhere on the page">
            <div className="space-y-3">
              {pinned && <HeroPost post={pinned} />}
              {pinned && <MiniLikes post={pinned} />}
            </div>
          </Panel>
          <Panel title="Viewer">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                Signed in as <AuthorName user={data.viewer} />
              </div>
              <RenameForm user={data.viewer} />
            </div>
          </Panel>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MutationTimeline />
        <StoreDiff />
      </div>
    </div>
  );
}
