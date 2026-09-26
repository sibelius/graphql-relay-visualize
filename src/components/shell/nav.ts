export const NAV = [
  { href: "/", label: "Overview", blurb: "Why GraphQL + Relay", n: "00", group: "Start" },
  { href: "/network", label: "One round trip", blurb: "REST waterfall vs one query", n: "01", group: "Mechanisms" },
  { href: "/colocation", label: "Colocation & masking", blurb: "Each component declares its data", n: "02", group: "Mechanisms" },
  { href: "/store", label: "Normalized store", blurb: "Response tree → record graph", n: "03", group: "Mechanisms" },
  { href: "/consistency", label: "Optimistic & consistent", blurb: "Update once, re-render precisely", n: "04", group: "Mechanisms" },
  { href: "/pagination", label: "Connections", blurb: "Cursor pagination, visualized", n: "05", group: "Mechanisms" },
  { href: "/compiler", label: "The compiler", blurb: "What you write → what ships", n: "06", group: "Mechanisms" },
  { href: "/schema", label: "Schema graph", blurb: "A typed contract you can see", n: "07", group: "Mechanisms" },
  { href: "/vs-rest", label: "vs REST & friends", blurb: "Frontend complexity, many endpoints", n: "08", group: "Compare" },
  { href: "/vs-apollo", label: "Relay vs Apollo", blurb: "What only Relay does", n: "09", group: "Compare" },
  { href: "/advanced", label: "Advanced Relay", blurb: "@defer, @stream, RSC, @catch", n: "10", group: "Go deeper" },
] as const;
