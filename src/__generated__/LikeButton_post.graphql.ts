/**
 * @generated SignedSource<<d67090ac7542bc264e6bd5225957950d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LikeButton_post$data = {
  readonly id: string;
  readonly likeCount: number;
  readonly viewerHasLiked: boolean;
  readonly " $fragmentType": "LikeButton_post";
};
export type LikeButton_post$key = {
  readonly " $data"?: LikeButton_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"LikeButton_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LikeButton_post",
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

(node as any).hash = "44157e32b8d7b516c4acfe6d3c850474";

export default node;
