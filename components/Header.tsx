"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuiz } from "./QuizProvider";

const nav = [
  { href: "/", label: "Dashboard", key: "d" },
  { href: "/history", label: "History", key: "h" },
  { href: "/bank", label: "Question Bank", key: "b" },
] as const;

function activeKey(path: string) {
  if (path.startsWith("/history")) return "h";
  if (path.startsWith("/bank")) return "b";
  return "d";
}

export function Header() {
  const path = usePathname();
  const { toggleTheme } = useQuiz();
  const cur = activeKey(path);

  return (
    <header className="sticky top-0 z-10 bg-[var(--hd)] text-[var(--hdt)] pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-2 px-3 py-2 sm:gap-1.5 sm:px-4">
        <span className="logo mr-auto flex min-w-0 items-center gap-2 font-[family-name:var(--font-barlow)] text-base font-bold tracking-wide sm:text-[22px] sm:tracking-widest">
          <svg className="shrink-0" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
          <span className="truncate">
            PPL<b className="text-[var(--ac)]">·</b>
            <span className="max-[380px]:hidden">QUESTION </span>BANK
          </span>
        </span>
        <nav
          aria-label="Main"
          className="order-3 flex w-full gap-0.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:order-none sm:w-auto sm:overflow-visible"
        >
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`shrink-0 rounded-md px-2.5 py-2 opacity-80 hover:bg-white/12 hover:opacity-100 sm:py-1.5 ${cur === n.key ? "bg-white/12 opacity-100" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="btn o min-h-11 shrink-0 rounded-lg border border-white/25 bg-transparent px-3 py-2 text-[var(--hdt)] sm:px-4 sm:py-2.5"
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
        >
          ◐
        </button>
      </div>
    </header>
  );
}
