"use client";

import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import clsx from "clsx";
import type { LikeButton_post$key } from "@/__generated__/LikeButton_post.graphql";
import type { LikeButtonMutation } from "@/__generated__/LikeButtonMutation.graphql";
import { inspector } from "@/relay/inspector";
import { RenderBadge } from "../ui";

const fragment = graphql`
  fragment LikeButton_post on Post {
    id
    likeCount
    viewerHasLiked
  }
`;

const mutation = graphql`
  mutation LikeButtonMutation($input: LikePostInput!) {
    likePost(input: $input) {
      post {
        id
        likeCount
        viewerHasLiked
      }
    }
  }
`;

export function LikeButton({ post, size = "sm" }: { post: LikeButton_post$key; size?: "sm" | "lg" }) {
  const data = useFragment(fragment, post);
  const [commit, inFlight] = useMutation<LikeButtonMutation>(mutation);
  const [rejected, setRejected] = useState(false);

  const toggle = () => {
    const like = !data.viewerHasLiked;
    setRejected(false);
    inspector.pushTimeline("execute.start", like ? "click ♥ like" : "click ♡ unlike", "LikeButtonMutation");
    commit({
      variables: { input: { postId: data.id, like } },
      // Written to the store immediately; Relay reverts it if the server disagrees.
      optimisticResponse: {
        likePost: { post: { id: data.id, likeCount: data.likeCount + (like ? 1 : -1), viewerHasLiked: like } },
      },
      onCompleted: (_, errors) => {
        if (errors?.length) setRejected(true);
      },
      onError: () => setRejected(true),
    });
  };

  return (
    <span data-render-host className="inline-flex items-center gap-2 rounded-md">
      <button
        type="button"
        onClick={toggle}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border font-medium tabular-nums transition",
          size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
          data.viewerHasLiked ? "border-bad/50 bg-bad/10 text-bad" : "border-line bg-panel-2 text-muted hover:text-ink",
        )}
      >
        <span>{data.viewerHasLiked ? "♥" : "♡"}</span>
        {data.likeCount}
        {inFlight && <span className="size-1.5 animate-pulse rounded-full bg-warn" title="optimistic — awaiting server" />}
      </button>
      {rejected && <span className="text-[11px] text-bad">rolled back</span>}
      <RenderBadge />
    </span>
  );
}
