// View/store/authStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

// 🔹 실제 API 연동은 잠깐 비활성화 (백엔드 붙일 때 다시 사용)
// import {
//   signIn,
//   signUp,
//   refreshToken as apiRefreshToken,
//   getMe,
// } from "@/service/api/auth";
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
   * 👟 부팅 시 동작 (목 버전)
   * - 지금은 저장된 토큰/유저 없이 항상 "로그아웃 상태"에서 시작
   * - 나중에 실제 토큰 복구 로직이 필요하면, 아래에 원래 bootstrap 구현 다시 넣으면 됨.
   */
  bootstrap: async () => {
    set({ isLoading: true, error: null });
    try {
      // 목 모드에서는 별거 안 하고 바로 끝
      set({ user: null, accessToken: null, refreshToken: null });
    } catch (e: any) {
      set({ error: e?.message ?? "초기화 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 👤 로그인 (목 버전)
   * - 백엔드 호출 없이, 입력한 email 기반으로 가짜 유저/토큰 세팅
   * - Http 어댑터에서 쓰는 AsyncStorage("token")도 같이 저장
   */
  login: async (email, _password) => {
    set({ isLoading: true, error: null });
    try {
      const fakeAccessToken = "dev-access-token";
      const fakeUser = {
        id: "dev-user",
        email,
        // User 타입 필드가 정확히 뭔지 몰라서 최소 필드만 넣고 캐스팅
        nickname: email.split("@")[0] ?? "User",
      } as unknown as User;

      await SecureStore.setItemAsync("accessToken", fakeAccessToken);
      await AsyncStorage.setItem("token", fakeAccessToken);

      set({
        user: fakeUser,
        accessToken: fakeAccessToken,
        refreshToken: null,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({ error: e?.message ?? "로그인 실패", isLoading: false });
      return false;
    }
  },

  /**
   * 📝 회원가입 (목 버전)
   * - 실제 서버에 유저를 만들지 않고, 바로 로그인된 상태로 전환
   */
  register: async (email, _password, nickname) => {
    set({ isLoading: true, error: null });
    try {
      const fakeAccessToken = "dev-access-token";
      const fakeUser = {
        id: "dev-user",
        email,
        nickname,
      } as unknown as User;

      await SecureStore.setItemAsync("accessToken", fakeAccessToken);
      await AsyncStorage.setItem("token", fakeAccessToken);

      set({
        user: fakeUser,
        accessToken: fakeAccessToken,
        refreshToken: null,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({ error: e?.message ?? "회원가입 실패", isLoading: false });
      return false;
    }
  },

  /**
   * 🚪 로그아웃: 저장소 정리 후 상태 초기화
   */
  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await AsyncStorage.removeItem("token");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  /**
   * 🔄 토큰 리프레시 (목 버전)
   * - 목 모드에서는 따로 갱신할 토큰이 없으므로 항상 true만 반환
   * - 나중에 실제 refresh 붙일 때 이 부분 교체
   */
  refresh: async () => {
    // mock 환경에서는 별도 동작 없음
    return true;
  },
}));
