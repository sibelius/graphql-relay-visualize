/**
 * @generated SignedSource<<60171cbb92d96120306bd999b61d35ae>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PostTitle_post$data = {
  readonly title: string;
  readonly " $fragmentType": "PostTitle_post";
};
export type PostTitle_post$key = {
  readonly " $data"?: PostTitle_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"PostTitle_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PostTitle_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "0b4be2a42199d82183bbaaa462805b5c";

export default node;
