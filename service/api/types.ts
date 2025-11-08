// service/api/types.ts
/**
 * @file Backend API 원본 타입 모음
 *
 * - 여기는 "백엔드에서 실제로 내려오는 그대로의 타입"만 둔다.
 * - 화면/도메인(UI)에서 쓰는 예쁜 타입은 `domain/**` + `domain/mappers.ts`에서 변환해서 사용.
 */

/* -------------------- 공통 유틸 타입 (선택적으로 사용) -------------------- */

/**
 * success + data 형태의 공통 래퍼가 있을 때 쓰는 제네릭.
 * 실제 Swagger에서 이 패턴을 안 쓰면 안 써도 된다.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  code?: string | number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/* -------------------- 유저 -------------------- */

export type User = {
  user_id: number;
  email: string;
  nickname: string;
  coins: number;
  auth_provider: string;
  created_at: string;
};

/* -------------------- 펫 -------------------- */

export interface PetMaster {
  pet_master_id: number;
  name: string;
  description: string;
  /** 백엔드가 문자열로 주는 필드 */
  evolution_info: string;
}

/**
 * ✅ BackendUserPet
 * - 백엔드에서 오는 원본 유저 펫 응답 구조
 * - domain 쪽에서는 이걸 받아서 `CurrentPetStatus` 같은 UI 타입으로 매핑해서 사용
 */
export type BackendUserPet = {
  user_pet_id: number;
  user_id: number;
  pet_master_id: number;
  nickname: string;
  level: number;
  experience_points: number;
  is_active: boolean;
  created_at: string;
};

/* -------------------- 미션 (리스트/프리뷰) -------------------- */

export type MissionPreview = {
  user_mission_id: number;
  mission_master_id: number;
  title: string;
  mission_type: "daily" | "weekly";
  goal_type: string;
  goal_value: number;
  reward_xp: number;
  reward_coins: number;
  progress: number;
  is_completed: boolean;
  assigned_date: string;
};

/* -------------------- 컬렉션 / 승천 -------------------- */

/**
 * ⚠ 여기 타입은 "현재 네가 types.ts에 써둔 것" 그대로 유지했다.
 * Swagger 스샷에 pet_masters.name 같은게 있으면,
 * 실제 응답에 맞춰서 여기를 확장하면 된다.
 */
export type UserCollection = {
  user_collection_id: number;
  pet_master_id: number;
  ascended_nickname: string;
  ascended_at: string;
};

/**
 * 컬렉션 상세 타임라인 이벤트
 * - 현재 네가 정의해둔 형태를 그대로 사용
 * - 세부 구조(details)는 백엔드 스펙에 따라 점진적으로 구체화 가능
 */
export type MissionTimelineEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  details?: Record<string, any>;
};
