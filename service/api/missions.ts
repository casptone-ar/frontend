// service/api/missions.ts
/**
 * Missions API
 * - GET /v1/missions
 * - POST /v1/missions/{missionId}/claim-reward
 */

import { API } from "@/service/lib/Http/adapter";
import type { ApiSuccess, MissionPreview } from "@/service/api/types";

/**
 * Swagger 기준 미션 타입 필터
 * - daily | weekly | all
 */
export type MissionTypeFilter = "daily" | "weekly" | "all";

/**
 * 백엔드에서 내려오는 미션 원본 타입
 * 👉 Swagger 전체 필드를 아직 100% 알 수 없어서 느슨하게 둠
 *    스펙 확정되면 여기서 필드 좁혀가면 됩니다.
 */
export type RawMission = MissionPreview;

/**
 * 미션 목록 응답 래퍼
 * (백엔드 공통 응답: { success: boolean; data: T } 형태라고 가정)
 */
export type GetMissionsResponse = ApiSuccess<MissionPreview[]>;

/**
 * 보상 수령 응답 (예: { success: true, data: { claimed_coins: number } })
 * 정확한 data 구조는 Swagger 최종 기준으로 추후 좁히면 됩니다.
 */
export type ClaimRewardResponse = ApiSuccess<unknown>;

/**
 * 미션 목록 조회
 * @param type daily | weekly | all (기본값 all)
 */
export async function getMissions(
  type: MissionTypeFilter = "all"
): Promise<MissionPreview[]> {
  const query = type ? `?type=${type}` : "";
  const res = await API.get<GetMissionsResponse>(`/v1/missions${query}`);
  return res.data;
}

/**
 * 미션 보상 수령
 * @param userMissionId Swagger에서 missionId(=user_missions.id) 로 표기된 값
 */
export async function claimMissionReward(
  userMissionId: number
): Promise<ApiSuccess<unknown>> {
  return API.post<ApiSuccess<unknown>>(
    `/v1/missions/${userMissionId}/claim-reward`,
    {}
  );
}
