import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PRIVACY_EFFECTIVE_DATE = '2026년 4월 20일'

export default function ClientPrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 w-full max-w-md items-center border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-50"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[17px] font-bold text-gray-900 pr-10">
          개인정보 처리방침
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14 leading-relaxed">
        <div className="mb-8 text-sm text-gray-500">시행일: {PRIVACY_EFFECTIVE_DATE}</div>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제1조 (개인정보의 처리 목적)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`젤리아 스튜디오(이하 "회사")는 다음의 목적을 위하여 최소한의 개인정보를 수집 및 처리합니다. 수집된 개인정보는 다음의 목적 이외의 용도로는 사용되지 않습니다.
① 회원 가입 및 관리: 회원 식별, 서비스 부정이용 방지, 가입 의사 확인
② 서비스 제공: 네일 디자인 검색 및 추천, 좋아요 및 저장 기능 제공, 맞춤형 큐레이션 서비스
③ 마케팅 및 광고에의 활용: 신규 서비스 및 이벤트 정보 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제2조 (수집하는 개인정보의 항목)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.
① 필수항목: 이메일 주소, 비밀번호, 닉네임(이름)
(※ 회원의 비밀번호는 원래 상태로 알아낼 수 없도록 강력하게 암호화되어 저장되므로, 회사 및 관리자는 고객님의 진짜 비밀번호를 절대 알 수 없으며 따로 수집·보관하지 않습니다.)
② 선택항목: 프로필 이미지, 관심 네일 스타일(퍼스널 진단 결과)
③ 자동 수집 항목: 서비스 이용 기록(검색어, 좋아요, 저장 내역), 접속 로그, 쿠키, 기기 정보`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제3조 (개인정보의 보유 및 이용 기간)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`회사는 원칙적으로 회원의 탈퇴 등 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관합니다.
① 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)
② 웹사이트 방문 기록: 3개월 (통신비밀보호법)`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제4조 (개인정보의 제3자 제공 및 위탁)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사는 회원의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 회원의 사전 동의 없이는 원칙적으로 외부에 제공하지 않습니다.
② 회사는 현재 개인정보 처리를 외부 업체에 위탁하지 않고 있으며, 향후 서비스 향상을 위해 위탁이 필요할 경우 사전에 공지하고 동의를 받습니다.`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제5조 (정보주체의 권리 및 행사 방법)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회원은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 서비스 가입 해지(회원 탈퇴)를 요청할 수 있습니다.
② 개인정보 조회, 수정, 탈퇴는 애플리케이션 내 '마이페이지' 또는 '설정' 메뉴를 통해 직접 처리할 수 있습니다.`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제6조 (개인정보의 파기 절차 및 방법)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 파기 절차: 회원이 입력한 정보는 목적 달성 후 내부 방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.
② 파기 방법: 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 안전하게 삭제합니다.`}
          </p>
        </section>

        <section>
          <h2 className="mb-3 mt-8 text-base font-bold text-gray-900">제7조 (개인정보 보호책임자)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
① 책임자: 젤리아 개인정보 보호책임자
② 이메일: k981202@naver.com

부칙
본 개인정보 처리방침은 2026년 4월 20일부터 적용됩니다.`}
          </p>
        </section>
      </main>
    </div>
  )
}
