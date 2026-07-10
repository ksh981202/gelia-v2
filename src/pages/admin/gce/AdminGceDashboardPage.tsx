import { useState } from 'react';
import { 
  BarChart2, Flame, Settings, Search, Sparkles, Loader2, 
  Globe, Smartphone, Calendar, Filter, CheckSquare, Clock, ArrowRight, 
  Plus, CalendarCheck, CheckCircle2, 
  Image as ImageIcon, FileText, Play,
  Link, Copy, ExternalLink,
  CalendarDays, ChevronDown, ChevronUp, Eye, Globe2,
  Target, Zap, Trophy, ArrowUpRight, Activity,
  PenTool, FileEdit,
  Trash2, Maximize2, Save, X,
} from 'lucide-react';

const DUMMY_BANK_DATA = [
  { id: 1, title: '2026년 7월 바캉스 시즌, 쿨톤 피부를 2배 맑게 밝혀주는 투명 시럽 네일 BEST 5', channel: 'web', status: 'unused' },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩에 찰떡인 미니멀 화이트 프렌치', channel: 'web', status: 'unused' },
  { id: 3, title: '유지력 갑! 물놀이에도 끄떡없는 글레이즈드 도넛 네일 시술 후기 및 추천', channel: 'web', status: 'published' },
  { id: 4, title: '올여름 하객룩 네일 고민 끝! 단아하고 고급스러운 핑크 옴브레 스타일링', channel: 'web', status: 'scheduled' },
  { id: 5, title: '여름휴가 네일 무조건 이거 박제! 쿨톤 인생 네일 찾음 🌊✨', channel: 'sns', status: 'unused' },
  { id: 6, title: '요즘 핫한 Y2K 감성 귀환! 페스티벌 시선 강탈 실버 크롬 포인트 💅🔥', channel: 'sns', status: 'unused' }
];

const MOCK_RESULTS = [
  { id: 1, title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', status: 'published', date: '2026-07-10', totalViews: 12450, views: { ko: 2450, en: 8500, ja: 1500 }, urls: { ko: '/magazine/1', en: '/en/magazine/1', ja: '/ja/magazine/1' } },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩에 찰떡인 미니멀 화이트 프렌치', status: 'published', date: '2026-07-08', totalViews: 8200, views: { ko: 4200, en: 3000, ja: 1000 }, urls: { ko: '/magazine/2', en: '/en/magazine/2', ja: '/ja/magazine/2' } },
  { id: 3, title: '2026년 하반기를 휩쓸 크롬 네일 디자인 BEST 5', status: 'scheduled', date: '2026-07-20 (12:00 예약)', totalViews: 0, views: { ko: 0, en: 0, ja: 0 }, urls: { ko: '/magazine/3', en: '/en/magazine/3', ja: '/ja/magazine/3' } },
];

const MOCK_BEST_ARTICLES = [
  { id: 1, title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', image: 'https://picsum.photos/seed/nailhero2/200/200', views: 12450, growth: '+15%', channel: 'web' },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩 미니멀 프렌치', image: 'https://picsum.photos/seed/occ2/200/200', views: 8200, growth: '+8%', channel: 'web' },
  { id: 3, title: '여름휴가 네일 무조건 이거 박제! 쿨톤 인생 네일 찾음 🌊✨', image: 'https://picsum.photos/seed/occ3/200/200', views: 7500, growth: '+22%', channel: 'sns' },
];

const MOCK_REVIEWS = [
  { id: 1, date: '2026-07-10', title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', channel: 'web', image: 'https://picsum.photos/seed/nailhero2/600/800', content_ko: '단순한 핑크가 아닙니다. 2026년 여름, 뷰티 씬을 장악한 트렌드는 바로 쿨톤 맞춤 시럽 네일(Syrup Nails)입니다.\n\n손끝에 맑은 물방울이 맺힌 듯한 이 영롱함. 왜 셀럽과 뷰티 인플루언서들이 앞다투어 이 디자인을 선택했을까요?\n\n손끝 하나로 피부 전체에 형광등을 켠 듯 화사해지는 글래스 네일(Glass Nails)의 매력, 지금부터 하나씩 짚어드릴게요.' },
  { id: 2, date: '2026-07-09', title: '단정함과 세련됨의 끝판왕! 여름 오피스룩 미니멀 프렌치', channel: 'web', image: 'https://picsum.photos/seed/occ2/600/800', content_ko: '오피스룩의 정석, 미니멀 화이트 프렌치 네일을 소개합니다.\n\n단정함을 유지하면서도 세련된 무드를 잃고 싶지 않은 직장인들을 위한 최고의 선택입니다.' },
];

export default function AdminGceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'insight' | 'trend' | 'factory' | 'review' | 'result'>('review');

  // Content Bank State
  const [bankData, setBankData] = useState(DUMMY_BANK_DATA);
  const [channelMode, setChannelMode] = useState<'web' | 'sns'>('web');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'scheduled' | 'published'>('unused');
  const [selectedTitleIds, setSelectedTitleIds] = useState<number[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isAutoCharging, setIsAutoCharging] = useState(false);

  // Factory State
  const [factoryChannelMode, setFactoryChannelMode] = useState<'web' | 'sns'>('web');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [processStep, setProcessStep] = useState<'pending' | 'photo_matching' | 'content_generating' | 'completed'>('pending');

  // Review Tab State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  // Result Tab State
  const [resultStartDate, setResultStartDate] = useState('');
  const [resultEndDate, setResultEndDate] = useState('');
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null);

  const handleOpenReview = (item: any) => {
    setSelectedReview(item);
    setReviewModalOpen(true);
  };

  const filteredBankData = bankData.filter(item => item.channel === channelMode && (statusFilter === 'all' || item.status === statusFilter));
  
  const handleToggleCheck = (id: number) => {
    setSelectedTitleIds(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
  };

  const handleManualAdd = () => {
    if (!newTitle.trim()) return;
    setBankData([{ id: Date.now(), title: newTitle.trim(), channel: channelMode, status: 'unused' }, ...bankData]);
    setNewTitle('');
  };

  const handleAutoCharge = () => {
    setIsAutoCharging(true);
    setTimeout(() => {
      const aiItems = [
        { id: Date.now() + 1, title: `${selectedMonth} 트래픽 폭발! AI가 추천하는 시선 강탈 네일 (자동생성)`, channel: channelMode, status: 'unused' },
        { id: Date.now() + 2, title: `지금 당장 시술받고 싶은 화제의 트렌드 아트 모음 (자동생성)`, channel: channelMode, status: 'unused' }
      ];
      setBankData([...aiItems, ...bankData]);
      setIsAutoCharging(false);
    }, 1500);
  };

  // Factory Items Logic
  const baseFactoryItems = selectedTitleIds.length > 0 ? bankData.filter(item => selectedTitleIds.includes(item.id)) : bankData.slice(0, 2);
  const currentFactoryItems = baseFactoryItems.filter(item => item.channel === factoryChannelMode);

  const handleStartEngine = () => {
    setIsEngineRunning(true);
    setProcessStep('photo_matching');
    setTimeout(() => {
      setProcessStep('content_generating');
      setTimeout(() => {
        setProcessStep('completed');
        setIsEngineRunning(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 bg-[#FAFAFA] min-h-screen">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl flex items-center">
            <Sparkles className="h-8 w-8 text-[#9333EA] mr-2" />
            GELIA Growth Engine (GGE)
          </h1>
          <p className="mt-2 text-[14px] font-medium text-stone-500">트래픽 창출 오토파일럿 · 글로벌 다국어 마케팅 성장 엔진</p>
        </div>
      </div>

      {/* Styled Tabs */}
      <div className="mb-8 flex space-x-2 rounded-2xl bg-white p-2 shadow-sm border border-stone-200">
        <button onClick={() => setActiveTab('insight')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'insight' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <BarChart2 className="h-5 w-5" /> 인사이트
        </button>
        <button onClick={() => setActiveTab('trend')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'trend' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <Flame className="h-5 w-5" /> 콘텐츠 뱅크
        </button>
        <button onClick={() => setActiveTab('factory')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'factory' ? 'bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <Settings className="h-5 w-5" /> 오토 팩토리
        </button>
        <button onClick={() => setActiveTab('review')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'review' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <FileEdit className="h-5 w-5" /> 검수 데스크
        </button>
        <button onClick={() => setActiveTab('result')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'result' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <Link className="h-5 w-5" /> 발행 결과
        </button>
      </div>

      <div className="min-h-[500px]">
        {/* TAB 1: INSIGHT */}
        {activeTab === 'insight' && (
          <div className="animate-in fade-in space-y-8 pb-20">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Global Traffic</h3>
                  <div className="p-2 bg-blue-50 rounded-full"><Globe className="h-4 w-4 text-blue-500" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">24,892</span></div>
                  <p className="mt-2 text-[12px] font-bold text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +18.2% vs last week</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Published</h3>
                  <div className="p-2 bg-purple-50 rounded-full"><Target className="h-4 w-4 text-[#9333EA]" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">1,240</span><span className="text-[14px] font-bold text-stone-400 mb-1">posts</span></div>
                  <p className="mt-2 text-[12px] font-medium text-stone-500">5 Languages across 3 platforms</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Queue</h3>
                  <div className="p-2 bg-amber-50 rounded-full"><Activity className="h-4 w-4 text-amber-500" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">45</span><span className="text-[14px] font-bold text-stone-400 mb-1">waiting</span></div>
                  <p className="mt-2 text-[12px] font-medium text-stone-500">Content bank ready to generate</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#9333EA] blur-3xl opacity-30"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-[13px] font-bold text-stone-400 uppercase tracking-widest">GCE Engine</h3>
                  <div className="p-2 bg-white/10 rounded-full"><Zap className="h-4 w-4 text-amber-400" /></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span><span className="text-xl font-black text-white">Active</span></div>
                  <p className="mt-3 text-[12px] font-medium text-stone-400">All automation systems online</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h3 className="text-[16px] font-extrabold text-stone-900 mb-6 flex items-center"><Globe className="h-5 w-5 text-stone-400 mr-2" /> Traffic by Region</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇺🇸 English (Global)</span><span>45%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full w-[45%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇯🇵 Japanese</span><span>25%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full w-[25%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇰🇷 Korean</span><span>15%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full w-[15%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🌏 Others (TH, VI)</span><span>15%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-800 rounded-full w-[15%]"></div></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h3 className="text-[16px] font-extrabold text-stone-900 mb-6 flex items-center"><Trophy className="h-5 w-5 text-amber-500 mr-2" /> Weekly Top Performing Articles</h3>
                <div className="space-y-4">
                  {MOCK_BEST_ARTICLES.map((article, idx) => (
                    <div key={article.id} className="flex items-center gap-5 p-4 rounded-2xl border border-stone-100 bg-stone-50 transition-colors hover:bg-white hover:border-[#9333EA]/30 hover:shadow-sm">
                      <div className="flex items-center justify-center w-8 font-black text-[18px] text-stone-300">{idx + 1}</div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={article.image} alt={article.title} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <span className={`inline-block mb-1.5 px-2 py-0.5 text-[10px] font-black tracking-wider rounded uppercase ${article.channel === 'web' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{article.channel}</span>
                        <h4 className="text-[14px] font-bold text-stone-900 line-clamp-1">{article.title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-black text-stone-900">{article.views.toLocaleString()}</div>
                        <div className="text-[12px] font-bold text-emerald-500">{article.growth}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENT BANK */}
        {activeTab === 'trend' && (
          <div className="animate-in fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex rounded-xl bg-stone-100 p-1.5">
                <button onClick={() => { setChannelMode('web'); setSelectedTitleIds([]); }} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all ${channelMode === 'web' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}><Globe className="h-4 w-4" /> 웹사이트용 (블로그/SEO)</button>
                <button onClick={() => { setChannelMode('sns'); setSelectedTitleIds([]); }} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all ${channelMode === 'sns' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}><Smartphone className="h-4 w-4" /> SNS용 (핀터레스트/숏폼)</button>
              </div>
              <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-100">
                <Calendar className="h-5 w-5 text-stone-400 ml-2" />
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent pl-2 pr-4 py-2 text-[15px] font-bold text-stone-700 outline-none cursor-pointer">
                  <option value="2026-07">2026년 7월 플래너</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-stone-400 mr-2" />
                  <div className="flex gap-2">
                    {[{ id: 'all', label: '전체 보기' }, { id: 'unused', label: '✨ 미사용만' }, { id: 'scheduled', label: '⏳ 예약중' }, { id: 'published', label: '✅ 발행완료' }].map(f => (
                      <button key={f.id} onClick={() => setStatusFilter(f.id as any)} className={`rounded-full px-5 py-2 text-[14px] font-bold transition-colors ${statusFilter === f.id ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{f.label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setActiveTab('factory')} disabled={selectedTitleIds.length === 0} className="flex items-center gap-2 rounded-xl bg-[#9333EA] px-6 py-3 text-[15px] font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-purple-600 disabled:opacity-50 disabled:hover:scale-100">
                  <CheckSquare className="h-5 w-5" /> {selectedTitleIds.length}개 팩토리로 전송 <ArrowRight className="h-5 w-5 ml-1" />
                </button>
              </div>

              <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-2">
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()} placeholder="번뜩이는 나만의 마케팅 훅(Hook) 제목을 직접 입력하세요..." className="w-full rounded-xl border border-stone-200 bg-white px-5 py-3.5 text-[15px] text-stone-800 outline-none transition-all focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20" />
                  <button onClick={handleManualAdd} disabled={!newTitle.trim()} className="flex shrink-0 items-center justify-center rounded-xl bg-stone-900 px-5 py-3.5 text-[15px] font-bold text-white hover:bg-stone-800 transition-colors disabled:opacity-50"><Plus className="h-5 w-5" /></button>
                </div>
                <div className="hidden h-10 w-px bg-stone-200 md:block mx-2"></div>
                <button onClick={handleAutoCharge} disabled={isAutoCharging} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 px-6 py-3.5 text-[15px] font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-70">
                  {isAutoCharging ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />} AI 대량 자동 충전
                </button>
              </div>

              <div className="space-y-3">
                {filteredBankData.map((item) => (
                  <div key={item.id} className={`group flex items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${item.status === 'unused' ? 'border-stone-200 bg-white hover:border-[#9333EA] hover:shadow-md' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
                    <div className="flex items-center gap-5 flex-1">
                      <input type="checkbox" checked={selectedTitleIds.includes(item.id)} onChange={() => handleToggleCheck(item.id)} disabled={item.status !== 'unused'} className="h-6 w-6 rounded-md border-stone-300 text-[#9333EA] focus:ring-[#9333EA] disabled:opacity-50 cursor-pointer transition-colors" />
                      <span className={`text-[16px] font-bold ${item.status === 'published' ? 'text-stone-400 line-through' : 'text-stone-900 group-hover:text-[#9333EA] transition-colors'}`}>{item.title}</span>
                    </div>
                    <div className="shrink-0">
                      {item.status === 'unused' && <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-[13px] font-bold text-blue-700">✨ 미사용</span>}
                      {item.status === 'scheduled' && <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-[13px] font-bold text-amber-700"><Clock className="mr-1.5 h-3.5 w-3.5" /> 예약중</span>}
                      {item.status === 'published' && <span className="inline-flex items-center rounded-full bg-stone-200 px-3 py-1.5 text-[13px] font-bold text-stone-600"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> 발행완료</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTO FACTORY */}
        {activeTab === 'factory' && (
          <div className="animate-in fade-in space-y-8 pb-20">
            {/* 상단: 채널 선택 및 달력 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex rounded-xl bg-stone-100 p-1.5">
                <button onClick={() => setFactoryChannelMode('web')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all ${factoryChannelMode === 'web' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}><Globe className="h-4 w-4" /> 웹사이트용 (블로그/SEO)</button>
                <button onClick={() => setFactoryChannelMode('sns')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold transition-all ${factoryChannelMode === 'sns' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}><Smartphone className="h-4 w-4" /> SNS용 (핀터레스트/숏폼)</button>
              </div>
              <div className="flex items-center gap-3 bg-stone-50 p-2 px-4 rounded-xl border border-stone-200">
                <Calendar className="h-5 w-5 text-stone-500" />
                <span className="text-[14px] font-bold text-stone-500">예약 일시:</span>
                <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="bg-transparent text-[15px] font-bold text-stone-900 outline-none cursor-pointer" />
              </div>
            </div>

            {/* 거대한 원클릭 마스터 버튼 영역 */}
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="text-center space-y-3 mb-4">
                <h2 className="text-3xl font-black text-stone-900 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-[#9333EA] mr-2" />
                  원클릭 오토파일럿 엔진
                </h2>
                <p className="text-[16px] font-medium text-stone-500">버튼 한 번만 누르면 사진 매칭, 다국어 생성, 예약 발행까지 시스템이 알아서 끝냅니다.</p>
              </div>
              
              <button 
                onClick={handleStartEngine} 
                disabled={isEngineRunning || processStep === 'completed' || currentFactoryItems.length === 0} 
                className={`group relative flex w-full max-w-2xl items-center justify-center gap-4 overflow-hidden rounded-[2rem] px-10 py-6 text-[20px] font-black text-white shadow-2xl transition-all ${processStep === 'completed' ? 'bg-stone-300 shadow-none' : 'bg-gradient-to-r from-[#9333EA] via-purple-500 to-[#EC4899] hover:scale-[1.03] hover:shadow-purple-500/30'} disabled:pointer-events-none disabled:opacity-90`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                {isEngineRunning ? <Loader2 className="h-7 w-7 animate-spin" /> : processStep === 'completed' ? <CheckCircle2 className="h-7 w-7" /> : <Play className="h-7 w-7 fill-current" />}
                {processStep === 'pending' && (scheduleDate ? `🕒 ${currentFactoryItems.length}개 콘텐츠 예약 세팅 가동` : `🚀 ${currentFactoryItems.length}개 콘텐츠 즉시 라이브 발행`)}
                {processStep === 'photo_matching' && 'AI 갤러리 탐색 및 사진 매칭 중...'}
                {processStep === 'content_generating' && '다국어 번역 및 플랫폼 최적화 작성 중...'}
                {processStep === 'completed' && '모든 작업 및 예약 발행 완료!'}
              </button>
            </div>

            {/* 실시간 전광판 */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-[18px] font-black text-stone-900 flex items-center">
                실시간 작업 대기열
                <span className="ml-3 rounded-full bg-stone-100 px-3 py-1 text-[13px] text-stone-600">{currentFactoryItems.length}건</span>
              </h3>
              <div className="space-y-4">
                {currentFactoryItems.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:bg-white hover:border-[#9333EA]/30 hover:shadow-sm">
                    <div className="flex items-center gap-5 flex-1">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${processStep === 'pending' || processStep === 'photo_matching' ? 'border-dashed border-stone-300 bg-white' : 'border-emerald-500 bg-emerald-50'}`}>
                        {processStep === 'pending' || processStep === 'photo_matching' ? <ImageIcon className={`h-6 w-6 ${processStep === 'photo_matching' ? 'animate-pulse text-[#9333EA]' : 'text-stone-300'}`} /> : <img src={`https://picsum.photos/seed/${item.id}/200`} alt="auto-matched" className="h-full w-full object-cover animate-in fade-in" />}
                      </div>
                      <div className="flex-1">
                        <span className={`inline-block mb-1.5 rounded-md px-2.5 py-1 text-[11px] font-black tracking-wider ${item.channel === 'web' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.channel === 'web' ? '블로그/SEO' : 'SNS/핀터레스트'}</span>
                        <p className="text-[15px] font-bold text-stone-900 line-clamp-1">{item.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[13px] font-bold md:min-w-[320px] md:justify-end shrink-0">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${processStep === 'pending' ? 'text-stone-400' : processStep === 'photo_matching' ? 'text-[#9333EA] bg-purple-50 animate-pulse' : 'text-emerald-600 bg-emerald-50'}`}>
                        {processStep === 'pending' ? <Loader2 className="h-4 w-4" /> : processStep === 'photo_matching' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} 사진매칭
                      </span>
                      <span className="text-stone-300">➔</span>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${processStep === 'pending' || processStep === 'photo_matching' ? 'text-stone-400' : processStep === 'content_generating' ? 'text-[#9333EA] bg-purple-50 animate-pulse' : 'text-emerald-600 bg-emerald-50'}`}>
                        {processStep === 'content_generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : processStep === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />} AI작성
                      </span>
                      <span className="text-stone-300">➔</span>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${processStep === 'completed' ? 'text-emerald-700 bg-emerald-100' : 'text-stone-400'}`}>
                        <CalendarCheck className="h-4 w-4" /> {processStep === 'completed' ? '예약완료' : '대기중'}
                      </span>
                    </div>
                  </div>
                ))}
                {currentFactoryItems.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mb-4"><Search className="h-6 w-6 text-stone-400" /></div>
                    <p className="text-[16px] font-bold text-stone-900 mb-1">대기열이 비어있습니다.</p>
                    <p className="text-[14px] font-medium text-stone-500">콘텐츠 뱅크에서 발송할 기사를 선택 후 전송해주세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: REVIEW DESK */}
        {activeTab === 'review' && (
          <div className="animate-in fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 flex items-center">
                  <PenTool className="h-6 w-6 text-[#9333EA] mr-2" /> AI 초안 검수 데스크
                </h2>
                <p className="mt-1 text-[14px] text-stone-500">AI가 작성한 원본을 확인하고 불필요한 건 삭제, 완벽한 글은 승인하여 번역을 시작하세요.</p>
              </div>
            </div>

            {/* 초압축 고밀도 리스트 */}
            <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="hidden md:flex items-center bg-stone-50 border-b border-stone-200 px-6 py-4 text-[13px] font-bold text-stone-500 uppercase tracking-widest">
                <div className="w-16">No.</div>
                <div className="w-32">Date</div>
                <div className="flex-1">Article Title</div>
                <div className="w-48 text-right">Actions</div>
              </div>
              <div className="divide-y divide-stone-100">
                {MOCK_REVIEWS.map((item, idx) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center px-6 py-4 transition-colors hover:bg-stone-50/50">
                    <div className="w-16 shrink-0 font-black text-stone-300 text-[16px]">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="w-32 shrink-0 text-[13px] font-medium text-stone-500">{item.date}</div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-black tracking-wider rounded uppercase ${item.channel === 'web' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.channel}</span>
                      <span className="font-bold text-[15px] text-stone-900 line-clamp-1">{item.title}</span>
                    </div>
                    <div className="w-48 shrink-0 flex items-center justify-end gap-2 mt-4 md:mt-0">
                      <button onClick={() => handleOpenReview(item)} className="flex items-center px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-[13px] font-bold hover:bg-stone-200 transition-colors">
                        <Maximize2 className="h-4 w-4 mr-1.5" /> 뷰어/수정
                      </button>
                      <button className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="삭제">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 풀스크린 WYSIWYG 에디터 모달 */}
            {reviewModalOpen && selectedReview && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  {/* 모달 헤더 */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                    <div className="flex items-center gap-2 text-[#9333EA] font-black text-[15px]">
                      <Eye className="h-5 w-5" /> 유저 뷰 (수정 가능)
                    </div>
                    <button onClick={() => setReviewModalOpen(false)} className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 모달 본문 (실제 매거진 화면과 동일한 구조, contentEditable 적용) */}
                  <div className="flex-1 overflow-y-auto px-6 py-10 md:px-16 md:py-16 scrollbar-hide">
                    <div className="max-w-2xl mx-auto space-y-10">
                      {/* 이미지 (3:4 비율) */}
                      <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-stone-100">
                        <img src={selectedReview.image} alt={selectedReview.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* 제목 수정 영역 */}
                      <h1 
                        contentEditable 
                        suppressContentEditableWarning 
                        className="text-3xl md:text-4xl font-black text-stone-900 leading-[1.3] outline-none focus:bg-stone-50 focus:ring-2 focus:ring-[#9333EA]/20 rounded-xl p-2 -ml-2 transition-all"
                      >
                        {selectedReview.title}
                      </h1>

                      <div className="w-10 h-1 bg-[#9333EA] rounded-full"></div>

                      {/* 본문 수정 영역 */}
                      <div 
                        contentEditable 
                        suppressContentEditableWarning 
                        className="text-[16px] md:text-[18px] leading-[2] text-stone-700 outline-none focus:bg-stone-50 focus:ring-2 focus:ring-[#9333EA]/20 rounded-xl p-4 -ml-4 whitespace-pre-wrap transition-all min-h-[200px]"
                      >
                        {selectedReview.content_ko}
                      </div>
                    </div>
                  </div>

                  {/* 모달 푸터 (액션 버튼) */}
                  <div className="px-6 py-5 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-3">
                    <button className="flex items-center px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-[14px] hover:bg-stone-100 transition-colors">
                      <Save className="h-4 w-4 mr-2" /> 임시 저장
                    </button>
                    <button onClick={() => setReviewModalOpen(false)} className="flex items-center px-6 py-2.5 rounded-xl bg-[#9333EA] text-white font-black text-[14px] shadow-md hover:bg-purple-600 hover:scale-105 transition-all">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> 원본 승인 및 다국어 번역 시작
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PUBLISH RESULTS */}
        {activeTab === 'result' && (
          <div className="animate-in fade-in space-y-6 pb-20">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-extrabold text-stone-900 flex items-center">
                  <Globe2 className="h-6 w-6 text-[#9333EA] mr-2" /> 글로벌 발행 현황
                </h2>
                <div className="hidden md:block w-px h-6 bg-stone-200"></div>
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-100">
                  <button className="px-4 py-1.5 text-[13px] font-bold bg-white text-stone-900 shadow-sm rounded-md">전체</button>
                  <button className="px-4 py-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-900">발행됨</button>
                  <button className="px-4 py-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-900">예약됨</button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <CalendarDays className="h-5 w-5 text-stone-400 ml-2" />
                <input type="date" value={resultStartDate} onChange={(e) => setResultStartDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-stone-700 outline-none cursor-pointer" />
                <span className="text-stone-400">~</span>
                <input type="date" value={resultEndDate} onChange={(e) => setResultEndDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-stone-700 outline-none cursor-pointer" />
              </div>
            </div>

            {/* 고밀도 데이터 테이블 (리스트) */}
            <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              {/* 테이블 헤더 (날짜 맨 앞으로 이동 및 너비 조정) */}
              <div className="hidden md:flex items-center bg-stone-50 border-b border-stone-200 px-6 py-4 text-[13px] font-bold text-stone-500 uppercase tracking-widest">
                <div className="w-40">Date</div>
                <div className="w-24">Status</div>
                <div className="flex-1">Article Title</div>
                <div className="w-32 text-right">Total Views</div>
                <div className="w-12"></div>
              </div>

              {/* 테이블 본문 */}
              <div className="divide-y divide-stone-100">
                {MOCK_RESULTS.map((item) => (
                  <div key={item.id} className="flex flex-col transition-colors hover:bg-stone-50/50">
                    {/* 요약 행 (클릭 시 아코디언 열림) */}
                    <div 
                      onClick={() => setExpandedResultId(expandedResultId === item.id ? null : item.id)}
                      className="flex flex-col md:flex-row md:items-center px-6 py-5 cursor-pointer gap-4 group"
                    >
                      {/* 1. 날짜 (맨 앞) */}
                      <div className="w-40 shrink-0 text-[13px] font-medium text-stone-500 break-keep">
                        {item.date}
                      </div>
                      
                      {/* 2. 상태 뱃지 */}
                      <div className="w-24 shrink-0">
                        {item.status === 'published' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-black rounded-md tracking-wider">발행완료</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-black rounded-md tracking-wider">예약됨</span>
                        )}
                      </div>
                      
                      {/* 3. 기사 제목 */}
                      <div className="flex-1 font-bold text-[15px] text-stone-900 line-clamp-1 group-hover:text-[#9333EA] transition-colors">
                        {item.title}
                      </div>
                      
                      {/* 4. 총 조회수 */}
                      <div className="w-32 shrink-0 flex items-center justify-end text-[15px] font-black text-stone-900">
                        <Eye className="h-4 w-4 text-stone-400 mr-1.5" /> {item.totalViews.toLocaleString()}
                      </div>
                      
                      {/* 5. 아코디언 버튼 */}
                      <div className="w-8 shrink-0 flex justify-end text-stone-400 group-hover:text-[#9333EA] transition-colors">
                        {expandedResultId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>

                    {/* 아코디언 상세 내용 (기존과 동일) */}
                    {expandedResultId === item.id && (
                      <div className="bg-stone-50 border-t border-stone-100 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col lg:flex-row gap-8">
                          
                          {/* URL 리스트 */}
                          <div className="flex-1 space-y-3">
                            <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">Live URLs</h4>
                            {Object.entries(item.urls).map(([lang, url]) => (
                              <div key={lang} className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                <span className="px-4 py-2.5 bg-stone-100 text-stone-700 text-[13px] font-black uppercase w-16 text-center border-r border-stone-200">{lang}</span>
                                <span className="px-4 py-2.5 text-stone-500 text-[13px] flex-1 truncate">{url}</span>
                                <button className="p-2.5 hover:bg-stone-100 text-stone-500 transition-colors border-l border-stone-200" title="주소 복사"><Copy className="h-4 w-4" /></button>
                                <a href={url} target="_blank" rel="noreferrer" className="p-2.5 hover:bg-stone-100 text-[#9333EA] transition-colors border-l border-stone-200" title="새 창으로 열기"><ExternalLink className="h-4 w-4" /></a>
                              </div>
                            ))}
                          </div>

                          {/* 국가별 트래픽 통계 */}
                          <div className="w-full lg:w-72 shrink-0">
                            <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">Traffic By Region</h4>
                            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-stone-700 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>EN (Global)</span>
                                <span className="text-[14px] font-black text-stone-900">{item.views.en.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-stone-700 flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>KO (Korea)</span>
                                <span className="text-[14px] font-black text-stone-900">{item.views.ko.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-stone-700 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>JA (Japan)</span>
                                <span className="text-[14px] font-black text-stone-900">{item.views.ja.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
