import { TrendingUp, Rocket, Coins, Shield, DollarSign, Gem, Zap, Wallet, ChevronRight, AlertTriangle, Bell, ArrowRight, BookOpen, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

      {/* Hot ETFs - Horizontal Wave Ticker (증권사 티커 스타일) */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-3 px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">실시간 인기</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d64f79] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d64f79]"></span>
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={() => onNavigate('discover')}>
            더보기 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal Wave Ticker - 우측으로 물결 흐르듯 + Shimmer 효과 */}
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes tickerWave {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .ticker-wave {
              animation: tickerWave 25s linear infinite;
            }
            .ticker-wave:hover {
              animation-play-state: paused;
            }
            .shimmer-card {
              position: relative;
              overflow: hidden;
            }
            .shimmer-card::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent, rgba(214, 79, 121, 0.08), transparent);
              animation: shimmer 3s ease-in-out infinite;
              pointer-events: none;
            }
          `}</style>

          <div className="ticker-wave flex gap-3 py-2">
            {/* 두 번 반복하여 무한 루프 효과 */}
            {[...popularETFs, ...popularETFs].map((etf, index) => (
              <div
                key={`${etf.id}-${index}`}
                onClick={() => onSelectETF(etf)}
                className="shimmer-card flex-shrink-0 w-[160px] bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3 cursor-pointer hover:border-[#d64f79]/50 transition-all hover:scale-105"
              >
                {/* Rank Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#d64f79]/20 text-[#d64f79] text-[10px] font-bold">
                    {(index % popularETFs.length) + 1}
                  </div>
                  <div className="text-[10px] text-gray-500">{etf.ticker}</div>
                </div>

                {/* ETF Name */}
                <div className="text-sm font-medium text-white truncate mb-2">
                  {etf.shortName}
                </div>

                {/* Price & Change */}
                <div className="flex items-end justify-between">
                  <div className="text-sm font-bold text-white">
                    {formatNumber(etf.price)}
                  </div>
                  <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${etf.change >= 0 ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}`}>
                    {etf.change >= 0 ? '+' : ''}{formatPercent(etf.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Overview - Horizontal Wave Ticker */}
      <div className="py-4">
        <h2 className="text-base font-semibold text-white mb-3 px-4">시장 현황</h2>

        {/* Market Ticker - 우측으로 물결 흐르듯 */}
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes marketWave {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .market-wave {
              animation: marketWave 30s linear infinite;
            }
            .market-wave:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="market-wave flex gap-3 py-2 pl-4">
            {/* 시장 데이터 - 두 번 반복하여 무한 루프 */}
            {[
              { name: 'KOSPI', value: '2,542.38', change: '+0.42%', isUp: true, flag: '🇰🇷' },
              { name: 'KOSDAQ', value: '721.56', change: '+0.31%', isUp: true, flag: '🇰🇷' },
              { name: 'S&P 500', value: '6,042.12', change: '+0.58%', isUp: true, flag: '🇺🇸' },
              { name: 'NASDAQ', value: '19,478.88', change: '+0.73%', isUp: true, flag: '🇺🇸' },
              { name: 'Nikkei 225', value: '38,451.46', change: '-0.28%', isUp: false, flag: '🇯🇵' },
              { name: 'Hang Seng', value: '19,229.57', change: '+1.24%', isUp: true, flag: '🇭🇰' },
              { name: 'USD/KRW', value: '1,438.50', change: '-0.12%', isUp: false, flag: '💱' },
              { name: '국채 3년', value: '2.85%', change: '-0.02%p', isUp: false, flag: '📊' },
              // 반복
              { name: 'KOSPI', value: '2,542.38', change: '+0.42%', isUp: true, flag: '🇰🇷' },
              { name: 'KOSDAQ', value: '721.56', change: '+0.31%', isUp: true, flag: '🇰🇷' },
              { name: 'S&P 500', value: '6,042.12', change: '+0.58%', isUp: true, flag: '🇺🇸' },
              { name: 'NASDAQ', value: '19,478.88', change: '+0.73%', isUp: true, flag: '🇺🇸' },
              { name: 'Nikkei 225', value: '38,451.46', change: '-0.28%', isUp: false, flag: '🇯🇵' },
              { name: 'Hang Seng', value: '19,229.57', change: '+1.24%', isUp: true, flag: '🇭🇰' },
              { name: 'USD/KRW', value: '1,438.50', change: '-0.12%', isUp: false, flag: '💱' },
              { name: '국채 3년', value: '2.85%', change: '-0.02%p', isUp: false, flag: '📊' },
            ].map((market, index) => (
              <div
                key={`${market.name}-${index}`}
                className="flex-shrink-0 w-[140px] bg-[#1f1a2e] border border-[#2d2640] rounded-xl p-3 hover:border-[#d64f79]/30 transition-colors"
              >
                {/* Market Name with Flag */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{market.flag}</span>
                  <div className="text-xs text-gray-400 truncate">{market.name}</div>
                </div>

                {/* Value */}
                <div className="text-base font-bold text-white mb-1">
                  {market.value}
                </div>

                {/* Change */}
                <div className={`text-xs font-medium inline-block px-1.5 py-0.5 rounded ${market.isUp ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}`}>
                  {market.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ETF 탐색하기 - 탐색 페이지로 연결 */}
      <div className="px-4 py-2">
        <Card className="bg-gradient-to-r from-[#1f3d2a] to-[#1f1a2e] border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 p-2.5">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-0.5">
                    ETF 탐색하기
                  </h3>
                  <p className="text-xs text-gray-400">
                    테마별, 건전성별 ETF 검색 및 비교
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('discover')}
                className="shrink-0 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETF 101 Guide - 투자정보 페이지로 연결 */}
      <div className="px-4 py-2 mb-4">
        <Card className="bg-gradient-to-r from-[#2a1f3d] to-[#1f1a2e] border-[#d64f79]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#d64f79]/20 p-2.5">
                  <BookOpen className="h-5 w-5 text-[#d64f79]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-0.5">
                    ETF 101 - 기초부터 배우기
                  </h3>
                  <p className="text-xs text-gray-400">
                    ETF란? 수수료, 괴리율, 건전성 지표 완벽 가이드
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('investinfo')}
                className="shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
