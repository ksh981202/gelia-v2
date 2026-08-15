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



const EXCLUSIVE_FILTER_RESET = {

  ...DEFAULT_FILTERS,

  rankingFilter: "전체",

} as const;



type ExclusiveSidebarFilterKey = ClientPcFilterKey | "rankingFilter";



function applyExclusiveSidebarFilter(

  state: Pick<ClientPcFilterState, ExclusiveSidebarFilterKey>,

  key: ExclusiveSidebarFilterKey,

  option: string,

) {

  const currentValue = state[key];



  if (currentValue === option) {
    return state;
  }



  return {

    ...EXCLUSIVE_FILTER_RESET,

    [key]: option,

  };

}



type ClientPcFilterState = ProGalleryActiveFilters & {

  rankingFilter: string;

  gallerySort: PcGallerySortTab;

  searchKeyword: string;

  quickChipKeyword: string | null;

  toggleFilter: (key: ClientPcFilterKey, option: string) => void;

  toggleRankingFilter: (option: string) => void;

  setGallerySort: (sort: PcGallerySortTab) => void;

  setSearchKeyword: (keyword: string) => void;

  toggleQuickChip: (keyword: string) => void;

  resetFilters: () => void;

};



export const useClientPcFilterStore = create<ClientPcFilterState>((set) => ({

  ...DEFAULT_FILTERS,

  rankingFilter: "전체",

  gallerySort: "최신순",

  searchKeyword: "",

  quickChipKeyword: null,

  toggleFilter: (key, option) => {

    set((state) => applyExclusiveSidebarFilter(state, key, option));

  },

  toggleRankingFilter: (option) => {

    set((state) => applyExclusiveSidebarFilter(state, "rankingFilter", option));

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

      rankingFilter: "전체",

      gallerySort: "최신순",

      searchKeyword: "",

      quickChipKeyword: null,

    }),

}));



function buildClientPcGalleryExtraTabs(

  filters: ProGalleryActiveFilters,

  searchKeyword: string,

  quickChipKeyword: string | null,

): string[] {

  const extraTabs = [...resolveProGalleryQuery(filters).extraTabs];



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

  const rankingFilter = useClientPcFilterStore((state) => state.rankingFilter);

  const quickChipKeyword = useClientPcFilterStore((state) => state.quickChipKeyword);



  return useMemo(

    () => {

      if (rankingFilter !== "전체") return [];



      return buildClientPcGalleryExtraTabs(

        {

          themeFilter,

          colorFilter,

          moodFilter,

          shapeFilter,

          pointFilter,

        },

        searchKeyword,

        quickChipKeyword,

      );

    },

    [

      themeFilter,

      colorFilter,

      moodFilter,

      shapeFilter,

      pointFilter,

      rankingFilter,

      searchKeyword,

      quickChipKeyword,

    ],

  );

}


