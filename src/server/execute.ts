import "server-only";
import { legacyExecuteIncrementally, parse } from "graphql";
import persisted from "../../persisted_queries.json";
import { schema } from "./schema";

/**
 * Runs a persisted operation in-process — no HTTP hop — for server components.
 * Takes the compiled artifact so the query text never leaves the server.
 */
export async function executePersisted(artifact: { params: { id?: string | null } }, variables: Record<string, unknown> = {}) {
  const started = performance.now();
  const node = (artifact as { default?: typeof artifact }).default ?? artifact;
  const source = (persisted as Record<string, string>)[node.params.id ?? ""];
  // The schema enables @defer/@stream, which requires the incremental executor.
  const result = await legacyExecuteIncrementally({
    schema,
    document: parse(source),
    variableValues: variables,
    contextValue: { fail: false },
  });
  if ("initialResult" in result) throw new Error("Server components here expect non-incremental queries");
  return { response: JSON.parse(JSON.stringify(result)), serverMs: Math.round(performance.now() - started) };
}
