import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from '../../../shared/api/supabaseClient'
import { getR2S3Client } from '../../../shared/api/r2Client'
import { compressImageForUpload, toWebpFilename } from '../compressImageForUpload'
import type { CsvDesignRow } from '../csvTypes'
import {
  parseCsvTagList,
  resolveStylesEnFromCsv,
  resolveStylesFromCsv,
} from '../parseCsvTagList'
import type { NailDesignInsert } from '../../../shared/types/database.types'

const R2_BUCKET = 'gelia-images'

function buildPublicImageUrl(imageR2Key: string): string {
  const base = (import.meta.env.VITE_R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  if (!base) {
    throw new Error('VITE_R2_PUBLIC_URL이 설정되어 있지 않습니다.')
  }
  const path = imageR2Key
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  return `${base}/${path}`
}

function safeFileStem(name: string): string {
  const base = name.replace(/^.*[/\\]/, '')
  const cleaned = base.replace(/[^\w.-]+/g, '_')
  return (cleaned || 'image').slice(0, 120)
}

export async function uploadToR2(file: File): Promise<{
  image_r2_key: string
  image_url: string
}> {
  const compressed = await compressImageForUpload(file)
  const s3 = getR2S3Client()
  const image_r2_key = `uploads/${crypto.randomUUID()}_${safeFileStem(compressed.name)}`
  const body = new Uint8Array(await compressed.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: image_r2_key,
      Body: body,
      ContentType: 'image/webp',
    }),
  )

  const image_url = buildPublicImageUrl(image_r2_key)
  return { image_r2_key, image_url }
}

export async function deleteFromR2(imageR2Key: string): Promise<void> {
  const key = imageR2Key.trim()
  if (!key) return
  const s3 = getR2S3Client()
  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  )
}

/** CSV V1 상세 → Supabase insert (필드 1:1, category/tags는 레거시 최소값만) */
export function buildNailInsertFromCsv(
  csv: CsvDesignRow,
  image_url: string,
  image_r2_key: string,
): NailDesignInsert {
  const title = csv.title.trim() || csv.image_filename
  const title_en = csv.title_en.trim() || title

  return {
    title,
    title_en,
    image_url,
    image_r2_key,
    source_filename: toWebpFilename(csv.image_filename.trim()),
    description: csv.description,
    description_en: csv.description_en,
    color: csv.color,
    color_en: csv.color_en,
    nail_length: csv.nail_length,
    length_en: csv.length_en,
    hand_type: csv.hand_type,
    hand_type_en: csv.hand_type_en,
    mood: csv.mood,
    mood_en: csv.mood_en,
    situations: parseCsvTagList(csv.situations),
    occasion_en: parseCsvTagList(csv.occasion_en),
    styles: resolveStylesFromCsv(csv),
    styles_en: resolveStylesEnFromCsv(csv),
    design_technique: csv.design_technique,
    technique_en: csv.technique_en,
    design_elements: csv.design_elements,
    design_point_en: csv.design_point_en,
    procedure_guide: csv.procedure_guide,
    guide_en: csv.guide_en,
    category: csv.mood.trim() || csv.color.trim() || '미분류',
    tags: [],
    tags_en: [],
    popularity: 0,
    saves: 0,
  }
}

export async function insertToSupabase(
  data: NailDesignInsert,
): Promise<{ id: string }> {
  const { data: row, error } = await supabase
    .from('nail_designs')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }
  if (!row?.id) {
    throw new Error('Supabase insert 응답에 id가 없습니다.')
  }
  return { id: row.id as string }
}
