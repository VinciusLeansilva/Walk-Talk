import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const result = body as {
      error?: { message?: string; code?: string };
    } | null;
    throw new ApiError(
      result?.error?.message || "Não foi possível concluir. Tente novamente.",
      response.status,
      result?.error?.code || "REQUEST_FAILED",
    );
  }
  return body as T;
}
export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setLoading(true);
    setError("");
    try {
      const result = await api<T>(path, { signal: active.signal });
      if (!active.signal.aborted) setData(result);
    } catch (cause) {
      if (!active.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar os dados.",
        );
    } finally {
      if (!active.signal.aborted) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setData(null);
    void reload();
    return () => controller.current?.abort();
  }, [reload]);
  return { data, loading, error, reload };
}
interface Notice {
  id: number;
  message: string;
  kind: "success" | "error";
}
export const useNotice = create<{ notice: Notice | null; dismiss: () => void }>(
  (set) => ({ notice: null, dismiss: () => set({ notice: null }) }),
);
export function notify(message: string, kind: "success" | "error" = "success") {
  useNotice.setState({ notice: { id: Date.now(), message, kind } });
}
export const roleLabel = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
};
export function formatDate(value: string | null, time = false) {
  if (!value) return "Não verificado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : { year: "numeric" }),
  }).format(date);
}
