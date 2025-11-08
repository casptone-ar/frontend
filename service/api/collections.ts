// service/api/collections.ts
import { API } from "@/service/lib/Http/adapter";
import type { UserCollection, MissionTimelineEvent } from "@/service/api/types";

// 컬렉션 상세 응답 타입 (타임라인 포함)
export type CollectionDetailResponse = {
  user_collection_id: number;
  pet_master_id: number;
  ascended_nickname: string;
  ascended_at: string;
  timeline: MissionTimelineEvent[];
};

// 🔴 여기 경로는 실제 Swagger에 적힌 걸로 바꿔줘야 해
//   (예: "/v1/collection" 또는 "/me/collections" 중 뭐가 맞는지 나는 모름)
export async function getCollections() {
  return API.get<UserCollection[]>("/v1/collection");
}

export async function getCollectionDetail(user_collection_id: number) {
  return API.get<CollectionDetailResponse>(
    `/v1/collection/${user_collection_id}`
  );
}
