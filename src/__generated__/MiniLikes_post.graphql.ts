/**
 * @generated SignedSource<<a54d7a2b0118a97379f0ad2b0af15468>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MiniLikes_post$data = {
  readonly likeCount: number;
  readonly viewerHasLiked: boolean;
  readonly " $fragmentType": "MiniLikes_post";
};
export type MiniLikes_post$key = {
  readonly " $data"?: MiniLikes_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"MiniLikes_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MiniLikes_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "likeCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerHasLiked",
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "d14a91ad006cce03e03b5c6d66dbc324";

export default node;
