/**
 * @generated SignedSource<<54fc0b80686a4ca8bf990c57742532d6>>
 * @relayHash 49f4b926e39652d8e0f1382b0119321a
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 49f4b926e39652d8e0f1382b0119321a

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type RequiredCatchDemoQuery$variables = {
  postId: string;
};
export type RequiredCatchDemoQuery$data = {
  readonly post: {
    readonly sponsor: Result<string | null | undefined, unknown>;
    readonly title: string;
  } | null | undefined;
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"RequiredCatchDemo_user">;
  }>;
};
export type RequiredCatchDemoQuery = {
  response: RequiredCatchDemoQuery$data;
  variables: RequiredCatchDemoQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "postId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "postId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sponsor",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RequiredCatchDemoQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "users",
        "plural": true,
        "selections": [
          (v1/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RequiredCatchDemo_user"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "post",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          {
            "kind": "CatchField",
            "field": (v4/*:: as any*/),
            "to": "RESULT"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RequiredCatchDemoQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "users",
        "plural": true,
        "selections": [
          (v1/*:: as any*/),
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "website",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "post",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v1/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "49f4b926e39652d8e0f1382b0119321a",
    "metadata": {},
    "name": "RequiredCatchDemoQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "402f3157be9ac974f99a2924c428a8f9";

export default node;
