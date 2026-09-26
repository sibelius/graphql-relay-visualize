"use client";

import { graphql, useFragment } from "react-relay";
import type { HeroPost_post$key } from "@/__generated__/HeroPost_post.graphql";
import { RenderBadge } from "../ui";
import { AuthorName } from "./AuthorName";
import { LikeButton } from "./LikeButton";
import { PostTitle } from "./PostTitle";

const fragment = graphql`
  fragment HeroPost_post on Post {
    excerpt
    ...PostTitle_post
    ...LikeButton_post
    author {
      ...AuthorName_user
    }
  }
`;

export function HeroPost({ post }: { post: HeroPost_post$key }) {
  const data = useFragment(fragment, post);
  return (
    <div data-render-host className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-accent uppercase">Pinned</span>
        <RenderBadge />
      </div>
      <PostTitle post={data} className="text-lg font-semibold" />
      <p className="mt-1.5 text-sm text-muted">{data.excerpt}</p>
      <div className="mt-4 flex items-center justify-between">
        <AuthorName user={data.author} />
        <LikeButton post={data} size="lg" />
      </div>
    </div>
  );
}
