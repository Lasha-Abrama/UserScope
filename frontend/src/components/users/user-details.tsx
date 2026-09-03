"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { CalendarDays, Mail, MapPin, Phone, RefreshCw, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, getUser } from "@/lib/api";
import type { User } from "@/lib/types";

export function UserDetails({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setUser(await getUser(id)); } catch (value) { setError(getErrorMessage(value)); } finally { setLoading(false); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <div className="skeleton h-96 rounded-2xl" />;
  if (error || !user) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6"><p className="font-semibold text-red-900">Unable to load this user</p><p className="mt-2 text-sm text-red-700">{error || "User not found"}</p><button type="button" onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-red-800"><RefreshCw size={15} /> Retry</button></div>;
  const fields = [[Mail, "Email", user.email], [Phone, "Phone", user.phoneNumber || "Not provided"], [MapPin, "Location", [user.city, user.country].filter(Boolean).join(", ") || "Not provided"], [UserRound, "Gender", user.gender === "m" ? "Male" : "Female"]] as const;
  return <section className="max-w-3xl rounded-2xl border border-[#e2e7ef] bg-white shadow-[0_1px_2px_rgba(23,32,51,0.03)]"><div className="border-b border-[#e2e7ef] px-6 py-7"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef2ff] text-lg font-bold text-[#3157d5]">{`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}</span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3157d5]">User profile</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{user.firstName} {user.lastName}</h1><p className="mt-1 text-sm text-[#68748a]">Age {user.age}</p></div></div></div><div className="grid gap-4 p-6 sm:grid-cols-2">{fields.map(([Icon, label, value]) => <div key={label} className="rounded-xl bg-[#fafbfc] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a94a6]"><Icon size={15} />{label}</div><p className="mt-3 break-words text-sm font-medium text-[#354158]">{value}</p></div>)}</div><div className="flex flex-wrap gap-6 border-t border-[#e2e7ef] px-6 py-5 text-xs text-[#68748a]"><span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Created {new Date(user.createdAt).toLocaleString()}</span><span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Updated {new Date(user.updatedAt).toLocaleString()}</span></div></section>;
}
