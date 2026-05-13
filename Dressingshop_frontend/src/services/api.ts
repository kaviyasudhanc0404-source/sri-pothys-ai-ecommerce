import { safeStorage } from "@/lib/storage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new Error("Network request failed. Please check your connection.");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    const message = payload?.error || payload?.message || "Request failed";

    const isTokenError =
      (response.status === 401 || response.status === 403) &&
      !!token &&
      typeof message === "string" &&
      (message === "Invalid or expired token" || message === "Access token required");

    if (isTokenError) {
      safeStorage.remove("authToken");
      safeStorage.remove("authUser");
      window.dispatchEvent(new Event("auth:logout"));
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json().catch(() => undefined as T);
}

export { apiRequest };
