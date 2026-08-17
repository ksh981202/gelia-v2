import { Helmet } from 'react-helmet-async'
import { SITE_ORIGIN } from '@/shared/lib/seoMeta'

type SeoHeadProps = {
  title: string
  description: string
  canonical: string
  ogImage?: string
}

function toAbsoluteUrl(url: string): string {
  const value = String(url ?? '').trim()
  if (!value) return SITE_ORIGIN
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${SITE_ORIGIN}${value}`
  return `${SITE_ORIGIN}/${value}`
}

export function SeoHead({ title, description, canonical, ogImage }: SeoHeadProps) {
  const canonicalUrl = toAbsoluteUrl(canonical)
  const image = ogImage ? toAbsoluteUrl(ogImage) : `${SITE_ORIGIN}/ogimage/og-image.webp`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GELIA" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
