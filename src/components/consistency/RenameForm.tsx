"use client";

import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import type { RenameForm_user$key } from "@/__generated__/RenameForm_user.graphql";
import type { RenameFormMutation } from "@/__generated__/RenameFormMutation.graphql";
import { inspector } from "@/relay/inspector";
import { Button } from "../ui";

const fragment = graphql`
  fragment RenameForm_user on User {
    id
    name
  }
`;

const mutation = graphql`
  mutation RenameFormMutation($input: RenameUserInput!) {
    renameUser(input: $input) {
      user {
        id
        name
      }
    }
  }
`;

const NAMES = ["Ada Lovelace", "Ada King", "Countess of Lovelace", "A. A. Lovelace"];

export function RenameForm({ user }: { user: RenameForm_user$key }) {
  const data = useFragment(fragment, user);
  const [commit, inFlight] = useMutation<RenameFormMutation>(mutation);
  const [draft, setDraft] = useState("");

  const rename = (name: string) => {
    inspector.pushTimeline("execute.start", `rename → "${name}"`, "RenameFormMutation");
    commit({
      variables: { input: { userId: data.id, name } },
      optimisticResponse: { renameUser: { user: { id: data.id, name } } },
    });
    setDraft("");
  };

  const next = NAMES[(NAMES.indexOf(data.name) + 1) % NAMES.length];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => rename(next)} disabled={inFlight}>
        Rename {data.name.split(" ")[0]} → “{next}”
      </Button>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) rename(draft.trim());
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="or type a name"
          className="w-40 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-faint"
        />
      </form>
    </div>
  );
}
