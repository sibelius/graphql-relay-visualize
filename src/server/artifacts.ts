import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import persisted from "../../persisted_queries.json";

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src/__generated__");

export type ArtifactInfo = {
  name: string;
  kind: "query" | "fragment" | "mutation" | "refetchable";
  code: string;
  types: string;
  source: { file: string; text: string } | null;
  persistedId: string | null;
  operationText: string | null;
};

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__generated__" ? [] : walk(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

let sources: { file: string; literals: string[] }[] | null = null;
function allSources() {
  return (sources ??= walk(path.join(ROOT, "src")).map((file) => ({
    file: path.relative(ROOT, file),
    literals: [...readFileSync(file, "utf8").matchAll(/graphql`([\s\S]*?)`/g)].map((m) => dedent(m[1])),
  })));
}

function dedent(text: string) {
  const lines = text.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

export function listArtifacts() {
  return readdirSync(GENERATED)
    .filter((f) => f.endsWith(".graphql.ts"))
    .map((f) => f.replace(".graphql.ts", ""))
    .sort();
}

export function readArtifact(name: string): ArtifactInfo {
  const code = readFileSync(path.join(GENERATED, `${name}.graphql.ts`), "utf8");
  const persistedId = code.match(/"id": "([0-9a-f]{32})"/)?.[1] ?? null;
  const isFragment = /import \{ (ReaderFragment|ReaderInlineDataFragment)/.test(code) || code.includes("ReaderFragment");
  const decl = new RegExp(`(query|fragment|mutation) ${name}\\b`);
  const literal = allSources()
    .flatMap((s) => s.literals.map((text) => ({ file: s.file, text })))
    .find((l) => decl.test(l.text));
  const kind: ArtifactInfo["kind"] = isFragment
    ? "fragment"
    : literal
      ? (literal.text.match(decl)![1] as "query" | "mutation")
      : "refetchable";

  // Everything between the header comment and the runtime node is the generated TypeScript.
  const types = code
    .split("\n")
    .filter((l) => !/^(\/\*| \*|\/\/|import )/.test(l))
    .join("\n")
    .split(/\nconst node/)[0]
    .trim();

  return {
    name,
    kind,
    code,
    types,
    source: literal ?? null,
    persistedId,
    operationText: persistedId ? (persisted as Record<string, string>)[persistedId] ?? null : null,
  };
}
