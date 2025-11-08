// service/api/pets.ts
import { API } from "@/service/lib/Http/adapter";
import type { PetMaster, UserPet, ApiSuccess } from "@/domain/pet/api-types";

/** 펫 마스터 목록 (온보딩 선택용) - GET /v1/pets/masters */
export async function getPetMasters(): Promise<PetMaster[]> {
  const res = await API.get<ApiSuccess<PetMaster[]>>("/v1/pets/masters");
  // 어댑터가 response.data를 반환하므로 여기 res는 { success, data }
  return res.data;
}

/** 활성 펫 조회 - GET /v1/pets/active (404면 null) */
export async function getActivePet(): Promise<UserPet | null> {
  try {
    // 백엔드가 래퍼 없이 UserPet 반환한다고 가정
    const pet = await API.get<UserPet>("/v1/pets/active");
    return pet;
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/** 유저 펫 생성 - POST /v1/pets  body: { pet_master_id, nickname } */
export async function createUserPet(
  pet_master_id: number,
  nickname: string
): Promise<UserPet> {
  // 일부 서버는 {success,data}로 줄 수도 있어 방어적으로 처리
  const raw = await API.post<UserPet | ApiSuccess<UserPet>>("/v1/pets", {
    pet_master_id,
    nickname,
  });
  return (raw as any)?.data && (raw as any).success
    ? (raw as ApiSuccess<UserPet>).data
    : (raw as UserPet);
}

/** 특정 유저 펫 활성화 - Swagger에 없음 → 보류/주석 처리 */
export async function activatePet(_user_pet_id: number) {
  throw new Error(
    "POST /pets/:id/activate 는 현재 Swagger에 없습니다(백엔드 확인 필요)."
  );
}
