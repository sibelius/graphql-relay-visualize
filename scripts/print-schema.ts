// Writes schema.graphql from the executable schema so relay-compiler can
// validate every fragment and query against it.
import { writeFileSync } from "node:fs";
import { printSchema } from "graphql";
import { schema } from "../src/server/schema.ts";

writeFileSync(new URL("../schema.graphql", import.meta.url), printSchema(schema) + "\n");
console.log("schema.graphql written");
