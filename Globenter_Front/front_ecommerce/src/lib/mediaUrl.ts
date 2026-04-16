function getApiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      // ignore invalid env value
    }
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl) {
    try {
      return new URL(appUrl).origin;
    } catch {
      // ignore invalid env value
    }
  }
  return "";
}

export function toAbsoluteMediaUrl(input?: string | null): string | null {
  if (!input || typeof input !== "string") return null;
  const value = input.trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;

  const origin = getApiOrigin();
  if (!origin) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

