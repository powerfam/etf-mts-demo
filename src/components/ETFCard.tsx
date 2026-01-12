import { TrendingUp, TrendingDown, AlertTriangle, Zap, ArrowDownUp, Shield } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import type { ETF } from '@/data/mockData'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils'

interface ETFCardProps {
  etf: ETF
  onClick?: () => void
}

export function ETFCard({ etf, onClick }: ETFCardProps) {
  const isUp = etf.change >= 0

  // Determine risk level badges
  const getDiscrepancyBadge = () => {
    if (Math.abs(etf.discrepancy) < 0.1) return <Badge variant="success">괴리↓</Badge>
    if (Math.abs(etf.discrepancy) < 0.3) return <Badge variant="warning">괴리↑</Badge>
    return <Badge variant="danger">괴리↑↑</Badge>
  }

  const getSpreadBadge = () => {
    if (etf.spread < 0.05) return <Badge variant="success">스프레드↓</Badge>
    if (etf.spread < 0.1) return <Badge variant="warning">스프레드↑</Badge>
    return <Badge variant="danger">스프레드↑↑</Badge>
  }

  const getLiquidityBadge = () => {
    if (etf.adtv > 500000000000) return <Badge variant="success">유동성↑</Badge>
    if (etf.adtv > 100000000000) return <Badge variant="info">유동성○</Badge>
    return <Badge variant="warning">유동성↓</Badge>
  }

  // Sparkline SVG
  const sparklinePoints = etf.sparkline.map((val, i) => {
    const min = Math.min(...etf.sparkline)
    const max = Math.max(...etf.sparkline)
    const range = max - min || 1
    const x = (i / (etf.sparkline.length - 1)) * 60
    const y = 20 - ((val - min) / range) * 18
    return `${x},${y}`
  }).join(' ')

  return (
    <Card
      className="cursor-pointer transition-all hover:border-[#d64f79]/50 hover:shadow-lg hover:shadow-[#d64f79]/10"
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">{etf.ticker}</span>
              {etf.isLeveraged && (
                <Badge variant="destructive" className="text-[10px] px-1.5">
                  <Zap className="h-3 w-3 mr-0.5" />
                  레버리지
                </Badge>
              )}
              {etf.isInverse && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  <ArrowDownUp className="h-3 w-3 mr-0.5" />
                  인버스
                </Badge>
              )}
              {etf.isHedged && (
                <Badge variant="info" className="text-[10px] px-1.5">
                  <Shield className="h-3 w-3 mr-0.5" />
                  환헤지
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-white text-sm leading-tight">{etf.shortName}</h3>
          </div>

          {/* Sparkline */}
          <svg width="60" height="24" className="ml-2">
            <polyline
              fill="none"
              stroke={isUp ? '#d64f79' : '#796ec2'}
              strokeWidth="1.5"
              points={sparklinePoints}
            />
          </svg>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xl font-bold text-white">
              {formatNumber(etf.price)}<span className="text-sm font-normal text-gray-400">원</span>
            </div>
            <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-up' : 'text-down'}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{formatPercent(etf.changePercent)}</span>
              <span className="text-gray-500">({formatNumber(etf.change)})</span>
            </div>
          </div>

          {/* iNAV & Discrepancy */}
          <div className="text-right">
            <div className="text-xs text-gray-400">iNAV</div>
            <div className="text-sm text-white">{formatNumber(etf.iNav)}</div>
            <div className={`text-xs ${Math.abs(etf.discrepancy) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
              괴리 {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Risk Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {getDiscrepancyBadge()}
          {getSpreadBadge()}
          {getLiquidityBadge()}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center border-t border-[#2d2640] pt-3">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">TER</div>
            <div className="text-xs font-medium text-white">{etf.ter.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">거래대금</div>
            <div className="text-xs font-medium text-white">{formatCurrency(etf.adtv)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">순자산</div>
            <div className="text-xs font-medium text-white">{formatCurrency(etf.aum)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">스프레드</div>
            <div className="text-xs font-medium text-white">{etf.spread.toFixed(2)}%</div>
          </div>
        </div>

        {/* Health Score */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">ETF 건전성</span>
            {etf.healthScore < 75 && <AlertTriangle className="h-3 w-3 text-amber-400" />}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-[#2a2438] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  etf.healthScore >= 90 ? 'bg-emerald-500' :
                  etf.healthScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${etf.healthScore}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              etf.healthScore >= 90 ? 'text-emerald-400' :
              etf.healthScore >= 75 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {etf.healthScore}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
