"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-panel/60 px-3 py-5 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
        <Logo />
        <div className="leading-tight">
          <div className="text-sm font-semibold">Relay, visualized</div>
          <div className="text-xs text-muted">GraphQL · Relay 21 · Next 16</div>
        </div>
      </Link>
      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          const heading = i === 0 || NAV[i - 1].group !== item.group ? item.group : null;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              {heading && i > 0 && (
                <div className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-faint uppercase">{heading}</div>
              )}
            <Link
              href={item.href}
              className={clsx(
                "group flex gap-3 rounded-lg px-2 py-1.5 transition-colors",
                active ? "bg-panel-2 text-ink" : "text-muted hover:bg-panel-2/60 hover:text-ink",
              )}
            >
              <span className={clsx("mt-0.5 font-mono text-[11px]", active ? "text-accent" : "text-faint")}>{item.n}</span>
              <span className="leading-tight">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-faint group-hover:text-muted">{item.blurb}</span>
              </span>
            </Link>
            </div>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 px-2 text-xs leading-relaxed text-faint">
        Every panel is fed by Relay&apos;s own <code className="font-mono text-muted">log</code> events and the real
        store. Open the devtools drawer at the bottom to watch them live.
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 lg:hidden">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "shrink-0 rounded-md px-2.5 py-1 text-xs",
            (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? "bg-panel-2 text-ink" : "text-muted",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#171b24" />
      <circle cx="9" cy="10" r="3.2" fill="#f26b00" />
      <circle cx="23" cy="10" r="3.2" fill="#e535ab" />
      <circle cx="16" cy="23" r="3.2" fill="#38bdf8" />
      <path d="M9 10 L23 10 L16 23 Z" fill="none" stroke="#e7e9f0" strokeOpacity=".5" strokeWidth="1.2" />
    </svg>
  );
}
