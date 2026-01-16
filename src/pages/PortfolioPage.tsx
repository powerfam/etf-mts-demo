import { useState, useRef } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, ChevronRight, ChevronDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPortfolioByAccountType } from '@/data/mockData'
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
              <div className="text-xs text-gray-400">{currentAccount.label}계좌</div>
              <div className="text-sm text-white">{currentAccount.number}</div>
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
                      <div className="text-xs text-gray-400">{account.label}계좌</div>
                      <div className="text-sm text-white">{account.number}</div>
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
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            accountType === 'general' ? 'bg-gray-500/20 text-gray-300' :
            accountType === 'pension' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            <AccountIcon className="h-3.5 w-3.5" />
            <span>{taxInfo.label}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400">ETF 포트폴리오</div>
        <div className="text-3xl font-bold text-white mt-1">
          {formatNumber(totalValue)}<span className="text-lg text-gray-400">원</span>
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">예상 세금 ({taxInfo.rate}%)</span>
            <span className="text-white">{formatNumber(Math.round(taxInfo.tax))}원</span>
          </div>
          {accountType !== 'general' && (
            <div className="text-xs text-emerald-400 mt-1">
              일반계좌 대비 {formatNumber(Math.round(totalProfitLoss * 0.154 - taxInfo.tax))}원 절감
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      <div className="px-4 py-4" data-tour="portfolio-chart">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">자산 배분</CardTitle>
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
                        color: 'white'
                      }}
                      formatter={(value) => value !== undefined ? [`${formatNumber(value as number)}원`, ''] : ['', '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400 flex-1">{item.name}</span>
                    <span className="text-xs text-white">{item.percent}%</span>
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
                <span className="text-sm font-medium text-white">리스크 알림</span>
              </div>
              <div className="space-y-2">
                {riskAlerts.map((etf) => (
                  <div key={etf.id} className="flex items-center justify-between text-xs">
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
                <span className="text-sm font-medium text-white">리밸런싱 제안</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              현재 포트폴리오가 목표 배분과 5% 이상 차이납니다. 리밸런싱을 검토해보세요.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <div className="px-4" data-tour="holdings-list">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">보유 종목</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={selectedFilter === 'profit' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFilter('profit')}
            >
              수익
            </Button>
            <Button
              variant={selectedFilter === 'loss' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
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
                      <div className="text-xs text-gray-400">{etf.ticker}</div>
                      <div className="font-medium text-white">{etf.shortName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{formatNumber(etf.totalValue)}원</div>
                      <div className={`text-xs ${etf.profitLoss >= 0 ? 'text-up' : 'text-down'}`}>
                        {etf.profitLoss >= 0 ? '+' : ''}{formatNumber(etf.profitLoss)}원 ({formatPercent(etf.profitLossPercent)})
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-gray-500">보유수량</div>
                      <div className="text-xs text-white">{etf.quantity}주</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">평균단가</div>
                      <div className="text-xs text-white">{formatNumber(etf.avgPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">현재가</div>
                      <div className="text-xs text-white">{formatNumber(etf.price)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">건전성</div>
                      <div className={`text-xs ${etf.healthScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {etf.healthScore}
                      </div>
                    </div>
                  </div>

                  {/* Quick risk indicators */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#2d2640]">
                    <Badge
                      variant={Math.abs(etf.discrepancy) <= 0.1 ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      괴리 {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
                    </Badge>
                    <Badge
                      variant={etf.spread <= 0.05 ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      스프레드 {etf.spread.toFixed(2)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Distribution Calendar */}
      <div className="px-4 py-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">배당 일정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">TIGER 배당다우</span>
                <div className="text-right">
                  <span className="text-white">1월 15일</span>
                  <span className="text-xs text-gray-500 ml-2">예상 580원/주</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">KODEX 200</span>
                <div className="text-right">
                  <span className="text-white">1월 30일</span>
                  <span className="text-xs text-gray-500 ml-2">예상 150원/주</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
