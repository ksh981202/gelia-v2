/**
 * Supabase `public` 스키마와 동기화되는 타입 정의.
 * `nail_designs` 테이블은 `supabase/schema.sql` 과 컬럼이 1:1로 대응합니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** `public.nail_designs` 한 행 (DB 스네이크 케이스) */
export type NailDesignRow = {
  id: string
  created_at: string
  title: string
  title_en: string
  image_url: string
  image_r2_key: string
  category: string
  tags: string[]
  tags_en: string[]
  popularity: number
  saves: number
}

/** INSERT (기본값·생성 컬럼은 선택) */
export type NailDesignInsert = {
  id?: string
  created_at?: string
  title: string
  title_en?: string
  image_url: string
  image_r2_key: string
  category: string
  tags?: string[]
  tags_en?: string[]
  popularity?: number
  saves?: number
}

/** UPDATE (부분 갱신) */
export type NailDesignUpdate = Partial<NailDesignInsert>

export type Database = {
  public: {
    Tables: {
      nail_designs: {
        Row: NailDesignRow
        Insert: NailDesignInsert
        Update: NailDesignUpdate
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
