/**
 * @generated SignedSource<<1723046ea8b34be65d632df9e96c4e55>>
 * @relayHash b5dd6473cd00a2070e81f1a515341253
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b5dd6473cd00a2070e81f1a515341253

import { ConcreteRequest } from 'relay-runtime';
export type StreamDemoOnQuery$variables = Record<PropertyKey, never>;
export type StreamDemoOnQuery$data = {
  readonly activity: ReadonlyArray<{
    readonly actor: {
      readonly avatarColor: string;
      readonly name: string;
    };
    readonly id: string;
    readonly message: string;
  }>;
};
export type StreamDemoOnQuery = {
  response: StreamDemoOnQuery$data;
  variables: StreamDemoOnQuery$variables;
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
    "name": "StreamDemoOnQuery",
    "selections": [
      {
        "kind": "Stream",
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
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "StreamDemoOnQuery",
    "selections": [
      {
        "if": null,
        "kind": "Stream",
        "label": "StreamDemoOnQuery$stream$activity",
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
      }
    ]
  },
  "params": {
    "id": "b5dd6473cd00a2070e81f1a515341253",
    "metadata": {},
    "name": "StreamDemoOnQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "159d0df95e295e4c053b70a76dce6a5d";

export default node;
