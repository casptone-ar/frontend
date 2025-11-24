// service/inbound/query/useMissions.ts

import { useAsyncFn, useFetch } from "./utils";
import {
  getMissions,
  claimMissionReward,
  type MissionTypeFilter,
} from "@/service/api/missions";
import type { MissionPreview } from "@/service/api/types";

/**
 * 🧩 미션 목록 조회 훅
 *
 * - scope: "daily" | "weekly" | "all"
 * - auto: true 면 마운트 시 자동 호출
 * - getMissions(scope) 는 MissionPreview[] 를 바로 리턴한다고 가정
 */
export function useMissions(scope: MissionTypeFilter = "all", auto = true) {
  // ✅ 이미 MissionPreview[] 를 리턴하므로 따로 .data 꺼낼 필요 없음
  const fetcher = () => getMissions(scope);

  const { data, error, loading, refetch, setData } = useFetch<MissionPreview[]>(
    fetcher,
    auto
  );

  return {
    missions: data ?? [],
    error,
    loading,
    refetch,
    setMissions: setData,
  } as const;
}

/**
 * 🎁 미션 보상 수령 훅
 *
 * - user_mission_id 를 넣어서 보상 수령 API 호출
 */
export function useClaimMissionReward() {
  const { loading, error, run } = useAsyncFn((user_mission_id: number) =>
    claimMissionReward(user_mission_id)
  );

  return {
    loading,
    error,
    claimReward: run,
  } as const;
}
