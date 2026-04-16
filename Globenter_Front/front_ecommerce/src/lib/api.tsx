import axios from "axios";
import Cookies from "js-cookie";
import publicApi from "@/lib/publicApi";
import { authPath } from "@/lib/authApiPaths";


const baseURL = process.env.NEXT_PUBLIC_API_URL ; 


// Create Axios instance
const api = axios.create({
  baseURL,
  withCredentials: true, // Important if cookies are used
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = Cookies.get("refresh");
    if (!refresh) return null;

    try {
      const { data } = await publicApi.post(authPath("refresh"), { refresh });
      const normalized = data?.data && typeof data.data === "object" ? data.data : data;
      const nextAccess =
        normalized?.access ||
        normalized?.access_token ||
        normalized?.tokens?.access ||
        null;
      const nextRefresh =
        normalized?.refresh ||
        normalized?.refresh_token ||
        normalized?.tokens?.refresh ||
        null;

      if (!nextAccess) {
        Cookies.remove("access");
        Cookies.remove("refresh");
        delete api.defaults.headers.common["Authorization"];
        return null;
      }

      Cookies.set("access", nextAccess);
      api.defaults.headers.common["Authorization"] = `Bearer ${nextAccess}`;

      if (nextRefresh) Cookies.set("refresh", nextRefresh);

      return nextAccess;
    } catch {
      Cookies.remove("access");
      Cookies.remove("refresh");
      delete api.defaults.headers.common["Authorization"];
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      } as any;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const isAuthEndpoint =
      typeof url === "string" &&
      (url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout"));

    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const nextAccess = await refreshAccessToken();

      if (nextAccess) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${nextAccess}`,
        };
        return api(originalRequest);
      }
    }

    if (process.env.NODE_ENV === "development") {
      // Avoid noisy expected auth failures for guest users in dev overlay.
      if (status !== 401) {
        console.error("API Error:", status, error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
