"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress/client-store";
import { SaveStatusBadge } from "@/components/SaveStatusBadge";
import { ConflictBanner } from "@/components/ConflictBanner";

const NAV = [
  { href: "/learn", label: "Dashboard", exact: true },
  { href: "/learn/course", label: "Course" },
  { href: "/learn/aids", label: "Aids" },
  { href: "/learn/resources", label: "Resources" },
  { href: "/learn/glossary", label: "Glossary" },
  { href: "/learn/project", label: "Project" },
  { href: "/learn/settings", label: "Settings" },
];

export function LearnShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch, state, flushNow } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync the browser timezone into settings once, if it differs.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz !== state.settings.timezone) {
        dispatch({ type: "setTimezone", timezone: tz });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function switchProfile() {
    await flushNow();
    await fetch("/api/profile", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-navy-600/15 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/learn" className="text-lg font-bold tracking-tight">
              Ascent
            </Link>
            <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200 sm:inline">
              {displayName}
            </span>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href, item.exact) ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm transition ${
                      isActive(item.href, item.exact)
                        ? "bg-white/15 font-semibold text-white"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <SaveStatusBadge />
            <button
              type="button"
              onClick={switchProfile}
              className="hidden rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10 sm:inline"
            >
              Switch
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md border border-white/20 p-2 md:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="currentColor">
                <path d="M3 5h14v2H3zM3 9h14v2H3zM3 13h14v2H3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="border-t border-white/10 bg-navy-700 md:hidden"
          >
            <ul className="mx-auto max-w-6xl px-2 py-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(item.href, item.exact) ? "page" : undefined}
                    className={`block rounded-md px-3 py-2.5 text-sm ${
                      isActive(item.href, item.exact)
                        ? "bg-white/15 font-semibold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={switchProfile}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10"
                >
                  Switch profile
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <ConflictBanner />

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
