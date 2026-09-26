"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { inspector, useInspector } from "@/relay/inspector";

export function PageHeader({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <header className="mb-8 max-w-3xl animate-rise">
      <div className="mb-2 font-mono text-xs text-accent">{n}</div>
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      <div className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">{children}</div>
    </header>
  );
}

export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={clsx("flex min-w-0 flex-col rounded-xl border border-line bg-panel", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{title}</h2>
          {right}
        </div>
      )}
      <div className={clsx("min-w-0 flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Takeaways({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-8 grid gap-3 md:grid-cols-3">
      {items.map((item, i) => (
        <li key={i} className="rounded-xl border border-line bg-panel/60 p-4 text-sm leading-relaxed text-muted">
          <span className="mb-2 block font-mono text-xs text-accent">why it matters</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2/60 px-3 py-2">
      <div className="text-[11px] tracking-wide text-faint uppercase">{label}</div>
      <div
        className={clsx(
          "mt-0.5 font-mono text-lg tabular-nums",
          tone === "good" && "text-ok",
          tone === "bad" && "text-bad",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-black/80"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/**
 * Counts React commits of the component it's placed in and flashes on each
 * one. Writes to the DOM directly so counting never causes a render itself.
 */
export function RenderBadge({ className }: { className?: string }) {
  const count = useRef(0);
  const el = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    count.current += 1;
    const node = el.current;
    if (!node) return;
    node.textContent = `renders ${count.current}`;
    const host = node.closest("[data-render-host]") as HTMLElement | null;
    for (const target of [node, host]) {
      if (!target || count.current === 1) continue;
      target.classList.remove("animate-flash");
      void target.offsetWidth;
      target.classList.add("animate-flash");
    }
  });
  return (
    <span
      ref={el}
      className={clsx(
        "rounded-full border border-line bg-bg px-1.5 py-px font-mono text-[10px] text-faint tabular-nums",
        className,
      )}
    />
  );
}

export function DemoControls({ showFail = false }: { showFail?: boolean }) {
  const settings = useInspector((s) => s.settings);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-line bg-panel px-4 py-3 text-sm">
      <label className="flex items-center gap-3">
        <span className="text-muted">Network latency</span>
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={settings.latency}
          onChange={(e) => inspector.setSettings({ latency: Number(e.target.value) })}
          className="w-40 accent-[var(--color-accent)]"
        />
        <span className="w-16 font-mono text-xs tabular-nums">{settings.latency} ms</span>
      </label>
      {showFail && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={settings.fail}
            onChange={(e) => inspector.setSettings({ fail: e.target.checked })}
            className="accent-[var(--color-bad)]"
          />
          <span className="text-muted">Make the server reject mutations</span>
        </label>
      )}
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "default",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "ghost";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-black hover:brightness-110",
        variant === "default" && "border border-line bg-panel-2 text-ink hover:border-faint",
        variant === "ghost" && "text-muted hover:bg-panel-2 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export { decodeId, formatBytes } from "@/lib/format";
