const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
const hasApiInBase = /\/api\/?$/.test(apiBaseUrl);

// Canonical auth route should be /api/auth/*.
// If baseURL already ends with /api, use /auth/* to avoid /api/api/auth/*.
const AUTH_BASE = hasApiInBase ? "/auth" : "/api/auth";

export function authPath(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return `${AUTH_BASE}/${normalized}/`;
}

