// View/store/missionStore.ts
import { createStore } from "zustand/vanilla";
import { getMissions, claimMissionReward } from "@/service/api/missions";
import type { MissionTypeFilter, RawMission } from "@/service/api/missions";

export type MissionFilter = MissionTypeFilter;

export interface MissionStoreState {
  missions: RawMission[];
  isLoading: boolean;
  error: string | null;
  filter: MissionFilter;

  /** 미션 목록 로드 */
  fetchMissions: (filter?: MissionFilter) => Promise<void>;

  /** 미션 보상 수령 */
  claimReward: (userMissionId: number) => Promise<void>;

  /** 필터 변경 (UI 탭 전환용) */
  setFilter: (filter: MissionFilter) => void;

  /** 스토어 초기화 */
  reset: () => void;
}

export const missionStore = createStore<MissionStoreState>((set, get) => ({
  missions: [],
  isLoading: false,
  error: null,
  filter: "all",

  async fetchMissions(filter) {
    const nextFilter = filter ?? get().filter ?? "all";

    set({
      isLoading: true,
      error: null,
      filter: nextFilter,
    });

    try {
      const res = await getMissions(nextFilter);
      // 공통 응답: { success, data } 라고 가정
      const missions = (res as any)?.data ?? [];

      set({
        missions,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Failed to fetch missions:", err);
      set({
        isLoading: false,
        error: err?.message ?? "미션을 불러오는 중 오류가 발생했습니다.",
      });
    }
  },

  async claimReward(userMissionId) {
    try {
      await claimMissionReward(userMissionId);

      // 성공 시, 해당 미션의 reward_claimed 플래그만 true로 업데이트 (있으면)
      set((state) => ({
        ...state,
        missions: state.missions.map((mission: any) => {
          const id =
            mission?.user_mission_id ??
            mission?.id ??
            mission?.missionId ??
            null;

          if (id === userMissionId) {
            return {
              ...mission,
              reward_claimed: true,
            };
          }
          return mission;
        }),
      }));
    } catch (err: any) {
      console.error("Failed to claim mission reward:", err);
      set((state) => ({
        ...state,
        error: err?.message ?? "보상 수령 중 오류가 발생했습니다.",
      }));
    }
  },

  setFilter(filter) {
    set({ filter });
  },

  reset() {
    set({
      missions: [],
      isLoading: false,
      error: null,
      filter: "all",
    });
  },
}));
