"use client";

import { graphql, useFragment } from "react-relay";
import type { PostCard_post$key } from "@/__generated__/PostCard_post.graphql";
import { AuthorLine } from "./AuthorLine";
import { CommentItem } from "./CommentItem";
import { LikeBar } from "./LikeBar";
import { XRay } from "./xray";

// PostCard never touches likeCount or the author's name. It only spreads the
// fragments of the children that do — and Relay masks their fields from it.
const fragment = graphql`
  fragment PostCard_post on Post {
    title
    excerpt
    author {
      ...AuthorLine_user
    }
    ...LikeBar_post
    comments(first: 2) {
      edges {
        node {
          id
          ...CommentItem_comment
        }
      }
    }
  }
`;

export function PostCard({ post }: { post: PostCard_post$key }) {
  const data = useFragment(fragment, post);
  return (
    <XRay component="PostCard" fragment={fragment} fragmentRef={post} data={data}>
      <article className="space-y-3 rounded-xl border border-line bg-panel p-4">
        <AuthorLine user={data.author} />
        <div>
          <h3 className="font-medium">{data.title}</h3>
          <p className="mt-1 text-sm text-muted">{data.excerpt}</p>
        </div>
        <LikeBar post={data} />
        <div className="space-y-2">
          {data.comments.edges?.map((e) => (e?.node ? <CommentItem key={e.node.id} comment={e.node} /> : null))}
        </div>
      </article>
    </XRay>
  );
}
