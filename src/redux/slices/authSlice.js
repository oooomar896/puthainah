import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

const getInitialState = () => {
  const initialState = {
    token: null,
    refreshToken: null,
    role: null,
    userId: null,
  };

  // التحقق من أننا في بيئة المتصفح (client-side)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.role && parsed.userId && parsed.refreshToken) {
          initialState.token = parsed.token;
          initialState.refreshToken = parsed.refreshToken;
          initialState.role = parsed.role;
          initialState.userId = parsed.userId;
        }
      }
    } catch {
      // تجاهل خطأ parsing localStorage
    }
  }

  return initialState;
};

// Async thunk لتسجيل الخروج من Supabase ثم مسح Redux state
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      if (supabase && supabase.auth && typeof supabase.auth.signOut === "function") {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch {
      // ignore
    }
    
    // مسح Redux state
    dispatch(logout());
    
    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      
      // حفظ في localStorage فقط في client-side
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            token: state.token,
            refreshToken: state.refreshToken,
            role: state.role,
            userId: state.userId,
          })
        );
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.userId = null;

      // حذف من localStorage فقط في client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem("auth");
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
