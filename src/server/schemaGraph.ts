import "server-only";
import { getNamedType, type GraphQLArgument, type GraphQLType, isInputObjectType, isInterfaceType, isObjectType, isUnionType, type GraphQLNamedType } from "graphql";
import { schema } from "./schema";

export type SchemaField = { name: string; type: string; target: string | null; args: string[]; description: string | null };
export type SchemaType = {
  name: string;
  kind: "object" | "interface" | "input" | "union";
  description: string | null;
  fields: SchemaField[];
  interfaces: string[];
  plumbing: boolean;
};

const isPlumbing = (name: string) => /(Connection|Edge|Payload|Input)$/.test(name) || name === "PageInfo";

/** Flattens the executable schema into plain data a client component can draw. */
export function schemaGraph(): SchemaType[] {
  const types = Object.values(schema.getTypeMap()).filter((t) => !t.name.startsWith("__"));
  const composite = (t: GraphQLNamedType) => isObjectType(t) || isInterfaceType(t) || isInputObjectType(t) || isUnionType(t);
  return types.filter(composite).map((t) => {
    const fields =
      isObjectType(t) || isInterfaceType(t) || isInputObjectType(t)
        ? Object.values(t.getFields()).map((field) => {
            const f = field as { name: string; type: GraphQLType; description?: string | null; args?: readonly GraphQLArgument[] };
            const named = getNamedType(f.type)!;
            return {
              name: f.name,
              type: String(f.type),
              target: composite(named) ? named.name : null,
              args: (f.args ?? []).map((a) => `${a.name}: ${a.type}`),
              description: f.description ?? null,
            };
          })
        : [];
    return {
      name: t.name,
      kind: isObjectType(t) ? "object" : isInterfaceType(t) ? "interface" : isInputObjectType(t) ? "input" : "union",
      description: t.description ?? null,
      fields,
      interfaces: isObjectType(t) ? t.getInterfaces().map((i) => i.name) : [],
      plumbing: isPlumbing(t.name),
    };
  });
}
