import React, { useState, useMemo } from 'react'
import { ChevronRight, Search, Sparkles, DollarSign, Globe, TrendingDown, PieChart, BarChart3, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockETFs } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

// 테마 키워드 매핑 (ETF shortName/name 기반 필터링) - 히트맵용 확장 키워드 포함
const themeKeywords: Record<string, string[]> = {
  '반도체': ['AI', '반도체', '파운드리', 'HBM', '시스템반도체', '메모리', '칩', 'SOX', '테크', 'IT', '하이닉스', '삼성전자'],
  '제약': ['바이오', '헬스케어', '제약', '의료', '비만', '신약', '건강', 'Health'],
  '여행/항공': ['항공', '여행', '레저', '호텔', '관광', '소비', '리테일'],
  '2차전지': ['2차전지', '배터리', '전기차', 'EV', '리튬', '양극재', '음극재', '친환경', '그린'],
  '배당': ['배당', '고배당', '인컴', '커버드콜', '배당귀족', '배당킹', '월배당', 'Div', 'Income'],
  '해운/운송': ['해운', '운송', '물류', '조선', '항만', '인프라', '교통'],
  '탄소배출': ['탄소', '친환경', '클린에너지', '신재생', 'ESG', '그린'],
  '보험': ['보험', '금융', '은행', '증권', 'Financial'],
  '태양광': ['태양광', '풍력', '수소', '신재생', '클린', '에너지'],
  '건설': ['건설', '인프라', '시멘트', '부동산', '리츠', 'REIT'],
  '농업/스마트팜': ['농업', '스마트팜', '농산물', '식품', '곡물'],
  '석유/가스': ['원유', 'WTI', '가스', '에너지', 'Oil', 'Energy'],
  'ESG': ['ESG', '친환경', '지속가능', '그린', '클린', '탄소'],
  '금융': ['금융', '은행', '증권', '보험', 'Financial', '파이낸셜'],
  '게임': ['게임', '엔터', 'K-콘텐츠', '미디어', '메타버스', '엔터테인먼트'],
  '원자재': ['골드', 'Gold', '원유', 'WTI', '구리', '원자재', '금선물', '은선물', 'Commodity', '금', '은', '실물'],
  '중국': ['중국', '차이나', 'CSI', '항셍', '홍콩', 'China', 'Hong Kong'],
  '미국': ['미국', 'S&P', '나스닥', 'NASDAQ', '다우', 'US', 'America', 'NYSE'],
  '채권': ['채권', '국채', '회사채', '단기채', '금리', 'KOFR', 'CD금리', '머니마켓', 'Bond', '채권형'],
  // 히트맵 테마용 추가 키워드
  '소재': ['소재', '철강', '화학', '비철금속', '소재산업', 'Material', '금속'],
  '신업재': ['산업재', '기계', '조선', '자동차', '운송', '제조', 'Industrial', '장비'],
  '필수소비재': ['필수소비', '식품', '유통', '소비재', 'Consumer', '생활'],
  '헬스케어': ['헬스케어', '바이오', '제약', '의료', 'Health', '건강', '병원'],
  'IT': ['IT', 'AI', '테크', '소프트웨어', '반도체', 'Tech', '정보기술', '인터넷'],
  '경기소비재': ['경기소비', '자동차', '여행', '레저', '의류', '소비', '리테일'],
  '통신서비스': ['통신', '미디어', '엔터', '인터넷', '플랫폼', 'Communication'],
  '에너지': ['에너지', '원유', '가스', 'Energy', 'Oil', '정유', '전력'],
  '유틸리티': ['유틸리티', '전력', '가스', '수도', 'Utility', '공공'],
  // 추가 테마
  '해운/운송/교통': ['해운', '운송', '물류', '배송', '교통', '운수', '조선', '항만', '택배', '운송업'],
}

// 빠른검색 버튼 설정 (3x2 그리드, ETF 빠른검색 포함)
const quickFilters = [
  { id: 'title', label: 'ETF\n빠른검색', icon: Sparkles, isTitle: true },
  { id: 'parking', label: '단기자금\n(파킹형)', icon: DollarSign },
  { id: 'country', label: '투자국가', icon: Globe },
  { id: 'leverage', label: '인버스/\n레버리지', icon: TrendingDown },
  { id: 'sector', label: '섹터', icon: PieChart },
  { id: 'index', label: '지수', icon: BarChart3 },
]

// 인기 테마 탭 카테고리
const themeCategories = [
  { id: 'innovation', label: '혁신기술', themes: ['반도체', '2차전지', '제약'] },
  { id: 'esg', label: 'ESG', themes: ['ESG', '탄소배출', '태양광'] },
  { id: 'dividend', label: '배당', themes: ['배당', '금융', '보험'] },
  { id: 'trend', label: '트렌드', themes: ['여행/항공', '게임', '원자재'] },
]

interface HomePageProps {
  accountType: string
  onSelectETF: (etf: ETF) => void
  onNavigate: (tab: string, theme?: string) => void
  onLongPressETF?: (etf: ETF) => void
  onAccountTypeChange?: (type: string) => void
  onOpenSearch?: () => void
  onOpenQuickSearch?: (tab: string) => void
}

// 지금 뜨는 테마 데이터 (실제로는 API에서 가져옴) - 최대 5순위
const trendingThemes = [
  { rank: 1, name: '반도체', count: 59, change: 3.45 },
  { rank: 2, name: '제약', count: 13, change: 2.86 },
  { rank: 3, name: '여행/항공', count: 27, change: 1.95 },
  { rank: 4, name: '해운/운송/교통', count: 22, change: 1.95 },
  { rank: 5, name: '탄소배출', count: 41, change: 1.81 },
]

// 지금 뜨는 테마 TOP 10 전체 리스트
const allTrendingThemes = [
  { rank: 1, name: '반도체', count: 59, change: 3.45 },
  { rank: 2, name: '제약', count: 13, change: 2.86 },
  { rank: 3, name: '여행/항공', count: 27, change: 1.95 },
  { rank: 4, name: '해운/운송/교통', count: 22, change: 1.95 },
  { rank: 5, name: '탄소배출', count: 41, change: 1.81 },
  { rank: 6, name: '보험', count: 26, change: 1.75 },
  { rank: 7, name: '태양광', count: 6, change: 1.65 },
  { rank: 8, name: '건설', count: 6, change: 1.62 },
  { rank: 9, name: '농업/스마트팜', count: 20, change: 1.50 },
  { rank: 10, name: '석유/가스 생산유통', count: 8, change: 1.49 },
]

// 히트맵 데이터 (4열 x 3행 = 12개로 균형있게, KOSPI/KOSDAQ 포함)
// isIndex: true인 항목은 벤치마크 지수 (흰색 배경 + 테두리 색상)
const heatmapDataByPeriod: Record<string, { theme: string; change: number; isIndex?: boolean }[]> = {
  '1D': [
    { theme: 'KOSPI', change: 0.42, isIndex: true },
    { theme: 'KOSDAQ', change: 0.31, isIndex: true },
    { theme: '소재', change: 6.40 },
    { theme: '신업재', change: 3.87 },
    { theme: '금융', change: 3.34 },
    { theme: '필수소비재', change: 2.38 },
    { theme: '헬스케어', change: 2.90 },
    { theme: 'IT', change: 2.67 },
    { theme: '경기소비재', change: 0.77 },
    { theme: '통신서비스', change: -1.10 },
    { theme: '에너지', change: -2.34 },
    { theme: '유틸리티', change: -0.44 },
  ],
  '1주': [
    { theme: 'KOSPI', change: 1.25, isIndex: true },
    { theme: 'KOSDAQ', change: -0.85, isIndex: true },
    { theme: '소재', change: 4.28 },
    { theme: '신업재', change: -3.85 },
    { theme: '금융', change: 1.42 },
    { theme: '필수소비재', change: 2.15 },
    { theme: '헬스케어', change: 0.85 },
    { theme: 'IT', change: -2.73 },
    { theme: '경기소비재', change: -4.12 },
    { theme: '통신서비스', change: -3.45 },
    { theme: '에너지', change: -1.92 },
    { theme: '유틸리티', change: 0.28 },
  ],
  'YTD': [
    { theme: 'KOSPI', change: 3.85, isIndex: true },
    { theme: 'KOSDAQ', change: -2.15, isIndex: true },
    { theme: '소재', change: 8.45 },
    { theme: '신업재', change: -5.23 },
    { theme: '금융', change: 4.67 },
    { theme: '필수소비재', change: 2.89 },
    { theme: '헬스케어', change: 6.12 },
    { theme: 'IT', change: -3.45 },
    { theme: '경기소비재', change: -8.34 },
    { theme: '통신서비스', change: -4.56 },
    { theme: '에너지', change: 1.23 },
    { theme: '유틸리티', change: 2.45 },
  ],
}

// 구성종목 검색 데이터 (전일 대비 수익률 포함)
const domesticStocks = [
  { name: '삼성전자', icon: '📱', change: 2.15 },
  { name: '현대차', icon: '🚗', change: 4.07 },
  { name: 'SK하이닉스', icon: '💾', change: 1.82 },
  { name: '키움증권', icon: '📊', change: -0.54 },
  { name: '한화솔루션', icon: '☀️', change: 3.21 },
]

const overseasStocks = [
  { name: 'TSLA', icon: '⚡', change: 5.34 },
  { name: 'GOOGL', icon: '🔍', change: -1.23 },
  { name: 'SNDK', icon: '💿', change: 2.87 },
  { name: 'AAPL', icon: '🍎', change: 0.92 },
  { name: 'KO', icon: '🥤', change: -0.31 },
]

export function HomePage({ onSelectETF, onNavigate, onLongPressETF, onOpenSearch, onOpenQuickSearch }: HomePageProps) {
  // 지금 뜨는 테마 모달 상태
  const [showTrendingModal, setShowTrendingModal] = useState(false)
  // 선택된 테마 (ETF 리스트용)
  const [selectedTheme, setSelectedTheme] = useState<{ theme: string; weeklyReturn: number } | null>(null)
  // 인기 테마 랭킹 탭
  const [activeThemeTab, setActiveThemeTab] = useState('innovation')
  // 히트맵 기간 탭
  const [heatmapPeriod, setHeatmapPeriod] = useState('1D')
  // 구성종목 검색 모달
  const [showConstituentModal, setShowConstituentModal] = useState(false)
  // 구성종목 검색어
  const [constituentSearchQuery, setConstituentSearchQuery] = useState('')

  // 테마별 ETF 필터링 함수
  const getETFsByTheme = (themeName: string): ETF[] => {
    const keywords = themeKeywords[themeName] || []
    if (keywords.length === 0) return []

    return mockETFs
      .filter(etf => {
        // 레버리지/인버스 제외
        if (etf.isLeveraged || etf.isInverse) return false
        // 키워드 매칭
        const name = etf.shortName.toUpperCase()
        return keywords.some(keyword => name.toUpperCase().includes(keyword.toUpperCase()))
      })
      .sort((a, b) => b.changePercent - a.changePercent) // 수익률 순 정렬
      .slice(0, 10) // TOP 10
  }

  // 롱프레스 처리를 위한 타이머
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLongPressStart = (etf: ETF) => {
    longPressTimer.current = setTimeout(() => {
      onLongPressETF?.(etf)
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // 히트맵 데이터 (기간별, 수익률순 정렬)
  const heatmapData = useMemo(() => {
    const data = heatmapDataByPeriod[heatmapPeriod] || heatmapDataByPeriod['1D']
    // 수익률 기준 내림차순 정렬 (KOSPI/KOSDAQ도 포함)
    return [...data].sort((a, b) => b.change - a.change)
  }, [heatmapPeriod])

  // 구성종목 검색 핸들러
  const handleConstituentSearch = (stockName: string) => {
    setConstituentSearchQuery(stockName)
    setShowConstituentModal(true)
  }

  // 구성종목 검색 결과 (해당 종목을 포함하는 ETF 목록)
  const constituentSearchResults = useMemo(() => {
    if (!constituentSearchQuery) return []
    const query = constituentSearchQuery.toLowerCase()
    return mockETFs
      .filter(etf => etf.holdings?.some(h => h.toLowerCase().includes(query)))
      .map(etf => {
        // 비중 계산 (순서 기반)
        const holdingIndex = etf.holdings?.findIndex(h => h.toLowerCase().includes(query)) || 0
        const weights = [51, 48, 35, 31, 25, 19, 16, 12, 8, 7]
        const weight = weights[holdingIndex] || Math.max(5, 50 - holdingIndex * 5)
        return { etf, weight }
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
  }, [constituentSearchQuery])

  // 현재 선택된 탭의 테마로 ETF 가져오기
  const currentCategoryETFs = useMemo(() => {
    const category = themeCategories.find(c => c.id === activeThemeTab)
    if (!category) return []

    const allETFs: { etf: ETF; theme: string }[] = []
    category.themes.forEach(themeName => {
      const etfs = getETFsByTheme(themeName)
      etfs.forEach(etf => {
        if (!allETFs.find(e => e.etf.id === etf.id)) {
          allETFs.push({ etf, theme: themeName })
        }
      })
    })
    return allETFs.sort((a, b) => b.etf.changePercent - a.etf.changePercent).slice(0, 5)
  }, [activeThemeTab])

  return (
    <div className="pb-20">
      {/* Search Bar - 클릭 시 전체 검색 페이지 오픈 (배경과 동일 컬러) */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 px-3 py-3 bg-[#191322] border border-[#3d3650] rounded-xl text-sm text-gray-500 hover:border-[#d64f79] transition-colors text-left search-bar-main"
        >
          <Search className="h-4 w-4 text-gray-400" />
          <span>ETF 종목을 검색해볼까요?</span>
        </button>
      </div>

      {/* Quick Filter Section - 3x2 그리드 */}
      <div className="px-4 py-3" data-tour="category-buttons">
        <div className="grid grid-cols-3 gap-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon
            const isTitle = 'isTitle' in filter && filter.isTitle

            // ETF 빠른검색은 회색 배경의 타이틀 스타일 (아이콘 없이 텍스트만, 테두리 동일색)
            if (isTitle) {
              return (
                <div
                  key={filter.id}
                  className="flex items-center justify-center p-3 rounded-xl bg-[#1f1a2e] border border-[#1f1a2e] quick-search-title-dark"
                >
                  <span className="text-sm text-white text-center whitespace-pre-line leading-tight font-bold">{filter.label}</span>
                </div>
              )
            }

            // 나머지 버튼들 (다크모드 대응)
            return (
              <button
                key={filter.id}
                onClick={() => onOpenQuickSearch?.(filter.id)}
                className="flex items-center gap-2 p-3 rounded-xl bg-[#2d2640] border border-[#3d3650] hover:border-[#d64f79]/50 transition-colors"
              >
                <div className="rounded-lg bg-[#3d3650] p-2">
                  <Icon className="h-4 w-4 text-[#d64f79]" />
                </div>
                <span className="text-xs text-gray-300 text-left whitespace-pre-line leading-tight">{filter.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 지금 뜨는 테마 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#d64f79]" />
            <h2 className="text-base font-semibold text-white">지금 뜨는 테마</h2>
          </div>
          <button
            onClick={() => setShowTrendingModal(true)}
            className="text-xs text-gray-400 flex items-center gap-1 hover:text-[#d64f79]"
          >
            전체보기 <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Marquee 효과로 가로 스크롤 */}
        <div className="bg-[#1f1a2e] rounded-xl border border-[#2d2640] p-3 overflow-hidden">
          <div className="flex animate-marquee-slow hover:animate-paused whitespace-nowrap">
            {/* 두 번 반복하여 무한 스크롤 효과 */}
            {[...trendingThemes, ...trendingThemes].map((theme, index) => (
              <button
                key={`${theme.rank}-${index}`}
                onClick={() => setSelectedTheme({ theme: theme.name, weeklyReturn: theme.change })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#2a2438] transition-colors shrink-0"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d64f79]/20 text-[#d64f79] text-xs font-bold">
                  {theme.rank}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{theme.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">▲ {theme.count}</span>
                    <span className={`text-xs font-medium ${theme.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {theme.change >= 0 ? '+' : ''}{theme.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 인기 테마 랭킹 TOP5 */}
      <div className="px-4 py-3" data-tour="popular-etf">
        <h2 className="text-base font-semibold text-white mb-3">인기 테마 랭킹 TOP5</h2>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-3">
          {themeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveThemeTab(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeThemeTab === cat.id
                  ? 'bg-[#d64f79] text-white'
                  : 'bg-[#2d2640] text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ETF 리스트 */}
        <div className="bg-[#1f1a2e] rounded-xl border border-[#2d2640] overflow-hidden">
          {currentCategoryETFs.map(({ etf }) => (
            <div
              key={etf.id}
              onClick={() => onSelectETF(etf)}
              onMouseDown={() => handleLongPressStart(etf)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(etf)}
              onTouchEnd={handleLongPressEnd}
              className="flex items-center gap-3 p-3 border-b border-[#2d2640] last:border-b-0 cursor-pointer hover:bg-[#2a2438] transition-colors select-none"
            >
              {/* ETF 뱃지 */}
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2d2640] text-[10px] text-gray-400 font-medium">
                ETF
              </div>

              {/* 종목명 & 가격 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white truncate">{etf.shortName}</span>
                </div>
                <div className="text-xs text-gray-500">{formatNumber(etf.price)}원</div>
              </div>

              {/* 등락률 */}
              <div className={`text-sm font-medium ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
              </div>

              {/* 즐겨찾기 */}
              <button className="p-1 text-gray-500 hover:text-[#d64f79]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* 히트맵 */}
      <div className="px-4 py-4" data-tour="heatmap">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">히트맵</h2>
        </div>

        {/* 기간 탭 */}
        <div className="flex items-center gap-2 mb-3">
          {['1D', '1주', 'YTD'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                heatmapPeriod === period
                  ? 'bg-white text-black'
                  : 'bg-transparent text-gray-400 border border-[#3d3650]'
              }`}
              onClick={() => setHeatmapPeriod(period)}
            >
              {period}
            </button>
          ))}
          {/* 스케일 바 */}
          <div className="flex-1 flex items-center justify-end gap-1">
            <span className="text-[10px] text-gray-500">-5%</span>
            <div className="w-20 h-2 rounded-full bg-gradient-to-r from-blue-500 via-gray-600 to-red-500" />
            <span className="text-[10px] text-gray-500">+5%</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {heatmapData.map((item) => {
            // 일반 테마용 배경색 (glossy 효과 포함)
            const getHeatBgStyle = (value: number): React.CSSProperties => {
              const baseColor = value >= 0 ? 'rgba(239, 68, 68' : 'rgba(59, 130, 246'
              const intensity = Math.min(Math.abs(value) / 5, 1) * 0.5 + 0.2 // 0.2 ~ 0.7 범위
              return {
                background: `linear-gradient(135deg, ${baseColor}, ${intensity + 0.15}) 0%, ${baseColor}, ${intensity}) 50%, ${baseColor}, ${intensity - 0.1}) 100%)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1), 0 2px 8px ${baseColor}, 0.3)`,
              }
            }

            // KOSPI/KOSDAQ 벤치마크 지수용 스타일 (흰색 배경 + 테두리 색상 + glossy)
            const getIndexStyle = (value: number): React.CSSProperties => {
              const borderColor = value >= 0 ? '#ef4444' : '#3b82f6'
              return {
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #f0f0f0 100%)',
                border: `2px solid ${borderColor}`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.15)',
              }
            }

            const isIndex = item.isIndex
            const style = isIndex ? getIndexStyle(item.change) : getHeatBgStyle(item.change)

            return (
              <div
                key={item.theme}
                className={`relative p-2 rounded-xl cursor-pointer transition-all hover:scale-105 overflow-hidden ${isIndex ? 'font-semibold' : ''}`}
                style={style}
                onClick={() => !isIndex && setSelectedTheme({ theme: item.theme, weeklyReturn: item.change })}
              >
                {/* Glossy overlay */}
                {!isIndex && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
                    }}
                  />
                )}
                <div className={`relative text-[10px] font-medium truncate ${isIndex ? (item.change >= 0 ? 'text-red-500' : 'text-blue-500') : 'text-white drop-shadow-sm'}`}>
                  {item.theme}
                </div>
                <div className={`relative text-xs font-bold mt-0.5 ${isIndex ? (item.change >= 0 ? 'text-red-500' : 'text-blue-500') : 'text-white drop-shadow-sm'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 구성종목 검색 TOP10 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">구성종목 검색 TOP10</h2>
          <button
            onClick={() => setShowConstituentModal(true)}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d64f79]/20 text-[#d64f79]"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 국내 | 해외 2단 레이아웃 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 국내 */}
          <div>
            <div className="text-xs text-gray-400 font-medium mb-2 pb-1 border-b border-[#3d3650]">국내</div>
            <div className="space-y-1">
              {domesticStocks.map((stock) => (
                <button
                  key={stock.name}
                  onClick={() => handleConstituentSearch(stock.name)}
                  className="w-full flex items-center gap-2 py-1.5 hover:bg-[#3d3650]/50 rounded transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#3d3650] flex items-center justify-center shrink-0">
                    <span className="text-[9px]">{stock.icon}</span>
                  </div>
                  <span className="text-xs text-white truncate flex-1 text-left">{stock.name}</span>
                  <span className={`text-[10px] shrink-0 ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 해외 */}
          <div>
            <div className="text-xs text-gray-400 font-medium mb-2 pb-1 border-b border-[#3d3650]">해외</div>
            <div className="space-y-1">
              {overseasStocks.map((stock) => (
                <button
                  key={stock.name}
                  onClick={() => handleConstituentSearch(stock.name)}
                  className="w-full flex items-center gap-2 py-1.5 hover:bg-[#3d3650]/50 rounded transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#3d3650] flex items-center justify-center shrink-0">
                    <span className="text-[9px]">{stock.icon}</span>
                  </div>
                  <span className="text-xs text-white truncate flex-1 text-left">{stock.name}</span>
                  <span className={`text-[10px] shrink-0 ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* 테마 TOP 10 모달 */}
      <Dialog open={!!selectedTheme} onOpenChange={() => setSelectedTheme(null)}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTheme?.theme}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                  (selectedTheme?.weeklyReturn || 0) >= 0
                    ? 'bg-up/20 text-up'
                    : 'bg-down/20 text-down'
                }`}>
                  {(selectedTheme?.weeklyReturn || 0) >= 0 ? '+' : ''}
                  {selectedTheme?.weeklyReturn?.toFixed(2)}%
                </span>
              </div>
            </DialogTitle>
            <p className="text-xs text-gray-400">수익률 기준 TOP 10</p>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(80vh-100px)] -mx-2 px-2">
            {selectedTheme && getETFsByTheme(selectedTheme.theme).length > 0 ? (
              <div className="space-y-2">
                {getETFsByTheme(selectedTheme.theme).map((etf, index) => (
                  <div
                    key={etf.id}
                    onClick={() => {
                      setSelectedTheme(null)
                      onSelectETF(etf)
                    }}
                    className="flex items-center gap-3 p-3 bg-[#2a2438] rounded-lg cursor-pointer hover:bg-[#3d3650] transition-colors"
                  >
                    {/* 순위 */}
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index < 3 ? 'bg-[#d64f79]/20 text-[#d64f79]' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>

                    {/* ETF 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{etf.shortName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-500">{etf.ticker}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {etf.marketClass}
                        </span>
                      </div>
                    </div>

                    {/* 가격 & 수익률 */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-white">{formatNumber(etf.price)}</div>
                      <div className={`text-xs ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                        {formatPercent(etf.changePercent)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-sm text-gray-400">해당 테마의 ETF가 없습니다</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSelectedTheme(null)
                    onNavigate('discover')
                  }}
                >
                  탐색 페이지로 이동
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 지금 뜨는 테마 전체 모달 */}
      <Dialog open={showTrendingModal} onOpenChange={setShowTrendingModal}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-white">지금 뜨는 테마</DialogTitle>
            <p className="text-xs text-gray-400">전일대비 등락률 · 2026.02.10 기준</p>
          </DialogHeader>

          {/* 국내/해외 탭 */}
          <div className="flex gap-4 border-b border-[#2d2640]">
            <button className="pb-2 text-sm font-medium text-white border-b-2 border-[#d64f79]">
              국내
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500">
              해외
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-150px)] -mx-2 px-2 mt-2">
            {allTrendingThemes.map((theme) => (
              <button
                key={theme.rank}
                onClick={() => {
                  setShowTrendingModal(false)
                  setSelectedTheme({ theme: theme.name, weeklyReturn: theme.change })
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#2a2438] rounded-lg transition-colors"
              >
                <span className={`text-sm font-bold ${theme.rank <= 3 ? 'text-[#d64f79]' : 'text-gray-500'}`}>
                  {theme.rank}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-up text-xs">▲</span>
                  <span className="text-[10px] text-gray-500">{theme.count}</span>
                </div>
                <span className="text-sm text-white flex-1 text-left">{theme.name}</span>
                <span className={`text-sm font-medium ${theme.change >= 0 ? 'text-up' : 'text-down'}`}>
                  {theme.change >= 0 ? '+' : ''}{theme.change.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 구성종목 검색 모달 */}
      <Dialog open={showConstituentModal} onOpenChange={setShowConstituentModal}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-white">ETF 구성종목 검색</DialogTitle>
          </DialogHeader>

          {/* 검색 입력창 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={constituentSearchQuery}
              onChange={(e) => setConstituentSearchQuery(e.target.value)}
              placeholder="종목명을 입력해주세요"
              className="w-full pl-9 pr-3 py-2.5 bg-[#2a2438] border border-[#3d3650] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d64f79]"
            />
          </div>

          {/* 빠른 필터 칩 - 개별 종목명 예시 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['삼성전자', 'SK하이닉스', '현대차', 'TSLA'].map((chip) => (
              <button
                key={chip}
                onClick={() => setConstituentSearchQuery(chip)}
                className="px-3 py-1 rounded-full text-xs text-gray-400 border border-[#3d3650] hover:border-[#d64f79] hover:text-[#d64f79] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* 검색 결과 */}
          {constituentSearchQuery ? (
            <div className="overflow-y-auto max-h-[calc(80vh-220px)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">총 {constituentSearchResults.length}건</span>
                <span className="text-[10px] text-gray-500">비중높은순</span>
              </div>
              {constituentSearchResults.map(({ etf, weight }) => (
                <button
                  key={etf.id}
                  onClick={() => {
                    setShowConstituentModal(false)
                    setConstituentSearchQuery('')
                    onSelectETF(etf)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#2a2438] rounded-lg transition-colors"
                >
                  {/* ETF 뱃지 */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2d2640] text-[10px] text-gray-400 font-medium shrink-0">
                    ETF
                  </div>

                  {/* 종목명 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm text-white truncate">{etf.shortName}</div>
                    {/* 비중 바 */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-[#2d2640] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#d64f79] rounded-full"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#d64f79] shrink-0">{weight}%</span>
                    </div>
                  </div>

                  {/* 즐겨찾기 */}
                  <button className="p-1 text-gray-500 hover:text-[#d64f79] shrink-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-500">종목명을 입력하면<br/>해당 종목이 포함된 ETF를 찾아드립니다</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
