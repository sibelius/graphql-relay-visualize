/**
 * @generated SignedSource<<652df50b6a21dc23455bb0a19a070b93>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ViewerBar_user$data = {
  readonly avatarColor: string;
  readonly followerCount: number;
  readonly name: string;
  readonly " $fragmentType": "ViewerBar_user";
};
export type ViewerBar_user$key = {
  readonly " $data"?: ViewerBar_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"ViewerBar_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ViewerBar_user",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "followerCount",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "38aa596445257e9fa5c171fbfec5dc6d";

export default node;
