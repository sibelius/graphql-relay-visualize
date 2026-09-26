"use client";

import { graphql, useFragment } from "react-relay";
import type { AuthorLine_user$key } from "@/__generated__/AuthorLine_user.graphql";
import { Avatar } from "../ui";
import { XRay } from "./xray";

const fragment = graphql`
  fragment AuthorLine_user on User {
    name
    username
    avatarColor
  }
`;

export function AuthorLine({ user, size = 28 }: { user: AuthorLine_user$key; size?: number }) {
  const data = useFragment(fragment, user);
  return (
    <XRay component="AuthorLine" fragment={fragment} fragmentRef={user} data={data} inline>
      <span className="inline-flex items-center gap-2">
        <Avatar name={data.name} color={data.avatarColor} size={size} />
        <span className="leading-tight">
          <span className="block text-sm font-medium text-ink">{data.name}</span>
          <span className="block text-xs text-faint">@{data.username}</span>
        </span>
      </span>
    </XRay>
  );
}
