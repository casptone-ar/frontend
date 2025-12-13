import { createStore, useStore } from "zustand";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postSteps } from "@/service/api/steps";

type HealthState = {
  todaySteps: number;
  lastSyncedSteps: number; // 마지막으로 서버에 동기화된 누적 걸음 수
  isLoading: boolean;
  syncing: boolean;
  error?: string;
};

type HealthActions = {
  refreshToday: () => Promise<void>;
  syncSteps: () => Promise<void>;
  reset: () => void;
};

const SYNC_KEY = "health:lastSyncedSteps";

export const healthStore = createStore<HealthState & HealthActions>(
  (set, get) => ({
    todaySteps: 0,
    lastSyncedSteps: 0,
    isLoading: false,
    syncing: false,
    error: undefined,

    /** HealthKit에서 오늘 걸음 수 가져오기 */
    async refreshToday() {
      if (Platform.OS !== "ios") {
        set({ todaySteps: 0, error: undefined });
        return;
      }
      set({ isLoading: true, error: undefined });
      try {
        // const steps = await getTodaySteps();
        set({ todaySteps: 4421 });
      } catch (e: any) {
        set({ error: String(e), todaySteps: 0 });
      } finally {
        set({ isLoading: false });
      }
    },

    /** 서버로 “증분 걸음 수” 전송 (경험치 업데이트) */
    async syncSteps() {
      if (Platform.OS !== "ios") return;
      const { todaySteps, lastSyncedSteps } = get();
      const delta = Math.max(0, todaySteps - (lastSyncedSteps || 0));

      if (delta === 0) {
        console.log("✅ 걸음수 변경 없음 — 동기화 생략");
        return;
      }

      set({ syncing: true });
      try {
        const res = await postSteps(delta);
        console.log("✅ 서버 동기화 완료:", res);

        // 동기화 이력 저장
        await AsyncStorage.setItem(SYNC_KEY, String(todaySteps));
        set({
          lastSyncedSteps: todaySteps,
          syncing: false,
          error: undefined,
        });
      } catch (e: any) {
        console.error("❌ 걸음 수 전송 실패:", e);
        set({ syncing: false, error: String(e) });
      }
    },

    /** 상태 초기화 */
    reset() {
      set({
        todaySteps: 0,
        lastSyncedSteps: 0,
        isLoading: false,
        syncing: false,
        error: undefined,
      });
    },
  })
);

// 컴포넌트에서 간단히 사용하기 위한 훅
export const useHealth = () => useStore(healthStore);
