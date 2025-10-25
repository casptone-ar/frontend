import { createStore } from "zustand";
import { getCollections, getCollectionDetail } from "@/service/api/collections";
import type { UserCollection, MissionTimelineEvent } from "@/service/api/types";

export type CollectionState = {
  collections: UserCollection[];
  selectedCollection?: {
    id: number;
    nickname: string;
    ascendedAt: string;
    timeline: MissionTimelineEvent[];
  };
  isLoading: boolean;
  error?: string;
};

export type CollectionActions = {
  fetchCollections: () => Promise<void>;
  fetchCollectionDetail: (user_collection_id: number) => Promise<void>;
};

export type CollectionStore = CollectionState & CollectionActions;

const initialState: CollectionState = {
  collections: [],
  isLoading: false,
};

export const collectionStore = createStore<CollectionStore>((set) => ({
  ...initialState,

  fetchCollections: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const res = await getCollections();
      set({ collections: res.items });
    } catch (err: any) {
      set({ error: err?.message ?? "컬렉션 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCollectionDetail: async (user_collection_id) => {
    set({ isLoading: true, error: undefined });
    try {
      const res = await getCollectionDetail(user_collection_id);
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
