import { useState, useEffect } from 'react'
import { ArrowLeft, Star, Share2, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle2, XCircle, Zap, Shield, ArrowDownUp, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ETF } from '@/data/mockData'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'

interface ETFDetailPageProps {
  etf: ETF
  accountType: string
  onBack: () => void
  onTrade: () => void
  onAddToCompare?: (etf: ETF) => void
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

export function ETFDetailPage({ etf, accountType, onBack, onTrade, onAddToCompare }: ETFDetailPageProps) {
  const [tab, setTab] = useState('summary')
  const [showHealthInfo, setShowHealthInfo] = useState(false)
  const isUp = etf.change >= 0
  const chartData = generateChartData(etf)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const getTaxImpact = (profit: number) => {
    switch (accountType) {
      case 'pension': return profit * 0.055
      case 'isa': return Math.max(0, profit - 2000000) * 0.099
      default: return profit * 0.154
    }
  }

  const mockProfit = 100000
  const taxAmount = getTaxImpact(mockProfit)

  const healthMetrics = [
    { name: 'TER (비용)', value: etf.ter, threshold: 0.1, pass: etf.ter <= 0.1, weight: 25 },
    { name: '괴리율', value: Math.abs(etf.discrepancy), threshold: 0.1, pass: Math.abs(etf.discrepancy) <= 0.1, weight: 25 },
    { name: '스프레드', value: etf.spread, threshold: 0.05, pass: etf.spread <= 0.05, weight: 25 },
    { name: '유동성', value: etf.adtv, threshold: 100000000000, pass: etf.adtv >= 100000000000, weight: 25 },
  ]

  return (
    <div className="pb-24">
      {showHealthInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1f1a2e] border border-[#3d3450] rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">ETF 건전성 점수란?</h3>
              <button onClick={() => setShowHealthInfo(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-300 mb-4">ETF 건전성 점수는 투자자가 ETF를 선택할 때 고려해야 할 핵심 품질 지표를 종합 평가한 점수입니다.</p>
            <div className="space-y-3 mb-4">
              {[['TER (총보수) 25점', '운용보수, 판매보수 등을 합산한 연간 총비용. 0.1% 이하 시 만점'],
                ['괴리율 25점', '시장가와 실시간 순자산가치(iNAV) 간 차이. ±0.1% 이내 시 만점'],
                ['스프레드 25점', '매수/매도 호가 차이로 거래비용 지표. 0.05% 이하 시 만점'],
                ['유동성 25점', '30일 평균 거래대금 기준. 100억 이상 시 만점']].map(([title, desc]) => (
                <div key={title} className="bg-[#2d2640]/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-1">{title}</div>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 border-t border-[#3d3450] pt-3">90점 이상: 우수 | 75~89점: 양호 | 75점 미만: 주의 필요</div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-50 bg-[#191322] border-b border-[#2d2640]">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Star className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 bg-gradient-to-b from-[#2a1f3d] to-[#191322]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-400">{etf.ticker}</span>
              {etf.isLeveraged && <Badge variant="destructive" className="text-[10px]"><Zap className="h-3 w-3 mr-0.5" />레버리지</Badge>}
              {etf.isInverse && <Badge variant="secondary" className="text-[10px]"><ArrowDownUp className="h-3 w-3 mr-0.5" />인버스</Badge>}
              {etf.isHedged && <Badge variant="info" className="text-[10px]"><Shield className="h-3 w-3 mr-0.5" />환헤지</Badge>}
            </div>
            <h1 className="text-xl font-bold text-white">{etf.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${etf.marketClass === '해외' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {etf.marketClass}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
                {etf.assetClass}
              </span>
              <span className="text-sm text-gray-400">{etf.category}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-white">{formatNumber(etf.price)}<span className="text-lg text-gray-400">원</span></div>
          <div className={`flex items-center gap-2 mt-1 ${isUp ? 'text-up' : 'text-down'}`}>
            {isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="text-lg font-medium">{formatPercent(etf.changePercent)}</span>
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

      <div className="px-4 py-4">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d64f79" stopOpacity={0.3}/><stop offset="95%" stopColor="#d64f79" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="date" tick={false} axisLine={false} /><YAxis domain={['auto', 'auto']} hide />
              <Tooltip contentStyle={{ backgroundColor: '#1f1a2e', border: '1px solid #3d3450', borderRadius: '8px', color: 'white' }} formatter={(value) => value !== undefined ? [`${formatNumber(value as number)}원`, '가격'] : ['', '']} />
              <Area type="monotone" dataKey="price" stroke="#d64f79" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {['1일', '1주', '1개월', '3개월', '1년'].map((period) => (<Button key={period} variant="ghost" size="sm" className="text-xs px-2">{period}</Button>))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="px-4">
        <TabsList className="w-full grid grid-cols-3"><TabsTrigger value="summary">요약</TabsTrigger><TabsTrigger value="check">검증</TabsTrigger><TabsTrigger value="detail">상세</TabsTrigger></TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card className="bg-[#2d2640]/50 border-[#3d3650]"><CardContent className="p-3"><p className="text-sm text-gray-300 leading-relaxed">{etf.overview}</p></CardContent></Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">ETF 건전성 점수<button onClick={() => setShowHealthInfo(true)}><Info className="h-4 w-4 text-gray-400 hover:text-white" /></button></CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${etf.healthScore >= 90 ? 'text-emerald-400' : etf.healthScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{etf.healthScore}</div>
                <div className="flex-1"><Progress value={etf.healthScore} className="h-3" /><p className="text-xs text-gray-400 mt-2">{etf.healthScore >= 90 ? '우수한 ETF입니다' : etf.healthScore >= 75 ? '양호한 ETF입니다' : '주의가 필요합니다'}</p></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {[['TER (총보수)', `${etf.ter.toFixed(2)}%`, etf.ter <= 0.1 ? '저비용' : '평균 수준', etf.ter <= 0.1],
              ['30D 거래대금', formatCurrency(etf.adtv), etf.adtv >= 100000000000 ? '유동성 풍부' : '유동성 보통', etf.adtv >= 100000000000],
              ['순자산(AUM)', formatCurrency(etf.aum), '', true],
              ['배당수익률', `${etf.dividendYield.toFixed(1)}%`, '', true]].map(([label, value, status, isGood]) => (
              <Card key={label as string}><CardContent className="p-3"><div className="text-xs text-gray-400 mb-1">{label}</div><div className="text-lg font-bold text-white">{value}</div>{status && <div className={`text-xs ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>{status}</div>}</CardContent></Card>
            ))}
          </div>
          <Card className="bg-[#2d2640]/50 border-[#3d3650]"><CardContent className="p-3"><div className="text-xs text-gray-500 mb-1">기초 지수</div><p className="text-sm text-gray-300">{etf.indexDescription}</p></CardContent></Card>
          <Card className="bg-[#2d2640]/50 border-[#3d3650]"><CardContent className="p-3"><div className="text-xs text-gray-500 mb-1">주요 특징</div><p className="text-sm text-gray-300">{etf.strategy}</p></CardContent></Card>
          <Card className={accountType !== 'general' ? 'border-emerald-500/30 bg-emerald-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-white">예상 세후 정보</span><Badge variant="outline">{accountType === 'pension' ? '연금계좌' : accountType === 'isa' ? 'ISA' : '일반계좌'}</Badge></div>
              <div className="text-xs text-gray-400"><p>수익 {formatNumber(mockProfit)}원 발생 시</p><p className="mt-1">예상 세금: <span className={accountType !== 'general' ? 'text-emerald-400' : 'text-white'}>{formatNumber(Math.round(taxAmount))}원</span>{accountType !== 'general' && <span className="ml-2 text-emerald-400">(일반대비 {formatNumber(Math.round(mockProfit * 0.154 - taxAmount))}원 절감)</span>}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check" className="space-y-4 mt-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">건전성 체크리스트</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {healthMetrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{metric.pass ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}<span className="text-sm text-white">{metric.name}</span></div>
                  <div className="text-right"><span className={`text-sm font-medium ${metric.pass ? 'text-emerald-400' : 'text-amber-400'}`}>{metric.name === '유동성' ? formatCurrency(metric.value as number) : `${(metric.value as number).toFixed(2)}%`}</span><div className="text-[10px] text-gray-500">기준: {metric.name === '유동성' ? '100억 이상' : `${metric.threshold}% 이하`}</div></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">유동성 분석</CardTitle></CardHeader><CardContent className="space-y-3">{[['현재 스프레드', `${etf.spread.toFixed(2)}%`], ['30D 평균 스프레드', `${(etf.spread * 1.1).toFixed(2)}%`], ['호가 깊이 (예상)', '양호']].map(([l, v]) => (<div key={l} className="flex justify-between text-sm"><span className="text-gray-400">{l}</span><span className={l === '호가 깊이 (예상)' ? 'text-emerald-400' : 'text-white'}>{v}</span></div>))}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">추적 품질</CardTitle></CardHeader><CardContent className="space-y-3">{[['추적오차 (1Y)', `${etf.trackingError.toFixed(2)}%`, 'text-white'], ['괴리율 (현재)', `${etf.discrepancy >= 0 ? '+' : ''}${etf.discrepancy.toFixed(2)}%`, Math.abs(etf.discrepancy) <= 0.1 ? 'text-emerald-400' : 'text-amber-400'], ['괴리율 (30D 평균)', `${(etf.discrepancy * 0.8).toFixed(2)}%`, 'text-white']].map(([l, v, c]) => (<div key={l} className="flex justify-between text-sm"><span className="text-gray-400">{l}</span><span className={c}>{v}</span></div>))}</CardContent></Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4 mt-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">구성 종목 TOP 5</CardTitle></CardHeader><CardContent className="space-y-2">{['삼성전자', 'SK하이닉스', 'LG에너지솔루션', '삼성바이오로직스', '현대자동차'].map((name, i) => (<div key={name} className="flex items-center justify-between text-sm"><span className="text-white">{name}</span><span className="text-gray-400">{(20 - i * 3).toFixed(1)}%</span></div>))}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">기본 정보</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{[['운용사', etf.issuer], ['설정일', etf.listedDate], ['기초지수', etf.indexProvider], ['분배금', '연 4회 (1,4,7,10월)']].map(([l, v]) => (<div key={l} className="flex justify-between"><span className="text-gray-400">{l}</span><span className="text-white">{v}</span></div>))}</CardContent></Card>
          {(etf.isLeveraged || etf.isInverse) && (
            <Card className="border-amber-500/30 bg-amber-500/5"><CardContent className="p-4"><div className="flex items-start gap-2"><AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" /><div><h4 className="text-sm font-medium text-amber-400 mb-1">위험 고지</h4><p className="text-xs text-gray-400">{etf.isLeveraged && '레버리지 ETF는 일별 수익률을 추종하며 장기 보유 시 복리효과로 인해 기초지수 수익률과 괴리가 발생할 수 있습니다.'}{etf.isInverse && '인버스 ETF는 기초지수의 역방향 수익률을 추종하며 장기 보유에 적합하지 않습니다.'}</p></div></div></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-[#191322]/95 backdrop-blur border-t border-[#2d2640]">
        <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={() => onAddToCompare?.(etf)}>비교하기</Button><Button className="flex-1" onClick={onTrade}>주문하기</Button></div>
      </div>
    </div>
  )
}
