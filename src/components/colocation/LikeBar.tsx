"use client";

import { graphql, useFragment } from "react-relay";
import type { LikeBar_post$key } from "@/__generated__/LikeBar_post.graphql";
import { XRay } from "./xray";

const fragment = graphql`
  fragment LikeBar_post on Post {
    likeCount
    viewerHasLiked
    tags
  }
`;

export function LikeBar({ post }: { post: LikeBar_post$key }) {
  const data = useFragment(fragment, post);
  return (
    <XRay component="LikeBar" fragment={fragment} fragmentRef={post} data={data}>
      <div className="flex items-center gap-3 text-xs">
        <span className={data.viewerHasLiked ? "text-bad" : "text-muted"}>
          {data.viewerHasLiked ? "♥" : "♡"} {data.likeCount}
        </span>
        {data.tags.map((t) => (
          <span key={t} className="rounded-full bg-panel-2 px-2 py-0.5 text-faint">
            #{t}
          </span>
        ))}
      </div>
    </XRay>
  );
}
