/**
 * @generated SignedSource<<6fa0c237bc46466a19c6f568500be33d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeferDemoInsights_post$data = {
  readonly insights: {
    readonly readMinutes: number;
    readonly related: ReadonlyArray<string>;
    readonly sentiment: string;
    readonly wordCount: number;
  };
  readonly " $fragmentType": "DeferDemoInsights_post";
};
export type DeferDemoInsights_post$key = {
  readonly " $data"?: DeferDemoInsights_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeferDemoInsights_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeferDemoInsights_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PostInsights",
      "kind": "LinkedField",
      "name": "insights",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "readMinutes",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "wordCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "sentiment",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "related",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "d5e49fae24636d0344e093327101a566";

export default node;
