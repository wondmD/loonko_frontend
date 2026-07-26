import type { ApiErrorShape } from "@/types";
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/token";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

const AUTH_PUBLIC_PATHS = ["/login", "/register"];

function isAuthPublicPath(pathname: string) {
  return AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function clearClientSession() {
  clearTokens();
  // Lazy import avoids circular deps with auth-store ↔ api client
  void import("@/stores/auth-store").then(({ useAuthStore }) => {
    useAuthStore.getState().logout();
  });
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

function stripJsonContentTypeForFormData(config: InternalAxiosRequestConfig) {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Default JSON Content-Type breaks multipart uploads (photos never reach Django).
    const headers = config.headers;
    if (headers && typeof headers.delete === "function") {
      headers.delete("Content-Type");
      headers.delete("content-type");
    } else if (headers) {
      delete (headers as Record<string, unknown>)["Content-Type"];
      delete (headers as Record<string, unknown>)["content-type"];
    }
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh });
    const access = data.access as string;
    const nextRefresh = (data.refresh as string | undefined) || refresh;
    setTokens(access, nextRefresh);
    return access;
  } catch {
    clearTokens();
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  stripJsonContentTypeForFormData(config);
  // JSON bodies only — never force this on FormData
  if (
    config.data &&
    !(typeof FormData !== "undefined" && config.data instanceof FormData) &&
    typeof config.data === "object" &&
    !config.headers.get?.("Content-Type")
  ) {
    config.headers.set("Content-Type", "application/json");
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    const requestUrl = original?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login/") ||
      requestUrl.includes("/auth/register/") ||
      requestUrl.includes("/auth/token/refresh/");

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const access = await refreshPromise;
      if (access) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${access}`;
        return apiClient(original);
      }
      clearClientSession();
      if (
        typeof window !== "undefined" &&
        !isAuthPublicPath(window.location.pathname)
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(normalizeApiError(error));
  },
);

export function normalizeApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const fieldErrors: Record<string, string[]> = {};
    let message = error.message || "Something went wrong";

    if (data) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.non_field_errors)) {
        message = String(data.non_field_errors[0]);
      }
      for (const [key, value] of Object.entries(data)) {
        if (key === "detail" || key === "non_field_errors") continue;
        if (Array.isArray(value)) fieldErrors[key] = value.map(String);
        else if (typeof value === "string") fieldErrors[key] = [value];
      }
      if (Object.keys(fieldErrors).length && !data.detail) {
        const first = Object.values(fieldErrors)[0]?.[0];
        if (first) message = first;
      }
    }

    return { message, fieldErrors, status: error.response?.status };
  }

  if (error && typeof error === "object" && "message" in error) {
    return error as ApiErrorShape;
  }

  return { message: "Unexpected error", fieldErrors: {} };
}
