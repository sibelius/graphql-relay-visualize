"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { GraphQLTaggedNode, ReaderFragment } from "relay-runtime";
import clsx from "clsx";

export const FRAGMENT_COLORS: Record<string, string> = {
  ColocationDemoQuery: "#f26b00",
  PostCard_post: "#38bdf8",
  AuthorLine_user: "#34d399",
  LikeBar_post: "#fbbf24",
  CommentItem_comment: "#a78bfa",
  ViewerBar_user: "#fb7185",
};

export type Inspected = { name: string; component: string; fragment: ReaderFragment; fragmentRef: unknown; data: unknown };

// Hover target lives outside React state so hovering never re-renders the demo tree.
let inspected: Inspected | null = null;
const listeners = new Set<() => void>();
const inspect = (next: Inspected | null) => {
  inspected = next;
  listeners.forEach((l) => l());
};
export const useInspected = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => inspected,
    () => null,
  );

export const XRayContext = createContext(false);

/** The compiled `graphql` tag can arrive as an ES module namespace; Relay unwraps `.default`, and so do we. */
export function unwrap<T>(node: T): T {
  return ((node as { default?: T }).default ?? node) as T;
}

/** Wraps a fragment component; in x-ray mode it outlines it and names its fragment. */
export function XRay({
  component,
  fragment,
  fragmentRef,
  data,
  children,
  className,
  inline = false,
}: {
  component: string;
  fragment: GraphQLTaggedNode;
  fragmentRef: unknown;
  data: unknown;
  children: ReactNode;
  className?: string;
  inline?: boolean;
}) {
  const on = useContext(XRayContext);
  const node = unwrap(fragment) as ReaderFragment;
  const color = FRAGMENT_COLORS[node.name] ?? "#8a93a8";
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      onMouseEnter={on ? () => inspect({ name: node.name, component, fragment: node, fragmentRef, data }) : undefined}
      onMouseLeave={on ? () => inspect(null) : undefined}
      className={clsx("relative transition-[outline-color,background-color] duration-200", inline && "inline-flex self-start", className)}
      style={
        on
          ? { outline: `1.5px dashed ${color}`, outlineOffset: 3, borderRadius: 8, background: `${color}0d` }
          : { outline: "1.5px dashed transparent", outlineOffset: 3 }
      }
    >
      {on && (
        <span
          className={clsx(
            "pointer-events-none absolute z-10 rounded px-1 font-mono text-[9.5px] leading-4 whitespace-nowrap text-black",
            inline ? "top-1/2 left-full ml-2 -translate-y-1/2" : "-top-2.5 right-2",
          )}
          style={{ background: color }}
        >
          {node.name}
        </span>
      )}
      {children}
    </Tag>
  );
}

type Sel = { kind: string; name?: string; alias?: string | null; selections?: readonly Sel[] };

/** Flattens a compiled ReaderFragment's selections into a readable outline. */
export function selectionOutline(selections: readonly Sel[], depth = 0): { depth: number; text: string; spread?: string }[] {
  const out: { depth: number; text: string; spread?: string }[] = [];
  for (const s of selections) {
    if (s.kind === "ScalarField") out.push({ depth, text: s.alias ?? s.name ?? "" });
    else if (s.kind === "FragmentSpread") out.push({ depth, text: `...${s.name}`, spread: s.name });
    else if (s.kind === "LinkedField") {
      out.push({ depth, text: `${s.alias ?? s.name} {` });
      out.push(...selectionOutline(s.selections ?? [], depth + 1));
      out.push({ depth, text: "}" });
    } else if (s.selections) out.push(...selectionOutline(s.selections, depth));
  }
  return out;
}

/** Replace Relay's internal fragment-owner objects with a short placeholder for display. */
export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 8) return "…";
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "__fragmentOwner") out[k] = "‹request descriptor›";
      else if (k === "__fragments") out[k] = Object.fromEntries(Object.keys(v as object).map((f) => [f, "{…}"]));
      else out[k] = sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}
