import { createStore } from "zustand";
import {
  getMissions,
  updateMissionProgress,
  completeMission,
} from "@/service/api/missions";
import type { MissionPreview } from "@/service/api/types";

export type MissionState = {
  missions: MissionPreview[];
  isLoading: boolean;
  error?: string;
};

export type MissionActions = {
  fetchMissions: (scope?: "daily" | "weekly" | "all") => Promise<void>;
  updateProgress: (user_mission_id: number, progress: number) => Promise<void>;
  completeMission: (user_mission_id: number) => Promise<void>;
};

export type MissionStore = MissionState & MissionActions;

const initialState: MissionState = {
  missions: [],
  isLoading: false,
};

export const missionStore = createStore<MissionStore>((set, get) => ({
  ...initialState,

  fetchMissions: async (scope = "all") => {
    set({ isLoading: true, error: undefined });
    try {
      const res = await getMissions(scope);
      set({ missions: res.items });
    } catch (err: any) {
      set({ error: err?.message ?? "미션 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProgress: async (user_mission_id, progress) => {
    try {
      await updateMissionProgress(user_mission_id, progress);
      set({
        missions: get().missions.map((m) =>
          m.user_mission_id === user_mission_id ? { ...m, progress } : m
        ),
      });
    } catch (err: any) {
      console.error("updateProgress error", err);
    }
  },

  completeMission: async (user_mission_id) => {
    try {
      await completeMission(user_mission_id);
      set({
        missions: get().missions.map((m) =>
          m.user_mission_id === user_mission_id
            ? { ...m, is_completed: true }
            : m
        ),
      });
    } catch (err: any) {
      console.error("completeMission error", err);
    }
  },
}));
