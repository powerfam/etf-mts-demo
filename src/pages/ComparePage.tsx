import { useState, useEffect } from 'react'
import { Plus, X, Radar as RadarIcon, Search, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockETFs } from '@/data/mockData'
import { formatNumber, formatCurrency } from '@/lib/utils'
import type { ETF } from '@/data/mockData'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ComparePageProps {
  onSelectETF: (etf: ETF) => void
  initialETFs?: ETF[]
  onClearInitialETFs?: () => void
}

// 지표 설명 데이터
const metricDescriptions: Record<string, { title: string; description: string; tip: string }> = {
  ter: {
    title: 'TER (총보수)',
    description: 'Total Expense Ratio의 약자로, ETF 운용에 드는 연간 비용입니다. 운용보수, 판매보수, 수탁보수 등이 포함됩니다.',
    tip: '같은 지수를 추종하는 ETF라면 TER이 낮은 것이 유리합니다.',
  },
  discrepancy: {
    title: '괴리율',
    description: 'ETF 시장가격과 실제 자산가치(NAV)의 차이입니다. 프리미엄(+)이면 NAV 대비 비싸게, 디스카운트(-)면 싸게 거래 중입니다.',
    tip: '괴리율이 크면 NAV와 다른 가격에 매매하게 됩니다.',
  },
  spread: {
    title: '스프레드',
    description: '매수호가와 매도호가의 차이입니다. 거래 시 발생하는 숨은 비용으로, LP(유동성공급자)가 관리합니다.',
    tip: '스프레드는 매매 시 발생하는 거래 비용입니다.',
  },
  aum: {
    title: '순자산 (AUM)',
    description: 'Assets Under Management의 약자로, ETF에 투자된 총 자산규모입니다.',
    tip: 'AUM 규모에 따라 상장폐지 요건에 영향을 받을 수 있습니다.',
  },
  adtv: {
    title: '거래대금 (30일)',
    description: '최근 30일간 일평균 거래대금입니다. 유동성을 나타내며, 원하는 수량의 체결 용이성과 관련됩니다.',
    tip: '거래량이 많을수록 호가 스프레드가 좁아지는 경향이 있습니다.',
  },
  trackingError: {
    title: '추적오차',
    description: 'ETF 수익률과 기초지수 수익률의 차이입니다. 지수 추종 정확도를 나타냅니다.',
    tip: '완전복제 방식 ETF가 샘플링 방식보다 추적오차가 작은 편입니다.',
  },
  weeklyReturn: {
    title: '주간 수익률',
    description: '최근 1주일간의 가격 변동률입니다.',
    tip: '수정주가(배당 재투자 반영) 기준으로 계산됩니다.',
  },
  monthlyReturn: {
    title: '월간 수익률',
    description: '최근 1개월간의 가격 변동률입니다.',
    tip: '20영업일 기준으로 계산됩니다.',
  },
  ytdReturn: {
    title: 'YTD 수익률',
    description: '연초 대비 현재까지의 수익률(Year-To-Date)입니다.',
    tip: '해당 연도 1월 첫 영업일 종가 대비 현재가로 계산됩니다.',
  },
  dividendYield: {
    title: '배당수익률',
    description: '연간 배당금을 현재 가격으로 나눈 비율입니다.',
    tip: '과거 배당 기준이며, 향후 배당은 달라질 수 있습니다.',
  },
  high52w: {
    title: '52주 최고가',
    description: '최근 52주(1년)간 기록한 가장 높은 가격입니다.',
    tip: '현재가와 비교하여 가격 위치를 파악할 수 있습니다.',
  },
  low52w: {
    title: '52주 최저가',
    description: '최근 52주(1년)간 기록한 가장 낮은 가격입니다.',
    tip: '현재가와 비교하여 가격 위치를 파악할 수 있습니다.',
  },
  position52w: {
    title: '52주 대비 위치',
    description: '현재 가격이 52주 최저가(0%)와 최고가(100%) 사이에서 어디에 위치하는지 나타냅니다.',
    tip: '50% 이하면 52주 중 저점에 가깝고, 50% 이상이면 고점에 가깝습니다.',
  },
}

// 구성종목 데이터 (holdings 또는 기본값 사용)
const getHoldingsData = (etf: ETF) => {
  const defaultHoldings = [
    { name: '삼성전자', weight: 20.5 },
    { name: 'SK하이닉스', weight: 12.3 },
    { name: 'LG에너지솔루션', weight: 8.7 },
    { name: '삼성바이오로직스', weight: 6.2 },
    { name: '현대자동차', weight: 5.1 },
  ]

  if (etf.holdings && etf.holdings.length > 0) {
    const weights = [22, 15, 12, 9, 7]
    return etf.holdings.slice(0, 5).map((name, i) => ({
      name,
      weight: weights[i] || 5
    }))
  }
  return defaultHoldings
}

export function ComparePage({ onSelectETF, initialETFs, onClearInitialETFs }: ComparePageProps) {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([mockETFs[0], mockETFs[1], mockETFs[2]])
  const [showSelector, setShowSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [compareTab, setCompareTab] = useState<'key' | 'basic' | 'holdings'>('key')

  // 외부에서 전달된 비교 목록 적용
  useEffect(() => {
    if (initialETFs && initialETFs.length > 0) {
      setSelectedETFs(initialETFs)
      onClearInitialETFs?.() // 적용 후 초기화
    }
  }, [initialETFs, onClearInitialETFs])

  const addETF = (etf: ETF) => {
    if (selectedETFs.length < 3 && !selectedETFs.find(e => e.id === etf.id)) {
      setSelectedETFs([...selectedETFs, etf])
    }
    setShowSelector(false)
    setSearchQuery('')
  }

  // 검색 필터링
  const filteredETFs = mockETFs
    .filter(etf => !selectedETFs.find(e => e.id === etf.id))
    .filter(etf => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        etf.name.toLowerCase().includes(query) ||
        etf.shortName.toLowerCase().includes(query) ||
        etf.ticker.includes(query) ||
        etf.category.toLowerCase().includes(query) ||
        etf.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })

  const removeETF = (id: string) => {
    setSelectedETFs(selectedETFs.filter(e => e.id !== id))
  }

  // 주간 수익률 계산 (sparkline 데이터 활용)
  const getWeeklyReturn = (etf: ETF) => {
    const sparkline = etf.sparkline
    if (sparkline.length < 2) return 0
    const first = sparkline[0]
    const last = sparkline[sparkline.length - 1]
    return ((last - first) / first) * 100
  }

  // 월간 수익률 계산 (목업: 주간수익률 * 3~4배 + 변동)
  const getMonthlyReturn = (etf: ETF) => {
    const weeklyReturn = getWeeklyReturn(etf)
    // 월간 수익률은 주간의 3~4배 정도로 시뮬레이션
    const multiplier = 3 + (etf.id.charCodeAt(0) % 10) / 10
    return weeklyReturn * multiplier + (etf.volatility / 10 - 1.5)
  }

  // YTD 수익률 계산 (목업: 연초대비)
  const getYTDReturn = (etf: ETF) => {
    // YTD는 주간 수익률을 기반으로 연초부터 누적 시뮬레이션
    const weeklyReturn = getWeeklyReturn(etf)
    const multiplier = 8 + (etf.id.charCodeAt(1) % 10)
    return weeklyReturn * multiplier + etf.changePercent * 2
  }

  // 52주 대비 현재가 위치 계산 (0% = 최저가, 100% = 최고가)
  // 신고가면 100% 초과, 신저가면 0% 미만 가능
  const get52wPosition = (etf: ETF): number => {
    const range = etf.high52w - etf.low52w
    if (range <= 0) return 50
    return Math.round(((etf.price - etf.low52w) / range) * 100)
  }

  // 바 표시용 (0~100%로 클램핑)
  const get52wPositionClamped = (etf: ETF): number => {
    const pos = get52wPosition(etf)
    return Math.min(100, Math.max(0, pos))
  }

  // 신고가/신저가 여부
  const isNewHigh = (etf: ETF): boolean => etf.price > etf.high52w
  const isNewLow = (etf: ETF): boolean => etf.price < etf.low52w

  // Compare metrics - 기본정보 (배당수익률, 주간수익률 포함)
  const basicInfoMetrics = [
    {
      category: '기본정보',
      items: [
        { key: 'issuer', label: '운용사', format: (v: string) => v.replace('자산운용', '\n자산운용'), best: 'none', isText: true, multiLine: true },
        { key: 'marketClass', label: '시장구분', format: (v: string) => v, best: 'none', isText: true },
        { key: 'assetClass', label: '자산군', format: (v: string) => v, best: 'none', isText: true },
        { key: 'category', label: '카테고리', format: (v: string) => v, best: 'none', isText: true },
        { key: 'isLeveraged', label: '레버리지', format: (v: boolean) => v ? 'O' : 'X', best: 'none', isText: true },
        { key: 'isHedged', label: '환헤지', format: (v: boolean) => v ? 'O' : 'X', best: 'none', isText: true },
        { key: 'pensionEligible', label: '연금투자', format: (_v: unknown, etf?: ETF) => etf && !etf.isLeveraged && !etf.isInverse ? 'O' : 'X', best: 'none', isText: true, computed: true },
      ]
    },
    {
      category: '수익',
      items: [
        { key: 'weeklyReturn', label: '주간수익률', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'high', computed: true },
        { key: 'monthlyReturn', label: '월간수익률', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'high', computed: true },
        { key: 'ytdReturn', label: 'YTD', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'high', computed: true },
        { key: 'dividendYield', label: '배당수익률', format: (v: number) => `${v.toFixed(1)}%`, best: 'high' },
      ]
    },
    {
      category: '가격위치',
      items: [
        { key: 'high52w', label: '52주 최고가', format: (v: number) => formatNumber(v), best: 'none' },
        { key: 'low52w', label: '52주 최저가', format: (v: number) => formatNumber(v), best: 'none' },
        { key: 'position52w', label: '52주 대비 위치', format: (_v: number, etf?: ETF) => etf ? `${get52wPosition(etf)}%` : '-', best: 'none', computed: true, showBar: true },
      ]
    },
  ]

  // Compare metrics - 주요지표 (6개 평가 지표)
  const keyMetrics = [
    {
      category: '비용효율',
      items: [
        { key: 'ter', label: 'TER', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
      ]
    },
    {
      category: '가격정확도',
      items: [
        { key: 'discrepancy', label: '괴리율', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'low', absolute: true },
      ]
    },
    {
      category: '거래효율',
      items: [
        { key: 'spread', label: '스프레드', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
      ]
    },
    {
      category: '유동성',
      items: [
        { key: 'aum', label: '순자산(AUM)', format: (v: number) => formatCurrency(v), best: 'high' },
        { key: 'adtv', label: '거래대금(30일)', format: (v: number) => formatCurrency(v), best: 'high' },
      ]
    },
    {
      category: '추적정확도',
      items: [
        { key: 'trackingError', label: '추적오차', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
      ]
    },
  ]

  // 레이더 차트용 색상
  const chartColors = ['#d64f79', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6']

  // 레이더 차트용 지표 (상대 비교용) - 6개 항목 (배당수익률, 주간수익률 제외)
  // 라벨은 "넓을수록 좋음"에 맞게 긍정적 표현 사용
  const radarMetrics = [
    { key: 'ter', label: '비용효율', lowerIsBetter: true },
    { key: 'discrepancy', label: '가격정확도', lowerIsBetter: true, absolute: true },
    { key: 'aum', label: 'AUM', lowerIsBetter: false },
    { key: 'trackingError', label: '추적정확도', lowerIsBetter: true },
    { key: 'spread', label: '거래효율', lowerIsBetter: true },
    { key: 'adtv', label: '거래대금', lowerIsBetter: false },
  ]

  // 상대 비교 정규화 (1-10 스케일, 비교군 내 최저=1, 최고=10)
  const getRelativeScore = (value: number, allValues: number[], lowerIsBetter: boolean): number => {
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    if (min === max) return 5.5 // 모두 같으면 중간값
    const normalized = (value - min) / (max - min) // 0~1
    // lowerIsBetter면 낮을수록 높은 점수, 최소 1점 보장
    const score = lowerIsBetter ? (1 - normalized) * 9 + 1 : normalized * 9 + 1
    return score
  }

  // 지표값 가져오기 (computed 필드 처리)
  const getMetricValue = (etf: ETF, metric: typeof radarMetrics[0]): number => {
    if (metric.key === 'weeklyReturn') {
      return getWeeklyReturn(etf)
    }
    const value = etf[metric.key as keyof ETF] as number
    return metric.absolute ? Math.abs(value) : value
  }

  // 레이더 차트 데이터 생성 - 상대 비교
  const radarData = radarMetrics.map(metric => {
    const allValues = selectedETFs.map(etf => getMetricValue(etf, metric))

    const dataPoint: Record<string, string | number> = { metric: metric.label, fullMark: 10 }
    selectedETFs.forEach(etf => {
      const actualValue = getMetricValue(etf, metric)
      dataPoint[etf.shortName] = Math.round(getRelativeScore(actualValue, allValues, metric.lowerIsBetter) * 10) / 10
    })
    return dataPoint
  })

  // 각 ETF의 순위 계산 (1위 = 우위 항목)
  const getRankCounts = (etf: ETF) => {
    const ranks = { first: 0, second: 0, third: 0 }

    radarMetrics.forEach(metric => {
      const allValues = selectedETFs.map(e => getMetricValue(e, metric))
      const etfValue = getMetricValue(etf, metric)

      // 1위 판정: lowerIsBetter면 최소값, 아니면 최대값과 같으면 1위
      const bestValue = metric.lowerIsBetter ? Math.min(...allValues) : Math.max(...allValues)

      if (etfValue === bestValue) {
        ranks.first++
      } else {
        // 2위, 3위는 단순히 순위로 계산
        const sorted = [...new Set(allValues)].sort((a, b) => metric.lowerIsBetter ? a - b : b - a)
        const rank = sorted.indexOf(etfValue) + 1
        if (rank === 2) ranks.second++
        else if (rank === 3) ranks.third++
      }
    })

    return ranks
  }

  // 우위 지표 수 기준 내림차순 정렬된 ETF 목록
  const sortedETFsForSummary = [...selectedETFs].sort((a, b) => {
    const ranksA = getRankCounts(a)
    const ranksB = getRankCounts(b)
    // 1위 개수 먼저, 같으면 2위 개수
    if (ranksB.first !== ranksA.first) return ranksB.first - ranksA.first
    return ranksB.second - ranksA.second
  })

  // ETF에서 값 가져오기 (computed 필드 처리)
  const getETFValue = (etf: ETF, key: string): number | string | boolean | undefined => {
    if (key === 'weeklyReturn') {
      return getWeeklyReturn(etf)
    }
    if (key === 'monthlyReturn') {
      return getMonthlyReturn(etf)
    }
    if (key === 'ytdReturn') {
      return getYTDReturn(etf)
    }
    return etf[key as keyof ETF] as number | string | boolean | undefined
  }

  const getBestValue = (key: string, best: string, absolute?: boolean) => {
    const values = selectedETFs.map(etf => {
      const value = getETFValue(etf, key) as number
      return absolute ? Math.abs(value) : value
    })
    if (best === 'low') {
      return Math.min(...values)
    }
    return Math.max(...values)
  }

  const isBestValue = (etf: ETF, key: string, best: string, absolute?: boolean) => {
    const rawValue = getETFValue(etf, key) as number
    const value = absolute ? Math.abs(rawValue) : rawValue
    return value === getBestValue(key, best, absolute)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-[52px] z-40 bg-[#191322] px-4 py-3 border-b border-[#2d2640]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">ETF 비교</h1>
          <Badge variant="outline" className="text-xs">{selectedETFs.length}/3</Badge>
        </div>
      </div>

      {/* Selected ETFs Header - 3개 균등 배치 */}
      <div className="px-4 py-3 border-b border-[#2d2640]" data-tour="compare-slots">
        <div className="grid grid-cols-3 gap-2">
          {selectedETFs.map((etf) => (
            <div key={etf.id} className="relative">
              <Card className="h-[100px]">
                <CardContent className="p-2.5 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-400">{etf.ticker}</div>
                    <div className="text-sm font-medium text-white truncate">{etf.shortName}</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{formatNumber(etf.price)}</div>
                    <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
              <button
                onClick={() => removeETF(etf.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2d2640] hover:bg-[#3d3450] flex items-center justify-center"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          ))}

          {selectedETFs.length < 3 && (
            <button
              onClick={() => setShowSelector(true)}
              className="h-[100px] border-2 border-dashed border-[#2d2640] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#d64f79]/50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">ETF 추가</span>
            </button>
          )}
        </div>
      </div>

      {/* ETF Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-[#1f1a2e] rounded-t-2xl max-h-[70vh]">
            <div className="sticky top-0 bg-[#1f1a2e] px-4 py-3 border-b border-[#2d2640]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">ETF 선택</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowSelector(false); setSearchQuery(''); }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {/* 검색창 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="종목명, 티커, 테마 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#2a2438] border border-[#3d3650] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d64f79]"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="h-[55vh]">
              <div className="p-4 space-y-2">
                {filteredETFs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredETFs.map((etf) => (
                    <Card
                      key={etf.id}
                      className="cursor-pointer hover:border-[#d64f79]/50"
                      onClick={() => addETF(etf)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-400">{etf.ticker}</div>
                          <div className="text-sm font-medium text-white">{etf.shortName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{formatNumber(etf.price)}</div>
                          <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                            {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Radar Chart */}
      {selectedETFs.length >= 2 && (
        <div className="px-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <RadarIcon className="h-5 w-5 text-[#d64f79]" />
                ETF Radar
              </CardTitle>
              <p className="text-sm text-gray-400">선택 종목 간 상대 비교</p>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="#3d3650" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: '#d1d5db', fontSize: 13, fontWeight: 500 }}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={false}
                      axisLine={false}
                    />
                    {selectedETFs.map((etf, index) => (
                      <Radar
                        key={etf.id}
                        name={etf.shortName.length > 10 ? etf.shortName.slice(0, 10) + '..' : etf.shortName}
                        dataKey={etf.shortName}
                        stroke={chartColors[index % chartColors.length]}
                        fill={chartColors[index % chartColors.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}
                      content={() => (
                        <div className="flex justify-center gap-4 flex-wrap pt-2">
                          {selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className="flex items-center gap-1.5 max-w-[100px]">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                              />
                              <div className="legend-marquee">
                                <div className="legend-marquee-inner text-[13px] text-white whitespace-nowrap">
                                  {etf.shortName}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary */}
      {selectedETFs.length >= 2 && (
        <div className="px-4 pt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">비교 요약</CardTitle>
              <p className="text-xs text-gray-500">우위 지표 많은 순</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedETFsForSummary.map((etf) => {
                  const originalIndex = selectedETFs.findIndex(e => e.id === etf.id)
                  const ranks = getRankCounts(etf)
                  return (
                    <button
                      key={etf.id}
                      onClick={() => onSelectETF(etf)}
                      className="w-full text-left hover:bg-[#2a2438] rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: chartColors[originalIndex % chartColors.length] }}
                          />
                          <span className="text-sm text-white">{etf.shortName}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          우위 항목 {ranks.first}개
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: radarMetrics.length }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-2 rounded-sm transition-all duration-300"
                            style={{
                              backgroundColor: i < ranks.first
                                ? chartColors[originalIndex % chartColors.length]
                                : '#2d2640',
                            }}
                          />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marquee 애니메이션 스타일 */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - 16px)); }
        }
        .marquee-cell {
          overflow: hidden;
        }
        .marquee-inner {
          display: inline-block;
          padding-right: 16px;
          animation: marquee 3s linear infinite;
        }
        .legend-marquee {
          overflow: hidden;
          max-width: 80px;
        }
        .legend-marquee-inner {
          display: inline-block;
          padding-right: 12px;
          animation: marquee 4s linear infinite;
        }
      `}</style>

      {/* Comparison Table - 탭 형태로 변경 */}
      <div className="px-4 pt-4" data-tour="compare-table">
        <h3 className="text-sm font-medium text-white mb-2">상세 지표 비교</h3>

        {/* 탭 버튼 */}
        <Tabs value={compareTab} onValueChange={(v) => setCompareTab(v as 'key' | 'basic' | 'holdings')} className="mb-3">
          <TabsList className="w-full grid grid-cols-3 h-auto bg-[#2a2438]">
            <TabsTrigger value="key" className="text-xs py-2">주요지표</TabsTrigger>
            <TabsTrigger value="basic" className="text-xs py-2">기본정보</TabsTrigger>
            <TabsTrigger value="holdings" className="text-xs py-2">보유종목</TabsTrigger>
          </TabsList>

          {/* 주요지표 탭 */}
          <TabsContent value="key" className="mt-3">
            {/* Sticky Header - 테이블 밖에서 동일한 컬럼 너비 */}
            <div className="sticky top-[98px] z-30 bg-[#191322]">
              <table className="w-full bg-[#1f1a2e] border border-[#2d2640] rounded-t-xl" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '115px' }} />
                  {selectedETFs.map(etf => (
                    <col key={`h-key-${etf.id}`} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="p-2 text-sm font-medium text-gray-500 text-left rounded-tl-xl"></th>
                    {selectedETFs.map((etf, index) => (
                      <th key={etf.id} className={`p-2 text-center border-l border-[#2d2640] ${index === selectedETFs.length - 1 ? 'rounded-tr-xl' : ''}`}>
                        <div
                          className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <div className="text-xs text-gray-400 font-normal">{etf.ticker}</div>
                        <div className="marquee-cell">
                          <div className="marquee-inner text-sm font-medium text-white whitespace-nowrap">
                            {etf.shortName}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Table Body - 주요지표 */}
            <table className="w-full bg-[#1f1a2e] border border-t-0 border-[#2d2640] rounded-b-xl" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '115px' }} />
                {selectedETFs.map(etf => (
                  <col key={`b-key-${etf.id}`} />
                ))}
              </colgroup>
              <tbody>
                {keyMetrics.map((category, catIdx) => (
                  <>
                    {/* Category Header */}
                    <tr key={`cat-key-${category.category}`} className={catIdx > 0 ? 'border-t border-[#2d2640]' : ''}>
                      <td colSpan={selectedETFs.length + 1} className="bg-[#2a2438] px-3 py-2">
                        <span className="text-sm font-semibold text-[#d64f79]">{category.category}</span>
                      </td>
                    </tr>

                    {/* Items */}
                    {category.items.map((item) => (
                      <tr key={item.key} className="border-t border-[#2d2640]">
                        <td className="p-2">
                          <button
                            onClick={() => setSelectedMetric(item.key)}
                            className="text-sm text-gray-400 hover:text-[#d64f79] transition-colors text-left"
                          >
                            {item.label}
                          </button>
                        </td>
                        {selectedETFs.map((etf) => {
                          const value = getETFValue(etf, item.key)
                          const itemExtended = item as { computed?: boolean; absolute?: boolean }
                          const isBest = item.best !== 'none' && isBestValue(etf, item.key, item.best, itemExtended.absolute)
                          const isComputed = itemExtended.computed

                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const displayValue = isComputed
                            ? (item.format as (v: any, etf?: ETF) => string)(value, etf)
                            : (item.format as (v: any) => string)(value)

                          return (
                            <td
                              key={etf.id}
                              className={`p-2 text-center border-l border-[#2d2640] ${isBest ? 'bg-emerald-500/10' : ''}`}
                            >
                              <span className={`text-base font-semibold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                                {displayValue}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </TabsContent>

          {/* 기본정보 탭 */}
          <TabsContent value="basic" className="mt-3">
            {/* Sticky Header */}
            <div className="sticky top-[98px] z-30 bg-[#191322]">
              <table className="w-full bg-[#1f1a2e] border border-[#2d2640] rounded-t-xl" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '115px' }} />
                  {selectedETFs.map(etf => (
                    <col key={`h-basic-${etf.id}`} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="p-2 text-sm font-medium text-gray-500 text-left rounded-tl-xl"></th>
                    {selectedETFs.map((etf, index) => (
                      <th key={etf.id} className={`p-2 text-center border-l border-[#2d2640] ${index === selectedETFs.length - 1 ? 'rounded-tr-xl' : ''}`}>
                        <div
                          className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <div className="text-xs text-gray-400 font-normal">{etf.ticker}</div>
                        <div className="marquee-cell">
                          <div className="marquee-inner text-sm font-medium text-white whitespace-nowrap">
                            {etf.shortName}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Table Body - 기본정보 */}
            <table className="w-full bg-[#1f1a2e] border border-t-0 border-[#2d2640] rounded-b-xl" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '115px' }} />
                {selectedETFs.map(etf => (
                  <col key={`b-basic-${etf.id}`} />
                ))}
              </colgroup>
              <tbody>
                {basicInfoMetrics.map((category, catIdx) => (
                  <>
                    {/* Category Header */}
                    <tr key={`cat-basic-${category.category}`} className={catIdx > 0 ? 'border-t border-[#2d2640]' : ''}>
                      <td colSpan={selectedETFs.length + 1} className="bg-[#2a2438] px-3 py-2">
                        <span className="text-sm font-semibold text-[#d64f79]">{category.category}</span>
                      </td>
                    </tr>

                    {/* Items */}
                    {category.items.map((item) => (
                      <tr key={item.key} className="border-t border-[#2d2640]">
                        <td className="p-2">
                          <button
                            onClick={() => setSelectedMetric(item.key)}
                            className="text-sm text-gray-400 hover:text-[#d64f79] transition-colors text-left"
                          >
                            {item.label}
                          </button>
                        </td>
                        {selectedETFs.map((etf) => {
                          const value = getETFValue(etf, item.key)
                          const itemExtended = item as { showBar?: boolean; computed?: boolean; isText?: boolean; absolute?: boolean; multiLine?: boolean }
                          const isText = itemExtended.isText
                          const isMultiLine = itemExtended.multiLine
                          const isBest = !isText && item.best !== 'none' && isBestValue(etf, item.key, item.best, itemExtended.absolute)
                          const showBar = itemExtended.showBar
                          const isComputed = itemExtended.computed

                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const displayValue = isComputed
                            ? (item.format as (v: any, etf?: ETF) => string)(value, etf)
                            : (item.format as (v: any) => string)(value)

                          // 52주 대비 위치 퍼센트 값 (바 표시용)
                          const position = showBar ? get52wPosition(etf) : 0
                          const positionClamped = showBar ? get52wPositionClamped(etf) : 0
                          const newHigh = showBar ? isNewHigh(etf) : false
                          const newLow = showBar ? isNewLow(etf) : false

                          return (
                            <td
                              key={etf.id}
                              className={`p-2 text-center border-l border-[#2d2640] ${isBest ? 'bg-emerald-500/10' : ''}`}
                            >
                              {showBar ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-base font-semibold ${newHigh ? 'text-up' : newLow ? 'text-down' : isBest ? 'text-emerald-400' : 'text-white'}`}>
                                      {displayValue}
                                    </span>
                                    {newHigh && (
                                      <span className="text-[10px] px-1 py-0.5 bg-red-500/20 text-up rounded font-medium">
                                        신고가
                                      </span>
                                    )}
                                    {newLow && (
                                      <span className="text-[10px] px-1 py-0.5 bg-blue-500/20 text-down rounded font-medium">
                                        신저가
                                      </span>
                                    )}
                                  </div>
                                  {/* 52주 위치 바 인디케이터 */}
                                  <div className="w-full h-2 bg-[#2d2640] rounded-full relative overflow-hidden">
                                    <div
                                      className="absolute left-0 top-0 h-full rounded-full"
                                      style={{
                                        width: `${positionClamped}%`,
                                        background: newHigh ? '#ef4444' : newLow ? '#3b82f6' : position > 70 ? '#ef4444' : position > 40 ? '#d64f79' : '#3b82f6'
                                      }}
                                    />
                                    {/* 현재 위치 마커 */}
                                    <div
                                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm border border-gray-400"
                                      style={{ left: `calc(${positionClamped}% - 4px)` }}
                                    />
                                  </div>
                                  <div className="flex justify-between w-full text-[10px] text-gray-500">
                                    <span>저가</span>
                                    <span>고가</span>
                                  </div>
                                </div>
                              ) : isMultiLine && typeof displayValue === 'string' && displayValue.includes('\n') ? (
                                <span className={`text-sm font-semibold ${isBest ? 'text-emerald-400' : 'text-white'} leading-tight`}>
                                  {displayValue.split('\n').map((line, i) => (
                                    <span key={i}>
                                      {i > 0 && <br />}
                                      {line}
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className={`text-base font-semibold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                                  {displayValue}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </TabsContent>

          {/* 보유종목 탭 - 세로 비교 */}
          <TabsContent value="holdings" className="mt-3">
            {(() => {
              // 각 ETF의 보유종목 데이터 수집
              const allHoldings = selectedETFs.map(etf => getHoldingsData(etf))

              // 모든 종목명 수집하여 공통 종목 찾기
              const allStockNames = allHoldings.flat().map(h => h.name)
              const stockCounts = allStockNames.reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1
                return acc
              }, {} as Record<string, number>)

              // 2개 이상 ETF에 포함된 종목은 공통 종목 - 색상 인덱스 할당
              const commonStockColors: Record<string, number> = {}
              let colorIdx = 0
              Object.entries(stockCounts)
                .filter(([, count]) => count >= 2)
                .forEach(([name]) => {
                  commonStockColors[name] = colorIdx++
                })

              // 공통 종목 하이라이트 색상 (서로 다른 색상들)
              const highlightColors = [
                { bg: 'bg-[#d64f79]/15', text: 'text-[#d64f79]', border: 'border-[#d64f79]/30' },  // 핑크
                { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },  // 초록
                { bg: 'bg-[#8B5CF6]/15', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/30' },  // 보라
                { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },  // 주황
                { bg: 'bg-[#3B82F6]/15', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30' },  // 파랑
                { bg: 'bg-[#EC4899]/15', text: 'text-[#EC4899]', border: 'border-[#EC4899]/30' },  // 분홍
              ]

              return (
                <>
                  {/* Sticky Header */}
                  <div className="sticky top-[98px] z-30 bg-[#191322]">
                    <table className="w-full bg-[#1f1a2e] border border-[#2d2640] rounded-t-xl" style={{ tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '50px' }} />
                        {selectedETFs.map(etf => (
                          <col key={`h-hold-${etf.id}`} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="p-2 text-sm font-medium text-gray-500 text-center rounded-tl-xl">순위</th>
                          {selectedETFs.map((etf, index) => (
                            <th key={etf.id} className={`p-2 text-center border-l border-[#2d2640] ${index === selectedETFs.length - 1 ? 'rounded-tr-xl' : ''}`}>
                              <div
                                className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                                style={{ backgroundColor: chartColors[index % chartColors.length] }}
                              />
                              <div className="text-xs text-gray-400 font-normal">{etf.ticker}</div>
                              <div className="marquee-cell">
                                <div className="marquee-inner text-sm font-medium text-white whitespace-nowrap">
                                  {etf.shortName}
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Table Body - 구성종목 */}
                  <table className="w-full bg-[#1f1a2e] border border-t-0 border-[#2d2640] rounded-b-xl" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '50px' }} />
                      {selectedETFs.map(etf => (
                        <col key={`b-hold-${etf.id}`} />
                      ))}
                    </colgroup>
                    <tbody>
                      {[0, 1, 2, 3, 4].map((rank) => (
                        <tr key={rank} className={rank > 0 ? 'border-t border-[#2d2640]' : ''}>
                          <td className="p-2 text-center">
                            <span className="text-sm font-medium text-[#d64f79]">{rank + 1}</span>
                          </td>
                          {selectedETFs.map((etf, etfIdx) => {
                            const holdings = allHoldings[etfIdx]
                            const holding = holdings[rank]
                            const colorIndex = holding ? commonStockColors[holding.name] : undefined
                            const isCommon = colorIndex !== undefined
                            const colors = isCommon ? highlightColors[colorIndex % highlightColors.length] : null

                            return (
                              <td
                                key={etf.id}
                                className={`p-2 border-l border-[#2d2640] ${colors ? colors.bg : ''}`}
                              >
                                {holding ? (
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${colors ? colors.text : 'text-white'}`}>
                                      {holding.name}
                                    </span>
                                    <span className="text-xs text-gray-400">{holding.weight.toFixed(1)}%</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      {/* 기타 비중 */}
                      <tr className="border-t border-[#2d2640] bg-[#2a2438]/50">
                        <td className="p-2 text-center">
                          <span className="text-xs text-gray-500">기타</span>
                        </td>
                        {selectedETFs.map((etf, etfIdx) => {
                          const holdings = allHoldings[etfIdx]
                          const total = holdings.reduce((sum, h) => sum + h.weight, 0)
                          return (
                            <td key={etf.id} className="p-2 border-l border-[#2d2640]">
                              <span className="text-sm text-gray-400">{(100 - total).toFixed(1)}%</span>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>

                </>
              )
            })()}
          </TabsContent>
        </Tabs>
      </div>

      {/* 지표 설명 모달 */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-sm">
          {selectedMetric && metricDescriptions[selectedMetric] && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#d64f79]" />
                  {metricDescriptions[selectedMetric].title}
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm">
                <p className="text-gray-300 leading-relaxed">
                  {metricDescriptions[selectedMetric].description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
