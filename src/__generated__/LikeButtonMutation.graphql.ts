/**
 * @generated SignedSource<<765671a50e1e4fc8f55924bb4939435f>>
 * @relayHash f543b7dcd38a0c08857aa177ddc22784
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f543b7dcd38a0c08857aa177ddc22784

import { ConcreteRequest } from 'relay-runtime';
export type LikePostInput = {
  clientMutationId?: string | null | undefined;
  like: boolean;
  postId: string;
};
export type LikeButtonMutation$variables = {
  input: LikePostInput;
};
export type LikeButtonMutation$data = {
  readonly likePost: {
    readonly post: {
      readonly id: string;
      readonly likeCount: number;
      readonly viewerHasLiked: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type LikeButtonMutation = {
  response: LikeButtonMutation$data;
  variables: LikeButtonMutation$variables;
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
    "concreteType": "LikePostPayload",
    "kind": "LinkedField",
    "name": "likePost",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "post",
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
            "name": "likeCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerHasLiked",
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
    "name": "LikeButtonMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LikeButtonMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "id": "f543b7dcd38a0c08857aa177ddc22784",
    "metadata": {},
    "name": "LikeButtonMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "d90061819adec0adb5153b3b59f0392d";

export default node;
