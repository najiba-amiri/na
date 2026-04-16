import axios from "axios";


const baseURL = process.env.NEXT_PUBLIC_API_URL ; 

const publicApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      const status = error.response?.status;
      const url: string = error.config?.url || "";
      const isAuthFlowEndpoint =
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/pre-register") ||
        url.includes("/api/auth/register") ||
        url.includes("/api/auth/forgot-password") ||
        url.includes("/api/auth/password-reset") ||
        url.includes("/api/auth/reset-password") ||
        url.includes("/api/auth/password-reset-confirm") ||
        url.includes("/api/auth/set-password") ||
        url.includes("/api/auth/verify-email") ||
        url.includes("/api/auth/resend-verification") ||
        url.includes("/auth/login") ||
        url.includes("/auth/pre-register") ||
        url.includes("/auth/register") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/password-reset") ||
        url.includes("/auth/reset-password") ||
        url.includes("/auth/password-reset-confirm") ||
        url.includes("/auth/set-password") ||
        url.includes("/auth/verify-email") ||
        url.includes("/auth/resend-verification");
      const isExpectedAuthValidationError =
        isAuthFlowEndpoint && (status === 400 || status === 404);
      const isAuthServerError = isAuthFlowEndpoint && typeof status === "number" && status >= 500;

      if (status !== 401 && !isExpectedAuthValidationError && !isAuthServerError) {
        console.error("Public API Error:", status, error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);

export default publicApi;
