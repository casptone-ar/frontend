// View/store/petStore.ts
import { createStore } from "zustand";

export type MockUserPet = {
  id: number;
  nickname: string;
  level: number;
  experience_points: number;
  health: number;
  happiness: number;
};

export type PetState = {
  activePet: MockUserPet | null;
  isLoading: boolean;
  error?: string;
};

export type PetActions = {
  fetchActivePet: () => Promise<void>;
  createPet: (pet_master_id: number, nickname: string) => Promise<void>;
  setActivePet: (user_pet_id: number) => Promise<void>;
};

export type PetStore = PetState & PetActions;

const initialState: PetState = {
  activePet: null,
  isLoading: false,
};

// ✅ 여기서만 쓰는 목 데이터
const MOCK_ACTIVE_PET: MockUserPet = {
  id: 1,
  nickname: "장금이",
  level: 3,
  experience_points: 120,
  health: 80,
  happiness: 90,
};

export const petStore = createStore<PetStore>((set) => ({
  ...initialState,

  // 활성 펫 조회 (목)
  fetchActivePet: async () => {
    set({ isLoading: true, error: undefined });
    try {
      // 네트워크 대신, 목 데이터 세팅
      await new Promise((r) => setTimeout(r, 400)); // 로딩 느낌용
      set({ activePet: MOCK_ACTIVE_PET });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  // 펫 생성 (목) – 일단은 항상 같은 펫으로 세팅
  createPet: async (_pet_master_id, nickname) => {
    set({ isLoading: true, error: undefined });
    try {
      await new Promise((r) => setTimeout(r, 400));
      set({
        activePet: { ...MOCK_ACTIVE_PET, nickname },
      });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 생성 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  // 활성 펫 전환 (목) – 지금은 단일 펫만 있다고 가정
  setActivePet: async (_user_pet_id) => {
    set({ isLoading: true, error: undefined });
    try {
      await new Promise((r) => setTimeout(r, 200));
      set({ activePet: MOCK_ACTIVE_PET });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 활성화 실패" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
