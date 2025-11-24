// service/api/pets.ts
import { API } from "@/service/lib/Http/adapter";
import type {
  ApiSuccess,
  PetMaster,
  BackendUserPet,
} from "@/service/api/types";

/**
 * 온보딩용 펫 마스터 목록 조회
 * GET /v1/pets/masters
 */
export async function getPetMasters() {
  // 응답 예시: { success: true, data: PetMaster[] }
  return API.get<ApiSuccess<PetMaster[]>>("/v1/pets/masters");
}

/**
 * 활성 펫 조회
 * GET /v1/pets/active
 *
 * - 로그인 필요 (401: 인증 토큰 없음)
 * - 활성 펫이 없으면 data 가 null 이거나 404 정책은 백엔드 기준
 */
export async function getActivePet() {
  // 응답 예시: { success: true, data: BackendUserPet | null }
  return API.get<ApiSuccess<BackendUserPet | null>>("/v1/pets/active");
}

/**
 * 새 펫 생성 요청 바디
 * POST /v1/pets
 */
export interface CreatePetRequest {
  pet_master_id: number;
  nickname: string;
}

/**
 * 새 펫 생성 (온보딩 확정)
 * POST /v1/pets
 */
export async function createUserPet(body: CreatePetRequest) {
  // 응답 예시: { success: true, data: BackendUserPet }
  return API.post<ApiSuccess<BackendUserPet>>("/v1/pets", body);
}

/**
 * 활성 펫 승천
 * POST /v1/pets/active/ascend
 *
 * ⚠️ 응답 data 구조(컬렉션 데이터인지, 펫인지)는
 * 스웨거 화면이 잘 안 보여서 정확히는 몰라서 unknown 으로 둠.
 * 나중에 백엔드 스키마 확정되면 제네릭 T 부분만 바꿔주면 됨.
 */
export async function ascendActivePet() {
  return API.post<ApiSuccess<unknown>>("/v1/pets/active/ascend", {});
}
