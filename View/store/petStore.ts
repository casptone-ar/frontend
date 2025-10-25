import { createStore } from "zustand";
import { getActivePet, createUserPet, activatePet } from "@/service/api/pets";
import type { UserPet } from "@/service/api/types";

export type PetState = {
  activePet: UserPet | null;
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
  activePet: null, // ✅
  isLoading: false,
};

export const petStore = createStore<PetStore>((set) => ({
  ...initialState,

  fetchActivePet: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const pet = await getActivePet();
      set({ activePet: pet });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 불러오기 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  createPet: async (pet_master_id, nickname) => {
    set({ isLoading: true, error: undefined });
    try {
      const pet = await createUserPet(pet_master_id, nickname);
      set({ activePet: pet });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 생성 실패" });
    } finally {
      set({ isLoading: false });
    }
  },

  setActivePet: async (user_pet_id) => {
    set({ isLoading: true, error: undefined });
    try {
      const pet = await activatePet(user_pet_id);
      set({ activePet: pet });
    } catch (err: any) {
      set({ error: err?.message ?? "펫 활성화 실패" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
