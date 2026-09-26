/**
 * @generated SignedSource<<5ea21dc13fbfdf2b9ea441b9d5c00874>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LikeBar_post$data = {
  readonly likeCount: number;
  readonly tags: ReadonlyArray<string>;
  readonly viewerHasLiked: boolean;
  readonly " $fragmentType": "LikeBar_post";
};
export type LikeBar_post$key = {
  readonly " $data"?: LikeBar_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"LikeBar_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LikeBar_post",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "tags",
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "64fb33cf161d8b9a92e04160ab202042";

export default node;
