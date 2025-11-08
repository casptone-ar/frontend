import { useAsyncFn, useFetch } from "./utils";
import {
  getMissions,
  updateMissionProgress,
  completeMission,
} from "@/service/api/missions";
import type { MissionPreview } from "@/service/api/types";

/** 미션 목록 */
export function useMissions(
  scope: "daily" | "weekly" | "all" = "all",
  auto = true
) {
  const fetcher = () => getMissions(scope).then((r) => r.items);
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

/** 진행도 업데이트 */
export function useMissionProgress() {
  const { loading, error, run } = useAsyncFn(
    (user_mission_id: number, progress: number) =>
      updateMissionProgress(user_mission_id, progress)
  );
  return {
    loading,
    error,
    updateProgress: run,
  } as const;
}

/** 미션 완료 */
export function useCompleteMission() {
  const { loading, error, run } = useAsyncFn((user_mission_id: number) =>
    completeMission(user_mission_id)
  );
  return {
    loading,
    error,
    complete: run,
  } as const;
}
