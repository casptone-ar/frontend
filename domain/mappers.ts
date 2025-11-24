// src/domain/mappers.ts
import type { BackendUserPet } from "@/domain/pet/api-types"; // ✅ 앱 내부 표준형
import type { MissionPreview as ApiMissionPreview } from "@/service/api/types"; // ✅ 서버 응답 원본
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types";
import type { MissionPreview as UiMissionPreview } from "@/domain/mission/types";

/** 레벨 → 다음 레벨까지 필요 경험치 (백엔드 확정 전 임시 로직) */
function estimateExpToNextLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/** 🐾 UserPet → CurrentPetStatus (홈 화면용) */
export function mapUserPetToCurrentPetStatus(
  p: BackendUserPet | null
): CurrentPetStatus | null {
  if (!p) return null;
  return {
    id: String(p.user_pet_id),
    name: p.nickname,
    level: p.level ?? 1,
    experience: p.experience_points ?? 0,
    experienceToNextLevel: estimateExpToNextLevel(p.level ?? 1),
    imageUrl: undefined, // 필요 시 master 정보에서 추출
  };
}

/** 🧩 UserPet → PetStats (상태바 등에서 사용) */
export function mapUserPetToPetStats(p: BackendUserPet | null): PetStats {
  return {
    level: p?.level ?? 0,
    experience: p?.experience_points ?? 0,
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

/** 🏆 API MissionPreview → UI MissionPreview */
export function mapApiMissionToUiMission(
  m: ApiMissionPreview
): UiMissionPreview {
  const statusText = `${m.progress} / ${m.goal_value}`;
  return {
    id: String(m.user_mission_id),
    title: m.title,
    statusText,
    iconUrl: pickMissionIcon(m.mission_type),
    ...(typeof m.is_completed === "boolean"
      ? { isCompleted: m.is_completed }
      : {}),
  };
}

/** 🏆 여러 미션 매핑 */
export function mapApiMissionsToUi(
  missions: ApiMissionPreview[]
): UiMissionPreview[] {
  return missions.map(mapApiMissionToUiMission);
}
