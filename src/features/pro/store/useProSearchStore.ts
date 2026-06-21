import { create } from "zustand";

type ProSearchState = {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
};

export const useProSearchStore = create<ProSearchState>((set) => ({
  searchKeyword: "",
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
}));
