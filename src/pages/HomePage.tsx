import React, { useState, useMemo } from 'react'
import { TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, Layers, ChevronRight, ArrowRight, BookOpen, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockETFs, themes } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

// 히트맵 테마 키워드 매핑 (ETF shortName 기반 필터링)
const themeKeywords: Record<string, string[]> = {
  'AI/반도체': ['AI', '반도체', '파운드리', 'HBM', '시스템반도체', '메모리', '칩', 'SOX'],
  '2차전지': ['2차전지', '배터리', '전기차', 'EV', '리튬', '양극재', '음극재'],
  '배당': ['배당', '고배당', '인컴', '커버드콜', '배당귀족', '배당킹', '월배당'],
  '바이오': ['바이오', '헬스케어', '제약', '의료', '비만', '신약'],
  '금융': ['금융', '은행', '보험', '증권'],
  '게임': ['게임', '엔터', 'K-콘텐츠', '미디어'],
  '메타버스': ['메타버스', 'VR', 'AR', '가상현실'],
  '신재생': ['신재생', '친환경', '클린에너지', '태양광', '풍력', '수소', '탄소'],
  '원자재': ['골드', 'Gold', '원유', 'WTI', '구리', '원자재', '농산물', '금선물', '은선물'],
  '중국': ['중국', '차이나', 'CSI', '항셍', '홍콩'],
  '미국': ['미국', 'S&P', '나스닥', 'NASDAQ', '다우', '필라델피아'],
  '채권': ['채권', '국채', '회사채', '단기채', '금리', 'KOFR', 'CD금리', '머니마켓'],
}

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, Layers
}

interface HomePageProps {
  accountType: string
  onSelectETF: (etf: ETF) => void
  onNavigate: (tab: string, theme?: string) => void
  onLongPressETF?: (etf: ETF) => void
  onAccountTypeChange?: (type: string) => void
}

// 검색 결과 인터페이스
interface SearchResult {
  type: 'name' | 'feature' | 'holding'
  etf: ETF
  matchedText?: string
  holdingWeights?: { name: string; weight: number }[]  // 구성종목 비중
}

export function HomePage({ onSelectETF, onNavigate, onLongPressETF }: HomePageProps) {
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [pensionOnly, setPensionOnly] = useState(false)
  const [holdingsSearch, setHoldingsSearch] = useState(false)
  const [holdingChips, setHoldingChips] = useState<string[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'name' | 'feature' | 'holding' | null>(null)

  // 히트맵 테마 모달 상태
  const [selectedTheme, setSelectedTheme] = useState<{ theme: string; weeklyReturn: number } | null>(null)

  // 검색 결과 계산
  const searchResults = useMemo(() => {
    const results: { nameMatches: SearchResult[]; featureMatches: SearchResult[]; holdingMatches: SearchResult[] } = {
      nameMatches: [],
      featureMatches: [],
      holdingMatches: []
    }

    // 연금 필터 적용
    let filteredETFs = mockETFs
    if (pensionOnly) {
      filteredETFs = mockETFs.filter(etf => !etf.isLeveraged && !etf.isInverse)
    }

    // 보유종목 검색 모드
    if (holdingsSearch && holdingChips.length > 0) {
      // 비중 생성 함수 (순서 기반 - 첫 번째가 가장 높음)
      const generateWeights = (holdings: string[]) => {
        // 상위 5개 기준으로 비중 배분 (합계 약 50-70%)
        const baseWeights = [15, 12, 10, 8, 6, 5, 4, 3, 2, 2]
        return holdings.map((_, idx) => {
          if (idx < baseWeights.length) return baseWeights[idx]
          return Math.max(1, 5 - Math.floor(idx / 2))
        })
      }

      filteredETFs.forEach(etf => {
        if (!etf.holdings) return
        const hasAllHoldings = holdingChips.every(chip =>
          etf.holdings!.some(h => h.toLowerCase().includes(chip.toLowerCase()))
        )
        if (hasAllHoldings) {
          // 매칭된 종목과 비중 계산
          const weights = generateWeights(etf.holdings!)
          const matchedWithWeights = etf.holdings!
            .map((h, idx) => ({ name: h, weight: weights[idx], idx }))
            .filter(item => holdingChips.some(chip => item.name.toLowerCase().includes(chip.toLowerCase())))

          results.holdingMatches.push({
            type: 'holding',
            etf,
            matchedText: matchedWithWeights.map(m => m.name).join(', '),
            holdingWeights: matchedWithWeights.map(m => ({ name: m.name, weight: m.weight }))
          })
        }
      })
      return results
    }

    const query = searchQuery.toLowerCase().trim()
    if (!query) return results

    // 띄어쓰기 무시 검색용 (금 현물 → 금현물)
    const queryNoSpace = query.replace(/\s+/g, '')
    const isShortQuery = queryNoSpace.length <= 2

    // 띄어쓰기 무시 매칭 함수
    const matchWithoutSpace = (text: string, q: string) => {
      const textLower = text.toLowerCase()
      const textNoSpace = textLower.replace(/\s+/g, '')
      return textLower.includes(q) || textNoSpace.includes(q.replace(/\s+/g, ''))
    }

    filteredETFs.forEach(etf => {
      // 종목명 일치 - 띄어쓰기 무시 매칭
      if (
        matchWithoutSpace(etf.name, query) ||
        matchWithoutSpace(etf.shortName, query) ||
        etf.ticker.includes(query)
      ) {
        results.nameMatches.push({ type: 'name', etf })
        return
      }

      // 기본정보(overview) + 주요특징(strategy) 검색
      // 짧은 검색어(2자 이하)는 오검색 방지를 위해 제외
      if (!isShortQuery) {
        // 기본 정보에서 매칭
        if (matchWithoutSpace(etf.overview, query)) {
          results.featureMatches.push({ type: 'feature', etf, matchedText: etf.overview.slice(0, 40) + '...' })
          return
        }
        // 주요 특징에서 매칭
        if (matchWithoutSpace(etf.strategy, query)) {
          results.featureMatches.push({ type: 'feature', etf, matchedText: etf.strategy.slice(0, 40) + '...' })
          return
        }
      }
    })

    return results
  }, [searchQuery, pensionOnly, holdingsSearch, holdingChips])

  // 검색 결과 클릭
  const handleSelectETF = (etf: ETF) => {
    onSelectETF(etf)
    setShowSearchResults(false)
    setSearchQuery('')
    setHoldingChips([])
    setExpandedSection(null)
  }

  // 보유종목 칩 추가
  const addHoldingChip = () => {
    if (searchQuery.trim() && holdingChips.length < 5) {
      setHoldingChips([...holdingChips, searchQuery.trim()])
      setSearchQuery('')
    }
  }

  // 보유종목 칩 제거
  const removeHoldingChip = (index: number) => {
    setHoldingChips(holdingChips.filter((_, i) => i !== index))
  }

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

  // 거래대금 기준 인기 ETF (실시간 인기)
  const popularETFs = [...mockETFs]
    .sort((a, b) => b.adtv - a.adtv)
    .slice(0, 5)

  // 레버리지/인버스 제외한 ETF 목록
  const normalETFs = mockETFs.filter(etf => !etf.isLeveraged && !etf.isInverse)

  // 수익률 상승 TOP5
  const topGainers = [...normalETFs]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5)

  // 수익률 하락 TOP5
  const topLosers = [...normalETFs]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5)

  return (
    <div className="pb-20">
      {/* Search Bar with Toggles */}
      <div className="bg-gradient-to-b from-[#2a1f3d] to-[#191322] px-4 pt-4 pb-4">
        {/* 검색창 + 토글 (우측 2열 배치) */}
        <div className="flex items-center gap-2">
          {/* 검색 입력창 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d64f79]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && holdingsSearch && searchQuery.trim()) {
                  addHoldingChip()
                }
              }}
              placeholder={holdingsSearch ? "종목명 입력 후 Enter" : "ETF 검색..."}
              className="w-full pl-9 pr-3 py-2.5 bg-[#1f1a2e] border border-[#3d3650] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d64f79]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* 토글 2열 배치 (우측) */}
          <div className="flex flex-col gap-1.5 shrink-0">
            {/* 연금가능 토글 */}
            <button
              onClick={() => setPensionOnly(!pensionOnly)}
              className="flex items-center gap-2"
            >
              <span className={`text-xs font-medium transition-colors whitespace-nowrap ${pensionOnly ? 'text-[#d64f79]' : 'text-gray-400'}`}>연금가능</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${pensionOnly ? 'bg-[#d64f79]' : 'bg-gray-600'}`}>
                <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform ${pensionOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </div>
            </button>

            {/* 구성종목 토글 */}
            <button
              onClick={() => {
                setHoldingsSearch(!holdingsSearch)
                setSearchQuery('')
                if (!holdingsSearch) {
                  setHoldingChips([])
                }
              }}
              className="flex items-center gap-2"
            >
              <span className={`text-xs font-medium transition-colors whitespace-nowrap ${holdingsSearch ? 'text-[#d64f79]' : 'text-gray-400'}`}>구성종목</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${holdingsSearch ? 'bg-[#d64f79]' : 'bg-gray-600'}`}>
                <div className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform ${holdingsSearch ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* 보유종목 검색 칩 */}
        {holdingsSearch && holdingChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {holdingChips.map((chip, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 text-[#d64f79] text-xs rounded-full"
              >
                {chip}
                <button onClick={() => removeHoldingChip(index)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <span className="text-[10px] text-gray-500 self-center ml-1">AND 조건</span>
          </div>
        )}

        {/* 검색 결과 드롭다운 */}
        {showSearchResults && (
          (holdingsSearch && holdingChips.length > 0) ||
          (!holdingsSearch && searchQuery)
        ) && (
          <div className="mt-2 bg-[#1f1a2e] border border-[#3d3650] rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            {/* 종목명 일치 - 일반 검색 모드에서만 표시 */}
            {!holdingsSearch && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-xs font-medium text-gray-400">
                  종목명 일치 ({searchResults.nameMatches.length}개)
                </span>
                {searchResults.nameMatches.length > 5 && expandedSection !== 'name' && (
                  <button
                    onClick={() => setExpandedSection('name')}
                    className="text-xs text-[#d64f79] hover:text-[#e06089]"
                  >
                    더보기
                  </button>
                )}
                {expandedSection === 'name' && (
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    접기
                  </button>
                )}
              </div>
              {searchResults.nameMatches.length === 0 ? (
                <div className="py-2 px-2 text-xs text-gray-600">일치하는 종목이 없습니다</div>
              ) : (
                searchResults.nameMatches.slice(0, expandedSection === 'name' ? undefined : 5).map(({ etf }) => (
                  <button
                    key={etf.id}
                    onClick={() => handleSelectETF(etf)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[#2d2640] rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-xs text-gray-500">{etf.ticker}</div>
                      <div className="text-sm text-white">{etf.shortName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{formatNumber(etf.price)}</div>
                      <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                        {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            )}

            {/* 특징 일치 - 일반 검색 모드에서만 표시 */}
            {!holdingsSearch && (
            <div className="p-2 border-t border-[#2d2640]">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-xs font-medium text-gray-400">
                  특징 일치 ({searchResults.featureMatches.length}개)
                </span>
                {searchResults.featureMatches.length > 5 && expandedSection !== 'feature' && (
                  <button
                    onClick={() => setExpandedSection('feature')}
                    className="text-xs text-[#d64f79] hover:text-[#e06089]"
                  >
                    더보기
                  </button>
                )}
                {expandedSection === 'feature' && (
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    접기
                  </button>
                )}
              </div>
              {searchResults.featureMatches.length === 0 ? (
                <div className="py-2 px-2 text-xs text-gray-600">일치하는 특징이 없습니다</div>
              ) : (
                searchResults.featureMatches.slice(0, expandedSection === 'feature' ? undefined : 5).map(({ etf, matchedText }) => (
                  <button
                    key={etf.id}
                    onClick={() => handleSelectETF(etf)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[#2d2640] rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-sm text-white">{etf.shortName}</div>
                      <div className="text-xs text-[#d64f79]">"{matchedText}"</div>
                    </div>
                    <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                    </div>
                  </button>
                ))
              )}
            </div>
            )}

            {/* 구성종목 일치 - 종목검색 토글 ON일 때만 표시 */}
            {holdingsSearch && searchResults.holdingMatches.length > 0 && (
              <div className="p-2 border-t border-[#2d2640]">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span className="text-xs font-medium text-gray-400">
                    구성종목 일치 ({searchResults.holdingMatches.length}개)
                  </span>
                  {searchResults.holdingMatches.length > 5 && expandedSection !== 'holding' && (
                    <button
                      onClick={() => setExpandedSection('holding')}
                      className="text-xs text-[#d64f79] hover:text-[#e06089]"
                    >
                      더보기
                    </button>
                  )}
                  {expandedSection === 'holding' && (
                    <button
                      onClick={() => setExpandedSection(null)}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      접기
                    </button>
                  )}
                </div>
                {searchResults.holdingMatches.slice(0, expandedSection === 'holding' ? undefined : 5).map(({ etf, holdingWeights }) => (
                  <button
                    key={etf.id}
                    onClick={() => handleSelectETF(etf)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[#2d2640] rounded-lg transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm text-white">{etf.shortName}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {holdingWeights?.map((hw, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                            {hw.name} <span className="text-blue-300 font-medium">{hw.weight}%</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`text-xs shrink-0 ml-2 ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 검색 결과 영역 외부 클릭시 닫기 */}
      {showSearchResults && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowSearchResults(false)}
        />
      )}

      {/* Theme/Category Grid */}
      <div className="px-4 py-2" data-tour="category-buttons">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">유형별 탐색</h2>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={() => onNavigate('discover')}>
            전체보기 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((theme) => {
            const Icon = iconMap[theme.icon] || TrendingUp
            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('discover', theme.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#1f1a2e] border border-[#2d2640] hover:border-[#d64f79]/50 transition-colors"
              >
                <div className="rounded-full bg-[#2a2438] p-2">
                  <Icon className="h-4 w-4 text-[#d64f79]" />
                </div>
                <span className="text-[10px] text-gray-300 text-center leading-tight">{theme.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hot ETFs - Horizontal Wave Ticker (증권사 티커 스타일) */}
      <div className="py-4" data-tour="popular-etf">
        <div className="flex items-center justify-between mb-3 px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">실시간 인기</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d64f79] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d64f79]"></span>
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={() => onNavigate('discover')}>
            더보기 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal Wave Ticker - 우측으로 물결 흐르듯 + Shimmer 효과 */}
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes tickerWave {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .ticker-wave {
              animation: tickerWave 25s linear infinite;
            }
            .ticker-wave:hover {
              animation-play-state: paused;
            }
            .shimmer-card {
              position: relative;
              overflow: hidden;
            }
            .shimmer-card::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent, rgba(214, 79, 121, 0.08), transparent);
              animation: shimmer 3s ease-in-out infinite;
              pointer-events: none;
            }
          `}</style>

          <div className="ticker-wave flex gap-3 py-2">
            {/* 두 번 반복하여 무한 루프 효과 */}
            {[...popularETFs, ...popularETFs].map((etf, index) => (
              <div
                key={`${etf.id}-${index}`}
                onClick={() => onSelectETF(etf)}
                onMouseDown={() => handleLongPressStart(etf)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(etf)}
                onTouchEnd={handleLongPressEnd}
                className="shimmer-card flex-shrink-0 w-[160px] bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3 cursor-pointer hover:border-[#d64f79]/50 transition-all hover:scale-105 select-none"
              >
                {/* Rank Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#d64f79]/20 text-[#d64f79] text-[10px] font-bold">
                    {(index % popularETFs.length) + 1}
                  </div>
                  <div className="text-[10px] text-gray-500">{etf.ticker}</div>
                </div>

                {/* ETF Name */}
                <div className="text-sm font-medium text-white truncate mb-1">
                  {etf.shortName}
                </div>

                {/* 시장분류 + 자산분류 배지 */}
                <div className="flex items-center gap-1 mb-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {etf.marketClass}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
                    {etf.assetClass}
                  </span>
                </div>

                {/* Price & Change */}
                <div className="flex items-end justify-between">
                  <div className="text-sm font-bold text-white">
                    {formatNumber(etf.price)}
                  </div>
                  <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${etf.change >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}`}>
                    {formatPercent(etf.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주간 테마 히트맵 */}
      <div className="px-4 py-4" data-tour="heatmap">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">주간 테마 히트맵</h2>
          <span className="text-[10px] text-gray-500">레버리지/인버스 제외</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {(() => {
            // 테마별 주간 수익률 계산 (레버리지/인버스 제외)
            const themePerformance = [
              { theme: 'AI/반도체', weeklyReturn: 4.28, count: 12 },
              { theme: '2차전지', weeklyReturn: -3.85, count: 8 },
              { theme: '배당', weeklyReturn: 1.42, count: 15 },
              { theme: '바이오', weeklyReturn: 2.15, count: 10 },
              { theme: '금융', weeklyReturn: 0.85, count: 7 },
              { theme: '게임', weeklyReturn: -2.73, count: 5 },
              { theme: '메타버스', weeklyReturn: -4.12, count: 4 },
              { theme: '신재생', weeklyReturn: -3.45, count: 6 },
              { theme: '원자재', weeklyReturn: -1.92, count: 8 },
              { theme: '중국', weeklyReturn: -2.88, count: 9 },
              { theme: '미국', weeklyReturn: 2.35, count: 18 },
              { theme: '채권', weeklyReturn: 0.28, count: 14 },
            ].sort((a, b) => b.weeklyReturn - a.weeklyReturn)

            // 색상 계산 함수 - 상승(빨강), 하락(파랑) 명확하게
            const getHeatStyle = (value: number): React.CSSProperties => {
              if (value >= 3) return { backgroundColor: 'rgba(239, 68, 68, 0.7)', color: 'white' } // 진한 빨강
              if (value >= 1.5) return { backgroundColor: 'rgba(239, 68, 68, 0.5)', color: 'white' } // 중간 빨강
              if (value >= 0) return { backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' } // 연한 빨강
              if (value >= -1.5) return { backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#3b82f6' } // 연한 파랑
              if (value >= -3) return { backgroundColor: 'rgba(59, 130, 246, 0.5)', color: 'white' } // 중간 파랑
              return { backgroundColor: 'rgba(59, 130, 246, 0.7)', color: 'white' } // 진한 파랑
            }

            return themePerformance.map((item) => (
              <div
                key={item.theme}
                className="relative p-2 rounded-lg cursor-pointer transition-all hover:scale-105"
                style={getHeatStyle(item.weeklyReturn)}
                onClick={() => setSelectedTheme(item)}
              >
                <div className="text-[10px] font-medium truncate">{item.theme}</div>
                <div className="text-xs font-bold mt-0.5">
                  {item.weeklyReturn >= 0 ? '+' : ''}{item.weeklyReturn.toFixed(1)}%
                </div>
              </div>
            ))
          })()}
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)' }}></div>
            <span className="text-[9px] text-gray-500">-3%↓</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.25)' }}></div>
            <span className="text-[9px] text-gray-500">0%↓</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)' }}></div>
            <span className="text-[9px] text-gray-500">0%↑</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.7)' }}></div>
            <span className="text-[9px] text-gray-500">+3%↑</span>
          </div>
        </div>
      </div>

      {/* 수익률 상하위 TOP5 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">오늘의 수익률</h2>
          <span className="text-[10px] text-gray-500">레버리지/인버스 제외</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 상승 TOP5 */}
          <div className="bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3" data-tour="top-gainers">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm">📈</span>
              <span className="text-xs font-medium text-up">상승 TOP 5</span>
            </div>
            <div className="space-y-2">
              {topGainers.map((etf, index) => (
                <div
                  key={etf.id}
                  onClick={() => onSelectETF(etf)}
                  onMouseDown={() => handleLongPressStart(etf)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(etf)}
                  onTouchEnd={handleLongPressEnd}
                  className="group flex items-center justify-between cursor-pointer hover:bg-[#2a2438] rounded px-1 py-0.5 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] text-gray-500 w-3 shrink-0">{index + 1}</span>
                    <div className="marquee-wrapper">
                      <span className="marquee-text text-xs text-white">
                        {etf.shortName}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-up shrink-0 ml-2">
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 하락 TOP5 */}
          <div className="bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3" data-tour="top-losers">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm">📉</span>
              <span className="text-xs font-medium text-down">하락 TOP 5</span>
            </div>
            <div className="space-y-2">
              {topLosers.map((etf, index) => (
                <div
                  key={etf.id}
                  onClick={() => onSelectETF(etf)}
                  onMouseDown={() => handleLongPressStart(etf)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(etf)}
                  onTouchEnd={handleLongPressEnd}
                  className="group flex items-center justify-between cursor-pointer hover:bg-[#2a2438] rounded px-1 py-0.5 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] text-gray-500 w-3 shrink-0">{index + 1}</span>
                    <div className="marquee-wrapper">
                      <span className="marquee-text text-xs text-white">
                        {etf.shortName}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-down shrink-0 ml-2">
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview - Horizontal Wave Ticker */}
      <div className="py-4" data-tour="market-status">
        <h2 className="text-base font-semibold text-white mb-3 px-4">시장 현황</h2>

        {/* Market Ticker - 우측으로 물결 흐르듯 */}
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes marketWave {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .market-wave {
              animation: marketWave 30s linear infinite;
            }
            .market-wave:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="market-wave flex gap-3 py-2 pl-4">
            {/* 시장 데이터 - 두 번 반복하여 무한 루프 */}
            {[
              { name: 'KOSPI', value: '2,542.38', change: '+0.42%', isUp: true, flag: '🇰🇷' },
              { name: 'KOSDAQ', value: '721.56', change: '+0.31%', isUp: true, flag: '🇰🇷' },
              { name: 'S&P 500', value: '6,042.12', change: '+0.58%', isUp: true, flag: '🇺🇸' },
              { name: 'NASDAQ', value: '19,478.88', change: '+0.73%', isUp: true, flag: '🇺🇸' },
              { name: 'Nikkei 225', value: '38,451.46', change: '-0.28%', isUp: false, flag: '🇯🇵' },
              { name: 'Hang Seng', value: '19,229.57', change: '+1.24%', isUp: true, flag: '🇭🇰' },
              { name: 'USD/KRW', value: '1,438.50', change: '-0.12%', isUp: false, flag: '💱' },
              { name: '국채 3년', value: '2.85%', change: '-0.02%p', isUp: false, flag: '📊' },
              // 반복
              { name: 'KOSPI', value: '2,542.38', change: '+0.42%', isUp: true, flag: '🇰🇷' },
              { name: 'KOSDAQ', value: '721.56', change: '+0.31%', isUp: true, flag: '🇰🇷' },
              { name: 'S&P 500', value: '6,042.12', change: '+0.58%', isUp: true, flag: '🇺🇸' },
              { name: 'NASDAQ', value: '19,478.88', change: '+0.73%', isUp: true, flag: '🇺🇸' },
              { name: 'Nikkei 225', value: '38,451.46', change: '-0.28%', isUp: false, flag: '🇯🇵' },
              { name: 'Hang Seng', value: '19,229.57', change: '+1.24%', isUp: true, flag: '🇭🇰' },
              { name: 'USD/KRW', value: '1,438.50', change: '-0.12%', isUp: false, flag: '💱' },
              { name: '국채 3년', value: '2.85%', change: '-0.02%p', isUp: false, flag: '📊' },
            ].map((market, index) => (
              <div
                key={`${market.name}-${index}`}
                className="flex-shrink-0 w-[140px] bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3 hover:border-[#d64f79]/30 transition-colors"
              >
                {/* Market Name with Flag */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{market.flag}</span>
                  <div className="text-xs text-gray-400 truncate">{market.name}</div>
                </div>

                {/* Value */}
                <div className="text-base font-bold text-white mb-1">
                  {market.value}
                </div>

                {/* Change */}
                <div className={`text-xs font-medium inline-block px-1.5 py-0.5 rounded ${market.isUp ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}`}>
                  {market.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ETF 탐색하기 - 탐색 페이지로 연결 */}
      <div className="px-4 py-2" data-tour="quick-links">
        <Card className="bg-gradient-to-r from-[#2a1f3d] to-[#1f1a2e] border-[#d64f79]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#d64f79]/20 p-2.5">
                  <Search className="h-5 w-5 text-[#d64f79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-0.5">
                    ETF 탐색하기
                  </h3>
                  <p className="text-xs text-gray-400">
                    테마별, 건전성별 ETF 검색 및 비교
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('discover')}
                className="shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETF 101 Guide - 투자정보 페이지로 연결 */}
      <div className="px-4 py-2 mb-4">
        <Card className="bg-gradient-to-r from-[#2a1f3d] to-[#1f1a2e] border-[#d64f79]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#d64f79]/20 p-2.5">
                  <BookOpen className="h-5 w-5 text-[#d64f79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-0.5">
                    ETF 101 - 기초부터 배우기
                  </h3>
                  <p className="text-xs text-gray-400">
                    ETF란? 수수료, 괴리율, 건전성 지표 완벽 가이드
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('investinfo')}
                className="shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <p className="text-xs text-gray-400">주간 수익률 기준 TOP 10</p>
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
                        {etf.changePercent >= 0 ? '+' : ''}{formatPercent(etf.changePercent)}
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
    </div>
  )
}
