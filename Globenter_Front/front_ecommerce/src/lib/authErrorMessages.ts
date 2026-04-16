type Translator = (key: string) => string;

interface AuthErrorMessagesArgs {
  err: any;
  tVerify: Translator;
  fallback: string;
}

export function getAuthErrorMessage({
  err,
  tVerify,
  fallback,
}: AuthErrorMessagesArgs): string {
  const status = err?.status;
  const code = err?.code;
  const message = err?.message;
  const detail = err?.detail;
  const raw = message || detail || code;

  if (status === 404) return "Authentication service endpoint is not available on backend yet.";
  if (status >= 500) return "Authentication service failed on backend. Please try again or contact support.";
  if (status === 429) return tVerify("waitBeforeResend");
  if (status === 410) return tVerify("expiredToken");
  if (status === 401 && (raw === "invalid_credentials" || raw === "invalid_login")) {
    return "Invalid email or password.";
  }

  if (raw === "email_not_verified") return tVerify("emailRequiredBeforeLogin");
  if (raw === "email_exists") return "An account with this email already exists. Please log in.";
  if (raw === "invalid_or_used_token") return tVerify("invalidToken");
  if (raw === "token_expired") return tVerify("expiredToken");
  if (raw === "already_verified") return tVerify("emailAlreadyVerified");
  if (raw === "invalid_refresh_token") return "Your session has expired. Please login again.";
  if (raw === "rate_limited") return "Too many attempts. Please wait and try again.";
  if (raw === "not_authenticated") return "Please login to continue.";
  if (raw === "validation_error") return "Please check the form fields and try again.";

  if (typeof raw === "string" && raw.trim().length > 0) return raw;

  if (err?.field_errors && typeof err.field_errors === "object") {
    for (const value of Object.values(err.field_errors)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  if (err && typeof err === "object") {
    for (const value of Object.values(err)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return fallback;
}
