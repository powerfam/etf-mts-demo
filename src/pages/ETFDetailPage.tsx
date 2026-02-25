import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ArrowLeft, Star, Share2, AlertTriangle, Info, Zap, Shield, ArrowDownUp, X, Calendar, PieChart as PieChartIcon, Lightbulb, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingUp, CandlestickChart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockETFs } from '@/data/mockData'
import type { ETF } from '@/data/mockData'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, BarChart, Bar } from 'recharts'

interface ETFDetailPageProps {
  etf: ETF
  accountType: string
  onBack: () => void
  onTrade: () => void
  onAddToCompare?: (etf: ETF) => void
  onSelectETF?: (etf: ETF) => void
  // 스와이프 네비게이션용 prop
  etfList?: ETF[]
  currentIndex?: number
  onNavigateETF?: (etf: ETF) => void
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

const PIE_COLORS = ['#d64f79', '#796ec2', '#10B981', '#F59E0B', '#3B82F6', '#6B7280']

// 괴리율 1개월 레인지 데이터 생성 (목업)
const getDiscrepancyRange = (etf: ETF) => {
  const d = etf.discrepancy
  const spread = Math.max(Math.abs(d), 0.2)
  const min = +(d - spread * 0.8).toFixed(2)
  const max = +(d + spread * 0.6).toFixed(2)
  const avg = +((min * 0.55 + max * 0.45)).toFixed(2)
  // 전일값: healthScore를 시드로 사용하여 결정적 생성
  const seed = etf.healthScore % 10
  let yesterday: number
  if (seed === 0 || seed === 5) {
    // ~20%: 범위 초과 (Max 초과)
    yesterday = +(max + spread * 0.3).toFixed(2)
  } else {
    const t = seed / 9
    yesterday = +(min + (max - min) * t).toFixed(2)
  }
  return { min, max, avg, yesterday }
}

// 동일 유형 ETF 피어그룹 통계 (marketClass + assetClass 기준)
const computePeerStats = (peers: ETF[]) => {
  const stat = (getter: (e: ETF) => number) => {
    const values = peers.map(getter)
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const minETFs = peers.filter(e => getter(e) === minVal)
    const maxETFs = peers.filter(e => getter(e) === maxVal)
    return {
      min: minVal,
      max: maxVal,
      avg: +(values.reduce((a, b) => a + b, 0) / values.length),
      minName: minETFs[0]?.shortName || '',
      maxName: maxETFs[0]?.shortName || '',
      minExtra: minETFs.length - 1,
      maxExtra: maxETFs.length - 1,
      minETFNames: minETFs.map(e => e.shortName),
      maxETFNames: maxETFs.map(e => e.shortName),
    }
  }
  return {
    ter: stat(e => e.ter),
    spread: stat(e => e.spread),
    adtv: stat(e => e.adtv)
  }
}

// ETF 액티브 운용 여부 판별
const isActiveETF = (etf: ETF): boolean => {
  return etf.name.includes('액티브') || (etf.tags?.includes('액티브') ?? false)
}

const getPeerGroup = (etf: ETF) => {
  const isSpecial = etf.isLeveraged || etf.isInverse
  const isActive = isActiveETF(etf)
  let peers = mockETFs.filter(e => {
    if (e.id === etf.id) return false
    if (isSpecial) return (e.isLeveraged || e.isInverse) && e.assetClass === etf.assetClass
    return e.marketClass === etf.marketClass && e.assetClass === etf.assetClass
      && !e.isLeveraged && !e.isInverse && isActiveETF(e) === isActive
  })
  // 피어가 너무 적으면 액티브/패시브 제한 해제
  if (peers.length < 3) {
    peers = mockETFs.filter(e => {
      if (e.id === etf.id) return false
      if (isSpecial) return (e.isLeveraged || e.isInverse) && e.assetClass === etf.assetClass
      return e.marketClass === etf.marketClass && e.assetClass === etf.assetClass && !e.isLeveraged && !e.isInverse
    })
  }
  if (peers.length < 3) {
    peers = mockETFs.filter(e => e.id !== etf.id && e.assetClass === etf.assetClass && !e.isLeveraged && !e.isInverse)
  }
  if (peers.length === 0) {
    peers = mockETFs.filter(e => e.id !== etf.id)
  }
  const styleLabel = isActive ? '액티브' : '패시브'
  const label = isSpecial ? `레버리지/인버스 ${etf.assetClass}` : `${etf.marketClass} ${etf.assetClass}`
  return { ...computePeerStats(peers), label, count: peers.length, isActive, styleLabel }
}

export function ETFDetailPage({ etf, onBack, onTrade, onAddToCompare, onSelectETF, etfList, currentIndex, onNavigateETF }: ETFDetailPageProps) {
  const [tab, setTab] = useState('overview')
  const [expandedMetricInfo, setExpandedMetricInfo] = useState<string | null>(null)
  const [dividendPeriod, setDividendPeriod] = useState<'1y' | '3y' | '5y'>('1y')
  const [dividendView, setDividendView] = useState<'monthly' | 'yearly'>('monthly')
  const [compositionTab, setCompositionTab] = useState<'stock' | 'country' | 'sector'>('stock')
  const [chartType, setChartType] = useState<'line' | 'candle'>('line')
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [showAllDividends, setShowAllDividends] = useState(false)
  const [peerListModal, setPeerListModal] = useState<{ label: string; names: string[] } | null>(null)
  const isUp = etf.change >= 0

  // 스와이프 관련 상태
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const minSwipeDistance = 50

  // 스와이프 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return
    if (!etfList || etfList.length <= 1) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // 현재 인덱스 찾기
    const idx = currentIndex !== undefined ? currentIndex : etfList.findIndex(e => e.id === etf.id)
    if (idx === -1) return

    if (isLeftSwipe && idx < etfList.length - 1) {
      // 왼쪽으로 스와이프 → 다음 종목
      onNavigateETF?.(etfList[idx + 1])
    } else if (isRightSwipe && idx > 0) {
      // 오른쪽으로 스와이프 → 이전 종목
      onNavigateETF?.(etfList[idx - 1])
    }

    touchStartX.current = null
    touchEndX.current = null
  }, [etfList, currentIndex, etf.id, onNavigateETF])

  // 랭킹 계산 (전일 기준 조회수 순위 - 목업)
  const rankingPosition = useMemo(() => {
    const sortedByAdtv = [...mockETFs].sort((a, b) => b.adtv - a.adtv)
    const rank = sortedByAdtv.findIndex(e => e.id === etf.id) + 1
    return rank <= 10 ? rank : null
  }, [etf.id])

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

  // 구성 데이터 (종목/국가/섹터)
  const holdingsData = useMemo(() => getHoldingsData(etf), [etf.id])
  const countryData = useMemo(() => getCountryData(etf), [etf.id])
  const sectorData = useMemo(() => getSectorData(etf), [etf.id])
  const discrepancyRange = useMemo(() => getDiscrepancyRange(etf), [etf.id])
  const peerGroup = useMemo(() => getPeerGroup(etf), [etf.id])

  const getCurrentCompositionData = () => {
    switch (compositionTab) {
      case 'country': return countryData
      case 'sector': return sectorData
      default: return holdingsData
    }
  }

  const currentData = getCurrentCompositionData()
  const currentTotal = currentData.reduce((sum, h) => sum + h.weight, 0)

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

  // 피어그룹 대비 지표 레인지 바
  const renderMetricRangeBar = (
    label: string,
    value: number,
    stats: { min: number; max: number; avg: number; minName: string; maxName: string; minExtra: number; maxExtra: number; minETFNames: string[]; maxETFNames: string[] },
    format: (v: number) => string,
    useLog = false,
    description?: string,
    metricKey?: string,
    detailedInfo?: string
  ) => {
    const { min, max, avg, minName, maxName, minExtra, maxExtra, minETFNames, maxETFNames } = stats
    const toScale = (v: number) => useLog ? Math.log10(Math.max(v, 1)) : v
    const sMin = toScale(min)
    const sMax = toScale(max)
    const sSpan = sMax - sMin || 0.001
    const clampPos = (v: number) => Math.max(10, Math.min(90, v))
    const getPos = (v: number) => clampPos(((toScale(v) - sMin) / sSpan) * 100)
    const avgPos = getPos(avg)
    const isAbove = value > max
    const isBelow = value < min
    const isOutOfRange = isAbove || isBelow
    // 최저/최고에 해당하거나 벗어나면 바 끝단에 배치
    const valuePos = value >= max ? 97 : value <= min ? 3 : getPos(value)
    const mk = metricKey || label

    return (
      <div className="space-y-2.5">
        {/* 라벨 + (i) + 현재값 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white">{label}</span>
            {detailedInfo && (
              <button
                onClick={() => setExpandedMetricInfo(expandedMetricInfo === mk ? null : mk)}
                className="p-0.5"
              >
                <Info className={`h-3.5 w-3.5 transition-colors ${expandedMetricInfo === mk ? 'text-[#d64f79]' : 'text-gray-500 hover:text-white'}`} />
              </button>
            )}
          </div>
          <span className="text-sm font-bold text-white shrink-0 ml-3">{format(value)}</span>
        </div>
        {description && <p className="text-xs text-gray-400 leading-relaxed">{description}</p>}
        {/* 상세 안내 (i 클릭 시 펼침) */}
        {expandedMetricInfo === mk && detailedInfo && (
          <div className="bg-[#2d2640]/60 rounded-lg px-3 py-2.5 text-xs text-gray-300 leading-relaxed border border-[#3d3650]/50">
            {detailedInfo}
          </div>
        )}

        {/* 최저/최고 - 종목명 항시 표시 */}
        <div className="flex justify-between text-xs">
          <div className="text-left text-gray-400">
            <span>최저 <span className="font-medium">{format(min)}</span></span>
            {minName && (
              <span className="block text-[11px] text-[#d64f79] mt-0.5">
                {minName}
                {minExtra > 0 && (
                  <button
                    onClick={() => setPeerListModal({ label: `${label} 최저`, names: minETFNames })}
                    className="text-gray-400 hover:text-[#d64f79] active:text-[#d64f79] ml-1 underline underline-offset-2"
                  >
                    외 {minExtra}개
                  </button>
                )}
              </span>
            )}
          </div>
          <div className="text-right text-gray-400">
            <span>최고 <span className="font-medium">{format(max)}</span></span>
            {maxName && (
              <span className="block text-[11px] text-[#d64f79] mt-0.5">
                {maxName}
                {maxExtra > 0 && (
                  <button
                    onClick={() => setPeerListModal({ label: `${label} 최고`, names: maxETFNames })}
                    className="text-gray-400 hover:text-[#d64f79] active:text-[#d64f79] ml-1 underline underline-offset-2"
                  >
                    외 {maxExtra}개
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 레인지 바 */}
        <div className="relative h-7 bg-[#352d4a] rounded-full">
          {/* 유형 평균 마커 (◆) */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10" style={{ left: `${avgPos}%` }}>
            <div className="w-2.5 h-2.5 bg-gray-400 rotate-45 rounded-[1px]" />
          </div>
          {/* 현재값 마커 (●) */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20" style={{ left: `${valuePos}%` }}>
            <div className={`w-4 h-4 rounded-full border-2 border-[#252038] shadow-lg ${isOutOfRange ? 'bg-orange-400' : 'bg-[#d64f79]'}`} />
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rotate-45 rounded-[1px] shrink-0" />
            <span>유형평균 {format(avg)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOutOfRange ? 'bg-orange-400' : 'bg-[#d64f79]'}`} />
            <span className={isOutOfRange ? 'text-orange-400' : ''}>
              {etf.shortName}
              {isBelow && ' (유형 최저 이하)'}
              {isAbove && ' (유형 최고 이상)'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={contentRef}
      className="pb-36"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 피어그룹 종목 리스트 모달 */}
      {peerListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1f1a2e] border border-[#3d3450] rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">{peerListModal.label}</h3>
              <button onClick={() => setPeerListModal(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {peerListModal.names.map((name, i) => (
                <div key={i} className="bg-[#2d2640]/50 rounded-lg px-3 py-2.5 text-sm text-white">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header - 디자인에 맞춰 중앙 정렬 */}
      <div className="sticky top-0 z-50 bg-[#191322] border-b border-[#2d2640]">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          {/* 티커 중앙 정렬 */}
          <span className="text-sm text-gray-400">{etf.ticker}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Star className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
          </div>
        </div>
        {/* 종목명 중앙 정렬 */}
        <div className="px-4 pb-3 flex items-center justify-center gap-2">
          <h1 className="text-lg font-bold text-white text-center">{etf.shortName}</h1>
          {etf.isLeveraged && <Badge variant="destructive" className="text-[10px]"><Zap className="h-3 w-3 mr-0.5" />레버리지</Badge>}
          {etf.isInverse && <Badge variant="secondary" className="text-[10px]"><ArrowDownUp className="h-3 w-3 mr-0.5" />인버스</Badge>}
          {etf.isHedged && <Badge variant="info" className="text-[10px]"><Shield className="h-3 w-3 mr-0.5" />환헤지</Badge>}
        </div>
      </div>

      {/* ETF Info Header */}
      <div className="px-4 py-4 bg-gradient-to-b from-[#2a1f3d] to-[#191322]">
        {/* 랭킹 배지 */}
        {rankingPosition && (
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d64f79]/20 text-[#d64f79] text-xs font-medium">
              어제 ETF 조회수 {rankingPosition}위
            </span>
          </div>
        )}

        {/* 가격 정보 - 디자인에 맞게 레이아웃 조정 */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-bold text-white">{formatNumber(etf.price)}</span>
            <span className="text-lg text-gray-400">원</span>
            <span className={`text-lg font-medium ${isUp ? 'text-up' : 'text-down'}`}>
              {formatNumber(Math.abs(etf.change))}원
            </span>
          </div>
          <div className={`flex items-center justify-center gap-3 mt-1 text-sm ${isUp ? 'text-up' : 'text-down'}`}>
            <span className="font-medium">{etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%</span>
            <span className="text-gray-400">iNAV {formatNumber(etf.iNav)}원</span>
            <span className={`${Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
              괴리율 {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 분류 배지 */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className={`text-[10px] px-2 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {etf.marketClass}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
            {etf.assetClass}
          </span>
          {etf.category !== '레버리지' && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
              {etf.category}
            </span>
          )}
        </div>

        {/* 스와이프 힌트 */}
        {etfList && etfList.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <ChevronLeft className="h-3 w-3" />
            <span>왼쪽으로 밀면 검색한 종목을 볼 수 있어요</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Price Chart */}
      <div className="px-4 py-4">
        {/* 차트 영역 - 우측에 아이콘 배치 */}
        <div className="relative">
          {/* 차트 타입 전환 버튼 (단일 토글) */}
          <button
            onClick={() => setChartType(chartType === 'line' ? 'candle' : 'line')}
            className="absolute top-0 right-0 z-10 p-2 rounded-lg bg-[#2d2640]/80 text-gray-400 hover:text-white hover:bg-[#3d3650] transition-colors"
            title={chartType === 'line' ? '캔들 차트로 전환' : '라인 차트로 전환'}
          >
            {chartType === 'line' ? (
              <CandlestickChart className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </button>

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
        </div>

        {/* 기간 선택 탭 */}
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
          <TabsTrigger value="health" className="text-xs py-2">지표모니터</TabsTrigger>
          <TabsTrigger value="insight" className="text-xs py-2">키움인사이트</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* 종목개요 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">종목개요</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {etf.marketClass}
                </span>
                {etf.category && etf.category !== '레버리지' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d64f79]/20 text-[#d64f79]">
                    {etf.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-white leading-relaxed">{etf.overview}</p>
            </CardContent>
          </Card>

          {/* 기초지수 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-2">기초지수</div>
              <p className="text-sm text-white">{etf.indexProvider || '없음'}</p>
            </CardContent>
          </Card>

          {/* 주요특징 */}
          <Card className="bg-[#2d2640]/50 border-[#3d3650]">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-2">주요특징</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {etf.strategy.split(/(\s+)/).map((word, i) => {
                  const keywords = ['밸류업', '성장목표', '배당지급', '기업가치', '저평가', '핵심기업', '리밸런싱', '액티브']
                  const isKeyword = keywords.some(k => word.includes(k))
                  return isKeyword ? <span key={i} className="text-[#d64f79]">{word}</span> : word
                })}
              </p>
            </CardContent>
          </Card>

          {/* 투자정보 - 작은 카드 형태 */}
          <div>
            <div className="text-xs text-gray-500 mb-3 px-1">투자정보</div>
            {/* Row 1: 순자산, 거래대금, 배당수익률 */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">순자산(AUM)</div>
                <div className="text-sm font-bold text-white">{formatCurrency(etf.aum)}</div>
              </div>
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">거래대금</div>
                <div className="text-sm font-bold text-white">{formatCurrency(etf.adtv)}</div>
              </div>
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">배당수익률</div>
                <div className="text-sm font-bold text-white">{etf.dividendYield.toFixed(2)}%</div>
              </div>
            </div>
            {/* Row 2: 총보수, 운용사, 상장일 */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">총보수(TER)</div>
                <div className="text-sm font-bold text-white">{etf.ter.toFixed(2)}%</div>
              </div>
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">운용사</div>
                <div className="text-xs font-bold text-white truncate">{etf.issuer}</div>
              </div>
              <div className="bg-[#2d2640]/50 border border-[#3d3650] rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">상장일</div>
                <div className="text-sm font-bold text-white">{etf.listedDate}</div>
              </div>
            </div>
            {/* 자세히 보기 버튼 */}
            <button
              onClick={() => setShowMoreInfo(true)}
              className="w-full flex items-center justify-end gap-1 py-2 text-sm text-gray-400 hover:text-[#d64f79] transition-colors"
            >
              자세히 보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

                  </TabsContent>

        {/* 자세히 보기 모달 */}
        {showMoreInfo && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMoreInfo(false)}>
            <div
              className="bg-[#1f1a2e] border-t border-[#3d3450] rounded-t-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-[#1f1a2e] px-4 py-4 border-b border-[#3d3450] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{etf.shortName}</h3>
                <button onClick={() => setShowMoreInfo(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* ETF 개요 */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">ETF 개요</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">운용사</span>
                      <span className="text-sm text-white">{etf.issuer}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">상장일</span>
                      <span className="text-sm text-white">{etf.listedDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">기초자산</span>
                      <span className="text-sm text-white">{etf.assetClass}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">기초지수</span>
                      <span className="text-sm text-white">{etf.indexProvider || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">시가총액</span>
                      <span className="text-sm text-white">{formatCurrency(etf.aum)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">순자산(AUM)</span>
                      <span className="text-sm text-white">{formatCurrency(etf.aum)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">구성종목수</span>
                      <span className="text-sm text-white">{etf.holdings?.length || 30}종목</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">레버리지</span>
                      <span className="text-sm text-white">{etf.isLeveraged ? '2배' : '1배'}</span>
                    </div>
                  </div>
                </div>

                {/* 수수료(연) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-medium text-white">수수료(연)</h4>
                    <button
                      onClick={() => setExpandedMetricInfo(expandedMetricInfo === 'fee' ? null : 'fee')}
                      className="p-0.5"
                    >
                      <Info className={`h-4 w-4 transition-colors ${expandedMetricInfo === 'fee' ? 'text-[#d64f79]' : 'text-gray-500 hover:text-white'}`} />
                    </button>
                  </div>
                  {/* 비용 설명 팝업 */}
                  {expandedMetricInfo === 'fee' && (
                    <div className="bg-[#2d2640] rounded-lg p-4 mb-3 space-y-3 text-sm">
                      <h5 className="font-medium text-white">ETF 수수료</h5>
                      <div>
                        <p className="text-[#d64f79] font-medium">총보수</p>
                        <p className="text-gray-400">= 운용보수+신탁보수+사무관리보수+지정참가회사보수</p>
                      </div>
                      <div>
                        <p className="text-[#d64f79] font-medium">TER <span className="text-gray-400 font-normal">(Total Expense Ratio)</span></p>
                        <p className="text-gray-400">= 총보수 + 기타비용*</p>
                        <p className="text-gray-500 text-xs">*기타비용 : 지수사용료, 회계감사비, 해외보관비 등</p>
                      </div>
                      <div>
                        <p className="text-[#d64f79] font-medium">실부담비용</p>
                        <p className="text-gray-400">= TER + 매매·중개수수료*</p>
                        <p className="text-gray-500 text-xs">*매매·중개수수료 : 자산 매매시 발생하는 증권거래비용</p>
                      </div>
                      <div className="pt-2 border-t border-[#3d3650] space-y-1">
                        <p className="text-xs text-gray-500">ⓘ 총보수는 일별자료이나 TER과 실부담비용은 월별자료 (기준일 : 2026/01/30) 입니다.</p>
                        <p className="text-xs text-gray-500">ⓘ 상장 1년 미만인 경우 매매·중개수수료가 과다하게 발생할 수 있습니다.</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">총보수율</span>
                      <span className="text-sm text-white">{etf.ter.toFixed(4)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">TER</span>
                      <span className="text-sm text-white">{(etf.ter * 1.1).toFixed(4)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">실부담비용률</span>
                      <span className="text-sm text-white">{(etf.ter * 1.15).toFixed(4)}%</span>
                    </div>
                  </div>
                </div>

                {/* 세금 */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">세금</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">증권거래</span>
                      <span className="text-sm text-white">비과세</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">매매차익</span>
                      <span className="text-sm text-white">비과세</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">현금배당</span>
                      <span className="text-sm text-white">배당소득세 (15.4%)</span>
                    </div>
                  </div>
                </div>

                {/* 거래정보 */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">거래정보</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">당일고저</span>
                      <span className="text-sm text-white">
                        {formatNumber(Math.round(etf.price * 0.98))} - {formatNumber(Math.round(etf.price * 1.02))}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">52주고저</span>
                      <span className="text-sm text-white">
                        {formatNumber(Math.round(etf.price * 0.85))} - {formatNumber(Math.round(etf.price * 1.15))}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">거래량(60일평균)</span>
                      <span className="text-sm text-white">{formatNumber(Math.round(etf.adtv / etf.price))}주</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2d2640]">
                      <span className="text-sm text-gray-400">거래대금(60일평균)</span>
                      <span className="text-sm text-white">{formatCurrency(etf.adtv)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

          {/* 구성 비중 - 가로 바 차트 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-[#d64f79]" />
                {compositionTab === 'stock' ? '구성종목 TOP 5' :
                 compositionTab === 'country' ? '국가별 비중' : '섹터별 비중'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentData.map((item, i) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{item.name}</span>
                    <span className="text-sm text-gray-400">{item.weight.toFixed(1)}%</span>
                  </div>
                  {/* 가로 바 */}
                  <div className="h-2 bg-[#2d2640] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.weight}%`,
                        backgroundColor: PIE_COLORS[i] || '#6B7280'
                      }}
                    />
                  </div>
                </div>
              ))}
              {currentTotal < 100 && (
                <div className="space-y-1 pt-2 border-t border-[#3d3650]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">기타</span>
                    <span className="text-sm text-gray-400">{(100 - currentTotal).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[#2d2640] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-600"
                      style={{ width: `${100 - currentTotal}%` }}
                    />
                  </div>
                </div>
              )}
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
                  className={`flex-1 py-1.5 text-xs rounded font-medium ${
                    dividendView === 'monthly'
                      ? 'bg-[#d64f79] text-white'
                      : 'bg-[#2d2640] text-gray-400'
                  }`}
                >
                  월별
                </button>
                <button
                  onClick={() => setDividendView('yearly')}
                  className={`flex-1 py-1.5 text-xs rounded font-medium ${
                    dividendView === 'yearly'
                      ? 'bg-[#d64f79] text-white'
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

        {/* 건전성 탭 (지표모니터) */}
        <TabsContent value="health" className="space-y-3 mt-4">
          {/* 비교 기준 컨텍스트 바 */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">비교 기준:</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {etf.marketClass}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
                {etf.assetClass}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${peerGroup.isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {peerGroup.styleLabel}
              </span>
              <span className="text-xs text-gray-400">{peerGroup.count}개 ETF</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 px-1">* 직전 거래일 기준</p>

          {/* 섹션: 동일 유형 ETF 대비 */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <div className="h-px flex-1 bg-[#3d3650]" />
            <span className="text-[11px] text-gray-500 shrink-0">동일 유형 ETF 대비</span>
            <div className="h-px flex-1 bg-[#3d3650]" />
          </div>

          {/* TER (총보수) */}
          <Card className="bg-[#2d2640]/30 border-[#3d3650]">
            <CardContent className="p-4">
              {renderMetricRangeBar(
                'TER (총보수)', etf.ter, peerGroup.ter, v => `${v.toFixed(2)}%`, false,
                '보유 중 순자산에서 자동 차감되는 연간 비용', 'ter',
                '운용보수, 수탁보수, 사무관리보수 등을 포함한 총비용입니다. 같은 지수를 추종하는 ETF라도 보수 차이가 있어, 보유 기간이 길수록 누적 비용 차이가 발생합니다.'
              )}
            </CardContent>
          </Card>

          {/* 스프레드 */}
          <Card className="bg-[#2d2640]/30 border-[#3d3650]">
            <CardContent className="p-4">
              {renderMetricRangeBar(
                '스프레드', etf.spread, peerGroup.spread, v => `${v.toFixed(2)}%`, false,
                '매수·매도 호가 간 차이, 매매 시마다 발생하는 거래비용', 'spread',
                'LP(유동성공급자)가 제시하는 매수·매도 호가 간 차이입니다. 매매할 때마다 발생하므로 거래 빈도가 높을수록 누적 영향이 커집니다.'
              )}
            </CardContent>
          </Card>

          {/* 유동성 */}
          <Card className="bg-[#2d2640]/30 border-[#3d3650]">
            <CardContent className="p-4">
              {renderMetricRangeBar(
                '유동성 (30D 거래대금)', etf.adtv, peerGroup.adtv, v => formatCurrency(v), true,
                '일평균 거래대금 기준, 체결 속도·물량에 영향', 'adtv',
                '최근 30일 일평균 거래대금입니다. 거래대금이 많을수록 원하는 가격·수량에 체결될 가능성이 높아지며, 대량 매매 시 특히 참고되는 지표입니다.'
              )}
            </CardContent>
          </Card>

          {/* 섹션: 이 종목의 최근 추이 */}
          <div className="flex items-center gap-2 px-1 pt-2">
            <div className="h-px flex-1 bg-[#3d3650]" />
            <span className="text-[11px] text-gray-500 shrink-0">이 종목의 최근 추이</span>
            <div className="h-px flex-1 bg-[#3d3650]" />
          </div>

          {/* 괴리율 */}
          <Card className="bg-[#2d2640]/30 border-[#3d3650]">
            <CardContent className="p-4 space-y-2.5">
              {/* 라벨 + (i) + 현재값 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white">괴리율</span>
                  <button
                    onClick={() => setExpandedMetricInfo(expandedMetricInfo === 'discrepancy' ? null : 'discrepancy')}
                    className="p-0.5"
                  >
                    <Info className={`h-3.5 w-3.5 transition-colors ${expandedMetricInfo === 'discrepancy' ? 'text-[#d64f79]' : 'text-gray-500 hover:text-white'}`} />
                  </button>
                </div>
                <span className="text-sm font-bold text-white shrink-0 ml-3">
                  {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">시장가와 NAV 차이, 매매 시점의 가격 괴리 정도</p>
              {/* 상세 안내 (i 클릭 시 펼침) */}
              {expandedMetricInfo === 'discrepancy' && (
                <div className="bg-[#2d2640]/60 rounded-lg px-3 py-2.5 text-xs text-gray-300 leading-relaxed border border-[#3d3650]/50">
                  시장가격과 순자산가치(iNAV) 간 차이입니다. 매수 시점에 프리미엄, 매도 시점에 디스카운트가 발생할 수 있으며, 이 수치를 통해 현재 가격이 적정 가치에 가까운지 참고할 수 있습니다.
                </div>
              )}

              {(() => {
                const { min, max, avg, yesterday } = discrepancyRange
                const span = max - min || 0.01
                const clampPos = (v: number) => Math.max(10, Math.min(90, v))
                const avgPos = clampPos(((avg - min) / span) * 100)
                const isExceeded = yesterday > max
                const isBelowMin = yesterday < min
                const isOutOfRange = isExceeded || isBelowMin
                // 최저/최고에 해당하거나 벗어나면 바 끝단에 배치
                const yesterdayPos = yesterday >= max ? 97 : yesterday <= min ? 3 : clampPos(((yesterday - min) / span) * 100)
                return (
                  <>
                    {/* 1개월 최저/최고 */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">1개월 최저 <span className="font-medium">{min >= 0 ? '+' : ''}{min.toFixed(2)}%</span></span>
                      <span className="text-gray-400">1개월 최고 <span className="font-medium">{max >= 0 ? '+' : ''}{max.toFixed(2)}%</span></span>
                    </div>

                    {/* 레인지 바 */}
                    <div className="relative h-7 bg-[#352d4a] rounded-full">
                      {/* 평균 마커 (◆) */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10" style={{ left: `${avgPos}%` }}>
                        <div className="w-2.5 h-2.5 bg-gray-400 rotate-45 rounded-[1px]" />
                      </div>
                      {/* 전일 마커 (●) */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20" style={{ left: `${yesterdayPos}%` }}>
                        <div className={`w-4 h-4 rounded-full border-2 border-[#252038] shadow-lg ${isOutOfRange ? 'bg-orange-400' : 'bg-[#d64f79]'}`} />
                      </div>
                    </div>

                    {/* 범례 */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rotate-45 rounded-[1px] shrink-0" />
                        <span>평균 {avg >= 0 ? '+' : ''}{avg.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOutOfRange ? 'bg-orange-400' : 'bg-[#d64f79]'}`} />
                        <span className={isOutOfRange ? 'text-orange-400' : ''}>
                          전일 {yesterday >= 0 ? '+' : ''}{yesterday.toFixed(2)}%
                          {isExceeded && ' (1개월 최고 이상)'}
                          {isBelowMin && ' (1개월 최저 이하)'}
                        </span>
                      </div>
                    </div>
                  </>
                )
              })()}
              {etf.marketClass === '해외' && (
                <p className="text-xs text-gray-400 mt-1">
                  국내상장 해외 ETF는 환율, 시차, 기초자산 선물가 등으로 인해 괴리율이 변동할 수 있습니다.
                </p>
              )}
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
          <Button variant="outline" className="flex-1" onClick={() => onAddToCompare?.(etf)}>비교하러가기</Button>
          <Button className="flex-1" onClick={onTrade}>주문하러가기</Button>
        </div>
      </div>
    </div>
  )
}
