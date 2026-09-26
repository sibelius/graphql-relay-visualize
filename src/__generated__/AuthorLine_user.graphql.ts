/**
 * @generated SignedSource<<c0e8bd2ce2e35cc139028fb5bb2ef02d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AuthorLine_user$data = {
  readonly avatarColor: string;
  readonly name: string;
  readonly username: string;
  readonly " $fragmentType": "AuthorLine_user";
};
export type AuthorLine_user$key = {
  readonly " $data"?: AuthorLine_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"AuthorLine_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AuthorLine_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarColor",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "752b87d9d1b36758f04cfdb40d5c36f5";

export default node;
