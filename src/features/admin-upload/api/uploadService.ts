import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from '../../../shared/api/supabaseClient'
import { getR2S3Client } from '../../../shared/api/r2Client'
import type { CsvDesignRow } from '../csvTypes'
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
  const s3 = getR2S3Client()
  const image_r2_key = `uploads/${crypto.randomUUID()}_${safeFileStem(file.name)}`
  const body = new Uint8Array(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: image_r2_key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
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

function parseTagsCell(raw: string): string[] {
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function buildNailInsertFromCsv(
  csv: CsvDesignRow,
  image_url: string,
  image_r2_key: string,
): NailDesignInsert {
  const tags = parseTagsCell(csv.tags)
  const title = csv.title.trim() || csv.image_filename
  const title_en = (csv.title_en ?? '').trim() || title
  return {
    title,
    title_en,
    image_url,
    image_r2_key,
    category: csv.category.trim() || '미분류',
    tags,
    tags_en: tags.length > 0 ? tags : [],
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
