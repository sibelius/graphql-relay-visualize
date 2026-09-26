"use client";

import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import type { RequiredCatchDemoQuery } from "@/__generated__/RequiredCatchDemoQuery.graphql";
import type { RequiredCatchDemo_user$key } from "@/__generated__/RequiredCatchDemo_user.graphql";
import { Avatar, Panel } from "../ui";

const query = graphql`
  query RequiredCatchDemoQuery($postId: ID!) {
    users {
      id
      ...RequiredCatchDemo_user
    }
    post(id: $postId) {
      title
      sponsor @catch
    }
  }
`;

// If website is null, the whole fragment becomes null: the component gets a
// non-null \`website: string\` type and one null check at the top.
const userFragment = graphql`
  fragment RequiredCatchDemo_user on User {
    name
    avatarColor
    website @required(action: NONE)
  }
`;

export function RequiredCatchDemo() {
  const data = useLazyLoadQuery<RequiredCatchDemoQuery>(query, { postId: btoa("Post:p1") });
  const sponsor = data.post?.sponsor;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={<>@required(action: NONE)</>}>
        <ul className="space-y-1.5">
          {data.users.map((u) => (
            <UserWebsite key={u.id} user={u} />
          ))}
        </ul>
        <pre className="mt-4 rounded-lg bg-panel-2/60 p-2.5 font-mono text-[11px] text-muted">
          {`// generated type\nreadonly website: string;   // not string | null\n// ...and the fragment itself is nullable:\nRequiredCatchDemo_user$data | null`}
        </pre>
      </Panel>
      <Panel title={<>@catch</>}>
        <p className="mb-3 text-sm text-muted">
          <code className="font-mono text-ink">sponsor</code> resolves from a service that always fails. Normally the error is
          swallowed into a <code className="font-mono">null</code> that looks exactly like &quot;no sponsor&quot;. With{" "}
          <code className="font-mono text-ink">@catch</code> the error arrives as a value you have to handle:
        </p>
        <pre className="rounded-lg bg-panel-2/60 p-2.5 font-mono text-[11px] leading-relaxed text-ink">
          {`data.post.sponsor = ${JSON.stringify(sponsor, null, 2)}`}
        </pre>
        <div className="mt-3 rounded-lg border border-line p-3 text-sm">
          {sponsor?.ok ? (
            <span>Sponsored by {sponsor.value ?? "nobody"}</span>
          ) : (
            <span className="text-warn">⚠ Sponsor unavailable. Showing a retry instead of pretending there&apos;s no sponsor.</span>
          )}
        </div>
      </Panel>
    </div>
  );
}

function UserWebsite({ user }: { user: RequiredCatchDemo_user$key }) {
  const data = useFragment(userFragment, user);
  if (data == null) {
    return (
      <li className="rounded-lg border border-dashed border-bad/40 px-3 py-2 text-xs text-bad">
        fragment is <code className="font-mono">null</code>: website was missing, so this row opted out
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-line bg-panel-2/40 px-3 py-2 text-sm">
      <Avatar name={data.name} color={data.avatarColor} size={20} />
      <span className="flex-1">{data.name}</span>
      <span className="font-mono text-xs text-info">{data.website}</span>
    </li>
  );
}
