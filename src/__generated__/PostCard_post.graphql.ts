/**
 * @generated SignedSource<<fef90373f54ca7d8bc5a960019c597f8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PostCard_post$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"AuthorLine_user">;
  };
  readonly comments: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"CommentItem_comment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly excerpt: string;
  readonly title: string;
  readonly " $fragmentSpreads": FragmentRefs<"LikeBar_post">;
  readonly " $fragmentType": "PostCard_post";
};
export type PostCard_post$key = {
  readonly " $data"?: PostCard_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"PostCard_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PostCard_post",
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "AuthorLine_user"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "LikeBar_post"
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 2
        }
      ],
      "concreteType": "CommentConnection",
      "kind": "LinkedField",
      "name": "comments",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "CommentEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Comment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "CommentItem_comment"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "comments(first:2)"
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "c27d68733019753415d48a16d31327f8";

export default node;
