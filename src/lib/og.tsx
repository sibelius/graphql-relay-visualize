import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { NAV } from "@/components/shell/nav";

export const SITE_URL = "https://graphql-relay-visualize.vercel.app";
export const SITE_NAME = "Relay, visualized";
export const SITE_DESCRIPTION = "Interactive visualizations of what GraphQL and Relay do for a React app.";
export const OG_SIZE = { width: 1200, height: 630 };

const HOME_TITLE = "See what Relay does for your data, one mechanism at a time.";
const HOME_BLURB = "Interactive visualizations of GraphQL and Relay in a real React app";

const C = {
  bg: "#0a0c11",
  panel: "#11141b",
  panel2: "#171b24",
  line: "#242a38",
  ink: "#e7e9f0",
  muted: "#8a93a8",
  faint: "#5a6275",
  accent: "#f26b00",
  gql: "#e535ab",
};
const FIELD = ["#38bdf8", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#22d3ee"];

function navItem(href: string) {
  const item = NAV.find((n) => n.href === href);
  if (!item) throw new Error(`No nav item for ${href}`);
  return item;
}

/** Metadata for a nav route; pass `artifact` for /compiler/[artifact]. */
export function pageMetadata(href: string, artifact?: string): Metadata {
  const item = navItem(href);
  const title =
    href === "/" ? SITE_NAME : artifact ? `${artifact} · ${item.label} · ${SITE_NAME}` : `${item.label} · ${SITE_NAME}`;
  const description = href === "/" ? SITE_DESCRIPTION : `${item.blurb}. ${SITE_DESCRIPTION}`;
  const url = artifact ? `${href}/${artifact}` : href;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: SITE_NAME, type: href === "/" ? "website" : "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function ogAlt(href: string) {
  if (href === "/") return `${SITE_NAME}: ${HOME_TITLE}`;
  const item = navItem(href);
  return `${item.label}: ${item.blurb}. ${SITE_NAME}`;
}

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const TYPES = ["User", "Post", "Comment", "Post", "User", "Comment", "Post"];

const STORE_W = 1080;
const STORE_H = 150;
const COLS = 8;
const BOX_W = 134;
const BOX_H = 32;

/** Seeded record layout, so every build draws the same picture. Top row of COLS, bottom row offset by half a step. */
function storeLayout(index: number) {
  const rand = rng(5 + index * 131);
  const step = (STORE_W - BOX_W) / (COLS - 1);
  const record = (x: number, y: number) => ({
    x: x + (rand() - 0.5) * 6,
    y: y + (rand() - 0.5) * 22,
    label: `${TYPES[Math.floor(rand() * TYPES.length)]}:${1 + Math.floor(rand() * 98)}`,
    field: FIELD[Math.floor(rand() * FIELD.length)],
  });
  const top = Array.from({ length: COLS }, (_, c) => record(BOX_W / 2 + c * step, 28));
  const bottom = Array.from({ length: COLS - 1 }, (_, c) => record(BOX_W / 2 + (c + 0.5) * step, 112));
  const nodes = [...top, ...bottom];
  const edges: [number, number][] = [];
  for (let c = 0; c < COLS; c++) {
    if (c < COLS - 1 && rand() < 0.6) edges.push([c, c + 1]);
    if (c < COLS - 2 && rand() < 0.5) edges.push([COLS + c, COLS + c + 1]);
    const down = c === 0 ? 0 : c === COLS - 1 ? c - 1 : c - (rand() < 0.5 ? 1 : 0);
    if (rand() < 0.75) edges.push([c, COLS + down]);
  }
  return { nodes, edges, hot: 2 + (index % 4) };
}

/** A slice of a normalized store: records keyed by id, linked by references. */
function StoreGraph({ index, color }: { index: number; color: string }) {
  const { nodes, edges, hot } = storeLayout(index);
  const hotEdges = edges.filter(([a, b]) => a === hot || b === hot);
  return (
    <div style={{ display: "flex", position: "relative", width: STORE_W, height: STORE_H, fontFamily: "JetBrains Mono" }}>
      <svg width={STORE_W} height={STORE_H} viewBox={`0 0 ${STORE_W} ${STORE_H}`}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={C.line} strokeWidth={1.5} />
        ))}
        {hotEdges.map(([a, b], i) => (
          <line key={`h${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={color} strokeWidth={2.5} />
        ))}
      </svg>
      {nodes.map((n, i) => {
        const isHot = i === hot;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x - BOX_W / 2,
              top: n.y - BOX_H / 2,
              width: BOX_W,
              height: BOX_H,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 10px",
              borderRadius: 8,
              background: isHot ? C.panel2 : C.panel,
              border: `${isHot ? 2 : 1.5}px solid ${isHot ? color : C.line}`,
              fontSize: 15,
              color: isHot ? C.ink : C.muted,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: isHot ? color : n.field }} />
            {n.label}
          </div>
        );
      })}
    </div>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#171b24" />
      <circle cx="9" cy="10" r="3.2" fill="#f26b00" />
      <circle cx="23" cy="10" r="3.2" fill="#e535ab" />
      <circle cx="16" cy="23" r="3.2" fill="#38bdf8" />
      <path d="M9 10 L23 10 L16 23 Z" fill="none" stroke="#e7e9f0" strokeOpacity=".5" strokeWidth="1.2" />
    </svg>
  );
}

const font = (f: string) => readFile(join(process.cwd(), "assets/fonts", f));

export async function renderOg(href: string, artifact?: string) {
  const [semi, sans, mono] = await Promise.all([
    font("Inter-SemiBold.woff"),
    font("Inter-Regular.woff"),
    font("JetBrainsMono-Medium.woff"),
  ]);
  const home = href === "/";
  const item = navItem(href);
  const index = Number(item.n);
  const color = home ? C.accent : index % 2 ? C.gql : C.accent;
  const title = home ? HOME_TITLE : (artifact ?? item.label);
  const blurb = home ? HOME_BLURB : artifact ? "What you write → what ships: the artifact relay-compiler emits" : item.blurb;
  const titleSize = artifact
    ? title.length > 22
      ? 66
      : 80
    : title.length > 40
      ? 66
      : title.length > 20
        ? 84
        : 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.bg,
          backgroundImage: `radial-gradient(circle at 95% 0%, ${color}24, transparent 42%)`,
          color: C.ink,
          padding: "54px 60px 44px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "JetBrains Mono", fontSize: 24 }}>
          <div style={{ width: 4, height: 26, borderRadius: 2, background: color }} />
          <span style={{ color }}>{item.n}</span>
          <span style={{ color: C.muted }}>
            {home ? "graphql + relay, visualized" : artifact ? `${item.group.toLowerCase()} · ${item.label.toLowerCase()}` : item.group.toLowerCase()}
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            fontWeight: 600,
            fontFamily: artifact ? "JetBrains Mono" : "Inter",
            fontSize: titleSize,
            lineHeight: 1.08,
            letterSpacing: artifact ? -1.5 : titleSize > 90 ? -4 : -2.5,
            maxWidth: 1080,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 18, fontSize: 31, lineHeight: 1.35, color: C.muted, maxWidth: 1000 }}>{blurb}</div>

        <div style={{ flex: 1 }} />
        <StoreGraph index={index} color={color} />
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono",
            fontSize: 21,
            color: C.faint,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: C.ink }}>
            <Mark size={36} />
            <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24 }}>{SITE_NAME}</span>
          </div>
          <span>graphql-relay-visualize.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: semi, weight: 600, style: "normal" },
        { name: "Inter", data: sans, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
