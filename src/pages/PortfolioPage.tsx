import { useState, useRef, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, ChevronRight, ChevronDown, Wallet, CalendarDays, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPortfolioByAccountType, getDividendsByDate, getPortfolioETFIds } from '@/data/mockData'
import { DividendCalendar } from '@/components/DividendCalendar'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

// 계좌 목록 데이터 (데모용)
const accountList = [
  { id: 'general-1', number: '8012-1234-5678', type: 'general', label: '일반' },
  { id: 'pension-1', number: '8012-5678-1234', type: 'pension', label: '연금' },
  { id: 'isa-1', number: '8012-9012-3456', type: 'isa', label: 'ISA' },
]

// 계좌 타입별 아이콘 (동일한 Wallet 아이콘 사용)
const accountTypeIcons: Record<string, React.ElementType> = {
  general: Wallet,
  pension: Wallet,
  isa: Wallet,
}

interface PortfolioPageProps {
  accountType: string
  onSelectETF: (etf: ETF) => void
  onLongPressETF?: (etf: ETF) => void
  onAccountTypeChange?: (type: string) => void
}

const COLORS = ['#d64f79', '#796ec2', '#4ade80', '#f59e0b', '#06b6d4']

export function PortfolioPage({ accountType, onSelectETF, onLongPressETF, onAccountTypeChange }: PortfolioPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showDividendCalendar, setShowDividendCalendar] = useState(false)

  // 현재 선택된 계좌 정보
  const currentAccount = accountList.find(acc => acc.type === accountType) || accountList[0]
  const AccountIcon = accountTypeIcons[accountType] || Wallet

  // 롱프레스 처리를 위한 타이머
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // 계좌 타입에 따른 포트폴리오 데이터 가져오기
  const currentPortfolio = getPortfolioByAccountType(accountType)
  const totalValue = currentPortfolio.reduce((sum, etf) => sum + etf.totalValue, 0)
  const totalCost = currentPortfolio.reduce((sum, etf) => sum + (etf.avgPrice * etf.quantity), 0)
  const totalProfitLoss = currentPortfolio.reduce((sum, etf) => sum + etf.profitLoss, 0)
  const totalProfitLossPercent = (totalProfitLoss / totalCost) * 100

  // Pie chart data
  const pieData = currentPortfolio.map((etf, index) => ({
    name: etf.shortName,
    value: etf.totalValue,
    percent: (etf.totalValue / totalValue * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }))

  // Calculate tax based on account type
  const getTaxInfo = () => {
    const gain = totalProfitLoss
    switch (accountType) {
      case 'pension':
        return { label: '연금', rate: 5.5, tax: gain * 0.055, benefit: '세금이연' }
      case 'isa':
        return { label: 'ISA', rate: 9.9, tax: Math.max(0, gain - 2000000) * 0.099, benefit: '비과세 한도' }
      default:
        return { label: '일반', rate: 15.4, tax: gain * 0.154, benefit: '' }
    }
  }
  const taxInfo = getTaxInfo()

  // Risk alerts
  const riskAlerts = currentPortfolio.filter(etf =>
    etf.healthScore < 75 || Math.abs(etf.discrepancy) > 0.1 || etf.spread > 0.1
  )

  // 자산 클래스별 비중 계산
  const assetClassData = useMemo(() => {
    const classMap: Record<string, number> = {}
    currentPortfolio.forEach(etf => {
      const assetClass = etf.assetClass || '주식'
      classMap[assetClass] = (classMap[assetClass] || 0) + etf.totalValue
    })

    const result = Object.entries(classMap).map(([name, value]) => ({
      name,
      value,
      percent: (value / totalValue * 100).toFixed(1)
    }))

    return result.sort((a, b) => b.value - a.value)
  }, [currentPortfolio, totalValue])

  // 자산 클래스별 색상
  const assetClassColors: Record<string, string> = {
    '주식': '#d64f79',
    '채권': '#4ade80',
    '원자재': '#f59e0b',
    '통화': '#06b6d4',
    '혼합': '#796ec2',
  }

  // 다가오는 분배금 일정 (현재 계좌 보유 ETF 기준)
  const upcomingDividends = useMemo(() => {
    const portfolioIds = getPortfolioETFIds(accountType)
    const today = new Date()
    const results: { etf: ETF; date: string; dividendPerShare: number }[] = []

    // 오늘부터 30일간 분배금 일정 확인
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`

      const dividends = getDividendsByDate(dateStr)
      dividends.forEach(d => {
        if (portfolioIds.includes(d.etfId)) {
          results.push({
            etf: d.etf,
            date: dateStr,
            dividendPerShare: d.dividendPerShare
          })
        }
      })
    }

    return results.slice(0, 3) // 최대 3개만 표시
  }, [accountType])

  return (
    <div className="pb-20">
      {/* Portfolio Summary Header */}
      <div className="bg-gradient-to-b from-[#2a1f3d] to-[#191322] px-4 py-6">
        {/* 계좌 선택 드롭다운 */}
        <div className="relative mb-4" data-tour="account-selector">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2 bg-[#1f1a2e] border border-[#3d3650] rounded-lg px-3 py-2 w-full"
          >
            <AccountIcon className="h-4 w-4 text-[#d64f79]" />
            <div className="flex-1 text-left">
              <div className="text-[15px] text-gray-400">{currentAccount.label}계좌</div>
              <div className="text-[17px] text-white">{currentAccount.number}</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* 드롭다운 메뉴 */}
          {showAccountDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1a2e] border border-[#3d3650] rounded-lg overflow-hidden z-50 shadow-xl">
              {accountList.map((account) => {
                const Icon = accountTypeIcons[account.type] || Wallet
                const isSelected = account.type === accountType
                return (
                  <button
                    key={account.id}
                    onClick={() => {
                      onAccountTypeChange?.(account.type)
                      setShowAccountDropdown(false)
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-[#d64f79]/20' : 'hover:bg-[#2d2640]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-[#d64f79]' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="text-[15px] text-gray-400">{account.label}계좌</div>
                      <div className="text-[17px] text-white">{account.number}</div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#d64f79]" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 계좌 타입 아이콘 표시 */}
        <div className="flex items-center gap-2 mb-2" data-tour="account-type-badge">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[15px] font-medium ${
            accountType === 'general' ? 'bg-gray-500/20 text-gray-300' :
            accountType === 'pension' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            <AccountIcon className="h-3.5 w-3.5" />
            <span>{taxInfo.label}</span>
          </div>
        </div>
        <div className="text-[17px] text-gray-400">ETF 포트폴리오</div>
        <div className="text-[33px] font-bold text-white mt-1">
          {formatNumber(totalValue)}<span className="text-[21px] text-gray-400">원</span>
        </div>
        <div className={`flex items-center gap-2 mt-2 ${totalProfitLoss >= 0 ? 'text-up' : 'text-down'}`}>
          {totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">
            {totalProfitLoss >= 0 ? '+' : ''}{formatNumber(totalProfitLoss)}원
          </span>
          <span>({formatPercent(totalProfitLossPercent)})</span>
        </div>

        {/* Tax Summary */}
        <div className={`mt-4 p-3 rounded-lg ${accountType !== 'general' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-[#1f1a2e]'}`} data-tour="tax-info">
          <div className="flex items-center justify-between text-[17px]">
            <span className="text-gray-400">예상 세금 ({taxInfo.rate}%)</span>
            <span className="text-white">{formatNumber(Math.round(taxInfo.tax))}원</span>
          </div>
          {accountType !== 'general' && (
            <div className="text-[15px] text-emerald-400 mt-1">
              일반계좌 대비 {formatNumber(Math.round(totalProfitLoss * 0.154 - taxInfo.tax))}원 절감
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      <div className="px-4 py-4" data-tour="portfolio-chart">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[17px]">자산 배분</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1a2e',
                        border: '1px solid #3d3450',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      itemStyle={{ color: 'white' }}
                      labelStyle={{ color: 'white' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-[#1f1a2e] border border-[#3d3450] rounded-lg px-3 py-2">
                              <p className="text-white text-[17px] font-medium">{data.name}</p>
                              <p className="text-gray-300 text-[15px] mt-1">
                                {formatNumber(data.value)}원 ({data.percent}%)
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[15px] text-gray-400 flex-1">{item.name}</span>
                    <span className="text-[15px] text-white">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 자산 클래스별 비중 바 */}
            <div className="mt-4 pt-4 border-t border-[#2d2640]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] text-gray-400">자산 클래스 비중</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-[#2d2640]">
                {assetClassData.map((item, index) => (
                  <div
                    key={item.name}
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: assetClassColors[item.name] || '#6b7280'
                    }}
                    className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${index === assetClassData.length - 1 ? 'rounded-r-full' : ''}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {assetClassData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: assetClassColors[item.name] || '#6b7280' }}
                    />
                    <span className="text-[14px] text-gray-400">{item.name}</span>
                    <span className="text-[14px] text-white">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div className="px-4 pb-4">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-[17px] font-medium text-white">리스크 알림</span>
              </div>
              <div className="space-y-2">
                {riskAlerts.map((etf) => (
                  <div key={etf.id} className="flex items-center justify-between text-[15px]">
                    <span className="text-gray-400">{etf.shortName}</span>
                    <span className="text-amber-400">
                      {etf.healthScore < 75 && '건전성 주의'}
                      {Math.abs(etf.discrepancy) > 0.1 && ' 괴리율 상승'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rebalancing Suggestion */}
      <div className="px-4 pb-4">
        <Card className="border-[#d64f79]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-[#d64f79]" />
                <span className="text-[17px] font-medium text-white">리밸런싱 제안</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[15px] text-gray-400 mt-2">
              현재 포트폴리오가 목표 배분과 5% 이상 차이납니다. 리밸런싱을 검토해보세요.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 분배금 일정 - 클릭 시 캘린더 모달 오픈 */}
      <div className="px-4 pb-4">
        <Card
          className="border-[#d64f79]/20 bg-[#d64f79]/5 cursor-pointer hover:border-[#d64f79]/40 transition-colors"
          onClick={() => setShowDividendCalendar(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#d64f79]" />
                <span className="text-[17px] font-medium text-white">분배금 일정</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {upcomingDividends.length === 0 ? (
              <p className="text-[15px] text-gray-500">
                30일 내 예정된 분배금이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingDividends.map((dividend, index) => {
                  const date = new Date(dividend.date)
                  const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일`
                  return (
                    <div key={`${dividend.etf.id}-${index}`} className="flex items-center justify-between text-[17px]">
                      <span className="text-gray-400">{dividend.etf.shortName}</span>
                      <div className="text-right">
                        <span className="text-white">{dateStr}</span>
                        <span className="text-[15px] text-[#d64f79] ml-2 font-medium">
                          {dividend.dividendPerShare.toLocaleString()}원/주
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#2d2640]">
              <p className="text-[14px] text-gray-500 text-center">
                탭하여 전체 분배금 캘린더 보기
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <div className="px-4" data-tour="holdings-list">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-white">보유 종목</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="text-[15px]"
              onClick={() => setSelectedFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={selectedFilter === 'profit' ? 'default' : 'outline'}
              size="sm"
              className="text-[15px]"
              onClick={() => setSelectedFilter('profit')}
            >
              수익
            </Button>
            <Button
              variant={selectedFilter === 'loss' ? 'default' : 'outline'}
              size="sm"
              className="text-[15px]"
              onClick={() => setSelectedFilter('loss')}
            >
              손실
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {currentPortfolio
            .filter(etf => {
              if (selectedFilter === 'profit') return etf.profitLoss >= 0
              if (selectedFilter === 'loss') return etf.profitLoss < 0
              return true
            })
            .map((etf) => (
              <Card
                key={etf.id}
                className="cursor-pointer hover:border-[#d64f79]/50 select-none"
                onClick={() => onSelectETF(etf)}
                onMouseDown={() => handleLongPressStart(etf)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(etf)}
                onTouchEnd={handleLongPressEnd}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[15px] text-gray-400">{etf.ticker}</div>
                      <div className="font-medium text-white">{etf.shortName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[21px] font-bold text-white">{formatNumber(etf.totalValue)}원</div>
                      <div className={`text-[15px] ${etf.profitLoss >= 0 ? 'text-up' : 'text-down'}`}>
                        {etf.profitLoss >= 0 ? '+' : ''}{formatNumber(etf.profitLoss)}원 ({formatPercent(etf.profitLossPercent)})
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[14px] text-gray-500">보유수량</div>
                      <div className="text-[15px] text-white">{etf.quantity}주</div>
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-500">평균단가</div>
                      <div className="text-[15px] text-white">{formatNumber(etf.avgPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-500">현재가</div>
                      <div className="text-[15px] text-white">{formatNumber(etf.price)}</div>
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-500">건전성</div>
                      <div className={`text-[15px] ${etf.healthScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {etf.healthScore}
                      </div>
                    </div>
                  </div>

                  {/* Quick risk indicators */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#2d2640]">
                    <Badge
                      variant={Math.abs(etf.discrepancy) <= 0.1 ? 'success' : 'warning'}
                      className="text-[14px]"
                    >
                      괴리 {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
                    </Badge>
                    <Badge
                      variant={etf.spread <= 0.05 ? 'success' : 'warning'}
                      className="text-[14px]"
                    >
                      스프레드 {etf.spread.toFixed(2)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* 분배금 캘린더 모달 */}
      <DividendCalendar
        isOpen={showDividendCalendar}
        onClose={() => setShowDividendCalendar(false)}
        accountType={accountType}
        onSelectETF={(etf) => {
          setShowDividendCalendar(false)
          onSelectETF(etf)
        }}
      />
    </div>
  )
}
