/**
 * @generated SignedSource<<3e67c70976c412f39f0c4a02a4a55210>>
 * @relayHash 0695478d673e03b9d346fbab3314d305
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 0695478d673e03b9d346fbab3314d305

import { ConcreteRequest } from 'relay-runtime';
export type StreamDemoOffQuery$variables = Record<PropertyKey, never>;
export type StreamDemoOffQuery$data = {
  readonly activity: ReadonlyArray<{
    readonly actor: {
      readonly avatarColor: string;
      readonly name: string;
    };
    readonly id: string;
    readonly message: string;
  }>;
};
export type StreamDemoOffQuery = {
  response: StreamDemoOffQuery$data;
  variables: StreamDemoOffQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarColor",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "StreamDemoOffQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Activity",
        "kind": "LinkedField",
        "name": "activity",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "StreamDemoOffQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Activity",
        "kind": "LinkedField",
        "name": "activity",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              (v0/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "0695478d673e03b9d346fbab3314d305",
    "metadata": {},
    "name": "StreamDemoOffQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "de08b968bb222e8fa56f37be770ad19f";

export default node;
