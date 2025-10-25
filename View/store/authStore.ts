// View/store/authStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import {
  signIn,
  signUp,
  refreshToken as apiRefreshToken,
  getMe,
} from "@/service/api/auth";
import type { User } from "@/service/api/types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // actions
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    nickname: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

export const authStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  /**
   * 앱 부팅: 토큰 복구 → /me 조회 (만료면 refresh 시도)
   * - 요청 인터셉터 호환을 위해 accessToken을 AsyncStorage("token")에도 동기화
   */
  bootstrap: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedAccess = await SecureStore.getItemAsync("accessToken");
      const storedRefresh = await SecureStore.getItemAsync("refreshToken");

      if (storedAccess) {
        await AsyncStorage.setItem("token", storedAccess);
        set({ accessToken: storedAccess, refreshToken: storedRefresh ?? null });

        try {
          const me = await getMe();
          set({ user: me });
        } catch {
          // access 만료 → refresh 시도
          if (storedRefresh) {
            const ok = await get().refresh();
            if (ok) {
              const me = await getMe();
              set({ user: me });
            }
          }
        }
        return;
      }

      // 레거시 호환: 예전에 AsyncStorage("token")만 쓰던 토큰 복구
      const legacy = await AsyncStorage.getItem("token");
      if (legacy) {
        await SecureStore.setItemAsync("accessToken", legacy);
        set({ accessToken: legacy, refreshToken: null });
        try {
          const me = await getMe();
          set({ user: me });
        } catch {
          await AsyncStorage.removeItem("token");
          await SecureStore.deleteItemAsync("accessToken");
          set({ accessToken: null });
        }
      }
    } catch (e: any) {
      set({ error: e?.message ?? "초기화 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 로그인: 토큰 저장(SecureStore + AsyncStorage("token")) 후 상태 세팅
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await signIn(email, password); // { accessToken, refreshToken, user }

      await SecureStore.setItemAsync("accessToken", res.accessToken);
      await SecureStore.setItemAsync("refreshToken", res.refreshToken);
      await AsyncStorage.setItem("token", res.accessToken);

      set({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({ error: e?.message ?? "로그인 실패", isLoading: false });
      return false;
    }
  },

  /**
   * 회원가입: 백엔드 정책(토큰 有/無) 모두 처리
   * - signUp 응답은 { user } 또는 { user, accessToken, refreshToken } 둘 중 하나라고 가정
   */
  register: async (email, password, nickname) => {
    set({ isLoading: true, error: null });
    try {
      const res = await signUp(email, password, nickname); // SignUpRes

      // 토큰을 함께 주는 경우 → 즉시 로그인 상태
      if ("accessToken" in res && "refreshToken" in res) {
        await SecureStore.setItemAsync("accessToken", res.accessToken);
        await SecureStore.setItemAsync("refreshToken", res.refreshToken);
        await AsyncStorage.setItem("token", res.accessToken);

        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isLoading: false,
        });
        return true;
      }

      // 토큰이 없는 경우 → user만 세팅(화면에서 로그인/온보딩으로 분기)
      set({ user: res.user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e?.message ?? "회원가입 실패", isLoading: false });
      return false;
    }
  },

  /**
   * 로그아웃: 저장소 정리 후 상태 초기화
   */
  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await AsyncStorage.removeItem("token");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  /**
   * 토큰 리프레시: 새 accessToken 저장 + 상태 갱신
   */
  refresh: async () => {
    try {
      const rt = get().refreshToken;
      if (!rt) return false;

      const res = await apiRefreshToken(rt); // { accessToken }
      await SecureStore.setItemAsync("accessToken", res.accessToken);
      await AsyncStorage.setItem("token", res.accessToken);
      set({ accessToken: res.accessToken });
      return true;
    } catch {
      await get().logout();
      return false;
    }
  },
}));
