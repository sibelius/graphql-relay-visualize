"use client";

import { graphql, useFragment } from "react-relay";
import type { CommentItem_comment$key } from "@/__generated__/CommentItem_comment.graphql";
import { AuthorLine } from "./AuthorLine";
import { XRay } from "./xray";

const fragment = graphql`
  fragment CommentItem_comment on Comment {
    body
    author {
      ...AuthorLine_user
    }
  }
`;

export function CommentItem({ comment }: { comment: CommentItem_comment$key }) {
  const data = useFragment(fragment, comment);
  return (
    <XRay component="CommentItem" fragment={fragment} fragmentRef={comment} data={data}>
      <div className="flex flex-col gap-1.5 rounded-lg bg-panel-2/60 p-2.5">
        <AuthorLine user={data.author} size={20} />
        <p className="pl-7 text-xs text-muted">{data.body}</p>
      </div>
    </XRay>
  );
}
