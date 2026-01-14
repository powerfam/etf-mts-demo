import { useState } from 'react'
import { Plus, X, CheckCircle2, Info, Radar as RadarIcon, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
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
}

export function ComparePage({ onSelectETF: _onSelectETF }: ComparePageProps) {
  void _onSelectETF // 미사용 경고 방지
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([mockETFs[0], mockETFs[1], mockETFs[2]])
  const [showSelector, setShowSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const addETF = (etf: ETF) => {
    if (selectedETFs.length < 5 && !selectedETFs.find(e => e.id === etf.id)) {
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

  // Compare metrics
  const compareMetrics = [
    {
      category: '비용',
      items: [
        { key: 'ter', label: 'TER (총보수)', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
      ]
    },
    {
      category: '거래안전',
      items: [
        { key: 'discrepancy', label: '괴리율', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'low', absolute: true },
        { key: 'spread', label: '스프레드', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
      ]
    },
    {
      category: '유동성',
      items: [
        { key: 'adtv', label: '30D 거래대금', format: (v: number) => formatCurrency(v), best: 'high' },
        { key: 'aum', label: '순자산(AUM)', format: (v: number) => formatCurrency(v), best: 'high' },
      ]
    },
    {
      category: '품질',
      items: [
        { key: 'trackingError', label: '추적오차', format: (v: number) => `${v.toFixed(2)}%`, best: 'low' },
        { key: 'healthScore', label: '건전성 점수', format: (v: number) => `${v}점`, best: 'high' },
      ]
    },
    {
      category: '수익',
      items: [
        { key: 'changePercent', label: '일간 수익률', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, best: 'high' },
        { key: 'dividendYield', label: '배당수익률', format: (v: number) => `${v.toFixed(1)}%`, best: 'high' },
      ]
    }
  ]

  // 레이더 차트용 색상
  const chartColors = ['#d64f79', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6']

  // 레이더 차트용 지표 정규화 (0-100 스케일)
  const normalizeForRadar = (etf: ETF) => {
    // 각 지표를 0-100 점수로 변환 (높을수록 좋음)
    const terScore = Math.max(0, 100 - etf.ter * 50) // TER 낮을수록 좋음
    const spreadScore = Math.max(0, 100 - etf.spread * 200) // 스프레드 낮을수록 좋음
    const healthScore = etf.healthScore // 이미 0-100
    const liquidityScore = Math.min(100, Math.log10(etf.adtv / 100000000) * 20) // 거래대금 로그 스케일
    const trackingScore = Math.max(0, 100 - etf.trackingError * 200) // 추적오차 낮을수록 좋음
    const dividendScore = Math.min(100, etf.dividendYield * 20) // 배당수익률

    return {
      name: etf.shortName.length > 8 ? etf.shortName.slice(0, 8) + '...' : etf.shortName,
      '비용효율': Math.round(terScore),
      '거래안전': Math.round(spreadScore),
      '건전성': Math.round(healthScore),
      '유동성': Math.round(liquidityScore),
      '추적정확': Math.round(trackingScore),
      '배당매력': Math.round(dividendScore),
    }
  }

  // 레이더 차트 데이터 생성
  const radarData = [
    { metric: '비용효율', fullMark: 100 },
    { metric: '거래안전', fullMark: 100 },
    { metric: '건전성', fullMark: 100 },
    { metric: '유동성', fullMark: 100 },
    { metric: '추적정확', fullMark: 100 },
    { metric: '배당매력', fullMark: 100 },
  ].map(item => {
    const dataPoint: Record<string, string | number> = { metric: item.metric, fullMark: item.fullMark }
    selectedETFs.forEach(etf => {
      const normalized = normalizeForRadar(etf)
      dataPoint[etf.shortName] = normalized[item.metric as keyof typeof normalized] as number
    })
    return dataPoint
  })

  const getBestValue = (key: string, best: string, absolute?: boolean) => {
    const values = selectedETFs.map(etf => {
      const value = etf[key as keyof ETF] as number
      return absolute ? Math.abs(value) : value
    })
    if (best === 'low') {
      return Math.min(...values)
    }
    return Math.max(...values)
  }

  const isBestValue = (etf: ETF, key: string, best: string, absolute?: boolean) => {
    const value = absolute ? Math.abs(etf[key as keyof ETF] as number) : etf[key as keyof ETF] as number
    return value === getBestValue(key, best, absolute)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-[52px] z-40 bg-[#191322] px-4 py-3 border-b border-[#2d2640]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">ETF 비교</h1>
          <Badge variant="outline" className="text-xs">{selectedETFs.length}/5</Badge>
        </div>
      </div>

      {/* Selected ETFs Header */}
      <div className="px-4 py-3 border-b border-[#2d2640]" data-tour="compare-slots">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {selectedETFs.map((etf) => (
              <div key={etf.id} className="relative shrink-0 w-[120px]">
                <Card className="h-[100px]">
                  <CardContent className="p-3 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400">{etf.ticker}</div>
                      <div className="text-xs font-medium text-white truncate">{etf.shortName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{formatNumber(etf.price)}</div>
                      <div className={`text-[10px] ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
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

            {selectedETFs.length < 5 && (
              <button
                onClick={() => setShowSelector(true)}
                className="shrink-0 w-[120px] h-[100px] border-2 border-dashed border-[#2d2640] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#d64f79]/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-500" />
                <span className="text-xs text-gray-500">ETF 추가</span>
              </button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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

      {/* Radar Chart - 방사형 비교 차트 */}
      {selectedETFs.length >= 2 && (
        <div className="px-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RadarIcon className="h-4 w-4 text-[#d64f79]" />
                ETF Radar
              </CardTitle>
              <p className="text-[11px] text-gray-500">주요 6개 항목 시각화 비교</p>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#3d3650" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 9 }}
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
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* 항목 설명 */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#d64f79]" />
                  비용효율: TER(총보수) 기준
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  거래안전: 스프레드 기준
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  건전성: 종합 건전성 점수
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  유동성: 30일 거래대금
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  추적정확: 추적오차 기준
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  배당매력: 배당수익률
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Table */}
      <div className="px-4 py-4" data-tour="compare-table">
        {compareMetrics.map((category) => (
          <Card key={category.category} className="mb-4">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-gray-400">{category.category}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {category.items.map((item) => (
                <div key={item.key} className="border-t border-[#2d2640]">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <Info className="h-3 w-3 text-gray-600" />
                    </div>
                  </div>
                  <div className="px-3 pb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedETFs.length}, 1fr)` }}>
                    {selectedETFs.map((etf) => {
                      const value = etf[item.key as keyof ETF] as number
                      const isBest = isBestValue(etf, item.key, item.best, item.absolute)
                      return (
                        <div
                          key={etf.id}
                          className={`p-2 rounded-lg text-center ${isBest ? 'bg-emerald-500/10' : 'bg-[#2a2438]'}`}
                        >
                          <div className={`text-sm font-medium ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                            {item.format(value)}
                          </div>
                          {isBest && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mx-auto mt-1" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="px-4 pb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">비교 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedETFs.map((etf) => {
                const wins = compareMetrics.flatMap(c => c.items)
                  .filter(item => isBestValue(etf, item.key, item.best, item.absolute)).length
                const total = compareMetrics.flatMap(c => c.items).length
                return (
                  <div key={etf.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d64f79' }} />
                      <span className="text-sm text-white">{etf.shortName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{wins}/{total} 항목 우위</span>
                      <Badge variant={wins >= total / 2 ? 'success' : 'outline'}>
                        {etf.healthScore}점
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
