import { ArrowLeft, Clock, Share2, BookmarkPlus, ChevronRight, Scale, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalMagazineDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans w-full absolute top-0 left-0 z-50">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-[14px] font-bold text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO MAGAZINE
          </button>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"><BookmarkPlus className="h-4 w-4" /></button>
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"><Share2 className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <article className="pb-32">
        {/* 2. Article Header */}
        <header className="max-w-3xl mx-auto px-5 pt-12 md:pt-20 pb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="px-3 py-1.5 text-[12px] font-bold tracking-widest text-[#9333EA] bg-purple-50 rounded-md uppercase">PERFECT FIT</span>
            <span className="text-stone-300">|</span>
            <span className="text-[12px] font-bold tracking-widest text-stone-500 uppercase">Shape Guide</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-stone-900 leading-[1.25] tracking-tight mb-8 break-keep">
            내 손톱에 찰떡인 쉐입은? 아몬드(Almond) vs 스퀘어(Square) 전격 비교
          </h1>
          <div className="flex items-center justify-center gap-4 text-[13px] font-bold text-stone-400 uppercase tracking-widest">
            <span>By GELIA EDITOR</span>
            <span>•</span>
            <span>Jul 15, 2026</span>
            <span>•</span>
            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> 6 min read</span>
          </div>
        </header>

        {/* 3. Hero Image (A vs B 분할 느낌의 메인 이미지) */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="w-full aspect-[16/9] overflow-hidden rounded-[2rem] bg-stone-200 shadow-xl relative">
            <img src="https://picsum.photos/seed/vs_hero/1200/800" alt="아몬드 vs 스퀘어 네일 메인" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white">
                <span className="font-black text-stone-900 tracking-wider">ALMOND</span>
                <span className="text-[#9333EA] font-black text-xl italic">VS</span>
                <span className="font-black text-stone-900 tracking-wider">SQUARE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Article Body (VS Compare Style) */}
        <div className="max-w-2xl mx-auto px-5 text-[16px] md:text-[18px] leading-[1.8] text-stone-700 break-keep">
          
          {/* 서론: 문제 제기 */}
          <p className="text-[20px] md:text-[22px] font-medium text-stone-900 leading-relaxed mb-6 text-center">
            "원장님, 저한테는 어떤 손톱 모양이 어울려요?"
          </p>
          <p className="mb-12 text-center text-[15px] md:text-[17px] text-stone-500">
            네일샵에서 가장 많이 듣는 질문 1위입니다. 똑같은 컬러를 발라도 쉐입(Shape)이 다르면 분위기가 180도 달라집니다. 오늘은 네일 디자인의 뼈대이자, 전체적인 손의 실루엣을 결정짓는 양대 산맥! 여성스러운 '아몬드'와 세련된 '스퀘어' 쉐입을 철저하게 비교 분석해 드립니다.
          </p>

          <div className="w-full h-px bg-stone-200 my-16"></div>

          {/* TYPE A: 아몬드 쉐입 */}
          <div className="mb-24">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 flex items-center">
              <span className="bg-[#9333EA] text-white px-3 py-1 rounded-lg mr-3 text-xl">Type A</span>
              아몬드 (Almond Shape)
            </h2>
            <div className="aspect-[3/4] md:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-stone-100 shadow-lg mb-8">
              <img src="https://picsum.photos/seed/vs_almond/800/600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="아몬드 쉐입 네일" />
            </div>
            <p className="mb-6 font-medium text-[18px] text-stone-900">
              견과류 아몬드처럼 끝으로 갈수록 부드럽게 뾰족해지는 형태입니다. 최근 셀럽들과 화보에서 가장 많이 등장하는 트렌드의 중심에 서 있죠.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start bg-stone-50 p-4 rounded-xl">
                <Check className="h-5 w-5 text-[#9333EA] mr-3 shrink-0 mt-0.5" />
                <span><strong>가장 큰 장점 (착시 효과):</strong> 손가락이 짧거나 통통한 분들에게 구세주 같은 쉐입입니다. 끝이 모이기 때문에 시선이 길게 연장되어 손가락이 최소 1.5배는 얇고 길어 보이는 엄청난 착시 효과를 줍니다.</span>
              </li>
              <li className="flex items-start bg-stone-50 p-4 rounded-xl">
                <Check className="h-5 w-5 text-[#9333EA] mr-3 shrink-0 mt-0.5" />
                <span><strong>찰떡 추천 아트:</strong> 여리여리한 느낌을 극대화하는 투명한 시럽 네일, 은은한 마그넷(자석) 네일, 그리고 쉐입 자체의 섹시함을 살려주는 강렬한 풀컬러 레드나 블랙과 완벽하게 어울립니다.</span>
              </li>
            </ul>
          </div>

          {/* TYPE B: 스퀘어 쉐입 */}
          <div className="mb-24">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 flex items-center">
              <span className="bg-stone-900 text-white px-3 py-1 rounded-lg mr-3 text-xl">Type B</span>
              스퀘어 (Square Shape)
            </h2>
            <div className="aspect-[3/4] md:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-stone-100 shadow-lg mb-8">
              <img src="https://picsum.photos/seed/vs_square/800/600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="스퀘어 쉐입 네일" />
            </div>
            <p className="mb-6 font-medium text-[18px] text-stone-900">
              네모 반듯하게 양 끝각을 살린 클래식의 정석입니다. 최근에는 각을 살짝 둥글게 굴린 '스퀘어 오프(Square-off)' 형태로 세련된 오피스 우먼들의 절대적인 지지를 받고 있습니다.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start bg-stone-50 p-4 rounded-xl">
                <Check className="h-5 w-5 text-stone-900 mr-3 shrink-0 mt-0.5" />
                <span><strong>가장 큰 장점 (안정감과 내구성):</strong> 힘을 받는 면적이 넓어서 컴퓨터 타이핑을 많이 하거나 손을 자주 쓰는 분들에게 가장 부러질 위험이 적고 튼튼한 쉐입입니다. 단정하고 프로페셔널한 느낌을 줍니다.</span>
              </li>
              <li className="flex items-start bg-stone-50 p-4 rounded-xl">
                <Check className="h-5 w-5 text-stone-900 mr-3 shrink-0 mt-0.5" />
                <span><strong>찰떡 추천 아트:</strong> 네모난 끝 라인을 강조하는 깔끔한 '일자 프렌치 네일'이나, 힙하고 도회적인 무드의 무광(Matte) 네일, 그리고 Y2K 감성의 체커보드 아트와 기가 막힌 궁합을 자랑합니다.</span>
              </li>
            </ul>
          </div>

          {/* 결론: 나를 위한 최종 선택 (VS 요약) */}
          <div className="mt-16 bg-gradient-to-br from-[#9333EA] to-indigo-600 p-8 md:p-12 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <Scale className="absolute -top-10 -right-10 h-64 w-64 text-white opacity-10" />
            <h3 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center relative z-10">
              그래서, 내 손에는 뭐가 맞을까?
            </h3>
            <div className="space-y-6 text-[15px] md:text-[16px] leading-relaxed relative z-10">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="font-bold text-amber-300 mb-2 text-[18px]">✅ 이런 분들은 무조건 '아몬드'를 선택하세요!</p>
                <p>손가락이 조금 통통하거나 바디가 짧아 고민이신 분, 화려하고 여성스러운 스타일을 즐겨 입으시는 분, 손가락이 여리여리하게 1.5배 길어 보이는 착시 효과를 원하시는 분.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="font-bold text-cyan-300 mb-2 text-[18px]">✅ 이런 분들은 무조건 '스퀘어'를 선택하세요!</p>
                <p>평소 자판을 많이 치는 직장인, 모던하고 미니멀한 룩(슬랙스, 셔츠)을 선호하시는 분, 프렌치 아트나 힙한 디자인을 자주 하시는 분.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 5. CTA */}
        <div className="max-w-4xl mx-auto px-5 mt-20">
          <div className="bg-stone-900 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-[#9333EA] opacity-20 rounded-full blur-3xl"></div>
            <h3 className="text-3xl md:text-4xl font-black mb-5 relative z-10">내 손톱 모양에 맞는 디자인, AI가 찾아드릴게요</h3>
            <p className="text-stone-400 mb-10 text-[16px] md:text-[18px] max-w-2xl mx-auto relative z-10 break-keep">
              아직도 고민되시나요? GELIA 앱에서 내 손톱 쉐입만 선택하면, 수만 개의 네일 사진 중 찰떡같이 어울리는 디자인만 쏙쏙 뽑아 무료로 큐레이션 해드립니다.
            </p>
            <button className="relative z-10 inline-flex items-center justify-center bg-[#9333EA] text-white font-black px-10 py-5 rounded-full hover:scale-105 hover:shadow-purple-500/50 transition-all text-[16px] shadow-lg">
              내 쉐입에 맞는 네일 추천받기 <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
