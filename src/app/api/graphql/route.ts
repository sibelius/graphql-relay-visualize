import { legacyExecuteIncrementally, parse, validate } from "graphql";
import persisted from "../../../../persisted_queries.json";
import { schema } from "@/server/schema";
import { latencyFrom, sleep } from "@/server/data";

const persistedQueries = persisted as Record<string, string>;

export async function POST(req: Request) {
  const started = performance.now();
  const body = (await req.json()) as { doc_id?: string; query?: string; variables?: Record<string, unknown> };

  // Relay sends only the md5 id of the operation; the server owns the text.
  const source = body.doc_id ? persistedQueries[body.doc_id] : body.query;
  if (!source) {
    return Response.json({ errors: [{ message: `Unknown persisted query id: ${body.doc_id}` }] }, { status: 400 });
  }

  await sleep(latencyFrom(req, 150));

  const document = parse(source);
  const errors = validate(schema, document);
  if (errors.length) return Response.json({ errors });

  const result = await legacyExecuteIncrementally({
    schema,
    document,
    variableValues: body.variables,
    contextValue: { fail: req.headers.get("x-demo-fail") === "1" },
  });
  const extensions = () => ({ serverMs: Math.round(performance.now() - started), persisted: Boolean(body.doc_id) });

  if (!("initialResult" in result)) return Response.json({ ...result, extensions: extensions() });

  // @defer / @stream: one JSON payload per line, flushed as the executor produces them.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
      send({ ...result.initialResult, extensions: extensions() });
      for await (const next of result.subsequentResults) send({ ...next, extensions: extensions() });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-cache" } });
}
