import { create } from "zustand";

type ProUIState = {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
};

export const useProUIStore = create<ProUIState>((set) => ({
  isFocusMode: false,

  toggleFocusMode: () => {
    set((state) => ({ isFocusMode: !state.isFocusMode }));
  },
}));
