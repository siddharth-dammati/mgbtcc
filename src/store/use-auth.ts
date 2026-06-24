import { create } from "zustand";
import { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  role: "Super Admin" | "Tournament Admin" | "Team Captain" | "Public Viewer" | null;
  loading: boolean;
  setUser: (user: User | null, role?: AuthState["role"]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user, role = null) => set({ user, role, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
