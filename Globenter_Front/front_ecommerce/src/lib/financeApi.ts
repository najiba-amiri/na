import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is missing");
}

const API_ROOT = API_BASE.replace(/\/api\/?$/, "");

export const financeApi = axios.create({
  baseURL: API_ROOT, // https://globenter.com
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

financeApi.interceptors.request.use((config) => {
  const token = Cookies.get("access");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as any;
  }
  return config;
});
