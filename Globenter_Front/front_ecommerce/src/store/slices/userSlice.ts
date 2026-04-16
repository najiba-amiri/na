

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // your Axios instance with token interceptor

// ===============================
// 🔹 Types
// ===============================

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
    twitter?: string;
}

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    phone?: string;
    profile_image?: string | null;
    profile_image_url?: string | null;
    social_links?: SocialLinks;
    joined_date?: string;
    addresses?: any[];
}

export interface UserState {
    users: User[];
    profile: User | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

// ===============================
// 🔹 Initial State
// ===============================

const initialState: UserState = {
    users: [],
    profile: null,
    loading: false,
    error: null,
    success: null,
};

// ===============================
// 🔹 Async Thunks
// ===============================

// Fetch all users
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/accounts/users/");
            return res.data as User[];
        } catch (err: any) {
            console.error("Fetch Users Error:", err.response?.data || err.message);
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch users");
        }
    }
);

// Create user
export const createUser = createAsyncThunk<User, FormData, { rejectValue: string }>(
    "users/create",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post("/accounts/users/create/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data as User;
        } catch (err: any) {
            // 🔹 Improved error handling
            console.error("Create User Error:", err?.response?.data || err?.message || err);

            // Try to find first meaningful error
            const message =
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) || // fallback to full data
                err.message ||
                "Failed to create user";

            return rejectWithValue(message);
        }
    }
);


// Update user
export const updateUser = createAsyncThunk<
    User,
    { id: number; formData: FormData },
    { rejectValue: string }
>("users/update", async ({ id, formData }, { rejectWithValue }) => {
    try {
        const res = await api.put(`/accounts/users/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data as User;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to update user");
    }
});

// Delete user
export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
    "users/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/accounts/users/${id}/`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || "Failed to delete user");
        }
    }
);

// Fetch profile
export const fetchProfile = createAsyncThunk<User, void, { rejectValue: string }>(
    "users/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/accounts/profile/");
            return res.data as User;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch profile");
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk<User, FormData, { rejectValue: string }>(
    "users/updateProfile",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.put("/accounts/profile/update/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data as User;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || "Failed to update profile");
        }
    }
);

// ===============================
// 🔹 Slice
// ===============================

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error fetching users";
            })

            // Create User
            .addCase(createUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.users.push(action.payload);
                state.success = "User created successfully!";
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error creating user";
            })

            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.users = state.users.map((u) => (u.id === action.payload.id ? action.payload : u));
                state.success = "User updated successfully!";
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error updating user";
            })

            // Delete User
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.success = "User deleted successfully!";
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload || "Error deleting user";
            })

            // Fetch Profile
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.error = action.payload || "Error fetching profile";
            })

            // Update Profile
            .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.profile = action.payload;
                state.success = "Profile updated successfully!";
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.error = action.payload || "Error updating profile";
            });
    },
});

export const { clearStatus } = userSlice.actions;
export default userSlice.reducer;
