// service/inbound/query/pets.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  getPetMasters,
  getActivePet,
  createUserPet,
  ascendActivePet,
  type CreatePetRequest,
} from "@/service/api/pets";

import type {
  ApiSuccess,
  PetMaster,
  BackendUserPet,
} from "@/service/api/types";

// 🔑 Query Keys
export const petKeys = {
  all: ["pets"] as const,
  masters: () => [...petKeys.all, "masters"] as const,
  active: () => [...petKeys.all, "active"] as const,
};

/**
 * 온보딩용 펫 마스터 목록 쿼리
 */
export function usePetMastersQuery(
  options?: UseQueryOptions<ApiSuccess<PetMaster[]>>
) {
  return useQuery<ApiSuccess<PetMaster[]>>({
    queryKey: petKeys.masters(),
    queryFn: getPetMasters,
    ...options,
  });
}

/**
 * 활성 펫 상태 쿼리
 */
export function useActivePetQuery(
  options?: UseQueryOptions<ApiSuccess<BackendUserPet | null>>
) {
  return useQuery<ApiSuccess<BackendUserPet | null>>({
    queryKey: petKeys.active(),
    queryFn: getActivePet,
    ...options,
  });
}

/**
 * 펫 생성 뮤테이션 (온보딩 확정)
 */
export function useCreatePetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePetRequest) => createUserPet(body),
    onSuccess: () => {
      // 펫 관련 캐시 정리
      queryClient.invalidateQueries({ queryKey: petKeys.all });
    },
  });
}

/**
 * 활성 펫 승천 뮤테이션
 */
export function useAscendActivePetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ascendActivePet(),
    onSuccess: () => {
      // 승천 후 활성 펫, 컬렉션 등 관련 데이터 다시 받도록
      queryClient.invalidateQueries({ queryKey: petKeys.all });
    },
  });
}
