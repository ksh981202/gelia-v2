import React from 'react';
import { Search, Clock, ChevronRight, BookOpen } from 'lucide-react';

const CATEGORIES = ['ALL', 'TRENDS', 'STYLE GUIDE', 'NAIL CARE', 'COLOR PALETTE', 'SEASONAL'];

const MOCK_ARTICLES = [
  { id: 1, category: 'SUMMER TRENDS', title: 'Glass Syrup Nails: The Ultimate 2026 Summer Glow-Up Guide', excerpt: 'Discover why translucent, jelly-like nail textures are dominating the summer beauty scene. A complete guide to achieving the perfect high-gloss finish that complements any skin tone.', image: 'https://picsum.photos/seed/nail1/600/800', date: 'Jul 10, 2026', readTime: '3 min read' },
  { id: 2, category: 'STYLE GUIDE', title: 'Minimalist White French: The Ultimate Aesthetic', excerpt: 'Stealth wealth is taking over nail art. Learn how to perfect the micro-French tip for a clean, sophisticated look.', image: 'https://picsum.photos/seed/nail2/600/800', date: 'Jul 08, 2026', readTime: '4 min read' },
  { id: 3, category: 'COLOR PALETTE', title: 'Mermaid Tears: Stunning Chrome & Glitter Combinations', excerpt: 'Get ready for your beach vacation with these mesmerizing chrome and glitter combinations.', image: 'https://picsum.photos/seed/nail3/600/800', date: 'Jul 05, 2026', readTime: '5 min read' },
  { id: 4, category: 'NAIL CARE', title: 'How to Maintain Your Gel Nails Flawless for 4 Weeks', excerpt: 'Stop peeling and chipping. Expert tips from top nail technicians on how to extend the life of your gel manicure.', image: 'https://picsum.photos/seed/nail4/600/800', date: 'Jul 02, 2026', readTime: '3 min read' },
  { id: 5, category: 'WEDDING', title: 'Blush Pink Gradient: The Most Requested Bridal Nail Art', excerpt: 'Classic, timeless, and elegant. Why the subtle blush pink ombre remains the undisputed king of wedding nail designs.', image: 'https://picsum.photos/seed/nail5/600/800', date: 'Jun 28, 2026', readTime: '4 min read' }
];

export default function GlobalMagazinePage() {
  const heroArticle = MOCK_ARTICLES[0];
  const listArticles = MOCK_ARTICLES.slice(1);

  return (
    <div className="min-h-screen bg-white font-sans w-full absolute top-0 left-0 z-50">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-stone-900 shrink-0 uppercase flex items-center">
            GELIA<span className="font-light text-stone-400 ml-1">EDITORIAL</span>
          </h1>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search articles, trends, tips..." 
              className="w-full h-10 pl-11 pr-4 bg-stone-100 rounded-full text-[14px] font-medium text-stone-800 outline-none focus:bg-stone-50 focus:ring-2 focus:ring-[#9333EA]/30 transition-all"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide border-t border-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-12">
            {CATEGORIES.map((cat, idx) => (
              <button key={idx} className={`text-[12px] font-bold tracking-widest whitespace-nowrap transition-colors ${idx === 0 ? 'text-[#9333EA]' : 'text-stone-500 hover:text-stone-900'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-20 pb-32">
        
        {/* 1. Hero Article Section */}
        <section className="group cursor-pointer">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            {/* 사진 영역 (크기 절대 고정) */}
            <div className="w-full md:w-5/12 lg:w-4/12 shrink-0">
              <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 relative shadow-md">
                <img src={heroArticle.image} alt={heroArticle.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
            {/* 텍스트 영역 */}
            <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-center py-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#9333EA] bg-purple-50 rounded-md">
                  {heroArticle.category}
                </span>
                <span className="flex items-center text-[13px] font-bold text-stone-400">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> {heroArticle.readTime}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[46px] font-extrabold text-stone-900 leading-[1.15] mb-6 group-hover:text-[#9333EA] transition-colors">
                {heroArticle.title}
              </h2>
              <p className="text-[16px] md:text-[18px] text-stone-500 leading-relaxed mb-10 line-clamp-4">
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

        {/* 2. Latest Articles List */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
            <h3 className="text-2xl font-extrabold text-stone-900 flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-stone-400" />
              LATEST ARTICLES
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {listArticles.map((article) => (
              <article key={article.id} className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-stone-200 mb-5 relative shrink-0 shadow-sm">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold tracking-widest text-stone-900 uppercase">
                    {article.category}
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-[17px] font-bold text-stone-900 leading-snug mb-2 group-hover:text-[#9333EA] transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[13px] text-stone-500 line-clamp-2 mb-4 flex-1">
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

      </main>
    </div>
  );
}

