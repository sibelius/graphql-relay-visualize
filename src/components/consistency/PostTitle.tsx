"use client";

import { graphql, useFragment } from "react-relay";
import type { PostTitle_post$key } from "@/__generated__/PostTitle_post.graphql";
import { RenderBadge } from "../ui";

// Reads only the title, so liking the post never re-renders this component.
const fragment = graphql`
  fragment PostTitle_post on Post {
    title
  }
`;

export function PostTitle({ post, className }: { post: PostTitle_post$key; className?: string }) {
  const data = useFragment(fragment, post);
  return (
    <span data-render-host className={`inline-flex items-center gap-2 rounded-md ${className ?? ""}`}>
      <span>{data.title}</span>
      <RenderBadge />
    </span>
  );
}
