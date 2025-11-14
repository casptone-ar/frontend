// application/hooks/useMissions.ts
import { useEffect } from "react";
import { useStore } from "zustand";

import { missionStore } from "@/View/store/missionStore";
import type { MissionFilter } from "@/View/store/missionStore";

/**
 * 미션 목록 + 필터 + 보상 수령까지 한 번에 관리하는 훅
 *
 * @param autoFetch true일 때, 마운트 시 자동으로 현재 filter 기준으로 fetch
 */
export function useMissions(autoFetch: boolean = true) {
  const {
    missions,
    isLoading,
    error,
    filter,
    fetchMissions,
    claimReward,
    setFilter,
  } = useStore(missionStore);

  useEffect(() => {
    if (!autoFetch) return;
    // 현재 filter 기준으로 자동 로딩
    fetchMissions(filter).catch((err) => {
      console.error("useMissions auto fetch error:", err);
    });
  }, [autoFetch, filter, fetchMissions]);

  return {
    missions,
    isLoading,
    error,
    filter,

    fetchMissions,
    claimReward,
    setFilter,
  } as const;
}

/**
 * 특정 필터(예: "daily" 탭용)만 바로 쓰고 싶을 때
 * - 내부적으로 store.filter도 같이 바꿔줌
 */
export function useMissionsByFilter(
  filter: MissionFilter,
  autoFetch: boolean = true
) {
  const { setFilter, ...rest } = useMissions(false);

  useEffect(() => {
    setFilter(filter);
    if (autoFetch) {
      rest.fetchMissions(filter).catch((err) => {
        console.error("useMissionsByFilter auto fetch error:", err);
      });
    }
  }, [filter, autoFetch, setFilter, rest.fetchMissions]);

  return {
    ...rest,
    filter,
  } as const;
}
