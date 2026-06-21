import type { NailDesignRow } from "@/shared/types/database.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProCartNail = {
  id: string;
  imageUrl: string;
  title: string;
};

type ProCartState = {
  selectedNails: ProCartNail[];
  toggleNail: (nail: ProCartNail) => void;
  removeNail: (nailId: string) => void;
  clearCart: () => void;
  setSelectedNails: (nails: ProCartNail[]) => void;
};

export function toProCartNail(item: NailDesignRow): ProCartNail {
  return {
    id: item.id,
    imageUrl: String(item.image_url ?? "").trim(),
    title: String(item.title ?? "").trim() || "네일 디자인",
  };
}

export const useProCartStore = create<ProCartState>()(
  persist(
    (set) => ({
      selectedNails: [],

      toggleNail: (nail) => {
        set((state) => {
          const exists = state.selectedNails.some((selected) => selected.id === nail.id);
          if (exists) {
            return {
              selectedNails: state.selectedNails.filter((selected) => selected.id !== nail.id),
            };
          }
          return { selectedNails: [...state.selectedNails, nail] };
        });
      },

      removeNail: (nailId) => {
        set((state) => ({
          selectedNails: state.selectedNails.filter((selected) => selected.id !== nailId),
        }));
      },

      clearCart: () => set({ selectedNails: [] }),

      setSelectedNails: (nails) => set({ selectedNails: nails }),
    }),
    {
      name: "pro-cart-storage",
      partialize: (state) => ({ selectedNails: state.selectedNails }),
    },
  ),
);
