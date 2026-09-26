/**
 * @generated SignedSource<<5bea46395addfd1e127c37523ee633d6>>
 * @relayHash 432e7de7536e0cb18edbbfcd7828d900
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 432e7de7536e0cb18edbbfcd7828d900

import { ConcreteRequest } from 'relay-runtime';
export type RenameUserInput = {
  clientMutationId?: string | null | undefined;
  name: string;
  userId: string;
};
export type RenameFormMutation$variables = {
  input: RenameUserInput;
};
export type RenameFormMutation$data = {
  readonly renameUser: {
    readonly user: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
  } | null | undefined;
};
export type RenameFormMutation = {
  response: RenameFormMutation$data;
  variables: RenameFormMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "RenameUserPayload",
    "kind": "LinkedField",
    "name": "renameUser",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RenameFormMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RenameFormMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "id": "432e7de7536e0cb18edbbfcd7828d900",
    "metadata": {},
    "name": "RenameFormMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "9ee1afddd45276a28ef13aab612f64f2";

export default node;
