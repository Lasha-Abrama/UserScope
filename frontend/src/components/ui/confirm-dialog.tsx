"use client";

import { LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ConfirmDialog({ open, title, description, onClose, onConfirm }: { open: boolean; title: string; description: string; onClose: () => void; onConfirm: () => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) { setError(""); dialog.showModal(); }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function confirm() {
    setLoading(true); setError("");
    try { await onConfirm(); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to delete this user."); }
    finally { setLoading(false); }
  }

  return <dialog ref={ref} onClose={onClose} onCancel={(event) => loading && event.preventDefault()} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#e2e7ef] bg-white p-0 text-[#172033] shadow-2xl">
    <div className="p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600"><Trash2 size={20} /></span><button type="button" onClick={onClose} disabled={loading} aria-label="Close dialog" className="rounded-lg p-2 text-[#68748a] hover:bg-[#f5f7fa]"><X size={18} /></button></div><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#68748a]">{description}</p>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}</div>
    <footer className="flex justify-end gap-3 border-t border-[#e2e7ef] bg-[#fafbfc] px-6 py-4"><button type="button" onClick={onClose} disabled={loading} className="h-10 rounded-xl border border-[#d9dfe8] bg-white px-4 text-sm font-semibold text-[#354158]">Cancel</button><button type="button" onClick={() => void confirm()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70">{loading && <LoaderCircle size={16} className="animate-spin" />}Delete user</button></footer>
  </dialog>;
}
