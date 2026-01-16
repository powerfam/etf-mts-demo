import { useState, useEffect } from 'react'
import { Search, TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, Layers, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ETFCard } from '@/components/ETFCard'
import { mockETFs, themes } from '@/data/mockData'
import type { ETF } from '@/data/mockData'

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, Layers
}

interface DiscoverPageProps {
  onSelectETF: (etf: ETF) => void
  accountType?: string
  selectedTheme?: string
  onThemeChange?: (theme: string) => void
  onLongPressETF?: (etf: ETF) => void
}

const INITIAL_DISPLAY_COUNT = 20

export function DiscoverPage({
  onSelectETF,
  accountType = 'general',
  selectedTheme: externalTheme = 'none',
  onThemeChange,
  onLongPressETF
}: DiscoverPageProps) {
  const [internalTheme, setInternalTheme] = useState<string>(externalTheme)
  const [sortBy, setSortBy] = useState<string>('return')
  const [mode, setMode] = useState<string>('discover')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false)
  const [pensionModeManual, setPensionModeManual] = useState<boolean>(false)
  const [marketFilter, setMarketFilter] = useState<string>('all') // 국내/해외/전체

  // 외부 테마 변경 시 내부 상태 동기화
  useEffect(() => {
    setInternalTheme(externalTheme)
  }, [externalTheme])

  const selectedTheme = internalTheme
  const setSelectedTheme = (theme: string) => {
    setInternalTheme(theme)
    onThemeChange?.(theme)
  }

  // 연금/ISA 계좌 선택 시 자동으로 레버리지/인버스 필터링
  const isPensionAccount = accountType === 'pension' || accountType === 'isa'
  const pensionMode = isPensionAccount || pensionModeManual

  // 'none' 테마이고 검색어도 없으면 빈 리스트 표시
  const isEmptyState = selectedTheme === 'none' && searchQuery.trim() === ''

  const filteredETFs = isEmptyState ? [] : mockETFs.filter(etf => {
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

    const matchesPensionMode = !pensionMode || (!etf.isLeveraged && !etf.isInverse)

    // 국내/해외 필터
    const matchesMarket = marketFilter === 'all' ||
      (marketFilter === 'domestic' && etf.marketClass === '국내') ||
      (marketFilter === 'overseas' && etf.marketClass === '해외')

    return matchesSearch && matchesTheme && matchesPensionMode && matchesMarket
  })

  const sortedETFs = [...filteredETFs].sort((a, b) => {
    switch (sortBy) {
      case 'health': return b.healthScore - a.healthScore
      case 'ter': return a.ter - b.ter
      case 'liquidity': return b.adtv - a.adtv
      case 'return': return b.changePercent - a.changePercent
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
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {/* 연금계좌 적합 상품만 */}
        <div className="flex items-center justify-between mb-2" data-tour="pension-filter">
          <span className="text-sm text-gray-400">
            연금계좌 적합 상품만
            {isPensionAccount && <span className="ml-1 text-xs text-[#d64f79]">(연금/ISA 계좌)</span>}
          </span>
          <button
            onClick={() => !isPensionAccount && setPensionModeManual(!pensionModeManual)}
            disabled={isPensionAccount}
            className={`relative w-11 h-6 rounded-full transition-colors ${pensionMode ? 'bg-[#d64f79]' : 'bg-[#3d3650]'} ${isPensionAccount ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${pensionMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {/* 시장 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">시장:</span>
          <div className="flex gap-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'domestic', label: '국내' },
              { id: 'overseas', label: '해외' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setMarketFilter(option.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  marketFilter === option.id
                    ? 'bg-[#d64f79] text-white'
                    : 'bg-[#2d2640] text-gray-400 hover:bg-[#3d3650]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3" data-tour="mode-tabs">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="discover">탐색</TabsTrigger>
            <TabsTrigger value="check">검증</TabsTrigger>
            <TabsTrigger value="trade">주문</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 pb-3" data-tour="theme-filter">
        {/* 빈 상태일 때 안내 메시지 */}
        {isEmptyState && (
          <div className="text-sm text-[#d64f79] mb-2 font-medium">
            👇 테마를 선택하거나 검색어를 입력하세요
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* 전체 버튼을 맨 앞에 (아이콘 포함) */}
          <Button
            variant={selectedTheme === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTheme('all')}
            className="shrink-0"
          >
            <Layers className="h-3 w-3 mr-1" />
            전체
          </Button>
          {/* 나머지 테마 (전체 제외) */}
          {themes.filter(theme => theme.id !== 'all').map((theme) => {
            const Icon = iconMap[theme.icon] || TrendingUp
            return (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme(theme.id)}
                className="shrink-0"
              >
                <Icon className="h-3 w-3 mr-1" />
                {theme.name}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between" data-tour="sort-options">
        <div className="text-sm text-gray-400">{sortedETFs.length}개 ETF</div>
        <div className="flex gap-2">
          {['return', 'liquidity', 'ter', 'health'].map((sort) => (
            <Button
              key={sort}
              variant="ghost"
              size="sm"
              className={`text-xs ${sortBy === sort ? 'text-[#d64f79]' : 'text-gray-400'}`}
              onClick={() => setSortBy(sort)}
            >
              {sort === 'return' ? '수익률순' : sort === 'liquidity' ? '유동성순' : sort === 'ter' ? '저비용순' : '건전성순'}
            </Button>
          ))}
        </div>
      </div>

      {mode === 'discover' && (
        <div className="px-4 space-y-3">
          {isEmptyState && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">ETF를 탐색해보세요</h3>
              <p className="text-sm text-gray-400 max-w-[240px]">
                상단의 테마 버튼을 선택하거나<br />검색어를 입력해주세요
              </p>
            </div>
          )}
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

      {mode === 'check' && (
        <div className="px-4">
          {isEmptyState && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">ETF를 탐색해보세요</h3>
              <p className="text-sm text-gray-400 max-w-[240px]">
                상단의 테마 버튼을 선택하거나<br />검색어를 입력해주세요
              </p>
            </div>
          )}
          {!isEmptyState && (
            <>
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">빠른 비교 체크리스트</h3>
                  <div className="space-y-2">
                    {[['TER (총보수)', '0.05% 이하 권장'], ['괴리율', '±0.1% 이내 권장'], ['스프레드', '0.05% 이하 권장'], ['거래대금', '100억 이상 권장']].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-emerald-400">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2d2640]">
                      {['종목', 'TER', '괴리율', '스프레드', '건전성'].map((h) => (
                        <th key={h} className={`py-2 text-gray-400 font-medium ${h === '종목' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedETFs.map((etf) => (
                      <tr key={etf.id} className="border-b border-[#2d2640] cursor-pointer hover:bg-[#1f1a2e]" onClick={() => onSelectETF(etf)}>
                        <td className="py-3">
                          <div className="font-medium text-white">{etf.shortName}</div>
                          <div className="text-gray-500">{etf.ticker}</div>
                        </td>
                        <td className={`text-right ${etf.ter <= 0.05 ? 'text-emerald-400' : etf.ter <= 0.1 ? 'text-amber-400' : 'text-red-400'}`}>{etf.ter.toFixed(2)}%</td>
                        <td className={`text-right ${Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>{etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%</td>
                        <td className={`text-right ${etf.spread <= 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>{etf.spread.toFixed(2)}%</td>
                        <td className="text-right"><Badge variant={etf.healthScore >= 90 ? 'success' : etf.healthScore >= 75 ? 'warning' : 'danger'}>{etf.healthScore}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'trade' && (
        <div className="px-4 space-y-3">
          {isEmptyState && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">ETF를 탐색해보세요</h3>
              <p className="text-sm text-gray-400 max-w-[240px]">
                상단의 테마 버튼을 선택하거나<br />검색어를 입력해주세요
              </p>
            </div>
          )}
          {!isEmptyState && (
            <>
              <Card className="border-[#d64f79]/30 bg-[#d64f79]/5">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">안전 주문 가이드</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• 지정가 주문으로 슬리피지를 방지하세요</li>
                    <li>• 괴리율이 높을 때는 매매를 피하세요</li>
                    <li>• 대량 주문은 분할 매매를 권장합니다</li>
                  </ul>
                </CardContent>
              </Card>
              {displayedETFs.map((etf) => (
            <Card key={etf.id} className="cursor-pointer hover:border-[#d64f79]/50" onClick={() => onSelectETF(etf)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-gray-400">{etf.ticker}</div>
                    <div className="font-medium text-white">{etf.shortName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{etf.price.toLocaleString()}</div>
                    <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>{etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
                {/* 시장분류 + 자산분류 배지 */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {etf.marketClass}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
                    {etf.assetClass}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['괴리율', etf.discrepancy, 0.1], ['스프레드', etf.spread, 0.05], ['체결가능', null, null]].map(([label, val, threshold]) => (
                    <div key={label as string} className="bg-[#2a2438] rounded-lg p-2 text-center">
                      <div className="text-[10px] text-gray-500">{label}</div>
                      <div className={`text-xs font-medium ${val === null ? 'text-emerald-400' : Math.abs(val as number) <= (threshold as number) ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {val === null ? '양호' : `${(val as number) >= 0 ? '+' : ''}${(val as number).toFixed(2)}%`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">매수</Button>
                  <Button size="sm" variant="secondary" className="flex-1">매도</Button>
                </div>
              </CardContent>
            </Card>
          ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
