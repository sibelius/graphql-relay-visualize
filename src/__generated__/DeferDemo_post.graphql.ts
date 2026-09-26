/**
 * @generated SignedSource<<254fad8588e97b330e3b8f3c81881807>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeferDemo_post$data = {
  readonly author: {
    readonly avatarColor: string;
    readonly name: string;
  };
  readonly excerpt: string;
  readonly title: string;
  readonly " $fragmentType": "DeferDemo_post";
};
export type DeferDemo_post$key = {
  readonly " $data"?: DeferDemo_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeferDemo_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeferDemo_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "excerpt",
      "storageKey": null
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
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "bddf1d0e64d7293ac849787f4ccee022";

export default node;
