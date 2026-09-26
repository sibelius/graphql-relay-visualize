"use client";

import { graphql, useFragment } from "react-relay";
import type { ViewerBar_user$key } from "@/__generated__/ViewerBar_user.graphql";
import { Avatar } from "../ui";
import { XRay } from "./xray";

const fragment = graphql`
  fragment ViewerBar_user on User {
    name
    avatarColor
    followerCount
  }
`;

export function ViewerBar({ viewer }: { viewer: ViewerBar_user$key }) {
  const data = useFragment(fragment, viewer);
  return (
    <XRay component="ViewerBar" fragment={fragment} fragmentRef={viewer} data={data}>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
        <Avatar name={data.name} color={data.avatarColor} />
        <div className="text-sm">
          Signed in as <span className="font-medium">{data.name}</span>
          <span className="ml-2 text-xs text-faint">{data.followerCount.toLocaleString("en-US")} followers</span>
        </div>
      </div>
    </XRay>
  );
}
