/**
 * @generated SignedSource<<efe1450e1ea4b5f4abe28679ea15f12e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RequiredCatchDemo_user$data = {
  readonly avatarColor: string;
  readonly name: string;
  readonly website: string;
  readonly " $fragmentType": "RequiredCatchDemo_user";
} | null | undefined;
export type RequiredCatchDemo_user$key = {
  readonly " $data"?: RequiredCatchDemo_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"RequiredCatchDemo_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RequiredCatchDemo_user",
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
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "website",
        "storageKey": null
      },
      "action": "NONE"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "21586570e89f7edc4421f3e508c715d8";

export default node;
