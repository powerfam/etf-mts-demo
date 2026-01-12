import { useState } from 'react'
import { ArrowLeft, AlertTriangle, Info, Shield, Zap, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ETF } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'

interface TradePageProps {
  etf: ETF | null
  accountType: string
  onBack: () => void
}

export function TradePage({ etf, accountType, onBack }: TradePageProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [priceType, setPriceType] = useState<'limit' | 'market'>('limit')
  const [quantity, setQuantity] = useState<string>('10')
  const [price, setPrice] = useState<string>(etf ? String(etf.price) : '0')
  const [splitOrder, setSplitOrder] = useState(false)
  const [splitCount, setSplitCount] = useState(3)

  if (!etf) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-4">
        <div className="text-gray-400 text-center">
          <p className="mb-4">주문할 ETF를 선택해주세요</p>
          <Button onClick={onBack}>ETF 탐색하기</Button>
        </div>
      </div>
    )
  }

  const orderAmount = parseInt(quantity || '0') * parseInt(price || '0')
  const estimatedSlippage = priceType === 'market' ? etf.spread * 2 : etf.spread * 0.5
  const estimatedCost = Math.round(orderAmount * (estimatedSlippage / 100))

  // Execution Feasibility Score
  const calculateFeasibilityScore = () => {
    let score = 100
    if (Math.abs(etf.discrepancy) > 0.1) score -= 15
    if (Math.abs(etf.discrepancy) > 0.3) score -= 15
    if (etf.spread > 0.05) score -= 10
    if (etf.spread > 0.1) score -= 10
    if (etf.adtv < 100000000000) score -= 10
    if (orderAmount > etf.adtv * 0.001) score -= 20
    if (priceType === 'market') score -= 10
    return Math.max(0, score)
  }

  const feasibilityScore = calculateFeasibilityScore()

  // Warnings
  const warnings: string[] = []
  if (Math.abs(etf.discrepancy) > 0.1) warnings.push(`괴리율이 높습니다 (${etf.discrepancy.toFixed(2)}%)`)
  if (etf.spread > 0.1) warnings.push(`스프레드가 높습니다 (${etf.spread.toFixed(2)}%)`)
  if (priceType === 'market') warnings.push('시장가 주문은 슬리피지 위험이 있습니다')
  if (etf.isLeveraged || etf.isInverse) warnings.push('레버리지/인버스 ETF는 단기 투자에 적합합니다')

  // Get tax info
  const getTaxLabel = () => {
    switch (accountType) {
      case 'pension': return '연금계좌 (세금이연)'
      case 'isa': return 'ISA (비과세 한도)'
      default: return '일반계좌 (15.4%)'
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#191322] border-b border-[#2d2640]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-white">{etf.shortName}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{etf.ticker}</span>
              <Badge variant="outline" className="text-[10px]">{getTaxLabel()}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Current Price */}
      <div className="px-4 py-4 border-b border-[#2d2640]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">{formatNumber(etf.price)}원</div>
            <div className={`flex items-center gap-1 text-sm ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
              <span>{formatPercent(etf.changePercent)}</span>
              <span className="text-gray-500">({formatNumber(etf.change)})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">iNAV</div>
            <div className="text-sm text-white">{formatNumber(etf.iNav)}원</div>
            <div className={`text-xs ${Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
              괴리 {etf.discrepancy >= 0 ? '+' : ''}{etf.discrepancy.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant={orderType === 'buy' ? 'default' : 'outline'}
            className={`flex-1 ${orderType === 'buy' ? 'bg-[#d64f79] hover:bg-[#c44a70]' : ''}`}
            onClick={() => setOrderType('buy')}
          >
            매수
          </Button>
          <Button
            variant={orderType === 'sell' ? 'secondary' : 'outline'}
            className={`flex-1 ${orderType === 'sell' ? 'bg-[#796ec2] hover:bg-[#6d62b0]' : ''}`}
            onClick={() => setOrderType('sell')}
          >
            매도
          </Button>
        </div>
      </div>

      {/* Execution Feasibility Score */}
      <div className="px-4 pb-3">
        <Card className={feasibilityScore >= 70 ? 'border-emerald-500/30' : 'border-amber-500/30'}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-white">체결 가능성</span>
                <Info className="h-3 w-3 text-gray-500" />
              </div>
              <span className={`text-lg font-bold ${feasibilityScore >= 70 ? 'text-emerald-400' : feasibilityScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {feasibilityScore}점
              </span>
            </div>
            <Progress value={feasibilityScore} className="h-2" />
            <p className="text-[10px] text-gray-500 mt-2">
              괴리율, 스프레드, 유동성, 주문규모 기반 산출
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 pb-3">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-amber-200">{warning}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Form */}
      <div className="px-4 space-y-4">
        {/* Price Type */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">주문유형</label>
          <div className="flex gap-2">
            <Button
              variant={priceType === 'limit' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setPriceType('limit')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              지정가 (권장)
            </Button>
            <Button
              variant={priceType === 'market' ? 'secondary' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setPriceType('market')}
            >
              시장가
            </Button>
          </div>
        </div>

        {/* Price Input */}
        {priceType === 'limit' && (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">주문가격</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1f1a2e] rounded-lg border border-[#2d2640] px-3 py-2">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent text-white text-right outline-none"
                />
              </div>
              <span className="text-gray-400">원</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setPrice(String(Math.round(etf.iNav * 0.999)))}
              >
                iNAV-0.1%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setPrice(String(etf.iNav))}
              >
                iNAV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setPrice(String(Math.round(etf.iNav * 1.001)))}
              >
                iNAV+0.1%
              </Button>
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">수량</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#1f1a2e] rounded-lg border border-[#2d2640] px-3 py-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-transparent text-white text-right outline-none"
              />
            </div>
            <span className="text-gray-400">주</span>
          </div>
          <div className="flex gap-2 mt-2">
            {[10, 50, 100, 500].map((q) => (
              <Button
                key={q}
                variant="ghost"
                size="sm"
                className="text-xs flex-1"
                onClick={() => setQuantity(String(q))}
              >
                {q}주
              </Button>
            ))}
          </div>
        </div>

        {/* Split Order Option */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-white">분할 주문</span>
              <Info className="h-3 w-3 text-gray-500" />
            </div>
            <Button
              variant={splitOrder ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSplitOrder(!splitOrder)}
            >
              {splitOrder ? '사용중' : '사용'}
            </Button>
          </div>
          {splitOrder && (
            <div className="mt-2 bg-[#1f1a2e] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">분할 횟수</span>
                <div className="flex items-center gap-2">
                  {[2, 3, 5, 10].map((n) => (
                    <Button
                      key={n}
                      variant={splitCount === n ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs px-2 h-7"
                      onClick={() => setSplitCount(n)}
                    >
                      {n}회
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                {Math.floor(parseInt(quantity || '0') / splitCount)}주씩 {splitCount}회에 걸쳐 주문합니다
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">주문 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">주문금액</span>
              <span className="text-white font-medium">{formatNumber(orderAmount)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">예상 체결비용</span>
              <span className={estimatedCost > orderAmount * 0.001 ? 'text-amber-400' : 'text-gray-400'}>
                ~{formatNumber(estimatedCost)}원 ({estimatedSlippage.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">수수료</span>
              <span className="text-gray-400">0원 (ETF 무료)</span>
            </div>
            <div className="border-t border-[#2d2640] pt-2 flex justify-between">
              <span className="text-gray-400">예상 총 비용</span>
              <span className="text-white font-bold">{formatNumber(orderAmount + estimatedCost)}원</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-[#191322]/95 backdrop-blur border-t border-[#2d2640]">
        <Button
          className={`w-full ${orderType === 'buy' ? 'bg-[#d64f79] hover:bg-[#c44a70]' : 'bg-[#796ec2] hover:bg-[#6d62b0]'}`}
          size="lg"
        >
          {orderType === 'buy' ? '매수' : '매도'} 주문
        </Button>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          주문 전 체결가능성과 예상 비용을 확인해주세요
        </p>
      </div>
    </div>
  )
}
