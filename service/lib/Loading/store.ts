import { useStore } from "zustand";
import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export interface GlobalLoadingState {
  isLoading: boolean;
}

export interface GlobalLoadingActions {
  setIsLoading: (value: boolean) => void;
}

const initialState: GlobalLoadingState = {
  isLoading: false,
};

export const GlobalLoadingStore = createStore<
  GlobalLoadingState & GlobalLoadingActions
>()(
  devtools((set) => ({
    ...initialState,

    setIsLoading: (value) =>
      set((state) => {
        state.isLoading = value;
      }),
  }))
);

export const useGlobalLoadingStore = () => {
  const store = useStore(GlobalLoadingStore);
  return store;
};
