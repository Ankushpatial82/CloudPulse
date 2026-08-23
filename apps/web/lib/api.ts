let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api";
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}
const API_URL = rawApiUrl;

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("cp_auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const safeEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const res = await fetch(`${API_URL}${safeEndpoint}`, {
      ...options,
      headers,
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`API error (Status: ${res.status}). Check if NEXT_PUBLIC_API_URL is correct in Vercel Environment Variables.`);
    }

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Network request error",
    };
  }
}
