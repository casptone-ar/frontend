import { API } from "@/service/lib/Http/adapter";
import type { MissionPreview } from "./types";

export async function getMissions(scope: "daily" | "weekly" | "all" = "all") {
  return API.get<{ items: MissionPreview[] }>("/me/missions", {
    params: { scope },
  });
}

export async function updateMissionProgress(
  user_mission_id: number,
  progress: number
) {
  return API.patch(`/user-missions/${user_mission_id}/progress`, { progress });
}

export async function completeMission(user_mission_id: number) {
  return API.post(`/user-missions/${user_mission_id}/complete`, {
    claim_reward: true,
  });
}
