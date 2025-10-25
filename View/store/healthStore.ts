import { createStore, useStore } from "zustand";
import { Platform } from "react-native";
import { getTodaySteps } from "@/service/health/iosHealth";

type HealthState = {
  todaySteps: number;
  isLoading: boolean;
  error?: string;
};

type HealthActions = {
  refreshToday: () => Promise<void>;
  reset: () => void;
};

export const healthStore = createStore<HealthState & HealthActions>((set) => ({
  todaySteps: 0,
  isLoading: false,
  error: undefined,

  async refreshToday() {
    if (Platform.OS !== "ios") {
      // Android는 다음 스프린트(Google Fit/Health Connect)
      set({ todaySteps: 0, error: undefined });
      return;
    }
    set({ isLoading: true, error: undefined });
    try {
      const steps = await getTodaySteps();
      set({ todaySteps: steps });
    } catch (e: any) {
      set({ error: String(e), todaySteps: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  reset() {
    set({ todaySteps: 0, isLoading: false, error: undefined });
  },
}));

// 컴포넌트에서 간단히 사용하기 위한 훅
export const useHealth = () => useStore(healthStore);
