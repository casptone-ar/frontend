import { API } from "@/service/lib/Http/adapter";
import type { UserCollection, MissionTimelineEvent } from "./types";

export async function getCollections() {
  return API.get<{ items: UserCollection[] }>("/me/collections");
}

export async function getCollectionDetail(user_collection_id: number) {
  return API.get<{
    user_collection_id: number;
    ascended_nickname: string;
    ascended_at: string;
    timeline: MissionTimelineEvent[];
  }>(`/me/collections/${user_collection_id}`);
}
