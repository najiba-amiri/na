import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

const PROFILE_ENDPOINT = "/accounts/profile/";

export interface Address {
  id?: number;
  address_line: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  is_primary: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface Profile {
  user_id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: string | null;
  phone: string | null;
  profile_image: string | null;
  profile_image_url: string | null;
  social_links: SocialLinks;
  joined_date: string | null;
  addresses: Address[];
}

type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  social_links?: SocialLinks;
  addresses?: Address[];
};

type UpdateProfileArgs = {
  data: UpdateProfilePayload | FormData;
  method?: "PATCH" | "PUT";
};

interface ProfileState {
  data: Profile | null;
  loading: boolean;
  hasFetched: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  hasFetched: false,
  error: null,
};

function extractErrorMessage(error: any): string {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof responseData?.detail === "string" && responseData.detail.trim()) {
    return responseData.detail;
  }
  if (responseData && typeof responseData === "object") {
    for (const value of Object.values(responseData)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return "Failed to process profile request";
}

function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    profile_image: toAbsoluteMediaUrl(profile.profile_image) || profile.profile_image,
    profile_image_url:
      toAbsoluteMediaUrl(profile.profile_image_url) ||
      toAbsoluteMediaUrl(profile.profile_image) ||
      profile.profile_image_url,
  };
}

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_force: boolean = false, thunkAPI) => {
    try {
      const response = await api.get(PROFILE_ENDPOINT);
      return normalizeProfile((response?.data?.data ?? response?.data) as Profile);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  },
  {
    condition: (force = false, { getState }) => {
      const accessToken = Cookies.get("access");
      if (!accessToken) return false;
      if (force) return true;
      const state = (getState() as { profile: ProfileState }).profile;
      return !(state.loading || state.hasFetched);
    },
  }
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async ({ data, method = "PATCH" }: UpdateProfileArgs, thunkAPI) => {
    try {
      const isMultipart = data instanceof FormData;
      const response = await api.request({
        url: PROFILE_ENDPOINT,
        method,
        data,
        headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return normalizeProfile((response?.data?.data ?? response?.data) as Profile);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.hasFetched = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.data = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
