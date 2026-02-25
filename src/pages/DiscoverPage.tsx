import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X, Filter, ShoppingCart, Star, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ETFCard } from '@/components/ETFCard'
import { mockETFs } from '@/data/mockData'
import type { ETF } from '@/data/mockData'
import { ScreeningSheet, applyFilters, defaultFilters, type ScreeningFilters } from '@/components/ScreeningSheet'
import { formatNumber, formatPercent } from '@/lib/utils'

// 필터 칩 컴포넌트
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-xs text-[#d64f79]">
      <span>{label}</span>
      <button onClick={onRemove} className="hover:bg-[#d64f79]/30 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

interface DiscoverPageProps {
  onSelectETF: (etf: ETF) => void
  accountType?: string
  selectedTheme?: string
  onLongPressETF?: (etf: ETF) => void
}

const INITIAL_DISPLAY_COUNT = 10

export function DiscoverPage({
  onSelectETF,
  accountType = 'general',
  selectedTheme: externalTheme = 'all',
  onLongPressETF
}: DiscoverPageProps) {
  const [internalTheme, setInternalTheme] = useState<string>(externalTheme)
  const [sortBy, setSortBy] = useState<string>('return')
  const [mode, setMode] = useState<string>('table') // 기본값: 테이블 뷰
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false)
  const [isScreeningOpen, setIsScreeningOpen] = useState<boolean>(false)
  const [screeningFilters, setScreeningFilters] = useState<ScreeningFilters>(defaultFilters)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLandscape, setIsLandscape] = useState<boolean>(false)
  // 실제 화면 방향 감지
  const [isDeviceLandscape, setIsDeviceLandscape] = useState(
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  )

  // 화면 방향 변경 감지
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsDeviceLandscape(window.innerWidth > window.innerHeight)
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false)

  // 비교 ETFs (임시 상태)
  const [compareETFs, setCompareETFs] = useState<ETF[]>([])

  // 즐겨찾기 토글
  const toggleFavorite = (etfId: string) => {
    setFavorites(prev =>
      prev.includes(etfId) ? prev.filter(id => id !== etfId) : [...prev, etfId]
    )
  }

  // 비교함에 추가/제거
  const toggleCompare = (etf: ETF) => {
    setCompareETFs(prev => {
      if (prev.find(e => e.id === etf.id)) {
        return prev.filter(e => e.id !== etf.id)
      }
      if (prev.length >= 3) return prev
      return [...prev, etf]
    })
  }

  const isInCompare = (etfId: string) => compareETFs.some(e => e.id === etfId)

  // 외부 테마 변경 시 내부 상태 동기화
  useEffect(() => {
    setInternalTheme(externalTheme)
  }, [externalTheme])

  const selectedTheme = internalTheme

  // 연금/ISA 계좌 선택 시 자동으로 레버리지/인버스 필터링
  const isPensionAccount = accountType === 'pension' || accountType === 'isa'

  // 스크리닝 필터 카운트 계산
  const screeningFilterCount = useMemo(() => {
    let count = 0
    if (screeningFilters.issuers.length > 0) count++
    if (screeningFilters.assetClasses.length > 0) count++
    if (screeningFilters.investRegions.length > 0) count++
    if (screeningFilters.leverageType !== 'all') count++
    if (screeningFilters.hedgeType !== 'all') count++
    if (screeningFilters.listingPeriod !== 'all') count++
    if (screeningFilters.ter[0] !== defaultFilters.ter[0] || screeningFilters.ter[1] !== defaultFilters.ter[1]) count++
    if (screeningFilters.aum[0] !== defaultFilters.aum[0] || screeningFilters.aum[1] !== defaultFilters.aum[1]) count++
    if (screeningFilters.adtv[0] !== defaultFilters.adtv[0] || screeningFilters.adtv[1] !== defaultFilters.adtv[1]) count++
    if (screeningFilters.discrepancy[0] !== defaultFilters.discrepancy[0] || screeningFilters.discrepancy[1] !== defaultFilters.discrepancy[1]) count++
    if (screeningFilters.trackingError[0] !== defaultFilters.trackingError[0] || screeningFilters.trackingError[1] !== defaultFilters.trackingError[1]) count++
    if (screeningFilters.return1m[0] !== defaultFilters.return1m[0] || screeningFilters.return1m[1] !== defaultFilters.return1m[1]) count++
    if (screeningFilters.return3m[0] !== defaultFilters.return3m[0] || screeningFilters.return3m[1] !== defaultFilters.return3m[1]) count++
    if (screeningFilters.returnYtd[0] !== defaultFilters.returnYtd[0] || screeningFilters.returnYtd[1] !== defaultFilters.returnYtd[1]) count++
    if (screeningFilters.return1y[0] !== defaultFilters.return1y[0] || screeningFilters.return1y[1] !== defaultFilters.return1y[1]) count++
    if (screeningFilters.volatility[0] !== defaultFilters.volatility[0] || screeningFilters.volatility[1] !== defaultFilters.volatility[1]) count++
    if (screeningFilters.healthScore[0] !== defaultFilters.healthScore[0] || screeningFilters.healthScore[1] !== defaultFilters.healthScore[1]) count++
    if (screeningFilters.dividendYield[0] !== defaultFilters.dividendYield[0] || screeningFilters.dividendYield[1] !== defaultFilters.dividendYield[1]) count++
    if (screeningFilters.dividendFrequency.length > 0) count++
    if (screeningFilters.componentCount[0] !== defaultFilters.componentCount[0] || screeningFilters.componentCount[1] !== defaultFilters.componentCount[1]) count++
    if (screeningFilters.top10Concentration[0] !== defaultFilters.top10Concentration[0] || screeningFilters.top10Concentration[1] !== defaultFilters.top10Concentration[1]) count++
    return count
  }, [screeningFilters])

  // 스크리닝 활성화 여부
  const isScreeningActive = screeningFilterCount > 0

  const filteredETFs = mockETFs.filter(etf => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query ||
      etf.name.toLowerCase().includes(query) ||
      etf.shortName.toLowerCase().includes(query) ||
      etf.ticker.includes(query) ||
      etf.category.toLowerCase().includes(query)

    const matchesTheme = selectedTheme === 'all' || selectedTheme === 'none' || (() => {
      const themeMapping: Record<string, string[]> = {
        index: ['시장지수'],
        bond: ['채권'],
        dividend: ['배당'],
        strategy: ['전략'],
        currency: ['통화'],
        commodity: ['원자재'],
        leverage: ['레버리지'],
      }
      return themeMapping[selectedTheme]?.some(cat => etf.category.includes(cat)) || false
    })()

    const matchesPensionMode = !isPensionAccount || (!etf.isLeveraged && !etf.isInverse)

    // 스크리닝 필터 적용
    const matchesScreening = !isScreeningActive || applyFilters(etf, screeningFilters)

    return matchesSearch && matchesTheme && matchesPensionMode && matchesScreening
  })

  // 보유고객 수 계산 (holdersCount가 없으면 AUM 기반 추정)
  const getHoldersCount = (etf: ETF) => {
    if (etf.holdersCount) return etf.holdersCount
    // AUM 1조원당 약 10,000명 보유 추정 (데모용)
    return Math.round(etf.aum / 100000000)
  }

  const sortedETFs = [...filteredETFs].sort((a, b) => {
    switch (sortBy) {
      case 'health': return b.healthScore - a.healthScore
      case 'ter': return a.ter - b.ter
      case 'liquidity': return b.adtv - a.adtv
      case 'return': return b.changePercent - a.changePercent
      case 'holders': return getHoldersCount(b) - getHoldersCount(a)
      default: return 0
    }
  })

  const isFiltering = searchQuery.trim() !== '' || (selectedTheme !== 'all' && selectedTheme !== 'none')
  const displayedETFs = (showAll || isFiltering) ? sortedETFs : sortedETFs.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreETFs = sortedETFs.length > INITIAL_DISPLAY_COUNT && !isFiltering

  return (
    <div className="pb-20">
      <div className="sticky top-[52px] z-40 bg-[#191322] px-4 py-3 border-b border-[#2d2640]">
        {/* 검색바 (최상단) */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-[#1f1a2e] rounded-lg px-3 py-2 border border-[#2d2640]" data-tour="search-input">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ETF 종목명, 티커 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            />
          </div>
          <button
            onClick={() => setIsScreeningOpen(true)}
            className={`icon-btn-3d relative ${isScreeningActive ? 'icon-btn-3d-active' : ''}`}
          >
            <Filter className="h-4 w-4" />
            {screeningFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d64f79] text-white text-[10px] rounded-full flex items-center justify-center">
                {screeningFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 적용된 스크리닝 필터 요약 칩 */}
        {isScreeningActive && (
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
            {screeningFilters.issuers.length > 0 && (
              <FilterChip
                label={`운용사 ${screeningFilters.issuers.length}개`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, issuers: [] }))}
              />
            )}
            {screeningFilters.assetClasses.length > 0 && (
              <FilterChip
                label={`자산 ${screeningFilters.assetClasses.join(', ')}`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, assetClasses: [] }))}
              />
            )}
            {screeningFilters.investRegions.length > 0 && (
              <FilterChip
                label={`지역 ${screeningFilters.investRegions.length}개`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, investRegions: [] }))}
              />
            )}
            {screeningFilters.leverageType !== 'all' && (
              <FilterChip
                label={screeningFilters.leverageType === 'normal' ? '일반만' : screeningFilters.leverageType === 'leveraged' ? '레버리지' : '인버스'}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, leverageType: 'all' }))}
              />
            )}
            {(screeningFilters.ter[0] !== defaultFilters.ter[0] || screeningFilters.ter[1] !== defaultFilters.ter[1]) && (
              <FilterChip
                label={`TER ${screeningFilters.ter[0].toFixed(2)}~${screeningFilters.ter[1].toFixed(2)}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, ter: defaultFilters.ter }))}
              />
            )}
            {(screeningFilters.aum[0] !== defaultFilters.aum[0] || screeningFilters.aum[1] !== defaultFilters.aum[1]) && (
              <FilterChip
                label={`AUM ${screeningFilters.aum[0]}~${screeningFilters.aum[1]}억`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, aum: defaultFilters.aum }))}
              />
            )}
            {(screeningFilters.healthScore[0] !== defaultFilters.healthScore[0] || screeningFilters.healthScore[1] !== defaultFilters.healthScore[1]) && (
              <FilterChip
                label={`건전성 ${screeningFilters.healthScore[0]}~${screeningFilters.healthScore[1]}점`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, healthScore: defaultFilters.healthScore }))}
              />
            )}
            {(screeningFilters.dividendYield[0] !== defaultFilters.dividendYield[0] || screeningFilters.dividendYield[1] !== defaultFilters.dividendYield[1]) && (
              <FilterChip
                label={`배당 ${screeningFilters.dividendYield[0]}~${screeningFilters.dividendYield[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, dividendYield: defaultFilters.dividendYield }))}
              />
            )}
            {screeningFilters.dividendFrequency.length > 0 && (
              <FilterChip
                label={`배당주기 ${screeningFilters.dividendFrequency.length}개`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, dividendFrequency: [] }))}
              />
            )}
            <button
              onClick={() => setScreeningFilters(defaultFilters)}
              className="shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              전체 초기화
            </button>
          </div>
        )}
      </div>

      {/* 통합 컨트롤 바: 결과수 + 뷰모드 + 정렬 + 가로보기 */}
      <div className="px-4 py-3 flex items-center justify-between" data-tour="mode-tabs">
        {/* 왼쪽: 결과 카운트 */}
        <div className="text-sm text-gray-400 font-medium">{sortedETFs.length}개 ETF</div>

        {/* 오른쪽: 컨트롤 그룹 */}
        <div className="flex items-center gap-2" data-tour="sort-options">
          {/* 뷰 모드 토글 */}
          <div className="flex bg-[#2d2640] rounded-lg p-0.5">
            <button
              onClick={() => setMode('table')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                mode === 'table' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              테이블
            </button>
            <button
              onClick={() => setMode('card')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                mode === 'card' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              카드
            </button>
          </div>

          {/* 정렬 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2d2640] rounded-lg text-xs text-white"
            >
              <span>
                {sortBy === 'return' ? '수익률' :
                 sortBy === 'liquidity' ? '유동성' :
                 sortBy === 'ter' ? '저비용' :
                 sortBy === 'health' ? '건전성' :
                 '보유고객'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-[#1f1a2e] border border-[#2d2640] rounded-lg shadow-lg z-50 overflow-hidden">
                {[
                  { id: 'return', label: '수익률순' },
                  { id: 'liquidity', label: '유동성순' },
                  { id: 'ter', label: '저비용순' },
                  { id: 'holders', label: '보유고객순' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      sortBy === option.id
                        ? 'bg-[#d64f79] text-white font-medium'
                        : 'text-gray-300 hover:bg-[#2d2640]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 가로보기 버튼 */}
          <button
            onClick={() => setIsLandscape(true)}
            className="icon-btn-3d"
            title="가로보기"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 테이블 뷰 */}
      {mode === 'table' && (
        <div className="px-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#2d2640] sticky top-0">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-3 py-2 min-w-[120px]">종목</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap">현재가</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap">등락률</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap">TER</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap">괴리율</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap">거래대금</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">비교</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">관심</th>
                </tr>
              </thead>
              <tbody>
                {displayedETFs.map((etf) => (
                  <tr
                    key={etf.id}
                    className="border-b border-[#2d2640] hover:bg-[#2d2640]/30 transition-colors cursor-pointer"
                    onClick={() => onSelectETF(etf)}
                  >
                    <td className="px-3 py-3">
                      <div className="marquee-wrapper max-w-[120px]">
                        <span className="marquee-text text-sm text-white">{etf.shortName}</span>
                      </div>
                      <div className="text-xs text-gray-500">{etf.ticker}</div>
                    </td>
                    <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                      {formatNumber(etf.price)}
                    </td>
                    <td className={`text-right text-sm px-2 py-3 whitespace-nowrap ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </td>
                    <td className={`text-right text-sm px-2 py-3 whitespace-nowrap ${etf.ter <= 0.05 ? 'text-emerald-400' : etf.ter <= 0.1 ? 'text-amber-400' : 'text-white'}`}>
                      {etf.ter.toFixed(2)}%
                    </td>
                    <td className={`text-right text-sm px-2 py-3 whitespace-nowrap ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                      {etf.discrepancy.toFixed(2)}%
                    </td>
                    <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                      {(etf.adtv / 100000000).toFixed(0)}억
                    </td>
                    <td className="text-center px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleCompare(etf)}
                        className={`icon-btn-3d ${isInCompare(etf.id) ? 'icon-btn-3d-active' : ''}`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="text-center px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(etf.id)}
                        className={`icon-btn-3d ${favorites.includes(etf.id) ? 'icon-btn-3d-active' : ''}`}
                      >
                        <Star className={`h-4 w-4 ${favorites.includes(etf.id) ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMoreETFs && !showAll && (
            <button onClick={() => setShowAll(true)} className="w-full mt-3 py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] rounded-xl text-sm text-gray-300 transition-colors">
              <span>더보기 ({sortedETFs.length - INITIAL_DISPLAY_COUNT}개 더)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          {showAll && hasMoreETFs && (
            <button onClick={() => setShowAll(false)} className="w-full mt-3 py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] rounded-xl text-sm text-gray-300 transition-colors">
              <span>접기</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* 카드 뷰 */}
      {mode === 'card' && (
        <div className="px-4 space-y-3">
          {displayedETFs.map((etf) => (
            <ETFCard key={etf.id} etf={etf} onClick={() => onSelectETF(etf)} onLongPress={() => onLongPressETF?.(etf)} />
          ))}
          {hasMoreETFs && !showAll && (
            <button onClick={() => setShowAll(true)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] rounded-xl text-sm text-gray-300 transition-colors">
              <span>더보기 ({sortedETFs.length - INITIAL_DISPLAY_COUNT}개 더)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          {showAll && hasMoreETFs && (
            <button onClick={() => setShowAll(false)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] rounded-xl text-sm text-gray-300 transition-colors">
              <span>접기</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* 가로보기 모드 오버레이 */}
      {isLandscape && (
        <div className="fixed inset-0 z-[100] bg-[#191322] flex flex-col">
          <div
            className="flex-1 origin-center"
            style={!isDeviceLandscape ? {
              transform: 'rotate(90deg)',
              width: '100vh',
              height: '100vw',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-50vw',
              marginLeft: '-50vh',
            } : {
              width: '100%',
              height: '100%',
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-[#191322] border-b border-[#2d2640]">
              <h1 className="text-sm font-semibold text-white">ETF 스크리닝 (가로보기)</h1>
              <button
                onClick={() => setIsLandscape(false)}
                className="px-3 py-1 rounded-lg bg-[#d64f79] text-white text-xs"
              >
                세로로 돌아가기
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full min-w-[800px] text-xs">
                <thead className="bg-[#2d2640] sticky top-0">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-2 py-2 min-w-[130px]">종목</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">현재가</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">등락률</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">TER</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">괴리율</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">거래대금</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">AUM</th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap">배당률</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedETFs.slice(0, 30).map((etf) => (
                    <tr
                      key={etf.id}
                      onClick={() => {
                        setIsLandscape(false)
                        onSelectETF(etf)
                      }}
                      className="border-b border-[#2d2640] hover:bg-[#2d2640]/30 cursor-pointer"
                    >
                      <td className="px-2 py-2">
                        <div className="marquee-wrapper max-w-[130px]">
                          <span className="marquee-text text-white">{etf.shortName}</span>
                        </div>
                      </td>
                      <td className="text-right px-2 py-2 text-white whitespace-nowrap">{formatNumber(etf.price)}</td>
                      <td className={`text-right px-2 py-2 whitespace-nowrap ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                        {formatPercent(etf.changePercent)}
                      </td>
                      <td className="text-right px-2 py-2 text-white whitespace-nowrap">{etf.ter.toFixed(2)}%</td>
                      <td className={`text-right px-2 py-2 whitespace-nowrap ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                        {etf.discrepancy.toFixed(2)}%
                      </td>
                      <td className="text-right px-2 py-2 text-white whitespace-nowrap">{(etf.adtv / 100000000).toFixed(0)}억</td>
                      <td className="text-right px-2 py-2 text-white whitespace-nowrap">{(etf.aum / 100000000).toFixed(0)}억</td>
                      <td className="text-right px-2 py-2 text-white whitespace-nowrap">{etf.dividendYield.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 스크리닝 바텀시트 */}
      <ScreeningSheet
        isOpen={isScreeningOpen}
        onClose={() => setIsScreeningOpen(false)}
        filters={screeningFilters}
        onFiltersChange={setScreeningFilters}
        etfs={mockETFs}
      />
    </div>
  )
}
