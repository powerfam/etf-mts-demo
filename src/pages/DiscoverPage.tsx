import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, X, Filter, ShoppingCart, Star, Smartphone } from 'lucide-react'
import { mockETFs } from '@/data/mockData'
import type { ETF } from '@/data/mockData'
import { ScreeningSheet, applyFilters, defaultFilters, type ScreeningFilters } from '@/components/ScreeningSheet'
import { formatNumber, formatPercent } from '@/lib/utils'
import { ETFLogo } from '@/components/ETFLogo'

// 상세 뷰 탭
const detailTabs = [
  { id: 'basic', label: '기본정보' },
  { id: 'returns', label: '수익률' },
  { id: 'flow', label: '자금유입' },
]


// 수익률/자금유입 기간
const returnPeriods = ['1일', '1주', '1개월', '3개월', '6개월', 'YTD', '1년', '3년', '5년', '10년']
const flowPeriods = ['전일', '1주', '1개월', '3개월', '6개월', '1년', 'YTD']

// 시드 기반 랜덤 함수 (ETF id 기반으로 일관된 값 생성)
const seededRandom = (seed: number, index: number) => {
  const x = Math.sin(seed * 9999 + index * 1000) * 10000
  return x - Math.floor(x)
}

// Mock data for returns and flows
const generateMockReturns = (etf: ETF) => {
  const seed = parseInt(etf.id.replace(/\D/g, '') || '0', 10)
  return {
    '1일': etf.changePercent,
    '1주': parseFloat((seededRandom(seed, 1) * 10 - 5).toFixed(2)),
    '1개월': parseFloat((seededRandom(seed, 2) * 20 - 10).toFixed(2)),
    '3개월': parseFloat((seededRandom(seed, 3) * 30 - 15).toFixed(2)),
    '6개월': parseFloat((seededRandom(seed, 4) * 50 - 25).toFixed(2)),
    'YTD': parseFloat((seededRandom(seed, 5) * 40 - 20).toFixed(2)),
    '1년': parseFloat((seededRandom(seed, 6) * 60 - 30).toFixed(2)),
    '3년': null as number | null,
    '5년': null as number | null,
    '10년': null as number | null,
  }
}

const generateMockFlow = (etf: ETF) => {
  const seed = parseInt(etf.id.replace(/\D/g, '') || '0', 10)
  return {
    '전일': Math.round((seededRandom(seed, 10) * 200 - 100) * 10) / 10,
    '1주': Math.round((seededRandom(seed, 11) * 500 - 250) * 10) / 10,
    '1개월': Math.round((seededRandom(seed, 12) * 2000 - 1000) * 10) / 10,
    '3개월': Math.round((seededRandom(seed, 13) * 5000 - 2500) * 10) / 10,
    '6개월': Math.round((seededRandom(seed, 14) * 10000 - 5000) * 10) / 10,
    '1년': Math.round((seededRandom(seed, 15) * 20000 - 10000) * 10) / 10,
    'YTD': Math.round((seededRandom(seed, 16) * 15000 - 7500) * 10) / 10,
  }
}

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
  onGoToCompare?: (etfs: ETF[]) => void
}

const INITIAL_DISPLAY_COUNT = 10

export function DiscoverPage({
  onSelectETF,
  accountType = 'general',
  selectedTheme: externalTheme = 'all',
  onLongPressETF: _onLongPressETF,
  onGoToCompare
}: DiscoverPageProps) {
  const [internalTheme, setInternalTheme] = useState<string>(externalTheme)
  const [sortBy, setSortBy] = useState<string>('return')
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary') // 요약/상세 뷰
  const [detailTab, setDetailTab] = useState<string>('basic') // 상세 뷰 탭
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
  // 테이블 헤더 클릭 정렬 상태
  const [columnSort, setColumnSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)

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

  // 테이블 헤더 클릭 정렬 핸들러
  const handleColumnSort = (column: string) => {
    setColumnSort(prev => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { column, direction: 'desc' }
    })
  }

  // 정렬 아이콘 렌더링
  const renderSortIcon = (column: string) => {
    if (columnSort?.column !== column) {
      return <ChevronDown className="h-3 w-3 opacity-30" />
    }
    return columnSort.direction === 'asc'
      ? <ChevronUp className="h-3 w-3 text-[#d64f79]" />
      : <ChevronDown className="h-3 w-3 text-[#d64f79]" />
  }

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

  const sortedETFs = useMemo(() => {
    let sorted = [...filteredETFs].sort((a, b) => {
      switch (sortBy) {
        case 'health': return b.healthScore - a.healthScore
        case 'ter': return a.ter - b.ter
        case 'liquidity': return b.adtv - a.adtv
        case 'return': return b.changePercent - a.changePercent
        case 'holders': return getHoldersCount(b) - getHoldersCount(a)
        default: return 0
      }
    })

    // 테이블 헤더 클릭 정렬 적용
    if (columnSort) {
      const { column, direction } = columnSort
      const multiplier = direction === 'asc' ? 1 : -1
      sorted = sorted.sort((a, b) => {
        let aVal: number, bVal: number

        // 수익률 컬럼 정렬 (return_1일, return_1주, ...)
        if (column.startsWith('return_')) {
          const period = column.replace('return_', '') as keyof ReturnType<typeof generateMockReturns>
          const aReturns = generateMockReturns(a)
          const bReturns = generateMockReturns(b)
          aVal = aReturns[period] ?? -999
          bVal = bReturns[period] ?? -999
          return (aVal - bVal) * multiplier
        }

        // 자금유입 컬럼 정렬 (flow_전일, flow_1주, ...)
        if (column.startsWith('flow_')) {
          const period = column.replace('flow_', '') as keyof ReturnType<typeof generateMockFlow>
          const aFlows = generateMockFlow(a)
          const bFlows = generateMockFlow(b)
          aVal = aFlows[period]
          bVal = bFlows[period]
          return (aVal - bVal) * multiplier
        }

        switch (column) {
          case 'price': aVal = a.price; bVal = b.price; break
          case 'change': aVal = a.changePercent; bVal = b.changePercent; break
          case 'ter': aVal = a.ter; bVal = b.ter; break
          case 'discrepancy': aVal = Math.abs(a.discrepancy); bVal = Math.abs(b.discrepancy); break
          case 'adtv': aVal = a.adtv; bVal = b.adtv; break
          case 'aum': aVal = a.aum; bVal = b.aum; break
          case 'dividend': aVal = a.dividendYield; bVal = b.dividendYield; break
          case 'volume': aVal = a.adtv / a.price; bVal = b.adtv / b.price; break
          case 'inav': aVal = a.iNav; bVal = b.iNav; break
          case 'health': aVal = a.healthScore; bVal = b.healthScore; break
          default: return 0
        }
        return (aVal - bVal) * multiplier
      })
    }

    return sorted
  }, [filteredETFs, sortBy, columnSort])

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
            data-tour="screening-filter"
          >
            <Filter className="h-4 w-4" />
            {screeningFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d64f79] text-white text-[11px] rounded-full flex items-center justify-center">
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
            {(screeningFilters.adtv[0] !== defaultFilters.adtv[0] || screeningFilters.adtv[1] !== defaultFilters.adtv[1]) && (
              <FilterChip
                label={`거래대금 ${screeningFilters.adtv[0]}~${screeningFilters.adtv[1]}억`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, adtv: defaultFilters.adtv }))}
              />
            )}
            {(screeningFilters.discrepancy[0] !== defaultFilters.discrepancy[0] || screeningFilters.discrepancy[1] !== defaultFilters.discrepancy[1]) && (
              <FilterChip
                label={`괴리율 ${screeningFilters.discrepancy[0]}~${screeningFilters.discrepancy[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, discrepancy: defaultFilters.discrepancy }))}
              />
            )}
            {(screeningFilters.trackingError[0] !== defaultFilters.trackingError[0] || screeningFilters.trackingError[1] !== defaultFilters.trackingError[1]) && (
              <FilterChip
                label={`추적오차 ${screeningFilters.trackingError[0]}~${screeningFilters.trackingError[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, trackingError: defaultFilters.trackingError }))}
              />
            )}
            {(screeningFilters.return1m[0] !== defaultFilters.return1m[0] || screeningFilters.return1m[1] !== defaultFilters.return1m[1]) && (
              <FilterChip
                label={`1개월 ${screeningFilters.return1m[0]}~${screeningFilters.return1m[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, return1m: defaultFilters.return1m }))}
              />
            )}
            {(screeningFilters.return3m[0] !== defaultFilters.return3m[0] || screeningFilters.return3m[1] !== defaultFilters.return3m[1]) && (
              <FilterChip
                label={`3개월 ${screeningFilters.return3m[0]}~${screeningFilters.return3m[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, return3m: defaultFilters.return3m }))}
              />
            )}
            {(screeningFilters.returnYtd[0] !== defaultFilters.returnYtd[0] || screeningFilters.returnYtd[1] !== defaultFilters.returnYtd[1]) && (
              <FilterChip
                label={`연초대비 ${screeningFilters.returnYtd[0]}~${screeningFilters.returnYtd[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, returnYtd: defaultFilters.returnYtd }))}
              />
            )}
            {(screeningFilters.return1y[0] !== defaultFilters.return1y[0] || screeningFilters.return1y[1] !== defaultFilters.return1y[1]) && (
              <FilterChip
                label={`1년 ${screeningFilters.return1y[0]}~${screeningFilters.return1y[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, return1y: defaultFilters.return1y }))}
              />
            )}
            {(screeningFilters.volatility[0] !== defaultFilters.volatility[0] || screeningFilters.volatility[1] !== defaultFilters.volatility[1]) && (
              <FilterChip
                label={`변동성 ${screeningFilters.volatility[0]}~${screeningFilters.volatility[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, volatility: defaultFilters.volatility }))}
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
            {(screeningFilters.componentCount[0] !== defaultFilters.componentCount[0] || screeningFilters.componentCount[1] !== defaultFilters.componentCount[1]) && (
              <FilterChip
                label={`종목수 ${screeningFilters.componentCount[0]}~${screeningFilters.componentCount[1]}개`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, componentCount: defaultFilters.componentCount }))}
              />
            )}
            {(screeningFilters.top10Concentration[0] !== defaultFilters.top10Concentration[0] || screeningFilters.top10Concentration[1] !== defaultFilters.top10Concentration[1]) && (
              <FilterChip
                label={`상위10 ${screeningFilters.top10Concentration[0]}~${screeningFilters.top10Concentration[1]}%`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, top10Concentration: defaultFilters.top10Concentration }))}
              />
            )}
            {(screeningFilters.hedgeType !== 'all') && (
              <FilterChip
                label={screeningFilters.hedgeType === 'hedged' ? '환헤지' : '환노출'}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, hedgeType: 'all' }))}
              />
            )}
            {(screeningFilters.listingPeriod !== 'all') && (
              <FilterChip
                label={`상장${screeningFilters.listingPeriod === '1y' ? '1년↑' : screeningFilters.listingPeriod === '3y' ? '3년↑' : '5년↑'}`}
                onRemove={() => setScreeningFilters(prev => ({ ...prev, listingPeriod: 'all' }))}
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
      <div className="px-4 py-3 flex items-center justify-between" data-tour="screening-sort">
        {/* 왼쪽: 결과 카운트 */}
        <div className="text-sm text-gray-400 font-medium">{sortedETFs.length}개 ETF</div>

        {/* 오른쪽: 컨트롤 그룹 */}
        <div className="flex items-center gap-2" data-tour="sort-options">
          {/* 요약/상세 뷰 모드 토글 */}
          <div className="flex bg-[#2d2640] rounded-lg p-0.5" data-tour="screening-view">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'summary' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              요약
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'detail' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              상세
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

      {/* 상세 뷰 탭 (상세 모드일 때만) */}
      {viewMode === 'detail' && (
        <div className="flex gap-4 px-4 pb-2 border-b border-[#2d2640]">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id)}
              className={`text-sm pb-2 transition-colors ${
                detailTab === tab.id
                  ? 'text-[#d64f79] border-b-2 border-[#d64f79] font-medium'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 요약 뷰 */}
      {viewMode === 'summary' && (
        <div className="divide-y divide-[#2d2640]">
          {displayedETFs.map((etf) => (
            <div
              key={etf.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#2d2640]/50 transition-colors"
            >
              {/* ETF 로고 */}
              <button
                onClick={() => onSelectETF(etf)}
                className="shrink-0"
              >
                <ETFLogo shortName={etf.shortName} size="md" />
              </button>

              {/* 종목명 + 가격/수익률 (2줄) */}
              <button
                onClick={() => onSelectETF(etf)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="text-[13px] text-white truncate">{etf.shortName}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-gray-400">{formatNumber(etf.price)}원</span>
                  <span className={`text-[11px] ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </button>

              {/* 아이콘 버튼들 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleCompare(etf)}
                  className={`icon-btn-3d ${isInCompare(etf.id) ? 'icon-btn-3d-active' : ''}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleFavorite(etf.id)}
                  className={`icon-btn-3d ${favorites.includes(etf.id) ? 'icon-btn-3d-active' : ''}`}
                >
                  <Star className={`h-4 w-4 ${favorites.includes(etf.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
          {hasMoreETFs && !showAll && (
            <button onClick={() => setShowAll(true)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] text-sm text-gray-300 transition-colors">
              <span>더보기 ({sortedETFs.length - INITIAL_DISPLAY_COUNT}개 더)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          {showAll && hasMoreETFs && (
            <button onClick={() => setShowAll(false)} className="w-full py-3 flex items-center justify-center gap-2 bg-[#2d2640] hover:bg-[#3d3650] text-sm text-gray-300 transition-colors">
              <span>접기</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* 상세 뷰 - 테이블 형식 */}
      {viewMode === 'detail' && (
        <div className="px-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#2d2640] sticky top-0" data-tour="column-sort">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-3 py-2 w-40">종목</th>
                  {detailTab === 'basic' && (
                    <>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('price')}>
                        <span className="inline-flex items-center gap-0.5">현재가 {renderSortIcon('price')}</span>
                      </th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('change')}>
                        <span className="inline-flex items-center gap-0.5">등락률 {renderSortIcon('change')}</span>
                      </th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('inav')}>
                        <span className="inline-flex items-center gap-0.5">iNAV {renderSortIcon('inav')}</span>
                      </th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('discrepancy')}>
                        <span className="inline-flex items-center gap-0.5">괴리율 {renderSortIcon('discrepancy')}</span>
                      </th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('volume')}>
                        <span className="inline-flex items-center gap-0.5">거래량 {renderSortIcon('volume')}</span>
                      </th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('adtv')}>
                        <span className="inline-flex items-center gap-0.5">거래대금 {renderSortIcon('adtv')}</span>
                      </th>
                    </>
                  )}
                  {detailTab === 'returns' && (
                    <>
                      {returnPeriods.map((period) => {
                        const colId = `return_${period}`
                        return (
                          <th
                            key={period}
                            className="text-right text-xs text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white whitespace-nowrap"
                            onClick={() => handleColumnSort(colId)}
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {period} {renderSortIcon(colId)}
                            </span>
                          </th>
                        )
                      })}
                    </>
                  )}
                  {detailTab === 'flow' && (
                    <>
                      {flowPeriods.map((period) => {
                        const colId = `flow_${period}`
                        return (
                          <th
                            key={period}
                            className="text-right text-xs text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white whitespace-nowrap"
                            onClick={() => handleColumnSort(colId)}
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {period} {renderSortIcon(colId)}
                            </span>
                          </th>
                        )
                      })}
                    </>
                  )}
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">비교</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">관심</th>
                </tr>
              </thead>
              <tbody>
                {displayedETFs.map((etf) => {
                  const returns = generateMockReturns(etf)
                  const flows = generateMockFlow(etf)
                  return (
                    <tr
                      key={etf.id}
                      className="border-b border-[#2d2640] hover:bg-[#2d2640]/30 transition-colors cursor-pointer"
                      onClick={() => onSelectETF(etf)}
                    >
                      <td className="px-3 py-3">
                        <div className="marquee-wrapper max-w-[140px]">
                          <span className="marquee-text text-sm text-white">{etf.shortName}</span>
                        </div>
                        <div className="text-xs text-gray-500">{etf.ticker}</div>
                      </td>
                      {detailTab === 'basic' && (
                        <>
                          <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                            {formatNumber(etf.price)}원
                          </td>
                          <td className={`text-right text-sm px-2 py-3 whitespace-nowrap ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent)}
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                            {formatNumber(etf.iNav)}
                          </td>
                          <td className={`text-right text-sm px-2 py-3 whitespace-nowrap ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                            {etf.discrepancy.toFixed(2)}%
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                            {Math.floor(etf.adtv / etf.price / 1000).toLocaleString()}천주
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3 whitespace-nowrap">
                            {(etf.adtv / 100000000).toFixed(0)}억
                          </td>
                        </>
                      )}
                      {detailTab === 'returns' && (
                        <>
                          {returnPeriods.map((period) => {
                            const value = returns[period as keyof typeof returns]
                            const isNull = value === null
                            const numValue = isNull ? 0 : value
                            return (
                              <td
                                key={period}
                                className={`text-right text-sm px-2 py-3 whitespace-nowrap ${
                                  isNull ? 'text-gray-500' :
                                  numValue >= 0 ? 'text-up' : 'text-down'
                                }`}
                              >
                                {isNull ? '-' : `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`}
                              </td>
                            )
                          })}
                        </>
                      )}
                      {detailTab === 'flow' && (
                        <>
                          {flowPeriods.map((period) => {
                            const value = flows[period as keyof typeof flows]
                            return (
                              <td
                                key={period}
                                className={`text-right text-sm px-2 py-3 whitespace-nowrap ${
                                  value >= 0 ? 'text-up' : 'text-down'
                                }`}
                              >
                                {value >= 0 ? '+' : ''}{value}억
                              </td>
                            )
                          })}
                        </>
                      )}
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
                  )
                })}
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
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('price')}>
                      <span className="inline-flex items-center gap-1">현재가 {renderSortIcon('price')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('change')}>
                      <span className="inline-flex items-center gap-1">등락률 {renderSortIcon('change')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('ter')}>
                      <span className="inline-flex items-center gap-1">TER {renderSortIcon('ter')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('discrepancy')}>
                      <span className="inline-flex items-center gap-1">괴리율 {renderSortIcon('discrepancy')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('adtv')}>
                      <span className="inline-flex items-center gap-1">거래대금 {renderSortIcon('adtv')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('aum')}>
                      <span className="inline-flex items-center gap-1">AUM {renderSortIcon('aum')}</span>
                    </th>
                    <th className="text-right text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('dividend')}>
                      <span className="inline-flex items-center gap-1">배당률 {renderSortIcon('dividend')}</span>
                    </th>
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

      {/* 비교하기 플로팅 버튼 */}
      {compareETFs.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20" data-tour="screening-compare">
          <button
            onClick={() => onGoToCompare?.(compareETFs)}
            className="w-full py-3 rounded-xl bg-[#d64f79] text-white font-medium flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            비교하기 ({compareETFs.length}/3)
          </button>
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
