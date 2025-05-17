/**
 * @file Pet 도메인 관련 타입 정의
 */

/**
 * 애완동물 선택 화면에서 사용될 애완동물 옵션의 타입입니다.
 */
export type PetOption = {
  id: string; // 애완동물 고유 ID (예: 'cat_01', 'dog_01')
  name: string; // 애완동물 이름 (예: '씩씩한 고양이', '명랑한 강아지')
  description: string; // 간단한 설명
  image: string; // image 속성 추가
  modelUrl?: string; // 3D 모델 경로 (AR 및 컬렉션용)
  thumbnailUrl?: string; // 선택 화면용 2D 썸네일
  initialStats?: PetStats; // 초기 스탯 (선택적)
};

export type PetStats = {
  health: number;
  happiness: number;
  experience: number;
  level: number;
};

export type Pet = PetOption & {
  level: number;
  experience: number;
  currentStats: PetStats;
  // 여기에 애완동물 관련 추가 데이터 필드 정의
  ownerId: string; // 사용자 ID
  createdAt: string; // ISO 날짜 문자열
  updatedAt: string; // ISO 날짜 문자열
  equippedItems?: string[]; // 장착한 치장 아이템 ID 목록
  learnedPoses?: string[]; // 습득한 자세 아이템 ID 목록 (애니메이션과 연관될 수 있음)
  arData?: PetARData; // AR 관련 데이터
};

/**
 * 사용자가 현재 키우고 있는 애완동물의 상태 정보를 나타내는 타입입니다.
 */
export type CurrentPetStatus = {
  id: string; // 현재 애완동물 고유 ID
  name: string; // 애완동물 이름
  level: number; // 현재 레벨
  experience: number; // 현재 경험치
  experienceToNextLevel: number; // 다음 레벨까지 필요한 총 경험치
  imageUrl?: string; // 애완동물 2D 이미지 URL (또는 로컬 에셋 경로)
  modelUrl?: string; // 애완동물 3D 모델 URL (또는 로컬 에셋 경로)
  // TODO: 애완동물의 현재 기분, 상태 (예: 배고픔, 행복함) 등 추가 가능
  // currentMood?: 'happy' | 'sad' | 'hungry';
};

/**
 * 일일 걸음 수 미션 진행 상태를 나타내는 타입입니다.
 */
export type DailyStepMissionProgress = {
  currentSteps: number; // 현재 걸음 수
  goalSteps: number; // 목표 걸음 수
  rewardCoin: number; // 완료 시 보상 코인
  isCompletedToday: boolean; // 오늘 이미 완료했는지 여부
};

/**
 * 애완동물이 수행할 수 있는 애니메이션의 종류를 정의합니다.
 * 'idle' (기본 대기), 'walk' (걷기), 'run' (뛰기), 'eat' (먹기),
 * 'play' (놀기), 'dance' (춤추기), 'sit' (앉기) 등이 포함될 수 있습니다.
 * 상점에서 구매한 '자세 아이템'에 따라 확장될 수 있습니다.
 */
export type PetAnimationType =
  | "idle"
  | "walk"
  | "run"
  | "eat"
  | "play"
  | "dance"
  | "sit"
  // 추가적인 애니메이션 타입 정의 가능
  | "happy_reaction" // 예: 터치 시 반응
  | "special_action_1"; // 예: 특정 아이템 사용 시 반응

/**
 * AR 기능에 사용될 애완동물의 데이터 구조입니다.
 * 3D 모델 정보, 사용 가능한 애니메이션 목록, 현재 애니메이션 상태 등을 포함합니다.
 */
export interface PetARData {
  modelUrl: string; // 애완동물의 3D 모델 파일 경로 또는 URL
  availableAnimations: PetAnimationType[]; // 현재 애완동물이 사용 가능한 애니메이션 목록
  currentAnimation: PetAnimationType; // 현재 재생 중인 애니메이션
  scale?: number; // AR 공간에서의 애완동물 크기 (기본값 1)
  positionOffset?: { x: number; y: number; z: number }; // AR 공간에서의 위치 오프셋 (선택적)
}

/**
 * 애완동물 승천 시 반환될 보상 및 결과 정보를 나타내는 타입입니다.
 */
export interface PetAscensionResult {
  ascendedPetName: string; // 승천한 애완동물의 이름
  bonusCoinsAwarded: number; // 승천 보상으로 지급된 코인
  message?: string; // 승천 완료 메시지 (예: "새로운 여정을 축하합니다!")
  // 컬렉션에 추가된 정보 (ID 등)를 포함할 수도 있음
  // collectedPetEntryId?: string;
}

// 향후 Pet 도메인과 관련된 다른 타입들을 여기에 추가할 수 있습니다.
// 예를 들어, 사용자가 현재 키우고 있는 애완동물의 상세 정보 타입 등
// export type CurrentPetStatus = {
//   ...
// }
