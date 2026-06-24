import { Link } from 'react-router-dom'

export default function ProLandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-stone-100 bg-white p-10 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-semibold tracking-wide text-stone-500">
            ✨ 고객이 더 쉽게 선택하는 네일 상담 도구
          </p>
          <h1 className="mb-8 text-4xl font-bold tracking-tight text-stone-800 md:text-5xl">
            GELIA PRO
          </h1>

          <div className="mb-10 space-y-6 text-base leading-relaxed text-stone-600 md:text-lg">
            <p>
              프리미엄 네일 디자인을 활용해
              <br />
              고객에게 딱 맞는 상담 컬렉션을 만들어보세요.
            </p>
            <p>
              상담 시간은 줄이고,
              <br />
              고객 만족도는 높여보세요.
            </p>
          </div>

          <Link
            to="/login?redirect=/pro"
            className="w-full max-w-sm rounded-xl bg-stone-800 py-4 font-medium text-white shadow-md transition-colors hover:bg-stone-700"
          >
            젤리아 계정으로 PRO 시작하기
          </Link>

          <p className="mt-5 text-xs leading-relaxed text-stone-400">
            기존 젤리아 회원이라면
            <br />
            로그인 후 샵 정보만 입력하면 바로 이용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
