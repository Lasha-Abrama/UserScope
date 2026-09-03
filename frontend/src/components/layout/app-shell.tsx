"use client";

import { Database, ExternalLink, LayoutDashboard, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { API_URL } from "@/lib/api";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: UsersRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-[#e2e7ef] bg-[#172033] text-white lg:flex lg:min-h-screen lg:flex-col lg:px-5 lg:py-6">
        <Brand />
        <nav className="mt-10 space-y-1" aria-label="Primary navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/7 hover:text-white"}`}><Icon size={18} aria-hidden="true" />{label}</Link>;
          })}
          <a href={`${API_URL}/api/docs`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white"><ExternalLink size={18} aria-hidden="true" />API Docs</a>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/6 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Data layer</p>
          <p className="mt-2 text-sm font-medium text-white">MongoDB Atlas</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Indexed, cached, and ready for scale.</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e2e7ef] bg-white/90 px-4 backdrop-blur md:px-8 lg:px-10">
          <div className="lg:hidden"><Brand compact /></div>
          <nav className="flex items-center gap-1 lg:hidden" aria-label="Mobile navigation">
            {navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-label={label} className={`rounded-lg p-2 ${pathname === href || (href !== "/" && pathname.startsWith(href)) ? "bg-[#eef2ff] text-[#3157d5]" : "text-[#68748a]"}`}><Icon size={19} /></Link>)}
          </nav>
          <div className="ml-auto hidden items-center gap-2 text-sm text-[#68748a] lg:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />Admin workspace</div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 md:px-8 md:py-9 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2.5" aria-label="UserScope dashboard"><span className={`grid place-items-center rounded-xl bg-[#3157d5] text-white shadow-lg shadow-blue-950/20 ${compact ? "h-9 w-9" : "h-10 w-10"}`}><Database size={compact ? 18 : 20} strokeWidth={2.2} /></span><span className={`font-semibold tracking-[-0.03em] ${compact ? "text-lg text-[#172033]" : "text-xl text-white"}`}>UserScope</span></Link>;
}
