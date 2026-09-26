"use client";

import { graphql, useFragment } from "react-relay";
import type { AuthorName_user$key } from "@/__generated__/AuthorName_user.graphql";
import { Avatar, RenderBadge } from "../ui";

const fragment = graphql`
  fragment AuthorName_user on User {
    name
    avatarColor
  }
`;

export function AuthorName({ user }: { user: AuthorName_user$key }) {
  const data = useFragment(fragment, user);
  return (
    <span data-render-host className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5">
      <Avatar name={data.name} color={data.avatarColor} size={18} />
      <span className="text-xs text-muted">{data.name}</span>
      <RenderBadge />
    </span>
  );
}
