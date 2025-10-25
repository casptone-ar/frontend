// src/domain/mappers.ts
import type {
  UserPet,
  MissionPreview as ApiMissionPreview,
} from "@/service/api/types";
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types";
import type { MissionPreview as UiMissionPreview } from "@/domain/mission/types";

/** 레벨→다음 레벨까지 필요 경험치 (백엔드 확정 전 임시 로직) */
function estimateExpToNextLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/** API UserPet → UI CurrentPetStatus
 *  - ⚠️ 도메인 CurrentPetStatus에 stats 필드가 없다고 했으니 'stats'는 넣지 않습니다.
 */
export function mapUserPetToCurrentPetStatus(
  p: UserPet | null
): CurrentPetStatus | null {
  if (!p) return null;
  return {
    id: String(p.user_pet_id),
    name: p.nickname,
    level: p.level,
    experience: p.experience_points,
    experienceToNextLevel: estimateExpToNextLevel(p.level),
    // 도메인 타입에 imageUrl이 있다면 값 넣고, 없다면 제거하세요.
    // imageUrl: undefined,
  } as CurrentPetStatus;
}

/** 필요 시 별도로 PetStats를 뽑아쓰도록 제공 */
export function mapUserPetToPetStats(p: UserPet | null): PetStats {
  return {
    level: p?.level ?? 0,
    experience: p?.experience_points ?? 0,
    // 백엔드 확정 전 임시값
    health: 100,
    happiness: 100,
  };
}

/** 임시 아이콘 선택 */
function pickMissionIcon(type: "daily" | "weekly"): string {
  return type === "daily"
    ? "https://via.placeholder.com/50/A0E0FF/000000?Text=Daily"
    : "https://via.placeholder.com/50/FFDDA0/000000?Text=Weekly";
}

/** API MissionPreview → UI MissionPreview
 *  - ⚠️ 도메인 MissionPreview에 category가 없다 했으니 'category'는 넣지 않습니다.
 */
export function mapApiMissionToUiMission(
  m: ApiMissionPreview
): UiMissionPreview {
  const statusText = `${m.progress} / ${m.goal_value}`;
  return {
    id: String(m.user_mission_id),
    title: m.title,
    statusText,
    iconUrl: pickMissionIcon(m.mission_type),
    // isCompleted가 도메인 정의에 있다면 유지, 없다면 제거
    ...(typeof m.is_completed === "boolean"
      ? { isCompleted: m.is_completed }
      : {}),
  } as UiMissionPreview;
}

export function mapApiMissionsToUi(
  missions: ApiMissionPreview[]
): UiMissionPreview[] {
  return missions.map(mapApiMissionToUiMission);
}
