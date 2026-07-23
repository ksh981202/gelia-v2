import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

type ErrorFallbackViewProps = {
  detail?: string
}

/** Router / Boundary 공용 UI — Link 대신 <a>로 Router 컨텍스트 의존 최소화 */
function ErrorFallbackView({ detail }: ErrorFallbackViewProps) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#fdfaf7] px-6 py-16 text-center">
      <p className="mb-2 text-sm font-semibold tracking-wide text-stone-500">GELIA</p>
      <h1 className="mb-3 text-xl font-bold text-stone-900 md:text-2xl">
        일시적인 오류가 발생했습니다
      </h1>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-stone-600">
        새로고침을 누르거나 홈으로 이동해 주세요.
      </p>
      {detail ? (
        <p className="mb-6 max-w-lg break-words rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-xs text-stone-400">
          {detail}
        </p>
      ) : null}
      <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-stone-900 px-5 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
        >
          새로고침
        </button>
        <a
          href="/"
          className="rounded-xl border border-stone-200 bg-white px-5 py-3.5 text-[15px] font-bold text-stone-800 transition-colors hover:bg-stone-50"
        >
          홈으로 이동
        </a>
      </div>
    </div>
  )
}

function formatRouteError(error: unknown): string | undefined {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim()
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return undefined
}

/** React Router `errorElement`용 — 라우트 렌더/로더 예외 방어 */
export default function GlobalErrorFallback() {
  const error = useRouteError()
  return <ErrorFallbackView detail={import.meta.env.DEV ? formatRouteError(error) : undefined} />
}

type AppErrorBoundaryState = { hasError: boolean; message?: string }

/** RouterProvider 바깥·미처리 렌더 예외 방어 (클래스 Error Boundary) */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error?.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackView
          detail={import.meta.env.DEV ? this.state.message : undefined}
        />
      )
    }
    return this.props.children
  }
}
