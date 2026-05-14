/** CSV 한 행 (Supabase 적재 전 단계) */
export type CsvDesignRow = {
  image_filename: string
  title: string
  category: string
  tags: string
  title_en?: string
}

export type MatchedRow = {
  csv: CsvDesignRow
  imageFile: File | null
  matched: boolean
}
