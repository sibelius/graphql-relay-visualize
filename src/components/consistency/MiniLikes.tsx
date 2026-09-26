"use client";

import { graphql, useFragment } from "react-relay";
import type { MiniLikes_post$key } from "@/__generated__/MiniLikes_post.graphql";
import { RenderBadge } from "../ui";

const fragment = graphql`
  fragment MiniLikes_post on Post {
    likeCount
    viewerHasLiked
  }
`;

export function MiniLikes({ post }: { post: MiniLikes_post$key }) {
  const data = useFragment(fragment, post);
  return (
    <div data-render-host className="flex items-center justify-between rounded-lg border border-line bg-panel-2/40 px-3 py-2.5">
      <div>
        <div className="text-[11px] tracking-wide text-faint uppercase">Sidebar widget</div>
        <div className="mt-0.5 text-sm">
          <span className="font-mono text-lg tabular-nums">{data.likeCount}</span> <span className="text-muted">likes</span>
          <span className={data.viewerHasLiked ? "ml-2 text-bad" : "ml-2 text-faint"}>
            {data.viewerHasLiked ? "incl. you" : "not you"}
          </span>
        </div>
      </div>
      <RenderBadge />
    </div>
  );
}
