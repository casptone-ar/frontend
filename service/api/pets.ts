import { API } from "@/service/lib/Http/adapter";
import type { PetMaster, UserPet } from "@/service/api/types";

/** 펫 마스터 목록 (온보딩 선택용) */
export async function getPetMasters() {
  // GET /pet-masters → PetMaster[]
  return API.get<PetMaster[]>("/pet-masters");
}

/** 활성 펫 조회 (없으면 null/404 → 백엔드 정책에 맞춰 처리) */
export async function getActivePet() {
  // GET /pets/me/active → UserPet | null
  return API.get<UserPet | null>("/pets/me/active");
}

/** 유저 펫 생성 */
export async function createUserPet(pet_master_id: number, nickname: string) {
  // POST /pets  body: { pet_master_id, nickname } → UserPet
  return API.post<UserPet>("/pets", { pet_master_id, nickname });
}

/** 특정 유저 펫 활성화 */
export async function activatePet(user_pet_id: number) {
  // POST /pets/:id/activate → UserPet
  return API.post<UserPet>(`/pets/${user_pet_id}/activate`);
}
