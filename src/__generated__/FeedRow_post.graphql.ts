/**
 * @generated SignedSource<<6ed72c5a5315a83f25cff21ab50cf07f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedRow_post$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"AuthorName_user">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"LikeButton_post" | "PostTitle_post">;
  readonly " $fragmentType": "FeedRow_post";
};
export type FeedRow_post$key = {
  readonly " $data"?: FeedRow_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"FeedRow_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FeedRow_post",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "PostTitle_post"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "LikeButton_post"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "AuthorName_user"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "3019575bb73405ceb6090508c8c3fa85";

export default node;
