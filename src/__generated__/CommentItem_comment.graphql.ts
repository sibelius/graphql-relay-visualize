/**
 * @generated SignedSource<<81fcaf454fa67fdb8ebcd657b4ed3c8b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentItem_comment$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"AuthorLine_user">;
  };
  readonly body: string;
  readonly " $fragmentType": "CommentItem_comment";
};
export type CommentItem_comment$key = {
  readonly " $data"?: CommentItem_comment$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommentItem_comment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommentItem_comment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "AuthorLine_user"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

(node as any).hash = "5bb6fa4977641324b299ae35b6131f70";

export default node;
