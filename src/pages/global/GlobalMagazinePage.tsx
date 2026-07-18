import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ChevronRight, BookOpen, Heart, Check } from 'lucide-react';

// --- 구글 SEO 맞춤 대카테고리 ---
const CATEGORIES = [
  { id: 'all', name: 'HOME', desc: 'GELIA GLOBAL EDITORIAL' },
  { id: 'trends', name: 'TRENDS & DESIGNS', desc: '트렌드 & 디자인 분석' },
  { id: 'occasion', name: 'BY OCCASION', desc: '상황별 TPO 추천' },
  { id: 'seasonal', name: 'SEASONAL & TONE', desc: '계절 & 퍼스널 컬러 맞춤' },
  { id: 'fit', name: 'PERFECT FIT', desc: '쉐입 & 콤플렉스 해결' },
  { id: 'clinic', name: 'NAIL CLINIC', desc: '전문 케어 & 꿀팁' }
];

// --- 카테고리별 중카테고리 (서브 필터 - 무결점 V2) ---
const SUB_CATEGORIES: Record<string, string[]> = {
  trends: [
    '2026 Trends', 
    'French & Classic', 
    'Chrome & Glazed', 
    'Syrup & Jelly',
    'Gradient & Ombre',
    'Art & Drawing',
    '3D & Parts',
    'Magnet & Velvet'
  ],
  occasion: [
    'Daily & Office', 
    'Wedding & Bridal', 
    'Vacation & Travel', 
    'Party & Festival'
  ],
  seasonal: [
    'Spring / Summer', 
    'Autumn / Winter', 
    'Cool Tone Match', 
    'Warm Tone Match'
  ],
  fit: [
    'Short Nails', 
    'Almond & Oval', 
    'Square & Coffin'
  ],
  clinic: [
    'Gel Maintenance', 
    'Damage Care', 
    'Hand & Cuticle'
  ]
};

// --- SEO 최적화 전문 기사 더미 데이터 (3:4 세로형 이미지) ---
const MOCK_ARTICLES = [
  { id: 1, category: 'SEASONAL & TONE', subCategory: 'Cool Tone Match', title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', excerpt: '단순한 핑크가 아닙니다. 피부톤을 환하게 형광등 켜주는 특유의 쿨톤 맞춤 시럽 텍스처와 올여름 가장 주목받는 디자인을 분석합니다.', image: 'https://picsum.photos/seed/nail1/600/800', date: 'Jul 10, 2026', readTime: '3 min read' },
  { id: 2, category: 'BY OCCASION', subCategory: 'Daily & Office', title: '오피스룩에 찰떡! 단정하면서도 고급스러운 미니멀 프렌치 모음', excerpt: '튀지 않으면서도 세련된 무드를 연출하고 싶다면? 성공적인 커리어우먼의 손끝을 완성하는 스텔스 럭셔리 네일 아트를 소개합니다.', image: 'https://picsum.photos/seed/nail2/600/800', date: 'Jul 08, 2026', readTime: '4 min read' },
  { id: 3, category: 'TRENDS & DESIGNS', subCategory: 'Chrome & Glazed', title: '2026년 하반기를 휩쓸 크롬 네일 디자인 BEST 5', excerpt: '은은한 진주빛부터 강렬한 메탈릭까지. 빛의 각도에 따라 오묘하게 변하는 크롬 네일의 매력과 추천 디자인을 확인하세요.', image: 'https://picsum.photos/seed/nail3/600/800', date: 'Jul 05, 2026', readTime: '5 min read' },
  { id: 4, category: 'NAIL CLINIC', subCategory: 'Gel Maintenance', title: '네일샵 원장님이 안 알려주는 젤 네일 4주 유지 시크릿 비법', excerpt: '끝이 들뜨고 금방 떨어져서 고민이셨나요? 집에서도 쉽게 따라 할 수 있는 젤 네일 유지력 극대화 홈케어 루틴을 대공개합니다.', image: 'https://picsum.photos/seed/nail4/600/800', date: 'Jul 02, 2026', readTime: '3 min read' },
  { id: 5, category: 'PERFECT FIT', subCategory: 'Short Nails', title: '짧고 뭉툭한 손톱도 길어 보이는 마법의 라운드 쉐입 아트', excerpt: '물어뜯는 손톱, 짧은 바디도 문제없습니다. 시각적인 착시 효과로 손가락을 얇고 길어 보이게 만드는 최적의 네일 쉐입과 컬러 배치를 제안합니다.', image: 'https://picsum.photos/seed/nail5/600/800', date: 'Jun 28, 2026', readTime: '4 min read' }
];

const MOCK_TRENDS = [
  { id: 101, title: 'Glass Syrup', image: 'https://picsum.photos/seed/t1/600/800', height: 'h-[250px] md:h-[300px]' },
  { id: 102, title: 'White French', image: 'https://picsum.photos/seed/t2/600/600', height: 'h-[200px] md:h-[250px]' },
  { id: 103, title: 'Mermaid Chrome', image: 'https://picsum.photos/seed/t3/600/900', height: 'h-[300px] md:h-[400px]' },
  { id: 104, title: 'Blush Ombre', image: 'https://picsum.photos/seed/t4/600/700', height: 'h-[280px] md:h-[350px]' },
  { id: 105, title: '3D Ribbon', image: 'https://picsum.photos/seed/t5/600/800', height: 'h-[320px] md:h-[380px]' },
  { id: 106, title: 'Magnet Aura', image: 'https://picsum.photos/seed/t6/600/600', height: 'h-[240px] md:h-[280px]' },
  { id: 107, title: 'Y2K Silver', image: 'https://picsum.photos/seed/t7/600/900', height: 'h-[360px] md:h-[420px]' },
  { id: 108, title: 'Glazed Donut', image: 'https://picsum.photos/seed/t8/600/700', height: 'h-[280px] md:h-[320px]' },
];

const MOCK_OCCASIONS = [
  { id: 201, subCategory: 'Wedding & Bridal', title: '순백의 드레스에 가장 완벽하게 어울리는 웨딩 네일 클래식', excerpt: '일생에 단 한 번뿐인 순간, 당신의 손끝을 가장 우아하게 빛내줄 웨딩 네일의 정석. 과한 화려함보다는 본연의 아름다움을 살려주는 디자인을 제안합니다.', image: 'https://picsum.photos/seed/occ1/800/1000', readTime: '5 min read', date: 'Jul 15, 2026' },
  { id: 202, subCategory: 'Daily & Office', title: '키보드 위에서도 당당하게, 프로페셔널 오피스 네일 가이드', excerpt: '단정함을 잃지 않으면서도 나만의 개성을 은근히 드러내는 방법. 보수적인 오피스 환경에서도 환영받는 스텔스 럭셔리 네일 스타일링의 모든 것.', image: 'https://picsum.photos/seed/occ2/800/1000', readTime: '4 min read', date: 'Jul 12, 2026' },
  { id: 203, subCategory: 'Vacation & Travel', title: '에메랄드빛 바다를 손끝에, 완벽한 휴양지 바캉스 네일', excerpt: '뜨거운 태양 아래서 더욱 빛을 발하는 비비드 컬러와 영롱한 글리터의 조합. 여행지 인생샷을 200% 보장하는 화려한 트로피컬 무드를 확인하세요.', image: 'https://picsum.photos/seed/occ3/800/1000', readTime: '6 min read', date: 'Jul 09, 2026' },
];

const MOCK_SEASONAL = [
  { id: 301, mood: 'Cool Tone Match', title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽', desc: '푸른 기가 도는 핑크 베이스로 피부의 노란 기를 잡아주고 투명함을 극대화하는 쿨톤 맞춤 컬러 팔레트. 손끝에 물방울이 맺힌 듯한 영롱함을 선사합니다.', colors: ['#FDF2F8', '#FBCFE8', '#F472B6', '#BE185D'], images: ['https://picsum.photos/seed/seas1/600/800', 'https://picsum.photos/seed/seas2/600/800'] },
  { id: 302, mood: 'Autumn / Winter', title: '가을 웜톤을 위한 우아한 딥 브라운 무드', desc: '찬 바람이 불기 시작할 때 가장 먼저 생각나는 컬러. 톤 다운된 베이지와 딥 브라운의 조합으로 고급스럽고 따뜻한 가을의 질감을 손끝에 입혀보세요.', colors: ['#FFFBEB', '#FDE68A', '#D97706', '#78350F'], images: ['https://picsum.photos/seed/seas3/600/800', 'https://picsum.photos/seed/seas4/600/800'] },
  { id: 303, mood: 'Spring / Summer', title: '봄의 생기를 담은 파스텔 피치 코랄', desc: '햇살 가득한 봄날의 피크닉을 연상케 하는 생기 발랄한 컬러. 웜톤, 쿨톤 구애받지 않고 누구에게나 사랑스럽게 어울리는 베스트셀러 팔레트입니다.', colors: ['#FFF1F2', '#FECDD3', '#FB7185', '#E11D48'], images: ['https://picsum.photos/seed/seas5/600/800', 'https://picsum.photos/seed/seas6/600/800'] }
];

const MOCK_FIT = [
  { id: 401, shape: 'Almond & Oval', title: '손가락이 1.5배 길어 보이는 우아한 아몬드 쉐입', desc: '끝으로 갈수록 부드럽게 좁아지는 형태. 손가락이 짧거나 통통한 분들에게 완벽한 착시 효과를 주며, 여성스럽고 화려한 아트와 가장 잘 어울립니다.', tags: ['여성스러운', '길어보이는', '시럽/글리터 추천'], images: ['https://picsum.photos/seed/fit1/600/800', 'https://picsum.photos/seed/fit2/600/400', 'https://picsum.photos/seed/fit3/600/400'] },
  { id: 402, shape: 'Square & Coffin', title: '도회적이고 세련된 무드의 정석, 스퀘어 쉐입', desc: '네모 반듯한 각을 살려 프로페셔널한 느낌을 줍니다. 표면적이 넓어 내구성이 좋으며, 프렌치 네일이나 힙한 체커보드, 매트(무광) 디자인과 찰떡궁합입니다.', tags: ['세련된', '튼튼한내구성', '프렌치/무광 추천'], images: ['https://picsum.photos/seed/fit4/600/800', 'https://picsum.photos/seed/fit5/600/400', 'https://picsum.photos/seed/fit6/600/400'] },
  { id: 403, shape: 'Short Nails', title: '짧고 뭉툭한 손톱도 트렌디하게, 숏 네일 가이드', desc: '손톱을 기르기 힘들거나 물어뜯는 습관이 있어도 걱정 마세요. 숏 네일만의 귀엽고 팝(Pop)한 매력을 극대화하는 컬러 배치와 라운드 쉐입 스타일링을 제안합니다.', tags: ['귀여운', '일상생활편리', '팝컬러/드로잉 추천'], images: ['https://picsum.photos/seed/fit7/600/800', 'https://picsum.photos/seed/fit8/600/400', 'https://picsum.photos/seed/fit9/600/400'] }
];

export default function GlobalMagazinePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  const currentCatInfo = CATEGORIES.find(c => c.id === activeCategory);
  
  // 첫 번째 글을 Hero로, 나머지를 리스트로 (실무에선 필터링 적용)
  const heroArticle = MOCK_ARTICLES[0];
  const listArticles = MOCK_ARTICLES.slice(1);

  return (
    <div className="min-h-screen bg-white font-sans w-full absolute top-0 left-0 z-50">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-stone-900 shrink-0 uppercase flex items-center cursor-pointer" onClick={() => {setActiveCategory('all'); setActiveSubCategory(null);}}>
            GELIA<span className="font-light text-stone-400 ml-1">EDITORIAL</span>
          </h1>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search articles, trends, tips..." 
              className="w-full h-10 pl-11 pr-4 bg-stone-100 rounded-full text-[14px] font-medium text-stone-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#9333EA]/30 transition-all"
            />
          </div>
        </div>

        {/* 대카테고리 네비게이션 */}
        <div className="w-full overflow-x-auto scrollbar-hide border-t border-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-12">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => { setActiveCategory(cat.id); setActiveSubCategory(null); }}
                className={`text-[12px] font-bold tracking-widest whitespace-nowrap transition-colors relative h-full flex items-center ${activeCategory === cat.id ? 'text-[#9333EA]' : 'text-stone-500 hover:text-stone-900'}`}
              >
                {cat.name}
                {activeCategory === cat.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9333EA]"></span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16 pb-32">
        
        {/* 2. Category Hero & Sub-categories (하이엔드 타이포그래피 & 가로 스크롤) */}
        {activeCategory !== 'all' && currentCatInfo && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-stone-200 pb-6">
              <h2 className="text-4xl md:text-[52px] font-black text-stone-900 tracking-tighter uppercase mb-2">
                {currentCatInfo.name}
              </h2>
              <p className="text-[16px] font-medium text-stone-500">
                {currentCatInfo.desc}
              </p>
            </div>
            
            {/* 중카테고리(서브 필터) 칩 - 한 줄 가로 스크롤 */}
            {SUB_CATEGORIES[activeCategory] && (
              <div className="w-full overflow-x-auto scrollbar-hide pt-6 pb-2">
                <div className="flex items-center gap-2.5 min-w-max">
                  <button 
                    onClick={() => setActiveSubCategory(null)}
                    className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all ${activeSubCategory === null ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    All
                  </button>
                  {SUB_CATEGORIES[activeCategory].map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setActiveSubCategory(tag)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all ${activeSubCategory === tag ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Hero Article Section (Featured) - HOME only */}
        {activeCategory === 'all' && (
          <>
        <section className="group cursor-pointer mb-16" onClick={() => navigate('/en/magazine/1')}>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-5/12 lg:w-4/12 shrink-0">
              <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 relative shadow-lg">
                <img src={heroArticle.image} alt={heroArticle.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
            <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-center py-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#9333EA] bg-purple-50 rounded-md">
                  {heroArticle.category}
                </span>
                <span className="flex items-center text-[13px] font-bold text-stone-400">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> {heroArticle.readTime}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-stone-900 leading-[1.2] mb-6 group-hover:text-[#9333EA] transition-colors break-keep">
                {heroArticle.title}
              </h2>
              <p className="text-[16px] md:text-[18px] text-stone-500 leading-relaxed mb-10 line-clamp-4 break-keep">
                {heroArticle.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto border-t border-stone-100 pt-6">
                <span className="text-[13px] font-bold text-stone-900 uppercase tracking-wider">{heroArticle.date}</span>
                <button className="flex items-center text-[13px] font-bold text-[#9333EA] hover:text-purple-700 transition-colors">
                  READ ARTICLE <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Latest Articles List - HOME only */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
            <h3 className="text-2xl font-extrabold text-stone-900 flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-stone-400" />
              LATEST ARTICLES
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {listArticles.map((article) => (
              <article key={article.id} className="group flex h-full cursor-pointer flex-col items-center" onClick={() => navigate('/en/magazine/1')}>
                <div className="relative mb-5 aspect-[3/4] w-full shrink-0 overflow-hidden rounded-xl bg-stone-200 shadow-sm">
                  <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 rounded bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-900 backdrop-blur-sm">
                    {article.subCategory}
                  </div>
                </div>
                <div className="flex w-full flex-1 flex-col">
                  <span className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-[#9333EA]">{article.category}</span>
                  <h4 className="mb-3 w-full text-center text-[17px] font-bold leading-snug text-stone-900 transition-colors line-clamp-2 break-keep group-hover:text-[#9333EA]">
                    {article.title}
                  </h4>
                  <p className="text-[13px] text-stone-500 line-clamp-3 mb-4 flex-1 break-keep">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{article.date}</span>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {article.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
          </>
        )}

        {activeCategory === 'trends' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {MOCK_TRENDS.map((item) => (
                <article key={item.id} className="group mb-6 flex cursor-pointer break-inside-avoid flex-col items-center gap-3">
                  {/* 이미지 영역 */}
                  <div className={`relative w-full ${item.height} overflow-hidden rounded-2xl bg-stone-200 shadow-sm`}>
                    <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-10 flex items-start justify-end bg-black/20 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-sm backdrop-blur-md transition-colors hover:bg-white hover:text-rose-500">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 텍스트(기사 정보) 영역 */}
                  <div className="flex w-full flex-col gap-1.5 px-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#9333EA]">
                        {activeSubCategory || 'TRENDING'}
                      </span>
                      <span className="flex items-center text-[10px] font-bold text-stone-400">
                        <Clock className="mr-1 h-3 w-3" /> 3 min
                      </span>
                    </div>
                    <h3 className="w-full text-center text-[15px] font-bold leading-snug text-stone-900 transition-colors line-clamp-2 break-keep group-hover:text-[#9333EA]">
                      {item.title} 디자인 완벽 가이드 및 스타일링 팁
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'occasion' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-24 md:space-y-32 py-10">
            {MOCK_OCCASIONS.map((item, index) => (
              <section key={item.id} className="group cursor-pointer">
                <div className={`flex flex-col gap-8 md:gap-16 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                  <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-200 relative shadow-xl">
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                  <div className={`w-full md:w-1/2 flex flex-col justify-center ${index % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1.5 text-[11px] font-bold tracking-widest text-white bg-[#9333EA] rounded-md uppercase shadow-sm">
                        {item.subCategory}
                      </span>
                      <span className="flex items-center text-[12px] font-bold text-stone-400">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> {item.readTime}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-stone-900 leading-[1.2] mb-6 group-hover:text-[#9333EA] transition-colors break-keep">
                      {item.title}
                    </h2>
                    <p className={`text-[16px] md:text-[18px] text-stone-500 leading-relaxed mb-10 max-w-lg break-keep ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                      {item.excerpt}
                    </p>
                    <div className={`flex items-center gap-6 w-full border-t border-stone-100 pt-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      <span className="text-[13px] font-bold text-stone-900 uppercase tracking-wider">{item.date}</span>
                      <button className={`flex items-center text-[13px] font-bold text-[#9333EA] hover:text-purple-700 transition-colors ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                        READ ARTICLE <ChevronRight className={`h-4 w-4 ${index % 2 === 1 ? 'mr-1 rotate-180' : 'ml-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {activeCategory === 'seasonal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 py-10">
            {MOCK_SEASONAL.map((item, index) => (
              <section key={item.id} className="bg-stone-50 rounded-[3rem] p-8 md:p-12 lg:p-16 border border-stone-100 group cursor-pointer hover:bg-stone-100 transition-colors duration-500">
                <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* 텍스트 및 컬러 팔레트 영역 */}
                  <div className="w-full lg:w-5/12 flex flex-col justify-center">
                    <span className="text-[#9333EA] font-extrabold text-[12px] tracking-widest uppercase mb-4 px-3 py-1.5 bg-purple-100 w-max rounded-md">
                      {item.mood}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-stone-900 leading-[1.2] mb-6 group-hover:text-[#9333EA] transition-colors break-keep">
                      {item.title}
                    </h2>
                    <p className="text-[16px] md:text-[18px] text-stone-500 leading-relaxed mb-10 break-keep">
                      {item.desc}
                    </p>
                    
                    {/* 컬러 스와치 (동그라미 색상표) */}
                    <div className="flex items-center gap-3 mb-10">
                      {item.colors.map((color, i) => (
                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-inner border border-black/5 transform hover:scale-110 transition-transform duration-300" style={{ backgroundColor: color }}></div>
                      ))}
                      <span className="ml-2 text-[13px] font-bold text-stone-400">Color Palette</span>
                    </div>

                    <button className="flex items-center text-[14px] font-bold text-stone-900 hover:text-[#9333EA] transition-colors w-max">
                      VIEW PALETTE <ChevronRight className="ml-1 h-5 w-5" />
                    </button>
                  </div>

                  {/* 에디토리얼 무드보드 (엇갈린 이미지 배치) */}
                  <div className="w-full lg:w-7/12 grid grid-cols-2 gap-4 md:gap-8">
                    <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 relative shadow-lg transform -translate-y-4 md:-translate-y-8 group-hover:-translate-y-6 transition-transform duration-500">
                      <img src={item.images[0]} alt="무드보드 1" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 relative shadow-lg transform translate-y-4 md:translate-y-8 group-hover:translate-y-6 transition-transform duration-500">
                      <img src={item.images[1]} alt="무드보드 2" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </div>

                </div>
              </section>
            ))}
          </div>
        )}

        {activeCategory === 'fit' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 py-10">
            {MOCK_FIT.map((item) => (
              <section key={item.id} className="bg-white rounded-3xl p-6 md:p-10 border border-stone-200 shadow-sm group hover:shadow-md transition-shadow duration-500">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
                  
                  {/* 좌측: 쉐입 설명 가이드 영역 */}
                  <div className="w-full lg:w-5/12 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 mb-6">
                      <span className="h-8 w-8 bg-stone-900 text-white flex items-center justify-center rounded-full font-black">FIT</span>
                      <span className="text-[14px] font-black tracking-widest text-stone-900 uppercase">
                        {item.shape}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-[1.25] mb-6 group-hover:text-[#9333EA] transition-colors break-keep">
                      {item.title}
                    </h2>
                    
                    <p className="text-[16px] text-stone-500 leading-relaxed mb-8 break-keep">
                      {item.desc}
                    </p>
                    
                    {/* 특징 태그 리스트 */}
                    <div className="space-y-3 mb-10">
                      {item.tags.map((tag, i) => (
                        <div key={i} className="flex items-center text-[14px] font-bold text-stone-700">
                          <Check className="h-5 w-5 text-[#9333EA] mr-3 shrink-0" />
                          {tag}
                        </div>
                      ))}
                    </div>

                    <button className="flex items-center text-[14px] font-bold text-white bg-stone-900 px-8 py-4 rounded-full hover:bg-[#9333EA] transition-colors w-max shadow-md">
                      이 쉐입 디자인 더보기 <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  {/* 우측: 3분할 비대칭 갤러리 그리드 */}
                  <div className="w-full lg:w-7/12 grid grid-cols-2 gap-4">
                    {/* 큰 세로 사진 */}
                    <div className="col-span-1 row-span-2 w-full h-full rounded-2xl overflow-hidden bg-stone-200 relative">
                      <img src={item.images[0]} alt="메인 쉐입 디자인" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    {/* 작은 가로 사진 2개 */}
                    <div className="col-span-1 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 relative">
                      <img src={item.images[1]} alt="서브 디자인 1" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="col-span-1 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 relative">
                      <img src={item.images[2]} alt="서브 디자인 2" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  </div>

                </div>
              </section>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
