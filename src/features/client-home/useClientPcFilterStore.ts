import {
  resolveProGalleryQuery,
  type ProGalleryActiveFilters,
} from "@/pages/pro/components/ProGalleryWidget";
import { useMemo } from "react";
import { create } from "zustand";
import type { PcGallerySortTab } from "./clientPcSidebarConfig";

export type ClientPcFilterKey = keyof ProGalleryActiveFilters;

const DEFAULT_FILTERS: ProGalleryActiveFilters = {
  themeFilter: "전체",
  colorFilter: "전체",
  moodFilter: "전체",
  shapeFilter: "전체",
  pointFilter: "전체",
};

type ClientPcFilterState = ProGalleryActiveFilters & {
  todayTrendFilter: string;
  gallerySort: PcGallerySortTab;
  searchKeyword: string;
  quickChipKeyword: string | null;
  toggleFilter: (key: ClientPcFilterKey, option: string) => void;
  toggleTodayTrend: (option: string) => void;
  setGallerySort: (sort: PcGallerySortTab) => void;
  setSearchKeyword: (keyword: string) => void;
  toggleQuickChip: (keyword: string) => void;
  resetFilters: () => void;
};

export const useClientPcFilterStore = create<ClientPcFilterState>((set) => ({
  ...DEFAULT_FILTERS,
  todayTrendFilter: "전체",
  gallerySort: "인기순",
  searchKeyword: "",
  quickChipKeyword: null,
  toggleFilter: (key, option) => {
    set((state) => ({
      [key]: state[key] === option ? "전체" : option,
    }));
  },
  toggleTodayTrend: (option) => {
    set((state) => ({
      todayTrendFilter: state.todayTrendFilter === option ? "전체" : option,
    }));
  },
  setGallerySort: (sort) => set({ gallerySort: sort }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  toggleQuickChip: (keyword) => {
    set((state) => ({
      quickChipKeyword: state.quickChipKeyword === keyword ? null : keyword,
    }));
  },
  resetFilters: () =>
    set({
      ...DEFAULT_FILTERS,
      todayTrendFilter: "전체",
      quickChipKeyword: null,
    }),
}));

function buildClientPcGalleryExtraTabs(
  filters: ProGalleryActiveFilters,
  todayTrendFilter: string,
  searchKeyword: string,
  quickChipKeyword: string | null,
): string[] {
  const extraTabs = [...resolveProGalleryQuery(filters).extraTabs];

  if (todayTrendFilter !== "전체" && !extraTabs.includes(todayTrendFilter)) {
    extraTabs.push(todayTrendFilter);
  }

  const trimmedSearch = searchKeyword.trim();
  if (trimmedSearch && !extraTabs.includes(trimmedSearch)) {
    extraTabs.push(trimmedSearch);
  }

  if (quickChipKeyword && !extraTabs.includes(quickChipKeyword)) {
    extraTabs.push(quickChipKeyword);
  }

  return extraTabs;
}

/** Zustand selector로 배열을 직접 반환하면 참조가 매번 바뀌어 무한 리렌더가 납니다. */
export function useClientPcGalleryExtraTabs(searchKeyword = ""): string[] {
  const themeFilter = useClientPcFilterStore((state) => state.themeFilter);
  const colorFilter = useClientPcFilterStore((state) => state.colorFilter);
  const moodFilter = useClientPcFilterStore((state) => state.moodFilter);
  const shapeFilter = useClientPcFilterStore((state) => state.shapeFilter);
  const pointFilter = useClientPcFilterStore((state) => state.pointFilter);
  const todayTrendFilter = useClientPcFilterStore((state) => state.todayTrendFilter);
  const quickChipKeyword = useClientPcFilterStore((state) => state.quickChipKeyword);

  return useMemo(
    () =>
      buildClientPcGalleryExtraTabs(
        {
          themeFilter,
          colorFilter,
          moodFilter,
          shapeFilter,
          pointFilter,
        },
        todayTrendFilter,
        searchKeyword,
        quickChipKeyword,
      ),
    [
      themeFilter,
      colorFilter,
      moodFilter,
      shapeFilter,
      pointFilter,
      todayTrendFilter,
      searchKeyword,
      quickChipKeyword,
    ],
  );
}
