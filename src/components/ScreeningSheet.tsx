import { useState, useEffect } from 'react'
import { X, RotateCcw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RangeSlider } from '@/components/RangeSlider'
import type { ETF } from '@/data/mockData'

// 스크리닝 필터 상태 타입
export interface ScreeningFilters {
  // 기본 정보
  issuers: string[]
  assetClasses: string[]
  investRegions: string[]
  leverageType: 'all' | 'normal' | 'leveraged' | 'inverse'
  hedgeType: 'all' | 'hedged' | 'unhedged'
  listingPeriod: 'all' | '1y' | '3y' | '5y'

  // 비용 & 규모
  ter: [number, number]
  aum: [number, number]  // 억원 단위
  adtv: [number, number]  // 억원 단위
  discrepancy: [number, number]
  trackingError: [number, number]

  // 수익률
  return1m: [number, number]
  return3m: [number, number]
  returnYtd: [number, number]
  return1y: [number, number]
  volatility: [number, number]
  healthScore: [number, number]

  // 배당
  dividendYield: [number, number]
  dividendFrequency: string[]

  // 구성 & 분산
  componentCount: [number, number]
  top10Concentration: [number, number]
}

// 기본 필터 값
export const defaultFilters: ScreeningFilters = {
  issuers: [],
  assetClasses: [],
  investRegions: [],
  leverageType: 'all',
  hedgeType: 'all',
  listingPeriod: 'all',

  ter: [0, 1],
  aum: [0, 50000],  // 0 ~ 5조
  adtv: [0, 10000],  // 0 ~ 1조
  discrepancy: [-2, 2],
  trackingError: [0, 5],

  return1m: [-20, 20],
  return3m: [-30, 30],
  returnYtd: [-50, 50],
  return1y: [-50, 100],
  volatility: [0, 50],
  healthScore: [0, 100],

  dividendYield: [0, 15],
  dividendFrequency: [],

  componentCount: [0, 500],
  top10Concentration: [0, 100]
}

// 카테고리 탭 정의
const categories = [
  { id: 'basic', name: '기본' },
  { id: 'cost', name: '비용' },
  { id: 'return', name: '수익' },
  { id: 'dividend', name: '배당' },
  { id: 'composition', name: '구성' }
]

// 운용사 목록
const issuers = [
  '미래에셋자산운용', '삼성자산운용', 'KB자산운용', '한화자산운용',
  '키움투자자산운용', 'NH아문디자산운용', '신한자산운용', '하나자산운용'
]

// 자산분류 목록
const assetClasses = [
  { id: '주식', name: '주식' },
  { id: '채권', name: '채권' },
  { id: '원자재', name: '원자재' },
  { id: '통화', name: '통화' },
  { id: '혼합', name: '혼합' }
]

// 투자지역 목록
const investRegions = [
  { id: 'domestic', name: '국내' },
  { id: 'us', name: '미국' },
  { id: 'china', name: '중국' },
  { id: 'japan', name: '일본' },
  { id: 'india', name: '인도' },
  { id: 'vietnam', name: '베트남' },
  { id: 'global', name: '글로벌' },
  { id: 'europe', name: '유럽' }
]

// 배당주기 목록
const dividendFrequencies = [
  { id: 'monthly', name: '월배당' },
  { id: 'quarterly', name: '분기' },
  { id: 'semiannual', name: '반기' },
  { id: 'annual', name: '연배당' },
  { id: 'none', name: '없음' }
]

// 지표 설명 데이터
const tooltipData: Record<string, { title: string; description: string }> = {
  ter: {
    title: '총보수 (TER)',
    description: 'ETF를 운용하는데 드는 연간 총 비용입니다. 0.07%라면 1년에 1만원당 7원을 운용사에 지불합니다. 낮을수록 투자자에게 유리합니다.'
  },
  aum: {
    title: '순자산 (AUM)',
    description: '펀드의 총 규모를 나타냅니다. 규모가 클수록 안정적으로 운용되며, 상장폐지 위험이 낮습니다.'
  },
  adtv: {
    title: '일평균 거래대금',
    description: '하루 평균 거래되는 금액입니다. 높을수록 매매가 쉽고 가격 충격 없이 거래할 수 있습니다.'
  },
  discrepancy: {
    title: '괴리율',
    description: 'NAV(순자산가치) 대비 시장가격의 차이입니다. 0에 가까울수록 적정 가격에 거래되고 있음을 의미합니다.'
  },
  trackingError: {
    title: '추적오차',
    description: '기초지수 대비 수익률의 오차입니다. 낮을수록 지수를 잘 추종하는 ETF입니다.'
  },
  volatility: {
    title: '변동성',
    description: '가격의 등락폭을 나타냅니다. 높을수록 고위험/고수익, 낮을수록 안정적입니다.'
  },
  healthScore: {
    title: '건전성 점수',
    description: 'TER, 괴리율, 스프레드, 유동성 등을 종합한 점수입니다. 높을수록 건전한 ETF입니다.'
  },
  dividendYield: {
    title: '배당수익률',
    description: '연간 분배금을 현재가로 나눈 비율입니다. 배당 투자자에게 중요한 지표입니다.'
  },
  componentCount: {
    title: '구성종목 수',
    description: 'ETF가 보유한 종목 수입니다. 많을수록 분산투자 효과가 큽니다.'
  },
  top10Concentration: {
    title: '상위10 집중도',
    description: '상위 10개 종목의 비중 합계입니다. 낮을수록 분산이 잘 되어 있습니다.'
  }
}

interface ScreeningSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: ScreeningFilters
  onFiltersChange: (filters: ScreeningFilters) => void
  etfs: ETF[]
}

// 배당주기 id -> 한글명 변환
const getDividendFrequencyName = (id: string): string => {
  const freq = dividendFrequencies.find(f => f.id === id)
  return freq ? freq.name : id
}

// 투자지역 id -> 한글명 변환
const getInvestRegionName = (id: string): string => {
  const region = investRegions.find(r => r.id === id)
  return region ? region.name : id
}

export function ScreeningSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  etfs: _etfs
}: ScreeningSheetProps) {
  const [activeCategory, setActiveCategory] = useState('basic')
  const [localFilters, setLocalFilters] = useState<ScreeningFilters>(filters)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // 필터 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // 필터링된 ETF 수 계산 - 성능 최적화를 위해 버튼 클릭 시에만 계산하도록 변경
  // const filteredCount = useMemo(() => {
  //   return etfs.filter(etf => applyFilters(etf, localFilters)).length
  // }, [etfs, localFilters])

  const handleReset = () => {
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const updateFilter = <K extends keyof ScreeningFilters>(
    key: K,
    value: ScreeningFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: 'issuers' | 'assetClasses' | 'investRegions' | 'dividendFrequency', value: string) => {
    setLocalFilters(prev => {
      const arr = prev[key] as string[]
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [key]: [...arr, value] }
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - z-index를 높여서 BottomNav 위에 표시 */}
      <div
        className="fixed inset-0 bg-black/60 z-[55]"
        onClick={onClose}
      />

      {/* Sheet - z-index를 높여서 BottomNav 위에 표시 */}
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-[#191322] rounded-t-2xl h-[80vh] flex flex-col animate-slide-up pb-16">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#2d2640]">
          <h2 className="text-[21px] font-semibold text-white">ETF 스크리닝</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 text-[15px] text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#2d2640] rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 선택된 필터 슬롯 */}
        {(localFilters.issuers.length > 0 ||
          localFilters.assetClasses.length > 0 ||
          localFilters.investRegions.length > 0 ||
          localFilters.leverageType !== 'all' ||
          localFilters.hedgeType !== 'all' ||
          localFilters.listingPeriod !== 'all' ||
          localFilters.ter[0] !== defaultFilters.ter[0] || localFilters.ter[1] !== defaultFilters.ter[1] ||
          localFilters.aum[0] !== defaultFilters.aum[0] || localFilters.aum[1] !== defaultFilters.aum[1] ||
          localFilters.adtv[0] !== defaultFilters.adtv[0] || localFilters.adtv[1] !== defaultFilters.adtv[1] ||
          localFilters.discrepancy[0] !== defaultFilters.discrepancy[0] || localFilters.discrepancy[1] !== defaultFilters.discrepancy[1] ||
          localFilters.trackingError[0] !== defaultFilters.trackingError[0] || localFilters.trackingError[1] !== defaultFilters.trackingError[1] ||
          localFilters.return1m[0] !== defaultFilters.return1m[0] || localFilters.return1m[1] !== defaultFilters.return1m[1] ||
          localFilters.return3m[0] !== defaultFilters.return3m[0] || localFilters.return3m[1] !== defaultFilters.return3m[1] ||
          localFilters.returnYtd[0] !== defaultFilters.returnYtd[0] || localFilters.returnYtd[1] !== defaultFilters.returnYtd[1] ||
          localFilters.return1y[0] !== defaultFilters.return1y[0] || localFilters.return1y[1] !== defaultFilters.return1y[1] ||
          localFilters.volatility[0] !== defaultFilters.volatility[0] || localFilters.volatility[1] !== defaultFilters.volatility[1] ||
          localFilters.healthScore[0] !== defaultFilters.healthScore[0] || localFilters.healthScore[1] !== defaultFilters.healthScore[1] ||
          localFilters.dividendYield[0] !== defaultFilters.dividendYield[0] || localFilters.dividendYield[1] !== defaultFilters.dividendYield[1] ||
          localFilters.dividendFrequency.length > 0 ||
          localFilters.componentCount[0] !== defaultFilters.componentCount[0] || localFilters.componentCount[1] !== defaultFilters.componentCount[1] ||
          localFilters.top10Concentration[0] !== defaultFilters.top10Concentration[0] || localFilters.top10Concentration[1] !== defaultFilters.top10Concentration[1]
        ) && (
          <div className="shrink-0 px-4 py-2 border-b border-[#2d2640] bg-[#1a1424] max-h-20 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {localFilters.issuers.map(issuer => (
                <span key={issuer} className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {issuer.replace('자산운용', '')}
                  <button onClick={() => updateFilter('issuers', localFilters.issuers.filter(i => i !== issuer))} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {localFilters.assetClasses.map(ac => (
                <span key={ac} className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {ac}
                  <button onClick={() => updateFilter('assetClasses', localFilters.assetClasses.filter(a => a !== ac))} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {localFilters.investRegions.map(region => (
                <span key={region} className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {getInvestRegionName(region)}
                  <button onClick={() => updateFilter('investRegions', localFilters.investRegions.filter(r => r !== region))} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {localFilters.leverageType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {localFilters.leverageType === 'normal' ? '일반' : localFilters.leverageType === 'leveraged' ? '레버리지' : '인버스'}
                  <button onClick={() => updateFilter('leverageType', 'all')} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {localFilters.hedgeType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {localFilters.hedgeType === 'hedged' ? '환헤지' : '환노출'}
                  <button onClick={() => updateFilter('hedgeType', 'all')} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {localFilters.listingPeriod !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  상장{localFilters.listingPeriod === '1y' ? '1년↑' : localFilters.listingPeriod === '3y' ? '3년↑' : '5년↑'}
                  <button onClick={() => updateFilter('listingPeriod', 'all')} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.ter[0] !== defaultFilters.ter[0] || localFilters.ter[1] !== defaultFilters.ter[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  TER {localFilters.ter[0].toFixed(2)}~{localFilters.ter[1].toFixed(2)}%
                  <button onClick={() => updateFilter('ter', defaultFilters.ter)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.aum[0] !== defaultFilters.aum[0] || localFilters.aum[1] !== defaultFilters.aum[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  AUM {localFilters.aum[0]}~{localFilters.aum[1]}억
                  <button onClick={() => updateFilter('aum', defaultFilters.aum)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.adtv[0] !== defaultFilters.adtv[0] || localFilters.adtv[1] !== defaultFilters.adtv[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  거래대금 {localFilters.adtv[0]}~{localFilters.adtv[1]}억
                  <button onClick={() => updateFilter('adtv', defaultFilters.adtv)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.discrepancy[0] !== defaultFilters.discrepancy[0] || localFilters.discrepancy[1] !== defaultFilters.discrepancy[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  괴리율 {localFilters.discrepancy[0]}~{localFilters.discrepancy[1]}%
                  <button onClick={() => updateFilter('discrepancy', defaultFilters.discrepancy)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.healthScore[0] !== defaultFilters.healthScore[0] || localFilters.healthScore[1] !== defaultFilters.healthScore[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  건전성 {localFilters.healthScore[0]}~{localFilters.healthScore[1]}점
                  <button onClick={() => updateFilter('healthScore', defaultFilters.healthScore)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.dividendYield[0] !== defaultFilters.dividendYield[0] || localFilters.dividendYield[1] !== defaultFilters.dividendYield[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  배당 {localFilters.dividendYield[0]}~{localFilters.dividendYield[1]}%
                  <button onClick={() => updateFilter('dividendYield', defaultFilters.dividendYield)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {localFilters.dividendFrequency.map(freq => (
                <span key={freq} className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  {getDividendFrequencyName(freq)}
                  <button onClick={() => updateFilter('dividendFrequency', localFilters.dividendFrequency.filter(f => f !== freq))} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {/* 비용 카테고리 */}
              {(localFilters.trackingError[0] !== defaultFilters.trackingError[0] || localFilters.trackingError[1] !== defaultFilters.trackingError[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  추적오차 {localFilters.trackingError[0]}~{localFilters.trackingError[1]}%
                  <button onClick={() => updateFilter('trackingError', defaultFilters.trackingError)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {/* 수익 카테고리 */}
              {(localFilters.return1m[0] !== defaultFilters.return1m[0] || localFilters.return1m[1] !== defaultFilters.return1m[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  1개월 {localFilters.return1m[0]}~{localFilters.return1m[1]}%
                  <button onClick={() => updateFilter('return1m', defaultFilters.return1m)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.return3m[0] !== defaultFilters.return3m[0] || localFilters.return3m[1] !== defaultFilters.return3m[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  3개월 {localFilters.return3m[0]}~{localFilters.return3m[1]}%
                  <button onClick={() => updateFilter('return3m', defaultFilters.return3m)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.returnYtd[0] !== defaultFilters.returnYtd[0] || localFilters.returnYtd[1] !== defaultFilters.returnYtd[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  연초대비 {localFilters.returnYtd[0]}~{localFilters.returnYtd[1]}%
                  <button onClick={() => updateFilter('returnYtd', defaultFilters.returnYtd)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.return1y[0] !== defaultFilters.return1y[0] || localFilters.return1y[1] !== defaultFilters.return1y[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  1년 {localFilters.return1y[0]}~{localFilters.return1y[1]}%
                  <button onClick={() => updateFilter('return1y', defaultFilters.return1y)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.volatility[0] !== defaultFilters.volatility[0] || localFilters.volatility[1] !== defaultFilters.volatility[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  변동성 {localFilters.volatility[0]}~{localFilters.volatility[1]}%
                  <button onClick={() => updateFilter('volatility', defaultFilters.volatility)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {/* 구성 카테고리 */}
              {(localFilters.componentCount[0] !== defaultFilters.componentCount[0] || localFilters.componentCount[1] !== defaultFilters.componentCount[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  종목수 {localFilters.componentCount[0]}~{localFilters.componentCount[1]}개
                  <button onClick={() => updateFilter('componentCount', defaultFilters.componentCount)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(localFilters.top10Concentration[0] !== defaultFilters.top10Concentration[0] || localFilters.top10Concentration[1] !== defaultFilters.top10Concentration[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#d64f79]/20 border border-[#d64f79]/40 rounded-full text-[15px] text-[#d64f79]">
                  상위10 {localFilters.top10Concentration[0]}~{localFilters.top10Concentration[1]}%
                  <button onClick={() => updateFilter('top10Concentration', defaultFilters.top10Concentration)} className="hover:bg-[#d64f79]/30 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Category Tabs (Left) */}
          <div className="w-20 bg-[#1a1424] border-r border-[#2d2640] flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full py-4 text-[17px] font-medium transition-colors
                  ${activeCategory === cat.id
                    ? 'bg-[#191322] text-[#d64f79] border-r-2 border-[#d64f79]'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filter Content (Right) */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* 기본 정보 */}
            {activeCategory === 'basic' && (
              <div className="space-y-6">
                {/* 운용사 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">운용사</h3>
                  <div className="flex flex-wrap gap-2">
                    {issuers.map(issuer => {
                      const shortName = issuer.replace('자산운용', '').replace('투자자산운용', '')
                      const selected = localFilters.issuers.includes(issuer)
                      return (
                        <button
                          key={issuer}
                          onClick={() => toggleArrayFilter('issuers', issuer)}
                          className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                            ${selected
                              ? 'bg-[#d64f79] text-white'
                              : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                            }`}
                        >
                          {shortName}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 자산분류 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">자산분류</h3>
                  <div className="flex flex-wrap gap-2">
                    {assetClasses.map(ac => {
                      const selected = localFilters.assetClasses.includes(ac.id)
                      return (
                        <button
                          key={ac.id}
                          onClick={() => toggleArrayFilter('assetClasses', ac.id)}
                          className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                            ${selected
                              ? 'bg-[#d64f79] text-white'
                              : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                            }`}
                        >
                          {ac.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 투자지역 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">투자지역</h3>
                  <div className="flex flex-wrap gap-2">
                    {investRegions.map(region => {
                      const selected = localFilters.investRegions.includes(region.id)
                      return (
                        <button
                          key={region.id}
                          onClick={() => toggleArrayFilter('investRegions', region.id)}
                          className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                            ${selected
                              ? 'bg-[#d64f79] text-white'
                              : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                            }`}
                        >
                          {region.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 레버리지 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">레버리지/인버스</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', name: '전체' },
                      { id: 'normal', name: '일반만' },
                      { id: 'leveraged', name: '레버리지' },
                      { id: 'inverse', name: '인버스' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateFilter('leverageType', opt.id as ScreeningFilters['leverageType'])}
                        className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                          ${localFilters.leverageType === opt.id
                            ? 'bg-[#d64f79] text-white'
                            : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                          }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 환헤지 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">환헤지</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', name: '전체' },
                      { id: 'hedged', name: '헤지' },
                      { id: 'unhedged', name: '언헤지' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateFilter('hedgeType', opt.id as ScreeningFilters['hedgeType'])}
                        className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                          ${localFilters.hedgeType === opt.id
                            ? 'bg-[#d64f79] text-white'
                            : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                          }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상장 기간 */}
                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">상장 기간</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', name: '전체' },
                      { id: '1y', name: '1년 이상' },
                      { id: '3y', name: '3년 이상' },
                      { id: '5y', name: '5년 이상' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateFilter('listingPeriod', opt.id as ScreeningFilters['listingPeriod'])}
                        className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                          ${localFilters.listingPeriod === opt.id
                            ? 'bg-[#d64f79] text-white'
                            : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                          }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 비용 & 규모 */}
            {activeCategory === 'cost' && (
              <div className="space-y-2">
                <RangeSlider
                  label="총보수 (TER)"
                  min={0}
                  max={1}
                  step={0.01}
                  value={localFilters.ter}
                  onChange={(v) => updateFilter('ter', v)}
                  formatValue={(v) => `${v.toFixed(2)}%`}
                  onHelpClick={() => setShowTooltip('ter')}
                />

                <RangeSlider
                  label="순자산 (AUM)"
                  min={0}
                  max={50000}
                  step={100}
                  value={localFilters.aum}
                  onChange={(v) => updateFilter('aum', v)}
                  formatValue={(v) => v >= 10000 ? `${(v / 10000).toFixed(1)}조` : `${v}억`}
                  onHelpClick={() => setShowTooltip('aum')}
                />

                <RangeSlider
                  label="일평균 거래대금"
                  min={0}
                  max={10000}
                  step={10}
                  value={localFilters.adtv}
                  onChange={(v) => updateFilter('adtv', v)}
                  formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}천억` : `${v}억`}
                  onHelpClick={() => setShowTooltip('adtv')}
                />

                <RangeSlider
                  label="괴리율"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={localFilters.discrepancy}
                  onChange={(v) => updateFilter('discrepancy', v)}
                  formatValue={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  onHelpClick={() => setShowTooltip('discrepancy')}
                />

                <RangeSlider
                  label="추적오차"
                  min={0}
                  max={5}
                  step={0.1}
                  value={localFilters.trackingError}
                  onChange={(v) => updateFilter('trackingError', v)}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                  onHelpClick={() => setShowTooltip('trackingError')}
                />
              </div>
            )}

            {/* 수익률 */}
            {activeCategory === 'return' && (
              <div className="space-y-2">
                <RangeSlider
                  label="1개월 수익률"
                  min={-20}
                  max={20}
                  step={1}
                  value={localFilters.return1m}
                  onChange={(v) => updateFilter('return1m', v)}
                  formatValue={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                />

                <RangeSlider
                  label="3개월 수익률"
                  min={-30}
                  max={30}
                  step={1}
                  value={localFilters.return3m}
                  onChange={(v) => updateFilter('return3m', v)}
                  formatValue={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                />

                <RangeSlider
                  label="YTD 수익률"
                  min={-50}
                  max={50}
                  step={1}
                  value={localFilters.returnYtd}
                  onChange={(v) => updateFilter('returnYtd', v)}
                  formatValue={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                />

                <RangeSlider
                  label="1년 수익률"
                  min={-50}
                  max={100}
                  step={1}
                  value={localFilters.return1y}
                  onChange={(v) => updateFilter('return1y', v)}
                  formatValue={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                />

                <RangeSlider
                  label="변동성"
                  min={0}
                  max={50}
                  step={1}
                  value={localFilters.volatility}
                  onChange={(v) => updateFilter('volatility', v)}
                  formatValue={(v) => `${v}%`}
                  onHelpClick={() => setShowTooltip('volatility')}
                />

                <RangeSlider
                  label="건전성 점수"
                  min={0}
                  max={100}
                  step={5}
                  value={localFilters.healthScore}
                  onChange={(v) => updateFilter('healthScore', v)}
                  formatValue={(v) => `${v}점`}
                  onHelpClick={() => setShowTooltip('healthScore')}
                />
              </div>
            )}

            {/* 배당 */}
            {activeCategory === 'dividend' && (
              <div className="space-y-6">
                <RangeSlider
                  label="배당수익률"
                  min={0}
                  max={15}
                  step={0.5}
                  value={localFilters.dividendYield}
                  onChange={(v) => updateFilter('dividendYield', v)}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                  onHelpClick={() => setShowTooltip('dividendYield')}
                />

                <div>
                  <h3 className="text-[17px] font-medium text-white mb-3">배당주기</h3>
                  <div className="flex flex-wrap gap-2">
                    {dividendFrequencies.map(freq => {
                      const selected = localFilters.dividendFrequency.includes(freq.id)
                      return (
                        <button
                          key={freq.id}
                          onClick={() => toggleArrayFilter('dividendFrequency', freq.id)}
                          className={`px-3 py-1.5 text-[15px] rounded-full transition-colors
                            ${selected
                              ? 'bg-[#d64f79] text-white'
                              : 'bg-[#1f1a2e] text-gray-400 border border-[#2d2640] hover:border-[#d64f79]'
                            }`}
                        >
                          {freq.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 구성 & 분산 */}
            {activeCategory === 'composition' && (
              <div className="space-y-2">
                <RangeSlider
                  label="구성종목 수"
                  min={0}
                  max={500}
                  step={10}
                  value={localFilters.componentCount}
                  onChange={(v) => updateFilter('componentCount', v)}
                  formatValue={(v) => v >= 500 ? '500+' : `${v}개`}
                  onHelpClick={() => setShowTooltip('componentCount')}
                />

                <RangeSlider
                  label="상위10 집중도"
                  min={0}
                  max={100}
                  step={5}
                  value={localFilters.top10Concentration}
                  onChange={(v) => updateFilter('top10Concentration', v)}
                  formatValue={(v) => `${v}%`}
                  onHelpClick={() => setShowTooltip('top10Concentration')}
                />

                <div className="mt-4 p-3 bg-[#1f1a2e] rounded-lg">
                  <p className="text-[15px] text-gray-400">
                    구성종목 수가 많을수록 분산투자 효과가 크고,
                    상위10 집중도가 낮을수록 특정 종목에 대한 의존도가 낮습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA - 필터 적용 버튼 */}
        <div className="shrink-0 p-4 border-t border-[#2d2640] bg-[#1f1a2e]">
          <Button
            onClick={handleApply}
            className="w-full h-12 text-[19px] font-semibold bg-[#d64f79] hover:bg-[#c44570] shadow-lg"
          >
            필터 적용
          </Button>
        </div>

        {/* Tooltip Modal */}
        {showTooltip && tooltipData[showTooltip] && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setShowTooltip(null)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1f1a2e] rounded-t-2xl p-4 animate-slide-up">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-[#d64f79]/20 rounded-full">
                  <Info className="h-4 w-4 text-[#d64f79]" />
                </div>
                <h3 className="text-[19px] font-semibold text-white">
                  {tooltipData[showTooltip].title}
                </h3>
              </div>
              <p className="text-[17px] text-gray-300 leading-relaxed mb-4">
                {tooltipData[showTooltip].description}
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowTooltip(null)}
                className="w-full"
              >
                확인
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

// 필터 적용 함수 (export하여 DiscoverPage에서 사용)
export function applyFilters(etf: ETF, filters: ScreeningFilters): boolean {
  // 운용사 필터
  if (filters.issuers.length > 0 && !filters.issuers.includes(etf.issuer)) {
    return false
  }

  // 자산분류 필터
  if (filters.assetClasses.length > 0 && !filters.assetClasses.includes(etf.assetClass)) {
    return false
  }

  // 투자지역 필터
  if (filters.investRegions.length > 0) {
    const etfRegion = etf.investRegion || getRegionFromETF(etf)
    if (!filters.investRegions.includes(etfRegion)) {
      return false
    }
  }

  // 레버리지 필터
  if (filters.leverageType === 'normal' && (etf.isLeveraged || etf.isInverse)) {
    return false
  }
  if (filters.leverageType === 'leveraged' && !etf.isLeveraged) {
    return false
  }
  if (filters.leverageType === 'inverse' && !etf.isInverse) {
    return false
  }

  // 환헤지 필터
  if (filters.hedgeType === 'hedged' && !etf.isHedged) {
    return false
  }
  if (filters.hedgeType === 'unhedged' && etf.isHedged) {
    return false
  }

  // 상장기간 필터
  if (filters.listingPeriod !== 'all') {
    const listedDate = new Date(etf.listedDate.replace(/\//g, '-'))
    const now = new Date()
    const yearsDiff = (now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

    if (filters.listingPeriod === '1y' && yearsDiff < 1) return false
    if (filters.listingPeriod === '3y' && yearsDiff < 3) return false
    if (filters.listingPeriod === '5y' && yearsDiff < 5) return false
  }

  // 비용 & 규모 필터 (기본값과 다를 때만 적용)
  const isTerFiltered = filters.ter[0] !== defaultFilters.ter[0] || filters.ter[1] !== defaultFilters.ter[1]
  if (isTerFiltered && (etf.ter < filters.ter[0] || etf.ter > filters.ter[1])) return false

  const aumInBillion = etf.aum / 100000000  // 원 -> 억 변환
  const isAumFiltered = filters.aum[0] !== defaultFilters.aum[0] || filters.aum[1] !== defaultFilters.aum[1]
  if (isAumFiltered && (aumInBillion < filters.aum[0] || aumInBillion > filters.aum[1])) return false

  const adtvInBillion = etf.adtv / 100000000  // 원 -> 억 변환
  const isAdtvFiltered = filters.adtv[0] !== defaultFilters.adtv[0] || filters.adtv[1] !== defaultFilters.adtv[1]
  if (isAdtvFiltered && (adtvInBillion < filters.adtv[0] || adtvInBillion > filters.adtv[1])) return false

  const isDiscrepancyFiltered = filters.discrepancy[0] !== defaultFilters.discrepancy[0] || filters.discrepancy[1] !== defaultFilters.discrepancy[1]
  if (isDiscrepancyFiltered && (etf.discrepancy < filters.discrepancy[0] || etf.discrepancy > filters.discrepancy[1])) return false

  const isTrackingErrorFiltered = filters.trackingError[0] !== defaultFilters.trackingError[0] || filters.trackingError[1] !== defaultFilters.trackingError[1]
  if (isTrackingErrorFiltered && (etf.trackingError < filters.trackingError[0] || etf.trackingError > filters.trackingError[1])) return false

  // 수익률 필터 (changePercent 기반으로 추정)
  // 1개월 수익률
  const return1m = etf.returns?.['1m'] ?? etf.changePercent
  const isReturn1mFiltered = filters.return1m[0] !== defaultFilters.return1m[0] || filters.return1m[1] !== defaultFilters.return1m[1]
  if (isReturn1mFiltered && (return1m < filters.return1m[0] || return1m > filters.return1m[1])) return false

  // 3개월 수익률 (데이터 없으면 1개월 * 2.5로 추정)
  const return3m = etf.returns?.['3m'] ?? (etf.changePercent * 2.5)
  const isReturn3mFiltered = filters.return3m[0] !== defaultFilters.return3m[0] || filters.return3m[1] !== defaultFilters.return3m[1]
  if (isReturn3mFiltered && (return3m < filters.return3m[0] || return3m > filters.return3m[1])) return false

  // YTD 수익률 (데이터 없으면 1개월 * 4로 추정)
  const returnYtd = etf.returns?.ytd ?? (etf.changePercent * 4)
  const isReturnYtdFiltered = filters.returnYtd[0] !== defaultFilters.returnYtd[0] || filters.returnYtd[1] !== defaultFilters.returnYtd[1]
  if (isReturnYtdFiltered && (returnYtd < filters.returnYtd[0] || returnYtd > filters.returnYtd[1])) return false

  // 1년 수익률 (데이터 없으면 1개월 * 8로 추정)
  const return1y = etf.returns?.['1y'] ?? (etf.changePercent * 8)
  const isReturn1yFiltered = filters.return1y[0] !== defaultFilters.return1y[0] || filters.return1y[1] !== defaultFilters.return1y[1]
  if (isReturn1yFiltered && (return1y < filters.return1y[0] || return1y > filters.return1y[1])) return false

  const isVolatilityFiltered = filters.volatility[0] !== defaultFilters.volatility[0] || filters.volatility[1] !== defaultFilters.volatility[1]
  if (isVolatilityFiltered && (etf.volatility < filters.volatility[0] || etf.volatility > filters.volatility[1])) return false

  const isHealthScoreFiltered = filters.healthScore[0] !== defaultFilters.healthScore[0] || filters.healthScore[1] !== defaultFilters.healthScore[1]
  if (isHealthScoreFiltered && (etf.healthScore < filters.healthScore[0] || etf.healthScore > filters.healthScore[1])) return false

  // 배당 필터
  const isDividendYieldFiltered = filters.dividendYield[0] !== defaultFilters.dividendYield[0] || filters.dividendYield[1] !== defaultFilters.dividendYield[1]
  if (isDividendYieldFiltered && (etf.dividendYield < filters.dividendYield[0] || etf.dividendYield > filters.dividendYield[1])) return false

  if (filters.dividendFrequency.length > 0) {
    const etfFreq = etf.dividendFrequency || 'none'
    if (!filters.dividendFrequency.includes(etfFreq)) return false
  }

  // 구성 필터 (필터가 설정되었고 데이터가 있는 경우에만)
  const isComponentCountFiltered = filters.componentCount[0] !== defaultFilters.componentCount[0] || filters.componentCount[1] !== defaultFilters.componentCount[1]
  if (isComponentCountFiltered && etf.componentCount !== undefined) {
    if (etf.componentCount < filters.componentCount[0] || etf.componentCount > filters.componentCount[1]) return false
  }

  const isTop10Filtered = filters.top10Concentration[0] !== defaultFilters.top10Concentration[0] || filters.top10Concentration[1] !== defaultFilters.top10Concentration[1]
  if (isTop10Filtered && etf.top10Concentration !== undefined) {
    if (etf.top10Concentration < filters.top10Concentration[0] || etf.top10Concentration > filters.top10Concentration[1]) return false
  }

  return true
}

// ETF에서 투자지역 추론
function getRegionFromETF(etf: ETF): string {
  if (etf.marketClass === '국내') return 'domestic'

  const name = etf.name.toLowerCase() + etf.shortName.toLowerCase()
  const tags = etf.tags.join(' ').toLowerCase()

  if (name.includes('미국') || name.includes('s&p') || name.includes('나스닥') || tags.includes('미국')) return 'us'
  if (name.includes('중국') || name.includes('차이나') || tags.includes('중국')) return 'china'
  if (name.includes('일본') || name.includes('니케이') || tags.includes('일본')) return 'japan'
  if (name.includes('인도') || tags.includes('인도')) return 'india'
  if (name.includes('베트남') || tags.includes('베트남')) return 'vietnam'
  if (name.includes('글로벌') || name.includes('선진국') || tags.includes('글로벌')) return 'global'
  if (name.includes('유럽') || name.includes('유로') || tags.includes('유럽')) return 'europe'

  return 'other'
}
