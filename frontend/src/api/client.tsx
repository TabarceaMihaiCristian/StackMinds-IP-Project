const API_BASE_URL =
  // For Vite; adjust if you use CRA
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

function getToken(): string | null {
  return window.localStorage.getItem("authToken");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  { auth = true }: { auth?: boolean } = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = res.statusText;

    try {
      const data = await res.json();
      if (data && typeof (data as any).detail === "string") {
        message = (data as any).detail;
      }
    } catch {
      // ignore JSON parse error
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function loginApi(
  email: string,
  password: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }
  return res.json();
}
