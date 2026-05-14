import { useEffect } from 'react'
import { useNavigationType } from 'react-router-dom'

const POLL_MS = 100
const POLL_MAX = 48
const MIN_RESTORE_DELTA_PX = 50

/**
 * 리스트 무한 스크롤 세션 키: pathname + search 그대로 조합 (탭 오염 방지).
 */
export function listInfiniteKey(pathname: string, search: string): string {
  const q = search.startsWith('?') ? search.slice(1) : search
  return `gelia:listScroll:v1|${pathname}?${q}`
}

/**
 * 절대 헌법 5조: POP 복구, 50px 미만 이동 무시, 최대 48회(100ms) 폴링 후 scrollTo.
 * 떠날 때 sessionStorage에 스크롤 Y 저장.
 */
export function useListScrollRestore(listKey: string) {
  const navigationType = useNavigationType()

  useEffect(() => {
    const key = listKey
    return () => {
      try {
        sessionStorage.setItem(key, String(window.scrollY))
      } catch {
        // storage full / disabled
      }
    }
  }, [listKey])

  useEffect(() => {
    if (navigationType !== 'POP') return

    let saved: number | null = null
    try {
      const raw = sessionStorage.getItem(listKey)
      if (raw != null) {
        const n = Number.parseInt(raw, 10)
        if (!Number.isNaN(n)) saved = n
      }
    } catch {
      return
    }
    if (saved == null) return

    const currentY = window.scrollY
    if (Math.abs(saved - currentY) < MIN_RESTORE_DELTA_PX) {
      return
    }

    let attempts = 0
    let cancelled = false

    const id = window.setInterval(() => {
      if (cancelled) return
      attempts += 1
      const doc = document.documentElement
      const target = saved ?? 0
      const tallEnough =
        doc.scrollHeight >= target + window.innerHeight * 0.35
      const force = attempts >= POLL_MAX

      if (tallEnough || force) {
        window.scrollTo({ top: target, left: 0, behavior: 'auto' })
        window.clearInterval(id)
      }
    }, POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [listKey, navigationType])
}
