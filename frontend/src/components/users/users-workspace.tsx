"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { ChevronDown, ChevronLeft, ChevronRight, Eye, Filter, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, getErrorMessage, getUsers, updateUser } from "@/lib/api";
import type { CreateUserInput, Gender, SortField, SortOrder, User } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";

const pageSizes = [10, 20, 50, 100];

export function UsersWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [notice, setNotice] = useState("");

  const query = useMemo(() => ({
    name: searchParams.get("name") || undefined,
    age: searchParams.get("age") ? Number(searchParams.get("age")) : undefined,
    ageFrom: searchParams.get("ageFrom") ? Number(searchParams.get("ageFrom")) : undefined,
    ageTo: searchParams.get("ageTo") ? Number(searchParams.get("ageTo")) : undefined,
    gender: (searchParams.get("gender") as Gender | null) || undefined,
    page: Number(searchParams.get("page") || "1"),
    limit: Number(searchParams.get("limit") || "20"),
    sortBy: (searchParams.get("sortBy") as SortField | null) || undefined,
    order: (searchParams.get("order") as SortOrder | null) || "asc",
  }), [searchParams]);

  const loadUsers = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true); setError("");
    try {
      const response = await getUsers(query, controller.signal);
      setUsers(response.data); setPagination(response.pagination);
    } catch (value) {
      if (!(value instanceof DOMException && value.name === "AbortError")) setError(getErrorMessage(value));
    } finally { setLoading(false); }
    return () => controller.abort();
  }, [query]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 3500); return () => window.clearTimeout(timer); }, [notice]);

  function updateQuery(changes: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.push(`/users?${params.toString()}`);
  }

  function resetFilters() { router.push("/users"); }

  async function saveUser(input: CreateUserInput) {
    if (editing) { await updateUser(editing._id, input); setNotice("User updated successfully."); }
    else { await createUser(input); setNotice("User created successfully."); }
    setFormOpen(false); setEditing(null); await loadUsers();
  }

  async function removeUser() {
    if (!deleting) return;
    await deleteUser(deleting._id);
    setDeleting(null); setNotice("User deleted successfully.");
    const nextPage = users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
    updateQuery({ page: String(nextPage) });
  }

  const hasFilters = Boolean(query.name || query.age || query.ageFrom || query.ageTo || query.gender);
  const currentSort = query.sortBy;
  const currentOrder = query.order;

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-semibold text-[#3157d5]">Directory</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#172033] md:text-4xl">Users</h1><p className="mt-2 text-sm leading-6 text-[#68748a]">Search, review, and manage the people in your workspace.</p></div><button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3157d5] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#2444ad]"><Plus size={17} /> Add user</button></section>
    {notice && <div role="status" className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button></div>}
    <section className="rounded-2xl border border-[#e2e7ef] bg-white p-4 shadow-[0_1px_2px_rgba(23,32,51,0.03)] md:p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[#172033]"><SlidersHorizontal size={17} className="text-[#3157d5]" /> Filters</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <label className="relative block lg:col-span-2"><span className="sr-only">Search by name</span><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#8a94a6]" /><input defaultValue={query.name ?? ""} key={`name-${query.name ?? ""}`} onChange={(event) => { const value = event.target.value; window.clearTimeout((event.currentTarget as HTMLInputElement).dataset.timer ? Number((event.currentTarget as HTMLInputElement).dataset.timer) : undefined); const timer = window.setTimeout(() => updateQuery({ name: value || undefined, page: "1" }), 350); (event.currentTarget as HTMLInputElement).dataset.timer = String(timer); }} placeholder="Search by name" className="h-10 w-full rounded-xl border border-[#d9dfe8] pl-9 pr-3 text-sm outline-none focus:border-[#8096e8] focus:ring-2 focus:ring-[#e8edff]" /></label>
      <NumberInput label="Exact age" value={query.age} onChange={(value) => updateQuery({ age: value, page: "1" })} />
      <NumberInput label="Age from" value={query.ageFrom} onChange={(value) => updateQuery({ ageFrom: value, page: "1" })} />
      <NumberInput label="Age to" value={query.ageTo} onChange={(value) => updateQuery({ ageTo: value, page: "1" })} />
      <label><span className="sr-only">Gender</span><select value={query.gender ?? ""} onChange={(event) => updateQuery({ gender: event.target.value || undefined, page: "1" })} className="h-10 w-full rounded-xl border border-[#d9dfe8] bg-white px-3 text-sm text-[#354158] outline-none focus:border-[#8096e8] focus:ring-2 focus:ring-[#e8edff]"><option value="">All genders</option><option value="m">Male</option><option value="f">Female</option></select></label>
    </div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-[#68748a]"><Filter size={14} /> {hasFilters ? "Filters active" : "Showing all users"}</div>{hasFilters && <button type="button" onClick={resetFilters} className="text-xs font-semibold text-[#3157d5] hover:underline">Clear filters</button>}</div></section>
    <section className="overflow-hidden rounded-2xl border border-[#e2e7ef] bg-white shadow-[0_1px_2px_rgba(23,32,51,0.03)]"><div className="flex flex-col justify-between gap-3 border-b border-[#e2e7ef] px-4 py-4 sm:flex-row sm:items-center md:px-5"><div><h2 className="text-sm font-semibold text-[#172033]">User directory</h2><p className="mt-1 text-xs text-[#68748a]">{pagination.total.toLocaleString()} matching records</p></div><label className="flex items-center gap-2 text-xs text-[#68748a]"><span>Rows</span><select value={query.limit} onChange={(event) => updateQuery({ limit: event.target.value, page: "1" })} className="h-8 rounded-lg border border-[#d9dfe8] bg-white px-2 text-xs font-semibold text-[#354158] outline-none">{pageSizes.map((size) => <option key={size}>{size}</option>)}</select></label></div>
      {error ? <div className="flex flex-col items-center justify-center px-6 py-20 text-center"><p className="font-semibold text-[#172033]">Unable to load users</p><p className="mt-2 max-w-sm text-sm text-[#68748a]">{error}</p><button type="button" onClick={() => void loadUsers()} className="mt-5 rounded-xl bg-[#3157d5] px-4 py-2 text-sm font-semibold text-white">Try again</button></div> : loading ? <TableSkeleton /> : users.length === 0 ? <div className="flex flex-col items-center justify-center px-6 py-20 text-center"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2ff] text-[#3157d5]"><Search size={21} /></div><p className="mt-4 font-semibold text-[#172033]">No users match these filters.</p><p className="mt-2 text-sm text-[#68748a]">Try broadening your search or clearing a filter.</p>{hasFilters && <button type="button" onClick={resetFilters} className="mt-4 text-sm font-semibold text-[#3157d5]">Clear filters</button>}</div> : <><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-[#fafbfc] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a94a6]"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><SortableHeader label="Age" field="age" current={currentSort} order={currentOrder} onSort={(field, order) => updateQuery({ sortBy: field, order, page: "1" })} /><th className="px-5 py-3">Gender</th><th className="px-5 py-3">Location</th><SortableHeader label="Created" field="createdAt" current={currentSort} order={currentOrder} onSort={(field, order) => updateQuery({ sortBy: field, order, page: "1" })} /><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#edf0f5]">{users.map((user) => <UserRow key={user._id} user={user} onEdit={() => { setEditing(user); setFormOpen(true); }} onDelete={() => setDeleting(user)} />)}</tbody></table></div><PaginationBar page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onPage={(page) => updateQuery({ page: String(page) })} /></>}
    </section>
    <UserFormDialog open={formOpen} user={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveUser} />
    <ConfirmDialog open={Boolean(deleting)} title="Delete this user?" description={`You are about to permanently remove ${deleting?.firstName ?? "this user"} ${deleting?.lastName ?? ""}. This action cannot be undone.`} onClose={() => setDeleting(null)} onConfirm={removeUser} />
  </div>;
}

function NumberInput({ label, value, onChange }: { label: string; value?: number; onChange: (value?: string) => void }) { return <label><span className="sr-only">{label}</span><input type="number" min="18" max="100" value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)} placeholder={label} className="h-10 w-full rounded-xl border border-[#d9dfe8] px-3 text-sm outline-none placeholder:text-[#8a94a6] focus:border-[#8096e8] focus:ring-2 focus:ring-[#e8edff]" /></label>; }

function SortableHeader({ label, field, current, order, onSort }: { label: string; field: SortField; current?: SortField; order?: SortOrder; onSort: (field: SortField, order: SortOrder) => void }) { const active = current === field; return <th className="px-5 py-3"><button type="button" onClick={() => onSort(field, active && order === "asc" ? "desc" : "asc")} className="inline-flex items-center gap-1 hover:text-[#3157d5]">{label}<ChevronDown size={14} className={`transition ${active && order === "desc" ? "rotate-180 text-[#3157d5]" : active ? "text-[#3157d5]" : "opacity-40"}`} /></button></th>; }

function UserRow({ user, onEdit, onDelete }: { user: User; onEdit: () => void; onDelete: () => void }) { return <tr className="transition hover:bg-[#fafbfc]"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar user={user} /><div><p className="text-sm font-semibold text-[#172033]">{user.firstName} {user.lastName}</p><p className="mt-0.5 text-xs text-[#8a94a6]">ID {user._id.slice(-8)}</p></div></div></td><td className="px-5 py-4 text-sm text-[#526078]">{user.email}</td><td className="px-5 py-4 text-sm font-medium text-[#354158]">{user.age}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.gender === "m" ? "bg-blue-50 text-[#3157d5]" : "bg-rose-50 text-rose-600"}`}>{user.gender === "m" ? "Male" : "Female"}</span></td><td className="px-5 py-4 text-sm text-[#526078]">{[user.city, user.country].filter(Boolean).join(", ") || "—"}</td><td className="px-5 py-4 text-sm text-[#68748a]">{new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><a href={`/users/${user._id}`} aria-label={`View ${user.firstName} ${user.lastName}`} className="rounded-lg p-2 text-[#68748a] hover:bg-[#eef2ff] hover:text-[#3157d5]"><Eye size={16} /></a><button type="button" onClick={onEdit} aria-label={`Edit ${user.firstName} ${user.lastName}`} className="rounded-lg p-2 text-[#68748a] hover:bg-[#eef2ff] hover:text-[#3157d5]"><Pencil size={16} /></button><button type="button" onClick={onDelete} aria-label={`Delete ${user.firstName} ${user.lastName}`} className="rounded-lg p-2 text-[#68748a] hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></td></tr>; }

function Avatar({ user }: { user: User }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef2ff] text-xs font-bold text-[#3157d5]">{`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}</span>; }

function PaginationBar({ page, totalPages, total, limit, onPage }: { page: number; totalPages: number; total: number; limit: number; onPage: (page: number) => void }) { const start = total ? (page - 1) * limit + 1 : 0; const end = Math.min(page * limit, total); return <div className="flex flex-col justify-between gap-3 border-t border-[#e2e7ef] px-4 py-4 text-xs text-[#68748a] sm:flex-row sm:items-center md:px-5"><span>Showing <strong className="font-semibold text-[#354158]">{start}–{end}</strong> of <strong className="font-semibold text-[#354158]">{total.toLocaleString()}</strong></span><div className="flex items-center gap-1"><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-[#d9dfe8] bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /></button><span className="min-w-20 text-center font-semibold text-[#354158]">Page {page} of {Math.max(totalPages, 1)}</span><button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-[#d9dfe8] bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={15} /></button></div></div>; }

function TableSkeleton() { return <div className="space-y-4 p-5">{Array.from({ length: 7 }, (_, index) => <div key={index} className="flex items-center gap-4"><div className="skeleton h-9 w-9 rounded-xl" /><div className="skeleton h-4 flex-1 rounded" /><div className="skeleton hidden h-4 w-32 rounded sm:block" /><div className="skeleton h-4 w-12 rounded" /></div>)}</div>; }
