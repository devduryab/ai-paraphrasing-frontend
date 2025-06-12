import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface User {
  _id: string; // Backend uses _id, not id
  email: string;
  role: "student" | "faculty" | "super_admin";
  profile: {
    firstName: string;
    lastName: string;
  };
  isApproved?: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Helper functions for localStorage
const getTokenFromStorage = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const setTokenInStorage = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

const setUserInStorage = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isLoading: false,
  error: null,
  isAuthenticated: !!getTokenFromStorage(),
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store in localStorage
      setTokenInStorage(data.accessToken); // Backend returns accessToken
      setUserInStorage(data.user);

      return {
        user: data.user,
        token: data.accessToken, // Map accessToken to token
        refreshToken: data.refreshToken,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Async thunk for token verification
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Token verification failed");
      }

      // Update localStorage
      setUserInStorage(data.user);

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    // Clear localStorage
    clearStorage();
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearStorage();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearStorage();
    },
    // Add action to load auth from storage
    loadAuthFromStorage: (state) => {
      const token = getTokenFromStorage();
      const user = getUserFromStorage();

      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        clearStorage();
      })
      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        clearStorage();
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, resetAuth, logout, loadAuthFromStorage } =
  authSlice.actions;
export default authSlice.reducer;
