// Relay 21 vs Apollo Client 4. "level" describes what you get out of the box:
//   default  - on, no configuration
//   optin    - built in, but you enable or configure it
//   tooling  - needs a separate tool or package
//   manual   - you write the code (a function, a policy, a convention)
//   none     - not available
export type Level = "default" | "optin" | "tooling" | "manual" | "none";

export type Feature = {
  key: string;
  group: "Build time" | "Data flow" | "Updates" | "Loading" | "Errors";
  title: string;
  relay: { level: Level; summary: string; code: string };
  apollo: { level: Level; summary: string; code: string };
  unique: boolean;
};

export const FEATURES: Feature[] = [
  {
    key: "compiler",
    group: "Build time",
    title: "Ahead-of-time compiler",
    unique: true,
    relay: {
      level: "default",
      summary: "Every graphql tag is validated against the schema at build time and compiled to an artifact. No GraphQL parsing in the browser.",
      code: `$ relay-compiler --watch
✖︎ Unknown field 'likeCnt' on type 'Post'
  src/LikeButton.tsx:12:5  → the build fails`,
    },
    apollo: {
      level: "tooling",
      summary: "Documents are parsed at runtime by default. Validation and types come from GraphQL Codegen or an editor plugin you set up separately.",
      code: `// codegen.ts (separate package, separate step)
const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: ["src/**/*.tsx"],
  generates: { "./src/gql/": { preset: "client" } },
};`,
    },
  },
  {
    key: "types",
    group: "Build time",
    title: "Types per fragment",
    unique: false,
    relay: {
      level: "default",
      summary: "The compiler emits $data and $key types for every fragment and operation, next to the artifact.",
      code: `import type { LikeButton_post$key } from "./__generated__/LikeButton_post.graphql";`,
    },
    apollo: {
      level: "tooling",
      summary: "Equivalent types come from GraphQL Codegen's client preset (TypedDocumentNode).",
      code: `const LIKE = graphql(\`fragment LikeButton on Post { likeCount }\`);
// graphql() here is codegen's generated function`,
    },
  },
  {
    key: "persisted",
    group: "Build time",
    title: "Persisted queries",
    unique: false,
    relay: {
      level: "optin",
      summary: "One line of compiler config. Artifacts carry an md5 id and the compiler writes the id → text map.",
      code: `// relay.config.json
"persistConfig": { "file": "./persisted_queries.json" }`,
    },
    apollo: {
      level: "tooling",
      summary: "Generate a manifest with @apollo/generate-persisted-query-manifest, publish it, then add the persisted-query link.",
      code: `npx generate-persisted-query-manifest
link: new PersistedQueryLink({ sha256, ... }).concat(httpLink)`,
    },
  },
  {
    key: "masking",
    group: "Data flow",
    title: "Data masking",
    unique: false,
    relay: {
      level: "default",
      summary: "Always on. A component only sees the fields of its own fragment; parents receive opaque references.",
      code: `const data = useFragment(PostCard_post, props.post);
data.likeCount // ✖ type error: belongs to LikeBar_post`,
    },
    apollo: {
      level: "optin",
      summary: "Available since 3.12 behind a client flag; existing code migrates with @unmask.",
      code: `new ApolloClient({ cache, dataMasking: true });
// ...PostCard @unmask  while migrating`,
    },
  },
  {
    key: "subscriptions",
    group: "Data flow",
    title: "Re-render only the fragment that changed",
    unique: false,
    relay: {
      level: "default",
      summary: "Every useFragment is its own store subscription. The query root doesn't re-render when a leaf changes.",
      code: `// like a post → only LikeButton + MiniLikes re-render
// (see page 04 render counters)`,
    },
    apollo: {
      level: "optin",
      summary: "useFragment gives a component its own live binding, but useQuery stays the primary hook and re-renders on any change to its result.",
      code: `const { data } = useFragment({ fragment: LIKE, from: post });`,
    },
  },
  {
    key: "conventions",
    group: "Data flow",
    title: "Colocation naming conventions",
    unique: false,
    relay: {
      level: "optin",
      summary: "The docs require operation names to begin with the module name (PostCard_post in PostCard.tsx), which makes every document traceable to its file. eslint-plugin-relay enforces it. relay-compiler 21 with the Next SWC plugin did not: we checked, and it accepted a fragment named Post.",
      code: `// in PostCard.tsx
fragment PostCard_post on Post { ... }   ✓ convention
fragment Post on Post { ... }            ⚠ lint error, compiles anyway`,
    },
    apollo: {
      level: "manual",
      summary: "No prescribed naming; colocation is a team convention, enforced by review or your own lint rules.",
      code: `// any name, any file
const POST = gql\`fragment Post on Post { ... }\`;`,
    },
  },
  {
    key: "pagination",
    group: "Updates",
    title: "Generated pagination queries",
    unique: true,
    relay: {
      level: "default",
      summary: "@refetchable + @connection: the compiler writes the pagination query, and loadNext merges edges into the connection record.",
      code: `fragment Feed_query on Query
  @refetchable(queryName: "FeedPaginationQuery") {
  feed(first: $count, after: $cursor) @connection(key: "Feed_feed") { ... }
}
const { data, loadNext } = usePaginationFragment(fragment, ref);`,
    },
    apollo: {
      level: "manual",
      summary: "Call fetchMore with the right variables and register a field policy that merges pages (relayStylePagination helps).",
      code: `new InMemoryCache({
  typePolicies: { Query: { fields: { feed: relayStylePagination() } } },
});
fetchMore({ variables: { after: data.feed.pageInfo.endCursor } });`,
    },
  },
  {
    key: "store-directives",
    group: "Updates",
    title: "Declarative store updates",
    unique: true,
    relay: {
      level: "default",
      summary: "Mutation responses carry directives that insert or delete edges and records. No updater function.",
      code: `addComment(input: $input) {
  commentEdge @appendEdge(connections: $connections) { node { ...Comment } }
}
deletePost(input: $input) { deletedId @deleteRecord }`,
    },
    apollo: {
      level: "manual",
      summary: "Write an update function that edits the cache with cache.modify or writeFragment.",
      code: `update(cache, { data }) {
  cache.modify({
    id: cache.identify(post),
    fields: { comments: (refs = [], { toReference }) =>
      [...refs, toReference(data.addComment.comment)] },
  });
}`,
    },
  },
  {
    key: "gc",
    group: "Updates",
    title: "Automatic garbage collection",
    unique: false,
    relay: {
      level: "default",
      summary: "Queries retain their data while mounted. When released, unreferenced records are collected on a schedule.",
      code: `// automatic; tune with
new Store(source, { gcReleaseBufferSize: 10 });`,
    },
    apollo: {
      level: "manual",
      summary: "The cache grows until you call cache.gc() or evict entries yourself.",
      code: `cache.evict({ id: cache.identify(post) });
cache.gc();`,
    },
  },
  {
    key: "3d",
    group: "Loading",
    title: "Data-driven code loading (@module)",
    unique: true,
    relay: {
      level: "optin",
      summary: "The server picks the component for each union member, and its JS is fetched in parallel with the data. Needs server support (types marked with a JS-dependency trait).",
      code: `...TextBlock_block @module(name: "TextBlock.react")
...ImageBlock_block @module(name: "ImageBlock.react")`,
    },
    apollo: { level: "none", summary: "No equivalent. Lazy-load components yourself after the data says which one you need.", code: `// data first, then React.lazy(() => import(...)): a waterfall` },
  },
  {
    key: "entrypoints",
    group: "Loading",
    title: "Preload code + data together",
    unique: false,
    relay: {
      level: "optin",
      summary: "EntryPoints bundle a route's queries with its component, so both start loading at navigation time.",
      code: `const ref = loadEntryPoint(env, PostEntryPoint, { id });
<EntryPointContainer entryPointReference={ref} props={{}} />`,
    },
    apollo: {
      level: "optin",
      summary: "createQueryPreloader starts the request early; loading the code is up to your router.",
      code: `const preloadQuery = createQueryPreloader(client);
const queryRef = preloadQuery(POST_QUERY, { variables: { id } });`,
    },
  },
  {
    key: "defer",
    group: "Loading",
    title: "@defer / @stream",
    unique: false,
    relay: {
      level: "default",
      summary: "Deferred fragments suspend independently, and streamed items append to the list record (page 10 runs it live).",
      code: `...Insights_post @defer(label: "insights")
activity @stream(initialCount: 1) { ... }`,
    },
    apollo: {
      level: "optin",
      summary: "Supported in Apollo Client 4 once you pick an incremental handler that matches your server's wire format.",
      code: `new ApolloClient({ incrementalHandler: new GraphQL17Alpha9Handler(), ... })`,
    },
  },
  {
    key: "required",
    group: "Errors",
    title: "Field-level nullability: @required, @catch",
    unique: true,
    relay: {
      level: "default",
      summary: "Declare per field whether a null should bubble, log, throw or come back as a typed error value, and the generated types follow.",
      code: `website @required(action: LOG)   # website: string
sponsor @catch                   # { ok: false, errors } | { ok: true, value }`,
    },
    apollo: {
      level: "manual",
      summary: "errorPolicy applies to a whole operation; per-field handling is checks in component code.",
      code: `useQuery(QUERY, { errorPolicy: "all" });
if (data?.post?.sponsor == null && error) { ... }`,
    },
  },
  {
    key: "resolvers",
    group: "Data flow",
    title: "Client schema resolvers",
    unique: false,
    relay: {
      level: "optin",
      summary: "Relay Resolvers: typed derived fields and client state in the graph, read through fragments. Live resolvers subscribe to external stores.",
      // "@" is interpolated so relay-compiler doesn't parse this sample as a real resolver.
      code: `/**
 * ${"@"}relayField Post.isPopular: Boolean
 * ${"@"}rootFragment isPopularFragment
 */
export function isPopular(key) { … }`,
    },
    apollo: {
      level: "optin",
      summary: "Local state through field policies (read functions) and reactive variables.",
      code: `typePolicies: { Post: { fields: {
  isPopular: { read: (_, { readField }) => readField("likeCount") > 100 },
} } }`,
    },
  },
];

export const APOLLO_WINS = [
  "No compiler or build step: add the client and start writing queries.",
  "Works with any GraphQL schema. Relay works best when the server follows the Node interface and connection spec.",
  "Easy to adopt incrementally in an existing app, one query at a time.",
  "A larger ecosystem: Apollo Link middleware, the Router/GraphOS platform, plenty of tutorials.",
  "Flexible cache policies (typePolicies, keyFields) for schemas without global ids.",
];
