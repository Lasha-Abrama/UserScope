"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { LoaderCircle, UserRoundPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CreateUserInput, Gender, User } from "@/lib/types";

interface UserFormDialogProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSubmit: (input: CreateUserInput) => Promise<void>;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  gender: Gender;
  phoneNumber: string;
  city: string;
  country: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  firstName: "", lastName: "", email: "", age: "", gender: "m",
  phoneNumber: "", city: "", country: "",
};

export function UserFormDialog({ open, user, onClose, onSubmit }: UserFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setForm(user ? {
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      age: String(user.age), gender: user.gender, phoneNumber: user.phoneNumber ?? "",
      city: user.city ?? "", country: user.country ?? "",
    } : emptyForm);
    setErrors({}); setSubmitError("");
  }, [open, user]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 18 || age > 100) next.age = "Age must be from 18 to 100.";
    if (!(["m", "f"] as const).includes(form.gender)) next.gender = "Select a gender.";
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setSubmitting(true); setSubmitError("");
    try {
      const optional = (value: string) => value.trim() || undefined;
      await onSubmit({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), age: Number(form.age), gender: form.gender,
        phoneNumber: optional(form.phoneNumber), city: optional(form.city), country: optional(form.country),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this user.");
    } finally { setSubmitting(false); }
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} onCancel={(event) => submitting && event.preventDefault()} className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-[#e2e7ef] bg-white p-0 text-[#172033] shadow-2xl">
      <form onSubmit={handleSubmit}>
        <header className="flex items-start justify-between border-b border-[#e2e7ef] px-5 py-5 sm:px-6">
          <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2ff] text-[#3157d5]"><UserRoundPlus size={19} /></span><div><h2 className="text-lg font-semibold tracking-[-0.02em]">{user ? "Edit user" : "Add a new user"}</h2><p className="mt-0.5 text-sm text-[#68748a]">{user ? "Update the selected account details." : "Create a new account in your directory."}</p></div></div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close dialog" className="rounded-lg p-2 text-[#68748a] hover:bg-[#f5f7fa] hover:text-[#172033]"><X size={18} /></button>
        </header>

        <div className="grid max-h-[65vh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">
          <Field label="First name" error={errors.firstName}><input autoFocus value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={inputClass(errors.firstName)} /></Field>
          <Field label="Last name" error={errors.lastName}><input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={inputClass(errors.lastName)} /></Field>
          <Field label="Email" error={errors.email} wide><input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass(errors.email)} /></Field>
          <Field label="Age" error={errors.age}><input type="number" min="18" max="100" value={form.age} onChange={(e) => updateField("age", e.target.value)} className={inputClass(errors.age)} /></Field>
          <Field label="Gender" error={errors.gender}><select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className={inputClass(errors.gender)}><option value="m">Male</option><option value="f">Female</option></select></Field>
          <Field label="Phone number" hint="Optional"><input value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} className={inputClass()} placeholder="+995 555 123 456" /></Field>
          <Field label="City" hint="Optional"><input value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass()} /></Field>
          <Field label="Country" hint="Optional" wide><input value={form.country} onChange={(e) => updateField("country", e.target.value)} className={inputClass()} /></Field>
          {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{submitError}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[#e2e7ef] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting} className="h-10 rounded-xl border border-[#d9dfe8] bg-white px-4 text-sm font-semibold text-[#354158] hover:bg-[#f5f7fa] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#3157d5] px-5 text-sm font-semibold text-white hover:bg-[#2444ad] disabled:cursor-wait disabled:opacity-70">{submitting && <LoaderCircle size={16} className="animate-spin" />}{user ? "Save changes" : "Create user"}</button>
        </footer>
      </form>
    </dialog>
  );
}

function Field({ label, hint, error, wide, children }: { label: string; hint?: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block ${wide ? "sm:col-span-2" : ""}`}><span className="mb-1.5 flex items-center justify-between text-sm font-medium text-[#354158]"><span>{label}</span>{hint && <span className="text-xs font-normal text-[#929bad]">{hint}</span>}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

function inputClass(error?: string) {
  return `h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-[#a1a9b8] focus:ring-2 ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#d9dfe8] focus:border-[#8096e8] focus:ring-[#e8edff]"}`;
}
