import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api from "../../lib/api"; // Axios (with JWT)
import publicApi from "../../lib/publicApi"; // Axios (no JWT)
import { authPath } from "@/lib/authApiPaths";


interface User {
  first_name?: string;
  last_name?: string;
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  loading: boolean;
  verificationLoading: boolean;
  resendLoading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  user: null,
  access: Cookies.get("access") || null,
  refresh: Cookies.get("refresh") || null,
  loading: false,
  verificationLoading: false,
  resendLoading: false,
  error: null,
};

interface SocialLoginArgs {
  provider: "google" | "facebook";
  access_token: string;
}

const AUTH_ENDPOINTS = {
  login: authPath("login"),
  register: authPath("register"),
  preRegister: authPath("pre-register"),
  verifyEmail: authPath("verify-email"),
  resendVerification: authPath("resend-verification"),
  forgotPassword: authPath("forgot-password"),
  resetPassword: authPath("reset-password"),
  setPassword: authPath("set-password"),
  me: authPath("me"),
  logout: authPath("logout"),
};

async function postAuth(url: string, payload: Record<string, any>) {
  return publicApi.post(url, payload);
}

async function postAuthWithFallback(
  urls: string[],
  payload: Record<string, any>
) {
  let lastError: any;
  for (const url of urls) {
    try {
      return await postAuth(url, payload);
    } catch (err: any) {
      lastError = err;
      // Only continue to next URL for "not found" compatibility issues.
      if (err?.response?.status !== 404) throw err;
    }
  }
  throw lastError;
}


// ==========================
// LOGIN (email/password)
// ==========================
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      // Always authenticate with email + password only.
      Cookies.remove("access");
      Cookies.remove("refresh");
      delete api.defaults.headers.common["Authorization"];

      const { data } = await postAuth(AUTH_ENDPOINTS.login, {
        email: email.trim().toLowerCase(),
        password,
      });

      const normalized = data?.data && typeof data.data === "object" ? data.data : data;
      const access =
        normalized?.access ||
        normalized?.access_token ||
        normalized?.tokens?.access ||
        data?.access ||
        data?.access_token ||
        data?.tokens?.access ||
        null;
      const refresh =
        normalized?.refresh ||
        normalized?.refresh_token ||
        normalized?.tokens?.refresh ||
        data?.refresh ||
        data?.refresh_token ||
        data?.tokens?.refresh ||
        null;

      // Access token is required for authenticated profile APIs.
      if (!access) {
        return thunkAPI.rejectWithValue({
          code: "missing_access_token",
          message: "Login response did not include an access token",
        });
      }

      if (access) {
        Cookies.set("access", access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      } else {
        Cookies.remove("access");
        delete api.defaults.headers.common["Authorization"];
      }
      if (refresh) {
        Cookies.set("refresh", refresh);
      } else {
        Cookies.remove("refresh");
      }

      let userData = normalized?.user || data?.user || null;
      if (!userData) {
        try {
          userData = (await api.get(AUTH_ENDPOINTS.me)).data;
        } catch {
          try {
            userData = (await api.get("/accounts/profile/")).data;
          } catch {
            userData = { email: email.trim().toLowerCase() };
          }
        }
      }

      return { access, refresh, user: userData };
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Login failed",
      });
    }
  }
);

// ==========================
// REGISTER
// ==========================
export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      password,
      confirm_password,
    }: {
      email: string;
      password: string;
      confirm_password: string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.register, {
        email: email.trim().toLowerCase(),
        password,
        confirm_password,
      });
      return data;
    } catch (err: any) {
      // Compatibility retry for older backend schema.
      if (err?.response?.status === 400) {
        try {
          const { data } = await postAuth(AUTH_ENDPOINTS.register, {
            username: email.trim().split("@")[0],
            email: email.trim().toLowerCase(),
            password1: password,
            password2: confirm_password,
          });
          return data;
        } catch (fallbackErr: any) {
          return thunkAPI.rejectWithValue(
            fallbackErr.response?.data || "Registration failed"
          );
        }
      }
      return thunkAPI.rejectWithValue(err.response?.data || "Registration failed");
    }
  }
);

export const preRegister = createAsyncThunk(
  "auth/preRegister",
  async (
    { full_name, email }: { full_name: string; email: string },
    thunkAPI
  ) => {
    try {
      const { data } = await postAuthWithFallback(
        [AUTH_ENDPOINTS.preRegister],
        {
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
        }
      );
      return data;
    } catch (err: any) {
      // Compatibility retry for legacy pre-register payloads.
      if (err?.response?.status === 400) {
        try {
          const { data } = await postAuthWithFallback(
            [AUTH_ENDPOINTS.preRegister],
            {
              username: full_name.trim() || email.trim().split("@")[0],
              email: email.trim().toLowerCase(),
            }
          );
          return data;
        } catch (fallbackErr: any) {
          const fallbackData = fallbackErr.response?.data;
          if (fallbackData && typeof fallbackData === "object") {
            return thunkAPI.rejectWithValue({
              status: fallbackErr.response?.status,
              ...fallbackData,
            });
          }
          return thunkAPI.rejectWithValue({
            status: fallbackErr.response?.status,
            message: fallbackData || "Pre-registration failed",
          });
        }
      }

      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Pre-registration failed",
      });
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ token }: { token: string }, thunkAPI) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.verifyEmail, { token });
      return data;
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Email verification failed",
      });
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.resendVerification, {
        email,
      });
      return data;
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Resend verification failed",
      });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.forgotPassword, { email });
      return data;
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Forgot password request failed",
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      uid,
      token,
      password1,
      password2,
    }: { uid: string; token: string; password1: string; password2: string },
    thunkAPI
  ) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.resetPassword, {
        uid,
        token,
        password1,
        password2,
      });
      return data;
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Reset password failed",
      });
    }
  }
);

export const setPassword = createAsyncThunk(
  "auth/setPassword",
  async (
    {
      signup_token,
      password1,
      password2,
    }: { signup_token: string; password1: string; password2: string },
    thunkAPI
  ) => {
    try {
      const { data } = await postAuth(AUTH_ENDPOINTS.setPassword, {
        signup_token,
        password1,
        password2,
      });
      const access =
        data?.access ||
        data?.access_token ||
        data?.tokens?.access ||
        null;
      const refresh =
        data?.refresh ||
        data?.refresh_token ||
        data?.tokens?.refresh ||
        null;

      if (access) {
        Cookies.set("access", access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      }
      if (refresh) {
        Cookies.set("refresh", refresh);
      }

      let userData = data?.user || null;
      if (!userData && access) {
        try {
          userData = (await api.get(AUTH_ENDPOINTS.me)).data;
        } catch {
          // If user endpoint fails, keep flow successful and continue.
        }
      }

      return {
        ...data,
        access,
        refresh,
        user: userData,
      };
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === "object") {
        return thunkAPI.rejectWithValue({
          status: err.response?.status,
          ...responseData,
        });
      }
      return thunkAPI.rejectWithValue({
        status: err.response?.status,
        message: responseData || "Set password failed",
      });
    }
  }
);

// ==========================
// GET CURRENT LOGGED USER
// ==========================
export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const { data } = await api.get(AUTH_ENDPOINTS.me);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || "Failed to fetch user");
  }
});

// ==========================
// LOGOUT
// ==========================
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    const refresh = Cookies.get("refresh");
    if (refresh) await api.post(AUTH_ENDPOINTS.logout, { refresh });

    Cookies.remove("access");
    Cookies.remove("refresh");

    return true;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || "Logout failed");
  }
});

// ==========================
// SOCIAL LOGIN (Google/Facebook)
// ==========================

export const socialLogin = createAsyncThunk(
  "auth/socialLogin",
  async ({ provider, access_token }: SocialLoginArgs, thunkAPI) => {
    try {
      // Call backend social login endpoint
      const endpoint = `/accounts/${provider}/`;
      const { data } = await publicApi.post(endpoint, { access_token });

      // Ensure JWT tokens were returned
      if (!data?.access || !data?.refresh) {
        return thunkAPI.rejectWithValue("No tokens received from backend");
      }

      // Save tokens in cookies
      Cookies.set("access", data.access);
      Cookies.set("refresh", data.refresh);

      // Set JWT in default axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      // Fetch the current user profile
      const { data: userData } = await api.get("/accounts/profile/");

      // Return user + tokens + newUser flag
      return {
        access: data.access,
        refresh: data.refresh,
        user: userData,
        newUser: data.new_user || false, // ← important
      };
    } catch (err: any) {
      console.error("Social login error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data || "Social login failed"
      );
    }
  }
);

// ==========================
// SLICE
// ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      Cookies.remove("access");
      Cookies.remove("refresh");
      state.user = null;
      state.access = null;
      state.refresh = null;
      state.loading = false;
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ access?: string; refresh?: string; user?: User }>
    ) => {
      const { access, refresh, user } = action.payload;
      if (access) Cookies.set("access", access);
      if (refresh) Cookies.set("refresh", refresh);

      state.access = access ?? state.access;
      state.refresh = refresh ?? state.refresh;
      state.user = user ?? state.user;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.user = null;
        state.access = null;
        state.refresh = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.access = null;
        state.refresh = null;
      });

    // REGISTER
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // PRE-REGISTER
    builder
      .addCase(preRegister.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(preRegister.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(preRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // GET USER
    builder
      .addCase(getUser.pending, (state) => { state.loading = true; })
      .addCase(getUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(getUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // LOGOUT
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.access = null;
        state.refresh = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => { state.error = action.payload; });

    // SOCIAL LOGIN
    builder
      .addCase(socialLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(socialLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // VERIFY EMAIL
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.verificationLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.verificationLoading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.verificationLoading = false;
        state.error = action.payload;
      });

    // RESEND VERIFICATION
    builder
      .addCase(resendVerification.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = action.payload;
      });

    // SET PASSWORD
    builder
      .addCase(setPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.access = action.payload?.access || state.access;
        state.refresh = action.payload?.refresh || state.refresh;
        state.user = action.payload?.user || state.user;
      })
      .addCase(setPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // FORGOT PASSWORD
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // RESET PASSWORD
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
