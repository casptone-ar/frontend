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
 * 개별 미션 정보를 나타내는 타입입니다.
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
 * 홈 화면이나 간단한 목록에 표시될 미션 미리보기 정보입니다.
 */
export interface MissionPreview {
  id: string;
  title: string;
  /** 예: "진행 중", "500/1000 걸음", "완료!", "보상 받기" */
  statusText: string;
  iconUrl?: string;
  /** 미션 타입에 따른 추가 정보 (예: 일일 미션, 주간 미션) */
  typeText?: string;
  /** 사용자가 이 미션을 탭했을 때 수행할 액션 (예: 미션 상세 페이지로 이동) */
  actionRequired?: boolean; // 즉각적인 사용자 액션(클릭)이 필요한지 여부 (예: 보상받기)
}

// 예시: 미션 목록 필터링을 위한 타입
export type MissionFilter = "all" | "daily" | "weekly" | "completed";
