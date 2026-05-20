import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TERMS_EFFECTIVE_DATE = '2026년 4월 20일'

export default function ClientTermsPage() {
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
          서비스 이용약관
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14 leading-relaxed">
        <div className="mb-6 text-right text-sm text-gray-500">시행일: {TERMS_EFFECTIVE_DATE}</div>
        <section>
          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제1조 (목적)</h2>
          <p className="text-sm text-gray-600">
            본 약관은 젤리아 스튜디오(이하 &quot;회사&quot;)가 제공하는 젤리아 애플리케이션 및 관련
            서비스(이하 &quot;서비스&quot;)를 이용함에 있어 회사와 회원 간의 권리, 의무, 책임사항 및
            서비스 이용 조건 등을 규정함을 목적으로 합니다.
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제2조 (용어의 정의)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① "서비스"란 단말기(PC, 휴대형 단말기 등)와 상관없이 회원이 이용할 수 있는 젤리아 관련 모든 서비스를 의미합니다.
② "회원"이란 서비스에 접속하여 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
③ "콘텐츠"란 회사가 서비스 내에 제공하는 네일 디자인 사진, 텍스트, 이미지, 정보 등 일체의 결과물을 의미합니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 또는 고객센터 공지사항에 게시합니다.
② 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
③ 약관이 개정될 경우, 회사는 적용일자 및 개정사유를 명시하여 적용일자 7일 전부터 서비스 내에 공지합니다. 단, 회원에게 불리한 변경의 경우 30일 전에 공지합니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제4조 (서비스의 제공 및 변경)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사는 회원에게 네일 디자인 갤러리 검색, 트렌드 정보 제공, 좋아요 및 저장 기능 등의 서비스를 제공합니다.
② 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제5조 (서비스 내 광고 게재)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사는 서비스의 운영과 관련하여 서비스 화면, 홈페이지 등에 광고를 게재할 수 있습니다.
② 회원이 서비스상에 게재되어 있는 광고를 이용하거나 판촉 활동에 참여하는 것은 전적으로 회원과 광고주 간의 법률관계이며, 회사는 이로 인해 발생하는 손실 또는 손해에 대해 책임을 지지 않습니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제6조 (회원의 의무)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회원은 서비스를 이용할 때 다음 각 호의 행위를 하여서는 안 됩니다.
1. 타인의 정보(이메일 등)를 도용하는 행위
2. 회사가 게시한 정보를 무단으로 변경하거나 상업적으로 이용하는 행위
3. 회사와 기타 제3자의 저작권 등 지적재산권을 침해하는 행위
4. 매크로, 봇(Bot), 크롤러 등 자동화된 수단을 이용하여 서비스의 데이터를 무단으로 수집(스크래핑)하는 행위
5. 서비스의 안정적 운영을 방해할 목적으로 다량의 정보를 전송하거나 시스템을 교란하는 행위
② 회원이 위 의무를 위반할 경우, 회사는 해당 회원의 서비스 이용을 제한하거나 계정을 정지할 수 있으며, 민형사상의 법적 조치를 취할 수 있습니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제7조 (저작권의 귀속 및 이용제한)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사가 작성하여 제공하는 모든 콘텐츠(네일 사진, 텍스트, UI/UX 디자인 등)에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.
② 회원은 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
③ 회원은 서비스 내의 디자인을 개인적인 네일 시술 참고용으로만 활용할 수 있습니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제8조 (면책 조항)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사는 천재지변, 서버 장애, 통신망 오류 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
② 회사는 서비스 내에서 제공되는 네일 디자인 및 텍스트 정보의 완전성이나 정확성을 보증하지 않습니다.
③ 회원은 서비스의 네일 디자인을 참고하여 실제 시술을 받을 때, 사용되는 재료, 조명, 사용자의 손톱 상태 등에 따라 앱의 이미지와 실제 결과물이 다를 수 있음을 인지하며, 회사는 이로 인해 발생하는 결과에 대해 책임을 지지 않습니다.`}
          </p>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">제9조 (준거법 및 재판관할)</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {`① 회사와 회원 간에 제기된 소송에는 대한민국 법을 적용합니다.
② 회사와 회원 간에 발생한 분쟁에 관한 소송은 회사의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다.`}
          </p>

          <p className="mt-6 whitespace-pre-wrap text-sm text-gray-600">
            {`부칙
본 약관은 2026년 4월 20일부터 시행됩니다.`}
          </p>
        </section>
      </main>
    </div>
  )
}
