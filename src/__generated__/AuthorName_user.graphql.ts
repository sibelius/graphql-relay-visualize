/**
 * @generated SignedSource<<43db6044463665d4b2c8fa45dce2e8d6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AuthorName_user$data = {
  readonly avatarColor: string;
  readonly name: string;
  readonly " $fragmentType": "AuthorName_user";
};
export type AuthorName_user$key = {
  readonly " $data"?: AuthorName_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"AuthorName_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AuthorName_user",
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
      "name": "avatarColor",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "4427b49d2aa7c4569bfb311bd2446329";

export default node;
