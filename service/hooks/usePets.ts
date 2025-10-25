import { useAsyncFn, useFetch } from "./utils";
import {
  getPetMasters,
  getActivePet,
  createUserPet,
  activatePet,
} from "@/service/api/pets";
import type { PetMaster, UserPet } from "@/service/api/types";

/** 온보딩용 펫 마스터 목록 */
export function usePetMasters(auto = true) {
  return useFetch<PetMaster[]>(getPetMasters, auto);
}

/** 활성 펫 조회 */
export function useActivePet(auto = true) {
  return useFetch<UserPet | null>(getActivePet, auto); // ✅
}

/** 펫 생성 (온보딩 확정) */
export function useCreatePet() {
  const { data, error, loading, run } = useAsyncFn(
    (pet_master_id: number, nickname: string) =>
      createUserPet(pet_master_id, nickname)
  );
  return {
    data, // 새 UserPet
    error,
    loading,
    createPet: run,
  } as const;
}

/** 활성 펫 전환 */
export function useActivatePet() {
  const { data, error, loading, run } = useAsyncFn((user_pet_id: number) =>
    activatePet(user_pet_id)
  );
  return {
    data, // 업데이트된 UserPet
    error,
    loading,
    activate: run,
  } as const;
}
