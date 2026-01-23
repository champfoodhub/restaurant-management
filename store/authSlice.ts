import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  loading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: true,
};

const AUTH_STORAGE_KEY = "@auth_user_data";

// Async thunks for storage operations
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async () => {
    const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (userData) {
      return JSON.parse(userData) as UserData;
    }
    return null;
  }
);

export const saveUserToStorage = createAsyncThunk(
  "auth/saveUserToStorage",
  async (user: UserData) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
);

export const clearUserFromStorage = createAsyncThunk(
  "auth/clearUserFromStorage",
  async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isLoggedIn = true;
        }
        state.loading = false;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveUserToStorage.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(clearUserFromStorage.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
      });
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

