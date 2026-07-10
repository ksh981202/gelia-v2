import { useState } from 'react';
import { 
  BarChart2, Flame, Settings, TrendingUp, Search, Sparkles, Loader2, 
  Globe, Smartphone, Calendar, Filter, CheckSquare, Clock, ArrowRight, 
  Plus, CalendarCheck, CheckCircle2, 
  Image as ImageIcon, FileText, Play 
} from 'lucide-react';

const DUMMY_BANK_DATA = [
  { id: 1, title: '2026년 7월 바캉스 시즌, 쿨톤 피부를 2배 맑게 밝혀주는 투명 시럽 네일 BEST 5', channel: 'web', status: 'unused' },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩에 찰떡인 미니멀 화이트 프렌치', channel: 'web', status: 'unused' },
  { id: 3, title: '유지력 갑! 물놀이에도 끄떡없는 글레이즈드 도넛 네일 시술 후기 및 추천', channel: 'web', status: 'published' },
  { id: 4, title: '올여름 하객룩 네일 고민 끝! 단아하고 고급스러운 핑크 옴브레 스타일링', channel: 'web', status: 'scheduled' },
  { id: 5, title: '여름휴가 네일 무조건 이거 박제! 쿨톤 인생 네일 찾음 🌊✨', channel: 'sns', status: 'unused' },
  { id: 6, title: '요즘 핫한 Y2K 감성 귀환! 페스티벌 시선 강탈 실버 크롬 포인트 💅🔥', channel: 'sns', status: 'unused' }
];

export default function AdminGceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'insight' | 'trend' | 'factory'>('factory');

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
      </div>

      <div className="min-h-[500px]">
        {/* TAB 1: INSIGHT */}
        {activeTab === 'insight' && (
          <div className="animate-in fade-in space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-stone-500">오늘 유입 트래픽</h3>
                  <div className="p-2 bg-rose-50 rounded-full"><TrendingUp className="h-5 w-5 text-rose-500" /></div>
                </div>
                <div className="flex items-end gap-2"><span className="text-4xl font-black text-stone-900">12,450</span></div>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-stone-500">오늘 자동 발행</h3>
                  <div className="p-2 bg-blue-50 rounded-full"><FileText className="h-5 w-5 text-blue-500" /></div>
                </div>
                <div className="flex items-end gap-2"><span className="text-4xl font-black text-stone-900">45</span><span className="mb-1 text-[15px] font-bold text-stone-400">/ 100건</span></div>
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
                {processStep === 'pending' && `${currentFactoryItems.length}개 콘텐츠 완전 자동화 시작`}
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
      </div>
    </div>
  );
}
