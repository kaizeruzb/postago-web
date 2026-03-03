const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }

  return res.json();
}
