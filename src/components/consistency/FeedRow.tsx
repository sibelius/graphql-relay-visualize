"use client";

import { graphql, useFragment } from "react-relay";
import type { FeedRow_post$key } from "@/__generated__/FeedRow_post.graphql";
import { RenderBadge } from "../ui";
import { AuthorName } from "./AuthorName";
import { LikeButton } from "./LikeButton";
import { PostTitle } from "./PostTitle";

const fragment = graphql`
  fragment FeedRow_post on Post {
    ...PostTitle_post
    ...LikeButton_post
    author {
      ...AuthorName_user
    }
  }
`;

export function FeedRow({ post }: { post: FeedRow_post$key }) {
  const data = useFragment(fragment, post);
  return (
    <div data-render-host className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel-2/40 px-3 py-2.5">
      <div className="flex min-w-0 flex-col gap-1">
        <PostTitle post={data} className="text-sm font-medium" />
        <AuthorName user={data.author} />
      </div>
      <div className="flex items-center gap-2">
        <LikeButton post={data} />
        <RenderBadge className="opacity-60" />
      </div>
    </div>
  );
}
