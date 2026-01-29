import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Star, Share2, TrendingUp, TrendingDown, AlertTriangle, Info, Zap, Shield, ArrowDownUp, X, Calendar, PieChart as PieChartIcon, Lightbulb, LineChart, CandlestickChart, ChevronDown, ChevronUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockETFs } from '@/data/mockData'
import type { ETF } from '@/data/mockData'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface ETFDetailPageProps {
  etf: ETF
  accountType: string
  onBack: () => void
  onTrade: () => void
  onAddToCompare?: (etf: ETF) => void
  onSelectETF?: (etf: ETF) => void
}

const generateChartData = (etf: ETF) => {
  const data = []
  let price = etf.price * 0.95
  for (let i = 30; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.02)
    data.push({ date: `${30 - i}일전`, price: Math.round(price), nav: Math.round(price * (1 + (Math.random() - 0.5) * 0.002)) })
  }
  data[data.length - 1].price = etf.price
  return data
}

// 캔들차트용 OHLC 데이터 생성
const generateCandleData = (etf: ETF) => {
  const data = []
  let basePrice = etf.price * 0.95

  for (let i = 30; i >= 0; i--) {
    const volatility = 0.015 + Math.random() * 0.01
    const trend = (Math.random() - 0.48) * 0.02

    const open = Math.round(basePrice)
    const close = Math.round(basePrice * (1 + trend))
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * volatility))
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * volatility))

    const isUp = close >= open

    data.push({
      date: `${30 - i}일전`,
      idx: 30 - i,
      open,
      high,
      low,
      close,
      isUp,
      // Bar 차트용 데이터
      wickTop: high,
      wickBottom: low,
      bodyTop: Math.max(open, close),
      bodyBottom: Math.min(open, close),
      bodyHeight: Math.abs(close - open) || 1,
    })

    basePrice = close
  }

  // 마지막 데이터를 현재가로 조정
  const lastCandle = data[data.length - 1]
  lastCandle.close = etf.price
  lastCandle.isUp = lastCandle.close >= lastCandle.open
  lastCandle.bodyTop = Math.max(lastCandle.open, lastCandle.close)
  lastCandle.bodyBottom = Math.min(lastCandle.open, lastCandle.close)
  lastCandle.high = Math.max(lastCandle.high, lastCandle.close)
  lastCandle.low = Math.min(lastCandle.low, lastCandle.close)
  lastCandle.wickTop = lastCandle.high
  lastCandle.wickBottom = lastCandle.low
  lastCandle.bodyHeight = Math.abs(lastCandle.close - lastCandle.open) || 1

  return data
}

// 캔들차트 컴포넌트
const CandleChart = ({ data, height }: { data: ReturnType<typeof generateCandleData>, height: number }) => {
  const margin = { top: 10, right: 10, bottom: 10, left: 10 }
  const chartWidth = 350
  const chartHeight = height - margin.top - margin.bottom

  // Y축 스케일 계산
  const allPrices = data.flatMap(d => [d.high, d.low])
  const minPrice = Math.min(...allPrices) * 0.998
  const maxPrice = Math.max(...allPrices) * 1.002
  const priceRange = maxPrice - minPrice

  const scaleY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight + margin.top
  }

  const candleWidth = (chartWidth - margin.left - margin.right) / data.length
  const bodyWidth = Math.max(candleWidth * 0.7, 3)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="none">
      {data.map((candle, i) => {
        const x = margin.left + i * candleWidth + candleWidth / 2
        const color = candle.isUp ? '#ef4444' : '#3b82f6'

        const yHigh = scaleY(candle.high)
        const yLow = scaleY(candle.low)
        const yBodyTop = scaleY(candle.bodyTop)
        const yBodyBottom = scaleY(candle.bodyBottom)

        return (
          <g key={i}>
            {/* 심지 (wick) */}
            <line
              x1={x}
              y1={yHigh}
              x2={x}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
            />
            {/* 몸통 (body) */}
            <rect
              x={x - bodyWidth / 2}
              y={yBodyTop}
              width={bodyWidth}
              height={Math.max(yBodyBottom - yBodyTop, 1)}
              fill={color}
              stroke={color}
              strokeWidth={0.5}
            />
          </g>
        )
      })}
    </svg>
  )
}

// 배당 주기 결정 (통일된 로직)
const getEffectiveFrequency = (etf: ETF): 'monthly' | 'quarterly' | 'annual' | 'none' => {
  // 1. dividendFrequency 필드가 있으면 사용
  if (etf.dividendFrequency) return etf.dividendFrequency
  // 2. 없으면 dividendYield 기반 추정
  if (etf.dividendYield >= 5) return 'monthly'
  if (etf.dividendYield >= 2) return 'quarterly'
  if (etf.dividendYield > 0) return 'annual'
  return 'none'
}

// 배당 주기에 따른 연간 배당 횟수
const getDividendCount = (frequency: string) => {
  switch (frequency) {
    case 'monthly': return 12
    case 'quarterly': return 4
    case 'annual': return 1
    default: return 0
  }
}

// 배당 히스토리 데이터 생성 (배당 주기 반영)
const generateDividendHistory = (etf: ETF, years: number) => {
  const data = []
  const frequency = getEffectiveFrequency(etf)
  const dividendsPerYear = getDividendCount(frequency)
  if (dividendsPerYear === 0) return []

  const monthInterval = 12 / dividendsPerYear
  const baseAmount = Math.round(etf.price * etf.dividendYield / 100 / dividendsPerYear)
  const now = new Date()
  const totalDividends = years * dividendsPerYear

  for (let i = totalDividends; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i * monthInterval, 1)
    if (date > now) continue
    const variation = 0.8 + Math.random() * 0.4
    data.push({
      date: `${date.getFullYear().toString().slice(2)}년 ${date.getMonth() + 1}월`,
      amount: Math.round(baseAmount * variation),
      fullDate: date
    })
  }
  return data.slice(-totalDividends)
}

// 최근 배당 내역 생성 (배당 주기 반영)
const generateRecentDividends = (etf: ETF) => {
  const data = []
  const frequency = getEffectiveFrequency(etf)
  const dividendsPerYear = getDividendCount(frequency)
  if (dividendsPerYear === 0) return []

  const monthInterval = 12 / dividendsPerYear
  const baseAmount = Math.abs(Math.round(etf.price * etf.dividendYield / 100 / dividendsPerYear))
  const now = new Date()
  const count = Math.min(12, dividendsPerYear * 3) // 최대 12개 또는 3년치

  for (let i = 0; i < count; i++) {
    const payDate = new Date(now.getFullYear(), now.getMonth() - i * monthInterval, 25)
    const exDate = new Date(payDate)
    exDate.setDate(exDate.getDate() - 3)
    const variation = 0.85 + Math.random() * 0.3

    data.push({
      exDate: `${exDate.getFullYear()}.${String(exDate.getMonth() + 1).padStart(2, '0')}.${String(exDate.getDate()).padStart(2, '0')}`,
      payDate: `${payDate.getFullYear()}.${String(payDate.getMonth() + 1).padStart(2, '0')}.${String(payDate.getDate()).padStart(2, '0')}`,
      amount: Math.round(baseAmount * variation)
    })
  }
  return data
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

// 국가별 비중 데이터 (mock)
const getCountryData = (etf: ETF) => {
  if (etf.marketClass === '해외') {
    // 해외 ETF의 경우
    if (etf.category === '미국' || etf.tags.includes('미국')) {
      return [
        { name: '미국', weight: 95.2 },
        { name: '아일랜드', weight: 2.3 },
        { name: '케이맨제도', weight: 1.5 },
        { name: '영국', weight: 0.6 },
        { name: '기타', weight: 0.4 },
      ]
    }
    if (etf.tags.includes('중국')) {
      return [
        { name: '중국', weight: 78.5 },
        { name: '홍콩', weight: 15.2 },
        { name: '케이맨제도', weight: 4.8 },
        { name: '미국', weight: 1.0 },
        { name: '기타', weight: 0.5 },
      ]
    }
    // 글로벌 ETF
    return [
      { name: '미국', weight: 62.3 },
      { name: '일본', weight: 8.5 },
      { name: '영국', weight: 5.2 },
      { name: '프랑스', weight: 4.1 },
      { name: '기타', weight: 19.9 },
    ]
  }
  // 국내 ETF
  return [
    { name: '한국', weight: 99.2 },
    { name: '현금성자산', weight: 0.8 },
  ]
}

// 섹터별 비중 데이터 (mock)
const getSectorData = (etf: ETF) => {
  if (etf.category === '2차전지' || etf.tags.includes('2차전지')) {
    return [
      { name: '2차전지/소재', weight: 45.2 },
      { name: '전기차', weight: 28.3 },
      { name: '에너지저장', weight: 15.5 },
      { name: '화학', weight: 8.2 },
      { name: '기타', weight: 2.8 },
    ]
  }
  if (etf.category === '반도체' || etf.tags.includes('반도체')) {
    return [
      { name: '반도체', weight: 65.3 },
      { name: '반도체장비', weight: 18.5 },
      { name: 'IT서비스', weight: 10.2 },
      { name: '전자부품', weight: 4.5 },
      { name: '기타', weight: 1.5 },
    ]
  }
  if (etf.assetClass === '채권') {
    return [
      { name: '국채', weight: 45.0 },
      { name: '회사채', weight: 30.2 },
      { name: '금융채', weight: 15.3 },
      { name: 'MBS/ABS', weight: 7.0 },
      { name: '기타', weight: 2.5 },
    ]
  }
  if (etf.marketClass === '해외' && (etf.tags.includes('미국') || etf.category === '미국')) {
    return [
      { name: '정보기술', weight: 32.5 },
      { name: '헬스케어', weight: 13.2 },
      { name: '금융', weight: 12.8 },
      { name: '경기소비재', weight: 10.5 },
      { name: '기타', weight: 31.0 },
    ]
  }
  // 기본값 (국내 시장대표 등)
  return [
    { name: '정보기술', weight: 35.2 },
    { name: '금융', weight: 15.3 },
    { name: '산업재', weight: 12.8 },
    { name: '경기소비재', weight: 11.5 },
    { name: '기타', weight: 25.2 },
  ]
}

// 연도별 배당 히스토리 생성
const generateYearlyDividendHistory = (etf: ETF, years: number) => {
  const data = []
  const frequency = getEffectiveFrequency(etf)
  const dividendsPerYear = getDividendCount(frequency)
  if (dividendsPerYear === 0) return []

  const baseYearlyAmount = Math.round(etf.price * etf.dividendYield / 100)
  const now = new Date()

  for (let i = years - 1; i >= 0; i--) {
    const year = now.getFullYear() - i
    const variation = 0.85 + Math.random() * 0.3
    data.push({
      date: `${year}년`,
      amount: Math.round(baseYearlyAmount * variation),
      year
    })
  }
  return data
}

// 예상 다음 배당 정보 생성
const generateNextDividend = (etf: ETF) => {
  const frequency = getEffectiveFrequency(etf)
  const dividendsPerYear = getDividendCount(frequency)
  if (dividendsPerYear === 0) return null

  const baseAmount = Math.abs(Math.round(etf.price * etf.dividendYield / 100 / dividendsPerYear))
  const now = new Date()

  // 다음 배당락일 계산 (주기에 따라)
  let nextExDate: Date
  if (frequency === 'monthly') {
    nextExDate = new Date(now.getFullYear(), now.getMonth() + 1, 20)
  } else if (frequency === 'quarterly') {
    const currentQuarter = Math.floor(now.getMonth() / 3)
    nextExDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 20)
  } else {
    nextExDate = new Date(now.getFullYear(), 11, 20)
    if (nextExDate < now) {
      nextExDate = new Date(now.getFullYear() + 1, 11, 20)
    }
  }

  const nextPayDate = new Date(nextExDate)
  nextPayDate.setDate(nextPayDate.getDate() + 5)

  return {
    exDate: `${nextExDate.getFullYear()}.${String(nextExDate.getMonth() + 1).padStart(2, '0')}.${String(nextExDate.getDate()).padStart(2, '0')}`,
    payDate: `${nextPayDate.getFullYear()}.${String(nextPayDate.getMonth() + 1).padStart(2, '0')}.${String(nextPayDate.getDate()).padStart(2, '0')}`,
    amount: Math.round(baseAmount * (0.95 + Math.random() * 0.1)),
    isEstimate: true
  }
}

const PIE_COLORS = ['#d64f79', '#796ec2', '#10B981', '#F59E0B', '#3B82F6', '#6B7280']

export function ETFDetailPage({ etf, onBack, onTrade, onAddToCompare, onSelectETF }: ETFDetailPageProps) {
  const [tab, setTab] = useState('overview')
  const [showHealthInfo, setShowHealthInfo] = useState(false)
  const [dividendPeriod, setDividendPeriod] = useState<'1y' | '3y' | '5y'>('1y')
  const [dividendView, setDividendView] = useState<'monthly' | 'yearly'>('monthly')
  const [compositionTab, setCompositionTab] = useState<'stock' | 'country' | 'sector'>('stock')
  const [chartType, setChartType] = useState<'line' | 'candle'>('line')
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [showAllDividends, setShowAllDividends] = useState(false)
  const isUp = etf.change >= 0

  // 차트 데이터 - ETF 변경시에만 재생성 (탭 이동시 유지)
  const chartData = useMemo(() => generateChartData(etf), [etf.id])
  const candleData = useMemo(() => generateCandleData(etf), [etf.id])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // 배당 데이터 - ETF 또는 기간 변경시에만 재생성
  const dividendYears = dividendPeriod === '1y' ? 1 : dividendPeriod === '3y' ? 3 : 5
  const dividendHistory = useMemo(() =>
    dividendView === 'monthly'
      ? generateDividendHistory(etf, dividendYears)
      : generateYearlyDividendHistory(etf, dividendYears),
    [etf.id, dividendYears, dividendView]
  )
  const recentDividends = useMemo(() => generateRecentDividends(etf), [etf.id])
  const nextDividend = useMemo(() => generateNextDividend(etf), [etf.id])

  // 구성 데이터 (종목/국가/섹터)
  const holdingsData = useMemo(() => getHoldingsData(etf), [etf.id])
  const countryData = useMemo(() => getCountryData(etf), [etf.id])
  const sectorData = useMemo(() => getSectorData(etf), [etf.id])

  const getCurrentCompositionData = () => {
    switch (compositionTab) {
      case 'country': return countryData
      case 'sector': return sectorData
      default: return holdingsData
    }
  }

  const currentData = getCurrentCompositionData()
  const currentTotal = currentData.reduce((sum, h) => sum + h.weight, 0)
  const pieData = useMemo(() => {
    const data = getCurrentCompositionData()
    const total = data.reduce((sum, h) => sum + h.weight, 0)
    if (total >= 100) {
      return data.map(h => ({ name: h.name, value: h.weight }))
    }
    return [
      ...data.map(h => ({ name: h.name, value: h.weight })),
      { name: '기타', value: 100 - total }
    ]
  }, [compositionTab, etf.id])

  // 분배금 지급 주기 (통일된 로직 사용)
  const getDividendMonths = () => {
    const frequency = getEffectiveFrequency(etf)
    switch (frequency) {
      case 'monthly': return '매월 (월배당)'
      case 'quarterly': return '분기별 (1, 4, 7, 10월)'
      case 'annual': return '연 1회 (12월)'
      default: return '-'
    }
  }

  return (
    <div className="pb-36">
      {/* 건전성 점수 정보 모달 */}
      {showHealthInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1f1a2e] border border-[#3d3450] rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">ETF 건전성 지표</h3>
              <button onClick={() => setShowHealthInfo(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 mb-4">
              {[
                ['TER (총보수)', '연간 운용비용. 낮을수록 유리'],
                ['괴리율', '시장가와 순자산가치 차이. 0에 가까울수록 좋음'],
                ['스프레드', '매수/매도 호가 차이. 낮을수록 거래비용 감소'],
                ['유동성', '거래대금 기준. 높을수록 거래 용이'],
                ['추적오차', '지수 추종 정확도. 낮을수록 정확']
              ].map(([title, desc]) => (
                <div key={title} className="bg-[#2d2640]/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-1">{title}</div>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#191322] border-b border-[#2d2640]">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Star className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      {/* ETF Info Header */}
      <div className="px-4 py-4 bg-gradient-to-b from-[#2a1f3d] to-[#191322]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-400">{etf.ticker}</span>
              {etf.isLeveraged && <Badge variant="destructive" className="text-[10px]"><Zap className="h-3 w-3 mr-0.5" />레버리지</Badge>}
              {etf.isInverse && <Badge variant="secondary" className="text-[10px]"><ArrowDownUp className="h-3 w-3 mr-0.5" />인버스</Badge>}
              {etf.isHedged && <Badge variant="info" className="text-[10px]"><Shield className="h-3 w-3 mr-0.5" />환헤지</Badge>}
            </div>
            <h1 className="text-xl font-bold text-white">{etf.shortName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {etf.marketClass}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
                {etf.assetClass}
              </span>
              {/* 레버리지 카테고리는 이미 상단 아이콘 배지로 표시되므로 중복 제거 */}
              {etf.category !== '레버리지' && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  {etf.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-white">{formatNumber(etf.price)}<span className="text-lg text-gray-400">원</span></div>
          <div className={`flex items-center gap-2 mt-1 ${isUp ? 'text-up' : 'text-down'}`}>
            {isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="text-lg font-medium">{etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%</span>
            <span className="text-gray-400">({formatNumber(etf.change)}원)</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2"><span className="text-xs text-gray-400">iNAV</span><span className="text-sm text-white">{formatNumber(etf.iNav)}원</span></div>
          <div className={`flex items-center gap-1 ${Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className="text-xs">괴리율</span>
            <span className="text-sm font-medium">{etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%</span>
            {Math.abs(etf.discrepancy) > 0.1 && <AlertTriangle className="h-3 w-3" />}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="px-4 py-4">
        {/* 차트 타입 전환 버튼 */}
        <div className="flex justify-end gap-1 mb-2">
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded ${
              chartType === 'line'
                ? 'bg-[#d64f79] text-white'
                : 'bg-[#2d2640] text-gray-400 hover:text-white'
            }`}
            title="라인 차트"
          >
            <LineChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={`p-1.5 rounded ${
              chartType === 'candle'
                ? 'bg-[#d64f79] text-white'
                : 'bg-[#2d2640] text-gray-400 hover:text-white'
            }`}
            title="캔들 차트"
          >
            <CandlestickChart className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[160px]">
          {chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d64f79" stopOpacity={0.3}/><stop offset="95%" stopColor="#d64f79" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={false} axisLine={false} /><YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: '#1f1a2e', border: '1px solid #3d3450', borderRadius: '8px', color: 'white' }} formatter={(value) => value !== undefined ? [`${formatNumber(value as number)}원`, '가격'] : ['', '']} />
                <Area type="monotone" dataKey="price" stroke="#d64f79" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <CandleChart data={candleData} height={160} />
          )}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {['1일', '1주', '1개월', '3개월', '1년'].map((period) => (<Button key={period} variant="ghost" size="sm" className="text-xs px-2">{period}</Button>))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="px-4">
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs py-2">개요</TabsTrigger>
          <TabsTrigger value="composition" className="text-xs py-2">구성</TabsTrigger>
          <TabsTrigger value="dividend" className="text-xs py-2">배당</TabsTrigger>
          <TabsTrigger value="health" className="text-xs py-2">건전성</TabsTrigger>
          <TabsTrigger value="insight" className="text-xs py-2">키움인사이트</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* 기본 정보 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-2">기본 정보</div>
              <p className="text-sm text-white leading-relaxed">{etf.overview}</p>
            </CardContent>
          </Card>

          {/* 기초 지수 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-2">기초 지수</div>
              <p className="text-sm text-gray-300">{etf.indexDescription}</p>
            </CardContent>
          </Card>

          {/* 주요 특징 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-2">주요 특징</div>
              <p className="text-sm text-gray-300">{etf.strategy}</p>
            </CardContent>
          </Card>

          {/* 핵심 지표 - 2x2 컴팩트 레이아웃 (순서: 순자산, 거래대금, 배당수익률, 총보수) */}
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">순자산 (AUM)</span>
                <span className="text-sm font-bold text-white">{formatCurrency(etf.aum)}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">거래대금</span>
                <span className="text-sm font-bold text-white">{formatCurrency(etf.adtv)}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">배당수익률</span>
                <span className="text-sm font-bold text-white">{etf.dividendYield.toFixed(1)}%</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">총보수 (TER)</span>
                <span className="text-sm font-bold text-white">{etf.ter.toFixed(2)}%</span>
              </CardContent>
            </Card>
          </div>

          {/* 더 보기 버튼 */}
          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showMoreInfo ? '접기' : '더 보기'}
            {showMoreInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* 더 보기 내용 */}
          {showMoreInfo && (
            <div className="space-y-3">
              {/* 비용 정보 */}
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">총보수율</span>
                    <span className="text-sm font-bold text-white">{etf.ter.toFixed(2)}%</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">실부담비용</span>
                    <span className="text-sm font-bold text-white">{(etf.ter * 1.15).toFixed(2)}%</span>
                  </CardContent>
                </Card>
              </div>

              {/* 운용사, 설정일 */}
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">운용사</span>
                    <span className="text-sm font-bold text-white truncate ml-2">{etf.issuer}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">설정일</span>
                    <span className="text-sm font-bold text-white">{etf.listedDate}</span>
                  </CardContent>
                </Card>
              </div>

              {/* 환헤지, 레버리지 */}
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">환헤지</span>
                    <span className={`text-sm font-bold ${etf.isHedged ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {etf.isHedged ? 'O' : 'X'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">레버리지</span>
                    <span className={`text-sm font-bold ${etf.isLeveraged ? 'text-amber-400' : 'text-gray-500'}`}>
                      {etf.isLeveraged ? 'O' : 'X'}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* 연금저축, 과세유형 */}
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">연금저축</span>
                    <span className={`text-sm font-bold ${!etf.isLeveraged && !etf.isInverse ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {!etf.isLeveraged && !etf.isInverse ? '가능' : '불가'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">과세유형</span>
                    <span className="text-sm font-bold text-white">
                      {etf.marketClass === '해외' ? '보유기간과세' : '배당소득세'}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 레버리지/인버스 경고 - 한 줄 표시 */}
          {(etf.isLeveraged || etf.isInverse) && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400">
                    {etf.isLeveraged && '레버리지 ETF는 일별 수익률 추종, 장기 보유 시 지수와 괴리 발생 가능'}
                    {etf.isInverse && '인버스 ETF는 역방향 수익률 추종, 장기 보유 부적합'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 구성 탭 */}
        <TabsContent value="composition" className="space-y-4 mt-4">
          {/* 하위 탭 버튼 */}
          <div className="flex gap-2">
            {(['stock', 'country', 'sector'] as const).map((subTab) => (
              <button
                key={subTab}
                onClick={() => setCompositionTab(subTab)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                  compositionTab === subTab
                    ? 'bg-[#d64f79] text-white'
                    : 'bg-[#2d2640] text-gray-400 hover:bg-[#3d3650]'
                }`}
              >
                {subTab === 'stock' ? '종목' : subTab === 'country' ? '국가' : '섹터'}
              </button>
            ))}
          </div>

          {/* 구성 비중 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-[#d64f79]" />
                {compositionTab === 'stock' ? '구성종목 TOP 5' :
                 compositionTab === 'country' ? '국가별 비중' : '섹터별 비중'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* 리스트 */}
                <div className="flex-1 space-y-2">
                  {currentData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i] || '#6B7280' }}
                        />
                        <span className="text-white">{item.name}</span>
                      </div>
                      <span className="text-gray-400">{item.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                  {currentTotal < 100 && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[#3d3650]">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        <span className="text-gray-400">기타</span>
                      </div>
                      <span className="text-gray-400">{(100 - currentTotal).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {/* 파이 차트 */}
                <div className="w-[120px] h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index] || '#6B7280'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연관 테마 ETF */}
          {(() => {
            // 같은 카테고리 또는 태그가 겹치는 ETF 찾기
            const relatedETFs = mockETFs
              .filter(e => e.id !== etf.id)
              .filter(e => {
                // 같은 카테고리이거나
                if (e.category === etf.category) return true
                // 태그가 겹치거나
                if (e.tags.some(tag => etf.tags.includes(tag))) return true
                // 같은 자산군이거나
                if (e.assetClass === etf.assetClass && e.marketClass === etf.marketClass) return true
                return false
              })
              .slice(0, 5)

            if (relatedETFs.length === 0) return null

            return (
              <div className="mt-4">
                <div className="text-sm font-medium text-white mb-3">연관 테마 ETF</div>
                <div className="overflow-hidden">
                  <div className="flex gap-3 animate-marquee-slow">
                    {[...relatedETFs, ...relatedETFs].map((related, idx) => (
                      <button
                        key={`${related.id}-${idx}`}
                        onClick={() => onSelectETF?.(related)}
                        className="flex-shrink-0 w-[140px] bg-[#2d2640] rounded-lg p-3 hover:bg-[#3d3650] transition-colors text-left"
                      >
                        <div className="text-xs text-gray-400 truncate">{related.ticker}</div>
                        <div className="text-sm font-medium text-white truncate">{related.shortName}</div>
                        <div className={`text-xs mt-1 ${related.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                          {related.changePercent >= 0 ? '+' : ''}{related.changePercent.toFixed(2)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </TabsContent>

        {/* 배당 탭 */}
        <TabsContent value="dividend" className="space-y-4 mt-4">
          {/* 배당 히스토리 차트 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#d64f79]" />
                  배당 지급 내역
                </CardTitle>
                <div className="flex gap-1">
                  {(['1y', '3y', '5y'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setDividendPeriod(period)}
                      className={`px-2 py-1 text-xs rounded ${
                        dividendPeriod === period
                          ? 'bg-[#d64f79] text-white'
                          : 'bg-[#2d2640] text-gray-400'
                      }`}
                    >
                      {period === '1y' ? '1년' : period === '3y' ? '3년' : '5년'}
                    </button>
                  ))}
                </div>
              </div>
              {/* 월별/연도별 선택 */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setDividendView('monthly')}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    dividendView === 'monthly'
                      ? 'bg-[#d64f79]/20 text-[#d64f79] border border-[#d64f79]'
                      : 'bg-[#2d2640] text-gray-400'
                  }`}
                >
                  월별
                </button>
                <button
                  onClick={() => setDividendView('yearly')}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    dividendView === 'yearly'
                      ? 'bg-[#d64f79]/20 text-[#d64f79] border border-[#d64f79]'
                      : 'bg-[#2d2640] text-gray-400'
                  }`}
                >
                  연도별
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {etf.dividendYield > 0 ? (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dividendHistory}>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval={dividendView === 'yearly' ? 0 : Math.floor(dividendHistory.length / 4)}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f1a2e',
                          border: '1px solid #3d3450',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [`${formatNumber(value as number)}원`, dividendView === 'yearly' ? '연간 배당금' : '주당 배당금']}
                      />
                      <Bar dataKey="amount" fill="#d64f79" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm">
                  배당 지급 내역이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 최근 배당 내역 + 예상 배당 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">배당 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {etf.dividendYield > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-xs text-gray-500 pb-2 border-b border-[#3d3650]">
                    <span>배당락일</span>
                    <span>지급일</span>
                    <span className="text-right">주당 배당금</span>
                  </div>
                  {/* 예상 다음 배당 */}
                  {nextDividend && (
                    <div className="grid grid-cols-3 text-sm bg-[#d64f79]/10 rounded-lg p-2 -mx-2">
                      <div>
                        <span className="text-[#d64f79]">{nextDividend.exDate}</span>
                        <span className="text-[10px] ml-1 text-[#d64f79]">(예상)</span>
                      </div>
                      <div>
                        <span className="text-[#d64f79]">{nextDividend.payDate}</span>
                        <span className="text-[10px] ml-1 text-[#d64f79]">(예상)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#d64f79] font-medium">~{formatNumber(nextDividend.amount)}원</span>
                      </div>
                    </div>
                  )}
                  {/* 과거 배당 내역 - 연도별 그룹화 */}
                  {(() => {
                    const displayDividends = showAllDividends ? recentDividends : recentDividends.slice(0, 5)
                    let lastYear = ''
                    return displayDividends.map((div, i) => {
                      const year = div.exDate.split('.')[0]
                      const showYearHeader = year !== lastYear
                      lastYear = year
                      return (
                        <div key={i}>
                          {showYearHeader && (
                            <div className="text-xs text-[#d64f79] font-medium pt-2 pb-1 border-t border-[#3d3650] mt-2 first:mt-0 first:border-t-0 first:pt-0">
                              {year}년
                            </div>
                          )}
                          <div className="grid grid-cols-3 text-sm">
                            <span className="text-gray-400">{div.exDate.slice(5)}</span>
                            <span className="text-gray-400">{div.payDate.slice(5)}</span>
                            <span className="text-white text-right">{formatNumber(div.amount)}원</span>
                          </div>
                        </div>
                      )
                    })
                  })()}
                  {/* 더보기 버튼 */}
                  {recentDividends.length > 5 && (
                    <button
                      onClick={() => setShowAllDividends(!showAllDividends)}
                      className="w-full flex items-center justify-center gap-1 pt-2 text-sm text-gray-400 hover:text-[#d64f79] transition-colors"
                    >
                      {showAllDividends ? '접기' : `더보기 (${recentDividends.length - 5}건)`}
                      {showAllDividends ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500 text-sm">
                  배당 지급 내역이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 배당 요약 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">배당 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">분배금 지급 주기</span>
                <span className="text-white">{getDividendMonths()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">최근 주당 배당금</span>
                <span className="text-white">
                  {etf.dividendYield > 0 ? `${formatNumber(recentDividends[0]?.amount || 0)}원` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">배당수익률 (연)</span>
                <span className="text-[#d64f79] font-medium">{etf.dividendYield.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 건전성 탭 */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                건전성 지표
                <button onClick={() => setShowHealthInfo(true)}>
                  <Info className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TER */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">TER (총보수)</span>
                  <span className={`text-sm font-medium ${etf.ter <= 0.1 ? 'text-emerald-400' : etf.ter <= 0.3 ? 'text-amber-400' : 'text-red-400'}`}>
                    {etf.ter.toFixed(2)}%
                  </span>
                </div>
                <Progress value={Math.min(etf.ter / 0.5 * 100, 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">낮을수록 좋음 (기준: 0.1% 이하 우수)</div>
              </div>

              {/* 괴리율 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">괴리율</span>
                  <span className={`text-sm font-medium ${Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : Math.abs(etf.discrepancy) <= 0.3 ? 'text-amber-400' : 'text-red-400'}`}>
                    {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
                  </span>
                </div>
                <Progress value={Math.min(Math.abs(etf.discrepancy) / 0.5 * 100, 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">0에 가까울수록 좋음 (기준: ±0.1% 이내 우수)</div>
              </div>

              {/* 스프레드 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">스프레드</span>
                  <span className={`text-sm font-medium ${etf.spread <= 0.05 ? 'text-emerald-400' : etf.spread <= 0.1 ? 'text-amber-400' : 'text-red-400'}`}>
                    {etf.spread.toFixed(2)}%
                  </span>
                </div>
                <Progress value={Math.min(etf.spread / 0.2 * 100, 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">낮을수록 좋음 (기준: 0.05% 이하 우수)</div>
              </div>

              {/* 유동성 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">유동성 (30D 거래대금)</span>
                  <span className={`text-sm font-medium ${etf.adtv >= 100000000000 ? 'text-emerald-400' : etf.adtv >= 10000000000 ? 'text-amber-400' : 'text-red-400'}`}>
                    {formatCurrency(etf.adtv)}
                  </span>
                </div>
                <Progress value={Math.min(etf.adtv / 500000000000 * 100, 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">높을수록 좋음 (기준: 100억 이상 우수)</div>
              </div>

              {/* 추적오차 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">추적오차</span>
                  <span className={`text-sm font-medium ${etf.trackingError <= 1 ? 'text-emerald-400' : etf.trackingError <= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {etf.trackingError.toFixed(2)}%
                  </span>
                </div>
                <Progress value={Math.min(etf.trackingError / 5 * 100, 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">낮을수록 좋음 (기준: 1% 이하 우수)</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 키움인사이트 탭 */}
        <TabsContent value="insight" className="space-y-4 mt-4">
          <Card className="border-dashed border-[#3d3650]">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-[#d64f79]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">키움인사이트</h3>
              <p className="text-sm text-gray-500">
                준비 중입니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-[#191322]/95 backdrop-blur border-t border-[#2d2640]">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onAddToCompare?.(etf)}>비교하기</Button>
          <Button className="flex-1" onClick={onTrade}>주문하기</Button>
        </div>
      </div>
    </div>
  )
}
