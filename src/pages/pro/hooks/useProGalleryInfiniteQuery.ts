import {
  applyGallerySort,
  buildTabOrFilter,
  DEFAULT_GALLERY_SORT,
  DEFAULT_GALLERY_TAB,
  GALLERY_COLUMNS,
  GALLERY_PAGE_SIZE,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import { supabase } from "@/shared/api/supabaseClient";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useInfiniteQuery } from "@tanstack/react-query";

export type ProGalleryFilters = {
  color: string;
  mood: string | null;
  shape: string | null;
};

export const DEFAULT_PRO_GALLERY_FILTERS: ProGalleryFilters = {
  color: DEFAULT_GALLERY_TAB,
  mood: null,
  shape: null,
};

function collectActiveFilterTabs(filters: ProGalleryFilters): string[] {
  const tabs: string[] = [];

  if (filters.color && filters.color !== DEFAULT_GALLERY_TAB) {
    tabs.push(filters.color);
  }
  if (filters.mood) {
    tabs.push(filters.mood);
  }
  if (filters.shape) {
    tabs.push(filters.shape);
  }

  return tabs;
}

export function useProGalleryInfiniteQuery(filters: ProGalleryFilters) {
  const activeFilterTabs = collectActiveFilterTabs(filters);

  return useInfiniteQuery({
    queryKey: ["nail-designs", "pro", "gallery", "infinite", filters],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const page = pageParam as number;
      const from = (page - 1) * GALLERY_PAGE_SIZE;
      const to = page * GALLERY_PAGE_SIZE - 1;

      let query = supabase.from("nail_designs").select(GALLERY_COLUMNS);

      for (const tab of activeFilterTabs) {
        const orFilter = buildTabOrFilter(tab);
        if (orFilter) query = query.or(orFilter);
      }

      query = applyGallerySort(query, DEFAULT_GALLERY_SORT);

      const { data, error } = await query.range(from, to).abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as NailDesignRow[];
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < GALLERY_PAGE_SIZE) return undefined;
      return (lastPageParam as number) + 1;
    },
  });
}
