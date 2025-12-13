// View/store/collectionStore.ts

import { createStore } from "zustand";
import { getCollections, getCollectionDetail } from "@/service/api/collections";
import type { UserCollection, MissionTimelineEvent } from "@/service/api/types";
import type { CollectionDetailResponse } from "@/service/api/collections";

export type CollectionState = {
  /** 내 승천 컬렉션 목록 */
  collections: UserCollection[];
  /** 선택된 컬렉션(상세 화면용) */
  selectedCollection?: {
    id: number;
    nickname: string;
    ascendedAt: string;
    timeline: MissionTimelineEvent[];
  };
  /** 목록/상세 공통 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 (있다면) */
  error?: string;
};

export type CollectionActions = {
  /** 컬렉션 목록 새로고침 */
  fetchCollections: () => Promise<void>;
  /** 특정 컬렉션 상세 + 타임라인 조회 */
  fetchCollectionDetail: (user_collection_id: number) => Promise<void>;
};

export type CollectionStore = CollectionState & CollectionActions;

const initialState: CollectionState = {
  collections: [],
  isLoading: false,
};

export const collectionStore = createStore<CollectionStore>((set) => ({
  ...initialState,

  /** 승천 컬렉션 목록 불러오기 */
  fetchCollections: async () => {
    set({ isLoading: true, error: undefined });
    try {
      // getCollections(): UserCollection[]
      const collections = await getCollections();
      set({ collections });
    } catch (err: any) {
      set({ error: err?.message ?? "컬렉션 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  /** 특정 컬렉션 상세 + 타임라인 불러오기 */
  fetchCollectionDetail: async (user_collection_id) => {
    set({ isLoading: true, error: undefined });
    try {
      const res: CollectionDetailResponse = await getCollectionDetail(
        user_collection_id
      );

      set({
        selectedCollection: {
          id: res.user_collection_id,
          nickname: res.ascended_nickname,
          ascendedAt: res.ascended_at,
          timeline: res.timeline,
        },
      });
    } catch (err: any) {
      set({ error: err?.message ?? "컬렉션 상세 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
