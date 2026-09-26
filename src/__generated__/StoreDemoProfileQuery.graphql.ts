/**
 * @generated SignedSource<<94dadd285d99d72a2295aaa748f99cb4>>
 * @relayHash 8e383c9fc4ba8f20057a91764a057c0b
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8e383c9fc4ba8f20057a91764a057c0b

import { ConcreteRequest } from 'relay-runtime';
export type StoreDemoProfileQuery$variables = Record<PropertyKey, never>;
export type StoreDemoProfileQuery$data = {
  readonly user: {
    readonly bio: string | null | undefined;
    readonly followerCount: number;
    readonly location: string | null | undefined;
  } | null | undefined;
};
export type StoreDemoProfileQuery = {
  response: StoreDemoProfileQuery$data;
  variables: StoreDemoProfileQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "username",
    "value": "alan"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bio",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "location",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "followerCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "StoreDemoProfileQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": "user(username:\"alan\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "StoreDemoProfileQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "user(username:\"alan\")"
      }
    ]
  },
  "params": {
    "id": "8e383c9fc4ba8f20057a91764a057c0b",
    "metadata": {},
    "name": "StoreDemoProfileQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0fface36574843d6d9ef70492a9d919c";

export default node;
