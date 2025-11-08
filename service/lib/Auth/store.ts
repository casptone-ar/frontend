import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore, useStore } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { merge } from "es-toolkit";

/**
 * Auth 상태 인터페이스
 */
export interface AuthStoreState<T> {
  user: T | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Auth 스토어 액션 인터페이스
 */
export interface AuthStoreActions<T> {
  setUser: (user: T | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export type AuthStoreI<T> = AuthStoreState<T> & AuthStoreActions<T>;

const initialState: AuthStoreState<null> = {
  user: null,
  token: null,
  isAuthenticated: false,
};

/**
 * ✅ 정상 동작 버전
 */
export const createAuthStore = <T = FirebaseAuthTypes.User>() =>
  createStore<AuthStoreI<T>>()(
    devtools(
      persist(
        (set, get) => ({
          user: null,
          token: null,
          isAuthenticated: false,

          setUser: (_user: T | null) => set({ user: _user }),
          setToken: (_token: string | null) => set({ token: _token }),
          setIsAuthenticated: (_isAuthenticated: boolean) =>
            set({ isAuthenticated: _isAuthenticated }),

          reset: () => set({ ...initialState }),
        }),
        {
          name: "auth-store",
          storage: createJSONStorage(() => AsyncStorage),
          merge: (persistedState, currentState) =>
            merge(currentState as any, persistedState as any) as any,
        }
      )
    )
  );

export const AuthStore = createAuthStore();

export const useAuthStore = () => useStore(AuthStore);
