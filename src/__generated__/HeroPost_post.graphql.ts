/**
 * @generated SignedSource<<38e04fc3e536a15585456800eae14cd3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeroPost_post$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"AuthorName_user">;
  };
  readonly excerpt: string;
  readonly " $fragmentSpreads": FragmentRefs<"LikeButton_post" | "PostTitle_post">;
  readonly " $fragmentType": "HeroPost_post";
};
export type HeroPost_post$key = {
  readonly " $data"?: HeroPost_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeroPost_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeroPost_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "excerpt",
      "storageKey": null
    },
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

(node as any).hash = "24d589b954034750924127ca04b0fa85";

export default node;
