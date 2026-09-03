"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { Activity, ArrowRight, Mars, RefreshCw, UsersRound, Venus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { checkApiHealth, getUserStats } from "@/lib/api";

interface DashboardData { total: number; male: number; female: number; averageAge: number; healthy: boolean; }

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [stats, healthy] = await Promise.all([getUserStats(), checkApiHealth()]);
      setData({ total: stats.totalUsers, male: stats.maleUsers, female: stats.femaleUsers, averageAge: stats.averageAge, healthy });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const maleShare = data?.total ? (data.male / data.total) * 100 : 0;
  const femaleShare = data?.total ? (data.female / data.total) * 100 : 0;

  return <div className="space-y-7">
    <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><p className="text-sm font-semibold text-[#3157d5]">Workspace overview</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#172033] md:text-4xl">Your user data, in focus.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#68748a] md:text-base">Monitor the dataset, understand its shape, and move directly into day-to-day user management.</p></div>
      <Link href="/users" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3157d5] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2444ad] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3157d5]">Manage users <ArrowRight size={17} /></Link>
    </section>
    {error ? <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold text-red-900">Unable to load the dashboard</p><p className="mt-1 text-sm text-red-700">Check that the NestJS API is running, then try again.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800"><RefreshCw size={15} /> Retry</button></div> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="User statistics">
        <StatCard label="Total users" value={data?.total} icon={UsersRound} tone="blue" loading={loading} note="Across the full dataset" />
        <StatCard label="Male users" value={data?.male} icon={Mars} tone="slate" loading={loading} note={`${maleShare.toFixed(1)}% of all users`} />
        <StatCard label="Female users" value={data?.female} icon={Venus} tone="rose" loading={loading} note={`${femaleShare.toFixed(1)}% of all users`} />
        <StatCard label="Average age" value={data?.averageAge ? `${data.averageAge} yrs` : undefined} icon={Activity} tone="green" loading={loading} note="Across the full dataset" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[#e2e7ef] bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.03)] md:p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[#172033]">Gender distribution</p><p className="mt-1 text-sm text-[#68748a]">Live totals from filtered API queries</p></div><span className="rounded-full bg-[#f5f7fa] px-3 py-1 text-xs font-medium text-[#68748a]">Live dataset</span></div>
          <div className="mt-8 space-y-6"><DistributionBar label="Male" value={data?.male ?? 0} percent={maleShare} color="bg-[#3157d5]" loading={loading} /><DistributionBar label="Female" value={data?.female ?? 0} percent={femaleShare} color="bg-[#d86d89]" loading={loading} /></div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#172033] p-6 text-white shadow-[0_12px_30px_rgba(23,32,51,0.14)]"><div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#3157d5]/30 blur-2xl" /><p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Built for scale</p><h2 className="relative mt-4 text-2xl font-semibold tracking-[-0.03em]">150k records.<br />One calm workspace.</h2><p className="relative mt-4 text-sm leading-6 text-slate-300">Server-side filters, indexed age queries, pagination, and cache-aware mutations keep the interface responsive.</p><Link href="/users" className="relative mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-200">Explore the directory <ArrowRight size={16} /></Link></div>
      </section>
    </>}
  </div>;
}

function StatCard({ label, value, icon: Icon, tone, note, loading }: { label: string; value?: number | string; icon: typeof UsersRound; tone: "blue" | "slate" | "rose" | "green"; note: string; loading: boolean }) {
  const tones = { blue: "bg-blue-50 text-[#3157d5]", slate: "bg-slate-100 text-slate-700", rose: "bg-rose-50 text-rose-600", green: "bg-emerald-50 text-emerald-600" };
  return <article className="rounded-2xl border border-[#e2e7ef] bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.03)]"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></div><p className="mt-5 text-sm font-medium text-[#68748a]">{label}</p>{loading ? <div className="skeleton mt-2 h-9 w-28 rounded-lg" /> : <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#172033]">{typeof value === "number" ? value.toLocaleString() : value}</p>}<p className="mt-2 text-xs text-[#8a94a6]">{note}</p></article>;
}

function DistributionBar({ label, value, percent, color, loading }: { label: string; value: number; percent: number; color: string; loading: boolean }) {
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-[#354158]">{label}</span><span className="font-mono text-xs text-[#68748a]">{loading ? "—" : `${value.toLocaleString()} · ${percent.toFixed(1)}%`}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#edf0f5]"><div className={`h-full rounded-full transition-[width] duration-700 ${color}`} style={{ width: loading ? "0%" : `${percent}%` }} /></div></div>;
}
