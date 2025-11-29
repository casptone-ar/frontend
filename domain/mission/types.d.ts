/**
 * @file Mission 도메인 관련 타입 정의
 */

/**
 * 미션의 종류 (일일/주간)
 */
export type MissionType = "daily" | "weekly";

/**
 * 미션의 현재 상태를 나타냅니다.
 * - pending: 아직 시작하지 않은 미션
 * - in-progress: 진행 중인 미션
 * - completed: 완료된 미션
 * - failed: 실패한 미션 (기간 만료 등)
 */
export type MissionStatus = "pending" | "in-progress" | "completed" | "failed";

/**
 * 미션의 완료 시 지급되는 재화의 종류와 양을 정의합니다.
 */
export type MissionReward = {
  type: "coin" | "experience"; // 재화 종류
  amount: number; // 재화의 양
};

/**
 * 개별 미션 정보를 나타내는 기본 타입입니다.
 */
export interface BaseMission {
  id: string; // 미션의 고유 ID
  title: string; // 미션 제목 (예: "하루에 5000보 걷기")
  description: string; // 미션 상세 설명
  type: MissionType; // 미션 종류 (일일/주간)
  status: MissionStatus; // 현재 미션 상태
  rewards: MissionReward[]; // 완료 시 보상 목록
  targetValue?: number; // 목표 값 (예: 걸음 수, 완료 횟수)
  currentValue?: number; // 현재 값
  iconUrl?: string; // 미션 아이콘 URL (옵션)
  category?: string; // 미션 카테고리 (옵션, 예: "건강", "탐험")
  startDate?: string; // 미션 시작일 (ISO 문자열)
  endDate?: string; // 미션 종료일 (ISO 문자열)
}

/**
 * 홈/리스트용 미리보기 정보
 */
export interface MissionPreview {
  id: string;
  title: string;
  /** 예: "진행 중", "500/1000 걸음", "완료!", "보상 받기" */
  statusText: string;
  iconUrl?: string;
  /** 미션 타입에 따른 추가 정보 (예: 일일 미션, 주간 미션) */
  typeText?: string;
  /** 보상 받기 등 즉각 액션 필요 여부 */
  actionRequired?: boolean;
}

/**
 * UI에서 자주 쓰는 확장형 미션 모델
 * - 서버/도메인 BaseMission을 확장해 화면단에서 쓰는 부가 필드 포함
 */
export interface Mission extends BaseMission {
  /** 정량 목표 */
  goal?: number;
  /** 진행도(정량) */
  currentProgress?: number;
  /** 단위: "보", "회" 등 */
  unit?: string;
  /** 간단 보상(코인만) 표현이 필요할 때 */
  rewardCoin?: number;
}

export type MissionFilter = "all" | "daily" | "weekly" | "completed";
