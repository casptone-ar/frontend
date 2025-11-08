// service/inbound/query/collections.ts
import { useAsyncFn, useFetch } from "./utils";
import {
  getCollections,
  getCollectionDetail,
  type CollectionDetailResponse,
} from "@/service/api/collections";
import type { UserCollection } from "@/service/api/types";

/** 승천 컬렉션 목록 */
export function useCollections(auto = true) {
  const { data, error, loading, refetch } = useFetch<UserCollection[]>(
    getCollections,
    auto
  );

  return {
    collections: data ?? [],
    error,
    loading,
    refetch,
  } as const;
}

/** 컬렉션 상세 (id가 주어졌을 때만 조회) */
export function useCollectionDetail(user_collection_id?: number) {
  const enabled = typeof user_collection_id === "number";

  const fetcher = () =>
    user_collection_id
      ? getCollectionDetail(user_collection_id)
      : Promise.reject(
          new Error("정보가 부족합니다: user_collection_id가 필요합니다.")
        );

  const { data, error, loading, refetch } = useFetch<CollectionDetailResponse>(
    fetcher,
    enabled
  );

  return {
    detail: data,
    error,
    loading,
    refetch,
  } as const;
}
