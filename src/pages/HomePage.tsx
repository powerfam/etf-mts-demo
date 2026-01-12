import { TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, ChevronRight, AlertTriangle, Bell, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ETFCard } from '@/components/ETFCard'
import { mockETFs, themes, portfolioETFs } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet
}

interface HomePageProps {
  accountType: string
  onSelectETF: (etf: ETF) => void
  onNavigate: (tab: string) => void
}

export function HomePage({ accountType, onSelectETF, onNavigate }: HomePageProps) {
  const totalValue = portfolioETFs.reduce((sum, etf) => sum + etf.totalValue, 0)
  const totalProfitLoss = portfolioETFs.reduce((sum, etf) => sum + etf.profitLoss, 0)
  const totalProfitLossPercent = (totalProfitLoss / (totalValue - totalProfitLoss)) * 100

  // Get account-specific tax info
  const getTaxInfo = () => {
    switch (accountType) {
      case 'pension': return { label: '연금계좌', taxRate: 5.5, benefit: '세금이연 혜택' }
      case 'isa': return { label: 'ISA', taxRate: 9.9, benefit: '비과세 한도 적용' }
      default: return { label: '일반계좌', taxRate: 15.4, benefit: '' }
    }
  }
  const taxInfo = getTaxInfo()

  // 거래대금 기준 인기 ETF (실시간 인기)
  const popularETFs = [...mockETFs]
    .sort((a, b) => b.adtv - a.adtv)
    .slice(0, 5)

  // Top performing ETFs for recommendations (건전성 상위)
  const recommendedETFs = mockETFs
    .filter(etf => etf.healthScore >= 85 && !etf.isLeveraged && !etf.isInverse)
    .sort((a, b) => b.healthScore - a.healthScore)
    .slice(0, 4)

  return (
    <div className="pb-20">
      {/* Hero Section - My Portfolio Summary */}
      <div className="bg-gradient-to-b from-[#2a1f3d] to-[#191322] px-4 py-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px]">{taxInfo.label}</Badge>
            {taxInfo.benefit && (
              <span className="text-[10px] text-emerald-400">{taxInfo.benefit}</span>
            )}
          </div>
          <div className="text-sm text-gray-400">내 ETF 평가금액</div>
          <div className="text-3xl font-bold text-white mt-1">
            {formatNumber(totalValue)}<span className="text-lg text-gray-400">원</span>
          </div>
          <div className={`flex items-center gap-2 mt-2 ${totalProfitLoss >= 0 ? 'text-up' : 'text-down'}`}>
            <span className="text-sm font-medium">
              {totalProfitLoss >= 0 ? '+' : ''}{formatNumber(totalProfitLoss)}원
            </span>
            <span className="text-sm">
              ({formatPercent(totalProfitLossPercent)})
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onNavigate('discover')}>
            ETF 탐색
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onNavigate('portfolio')}>
            보유현황
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="px-4 py-4">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-500/20 p-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">안전 알림</div>
                <div className="text-xs text-gray-400">
                  KODEX 인버스2X(252670) 스프레드 확대 - 매매 주의
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme/Category Grid */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">목적별 탐색</h2>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={() => onNavigate('discover')}>
            전체보기 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {themes.slice(0, 8).map((theme) => {
            const Icon = iconMap[theme.icon] || TrendingUp
            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('discover')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#1f1a2e] border border-[#2d2640] hover:border-[#d64f79]/50 transition-colors"
              >
                <div className="rounded-full bg-[#2a2438] p-2">
                  <Icon className="h-4 w-4 text-[#d64f79]" />
                </div>
                <span className="text-[10px] text-gray-300 text-center leading-tight">{theme.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hot ETFs - Horizontal Scroll */}
      <div className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-semibold text-white">실시간 인기</h2>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400">
            더보기 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 px-4">
            {popularETFs.map((etf, index) => (
              <div
                key={etf.id}
                onClick={() => onSelectETF(etf)}
                className="w-[160px] shrink-0 cursor-pointer"
              >
                <Card className="hover:border-[#d64f79]/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d64f79]/20 text-[#d64f79] text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-[10px] text-gray-400">{etf.ticker}</span>
                    </div>
                    <div className="text-sm font-medium text-white truncate mb-1">
                      {etf.shortName}
                    </div>
                    <div className="text-base font-bold text-white">
                      {formatNumber(etf.price)}
                    </div>
                    <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Recommended for You */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">추천 ETF</h2>
            <Badge variant="outline" className="text-[10px]">
              <Star className="h-3 w-3 mr-1" />
              건전성 상위
            </Badge>
          </div>
        </div>
        <div className="grid gap-3">
          {recommendedETFs.map((etf) => (
            <ETFCard key={etf.id} etf={etf} onClick={() => onSelectETF(etf)} />
          ))}
        </div>
      </div>

      {/* Market Overview */}
      <div className="px-4 py-4">
        <h2 className="text-base font-semibold text-white mb-3">시장 현황</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-gray-400 mb-1">KOSPI</div>
              <div className="text-lg font-bold text-white">2,542.38</div>
              <div className="text-xs text-up">+0.42%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-gray-400 mb-1">S&P 500</div>
              <div className="text-lg font-bold text-white">6,042.12</div>
              <div className="text-xs text-up">+0.58%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-gray-400 mb-1">USD/KRW</div>
              <div className="text-lg font-bold text-white">1,438.50</div>
              <div className="text-xs text-down">-0.12%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-gray-400 mb-1">국채 3년</div>
              <div className="text-lg font-bold text-white">2.85%</div>
              <div className="text-xs text-down">-0.02%p</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Educational Content */}
      <div className="px-4 py-2 mb-4">
        <Card className="bg-gradient-to-r from-[#2a1f3d] to-[#1f1a2e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 text-[10px]">초보 가이드</Badge>
                <h3 className="text-sm font-medium text-white mb-1">
                  ETF 투자, 어떻게 시작할까요?
                </h3>
                <p className="text-xs text-gray-400">
                  3분만에 배우는 ETF 기초
                </p>
              </div>
              <Button variant="outline" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
