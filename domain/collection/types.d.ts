/**
 * @file Collection 도메인 관련 타입 정의
 */

import type { Mission, MissionType } from "@/domain/mission/types";
import type { Pet } from "@/domain/pet/types";

/**
 * 컬렉션에 저장될 승천한 애완동물의 정보를 나타냅니다.
 * Pet 타입에서 일부 정보를 가져오고, 컬렉션에 특화된 정보를 추가합니다.
 */
export interface CollectedPet {
  id: string; // 승천 기록 ID (Pet ID와 다를 수 있음, 또는 Pet ID를 그대로 사용)
  petId: Pet["id"]; // 원본 애완동물의 ID
  name: Pet["name"];
  description: Pet["description"];
  modelUrl?: Pet["modelUrl"]; // 컬렉션에서 보여줄 3D 모델 경로
  thumbnailUrl?: Pet["thumbnailUrl"]; // 그리드 뷰 등에서 사용할 썸네일
  ascendedAt: string; // ISO 날짜 문자열, 승천한 날짜
  finalLevel: Pet["level"]; // 승천 당시 레벨
  // 승천 당시의 스탯이나 특별한 기록 등을 추가할 수 있음
  // finalStats?: PetStats;
  missionTimelineId?: string; // 이 애완동물과 관련된 미션 타임라인 ID
}

/**
 * 미션 타임라인의 개별 이벤트를 나타냅니다.
 */
export interface TimelineEvent {
  id: string; // 이벤트 고유 ID
  timestamp: string; // ISO 날짜 문자열, 이벤트 발생 시각
  type: "mission_completed" | "level_up" | "item_acquired" | "ascension"; // 이벤트 종류
  title: string; // 이벤트 제목 (예: "일일 미션 완료: 5000보 걷기")
  description?: string; // 이벤트 상세 설명
  details?: {
    missionId?: Mission["id"];
    missionType?: MissionType;
    missionGoal?: Mission["goal"];
    missionUnit?: Mission["unit"];
    rewardCoin?: Mission["rewardCoin"];
    achievedLevel?: Pet["level"];
    // 아이템 획득 이벤트의 경우 아이템 정보
    // acquiredItemId?: ShopItem['id'];
    // acquiredItemName?: ShopItem['name'];
  };
  icon?: string; // 이벤트 타입에 따른 아이콘 (선택적)
}

/**
 * 특정 애완동물의 전체 미션 타임라인 정보를 나타냅니다.
 */
export interface MissionTimeline {
  id: string; // 타임라인 고유 ID
  petId: Pet["id"]; // 이 타임라인의 대상 애완동물 ID
  events: TimelineEvent[]; // 시간 순서대로 정렬된 이벤트 목록
  startDate?: string; // 애완동물 육성 시작일 (선택적)
  endDate?: string; // 애완동물 승천일 (선택적)
}
