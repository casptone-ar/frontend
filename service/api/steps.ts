import { API } from "@/service/lib/Http/adapter";

/**
 * 클라이언트에서 측정한 걸음 수를 서버에 전송하고
 * 활성화된 펫의 경험치를 업데이트합니다.
 *
 * POST /v1/me/steps
 *
 * @param stepsCount - 전송할 걸음 수
 * @returns 서버에서 반환된 경험치 업데이트 결과
 *
 * @example
 * const res = await postSteps(1500);
 * console.log(res.added_xp); // 추가된 경험치
 */
export async function postSteps(stepsCount: number) {
  const res = await API.post<StepsResponse>("/v1/me/steps", {
    steps_count: stepsCount,
  });
  return res;
}

/** 서버 응답 타입 정의 */
export interface StepsResponse {
  success: boolean;
  message: string;
  level: number;
  experience_points: number;
  added_xp: number;
}
