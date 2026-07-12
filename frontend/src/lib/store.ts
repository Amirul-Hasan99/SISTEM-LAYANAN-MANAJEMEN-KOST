import { create } from "zustand";
import type { AppPage, UserSession } from "@/types";

interface AppState {
  // State
  currentPage: AppPage;
  user: UserSession | null;
  isLoading: boolean;
  sidebarOpen: boolean;

  // Actions
  setCurrentPage: (page: AppPage) => void;
  setUser: (user: UserSession | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const INITIAL_STATE = {
  currentPage: "landing" as AppPage,
  user: null,
  isLoading: true,
  sidebarOpen: true,
};

export const useAppStore = create<AppState>((set) => ({
  ...INITIAL_STATE,

  setCurrentPage: (page) => set({ currentPage: page }),
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  logout: () => set({ user: null, currentPage: "landing" }),
}));