/**
 * @generated SignedSource<<f11d5906a621cd5e73ccf1cd1890e0d6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RenameForm_user$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "RenameForm_user";
};
export type RenameForm_user$key = {
  readonly " $data"?: RenameForm_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"RenameForm_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RenameForm_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "eb1720981b07ce621181c183b66c7235";

export default node;
