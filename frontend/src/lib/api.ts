import type { CreateUserInput, PaginatedUsersResponse, UpdateUserInput, User, UsersQuery } from "@/lib/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to reach the API. Check your connection and try again.";
}

interface ErrorPayload { message?: string | string[]; }

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const payload = (await response.json()) as ErrorPayload;
      if (Array.isArray(payload.message)) message = payload.message.join(" ");
      else if (payload.message) message = payload.message;
    } catch {
      // Keep the useful fallback when the API does not return JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getUsers(query: UsersQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return apiFetch<PaginatedUsersResponse>(`/users${search ? `?${search}` : ""}`, { signal });
}

export function getUser(id: string, signal?: AbortSignal) {
  return apiFetch<User>(`/users/${id}`, { signal });
}

export function createUser(input: CreateUserInput) {
  return apiFetch<User>("/users", { method: "POST", body: JSON.stringify(input) });
}

export function updateUser(id: string, input: UpdateUserInput) {
  return apiFetch<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}

export function getTotalUsers(signal?: AbortSignal) {
  return apiFetch<{ totalUsers: number }>("/total-users", { signal });
}

export function getUserStats(signal?: AbortSignal) {
  return apiFetch<{ totalUsers: number; maleUsers: number; femaleUsers: number; averageAge: number }>("/stats", { signal });
}

export async function checkApiHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(API_URL, { signal });
    return response.ok;
  } catch { return false; }
}
