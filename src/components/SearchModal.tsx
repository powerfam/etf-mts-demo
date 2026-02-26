import { useState, useMemo } from 'react'
import { Search, X, Filter, Tag, Briefcase, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mockETFs } from '@/data/mockData'
import type { ETF } from '@/data/mockData'
import { formatNumber } from '@/lib/utils'

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectETF: (etf: ETF) => void
}

interface SearchResult {
  type: 'name' | 'feature' | 'holding'
  etf: ETF
  matchedText?: string
}

export function SearchModal({ open, onOpenChange, onSelectETF }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [pensionOnly, setPensionOnly] = useState(false)
  const [holdingsSearch, setHoldingsSearch] = useState(false)
  const [holdingChips, setHoldingChips] = useState<string[]>([])
  const [holdingInput, setHoldingInput] = useState('')

  // 구성종목 칩 추가
  const addHoldingChip = () => {
    if (holdingInput.trim() && holdingChips.length < 5) {
      setHoldingChips([...holdingChips, holdingInput.trim()])
      setHoldingInput('')
    }
  }

  // 구성종목 칩 제거
  const removeHoldingChip = (index: number) => {
    setHoldingChips(holdingChips.filter((_, i) => i !== index))
  }

  // 검색 결과
  const searchResults = useMemo(() => {
    const results: SearchResult[] = []
    const query = searchQuery.toLowerCase().trim()

    // 연금 가능 필터 적용
    let filteredETFs = mockETFs
    if (pensionOnly) {
      filteredETFs = mockETFs.filter(etf => !etf.isLeveraged && !etf.isInverse)
    }

    // 구성종목 검색 모드
    if (holdingsSearch && holdingChips.length > 0) {
      filteredETFs.forEach(etf => {
        if (!etf.holdings) return
        const hasAllHoldings = holdingChips.every(chip =>
          etf.holdings!.some(h => h.toLowerCase().includes(chip.toLowerCase()))
        )
        if (hasAllHoldings) {
          const matchedHoldings = etf.holdings!.filter(h =>
            holdingChips.some(chip => h.toLowerCase().includes(chip.toLowerCase()))
          )
          results.push({
            type: 'holding',
            etf,
            matchedText: matchedHoldings.join(', ')
          })
        }
      })
      return { nameMatches: [], featureMatches: [], holdingMatches: results }
    }

    // 일반 검색 모드
    if (!query) {
      return { nameMatches: [], featureMatches: [], holdingMatches: [] }
    }

    const nameMatches: SearchResult[] = []
    const featureMatches: SearchResult[] = []
    const holdingMatches: SearchResult[] = []

    filteredETFs.forEach(etf => {
      // 1. 종목명 일치
      if (
        etf.name.toLowerCase().includes(query) ||
        etf.shortName.toLowerCase().includes(query) ||
        etf.ticker.includes(query)
      ) {
        nameMatches.push({ type: 'name', etf })
        return // 중복 방지
      }

      // 2. 특징 태그 일치
      if (etf.featureTags?.some(tag => tag.toLowerCase().includes(query))) {
        const matchedTag = etf.featureTags!.find(tag => tag.toLowerCase().includes(query))
        featureMatches.push({ type: 'feature', etf, matchedText: matchedTag })
        return
      }

      // 3. overview/strategy 텍스트 일치
      const fullText = `${etf.overview} ${etf.strategy} ${etf.indexDescription}`.toLowerCase()
      if (fullText.includes(query)) {
        featureMatches.push({ type: 'feature', etf, matchedText: etf.overview.slice(0, 30) + '...' })
        return
      }

      // 4. 구성종목 일치 (일반 검색에서도)
      if (etf.holdings?.some(h => h.toLowerCase().includes(query))) {
        const matchedHolding = etf.holdings!.find(h => h.toLowerCase().includes(query))
        holdingMatches.push({ type: 'holding', etf, matchedText: matchedHolding })
      }
    })

    return { nameMatches, featureMatches, holdingMatches }
  }, [searchQuery, pensionOnly, holdingsSearch, holdingChips])

  const hasResults = searchResults.nameMatches.length > 0 ||
                     searchResults.featureMatches.length > 0 ||
                     searchResults.holdingMatches.length > 0

  const handleSelectETF = (etf: ETF) => {
    onSelectETF(etf)
    onOpenChange(false)
    setSearchQuery('')
    setHoldingChips([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-md p-0 gap-0 max-h-[85vh] overflow-hidden">
        {/* 검색 입력 영역 */}
        <div className="p-4 border-b border-[#2d2640]">
          {/* 일반 검색 입력 */}
          {!holdingsSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ETF 종목명, 특징, 구성종목 검색..."
                className="w-full pl-11 pr-4 py-3 bg-[#2a2438] border border-[#3d3650] rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#d64f79]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* 구성종목 검색 입력 */}
          {holdingsSearch && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                구성종목으로 ETF 찾기 (AND 조건)
              </div>

              {/* 칩 표시 */}
              <div className="flex flex-wrap gap-2">
                {holdingChips.map((chip, index) => (
                  <Badge
                    key={index}
                    className="bg-[#d64f79]/20 text-[#d64f79] border-[#d64f79]/30 px-3 py-1.5"
                  >
                    {chip}
                    <button onClick={() => removeHoldingChip(index)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {holdingChips.length < 5 && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={holdingInput}
                      onChange={(e) => setHoldingInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addHoldingChip()}
                      placeholder={holdingChips.length === 0 ? "종목명 입력" : "+"}
                      className="w-24 px-2 py-1.5 bg-[#2a2438] border border-[#3d3650] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d64f79]"
                    />
                    <button
                      onClick={addHoldingChip}
                      className="px-2 py-1.5 bg-[#3d3650] rounded-lg text-sm text-white hover:bg-[#4d4660]"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 토글 옵션 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setPensionOnly(!pensionOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                pensionOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#2a2438] text-gray-400 border border-[#3d3650]'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              연금 가능
            </button>
            <button
              onClick={() => {
                setHoldingsSearch(!holdingsSearch)
                setSearchQuery('')
                setHoldingChips([])
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                holdingsSearch
                  ? 'bg-[#d64f79]/20 text-[#d64f79] border border-[#d64f79]/30'
                  : 'bg-[#2a2438] text-gray-400 border border-[#3d3650]'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              구성종목 검색
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {!hasResults && (searchQuery || holdingChips.length > 0) && (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다
            </div>
          )}

          {!hasResults && !searchQuery && holdingChips.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {holdingsSearch
                ? '구성종목을 입력하세요 (예: 삼성전자, NVIDIA)'
                : 'ETF 종목명, 특징, 구성종목을 검색하세요'
              }
            </div>
          )}

          {/* 종목명 일치 */}
          {searchResults.nameMatches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-[#d64f79]" />
                <span className="text-sm font-medium text-gray-400">
                  종목명 일치 ({searchResults.nameMatches.length})
                </span>
              </div>
              <div className="space-y-2">
                {searchResults.nameMatches.slice(0, 5).map(({ etf }) => (
                  <SearchResultItem key={etf.id} etf={etf} onClick={() => handleSelectETF(etf)} />
                ))}
              </div>
            </div>
          )}

          {/* 특징 일치 */}
          {searchResults.featureMatches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-400">
                  특징 일치 ({searchResults.featureMatches.length})
                </span>
              </div>
              <div className="space-y-2">
                {searchResults.featureMatches.slice(0, 5).map(({ etf, matchedText }) => (
                  <SearchResultItem
                    key={etf.id}
                    etf={etf}
                    subText={matchedText}
                    onClick={() => handleSelectETF(etf)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 구성종목 일치 */}
          {searchResults.holdingMatches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-400">
                  구성종목 일치 ({searchResults.holdingMatches.length})
                </span>
              </div>
              <div className="space-y-2">
                {searchResults.holdingMatches.slice(0, 5).map(({ etf, matchedText }) => (
                  <SearchResultItem
                    key={etf.id}
                    etf={etf}
                    subText={matchedText}
                    onClick={() => handleSelectETF(etf)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 검색 결과 아이템 컴포넌트
function SearchResultItem({
  etf,
  subText,
  onClick
}: {
  etf: ETF
  subText?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-[#2a2438] rounded-xl hover:bg-[#3a3448] transition-colors"
    >
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{etf.ticker}</span>
          {etf.isLeveraged && (
            <Badge variant="outline" className="text-[11px] px-1 py-0 text-yellow-400 border-yellow-400/30">
              레버리지
            </Badge>
          )}
          {etf.isInverse && (
            <Badge variant="outline" className="text-[11px] px-1 py-0 text-blue-400 border-blue-400/30">
              인버스
            </Badge>
          )}
        </div>
        <div className="text-sm font-medium text-white mt-0.5">{etf.shortName}</div>
        {subText && (
          <div className="text-xs text-[#d64f79] mt-1">"{subText}"</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold text-white">{formatNumber(etf.price)}</div>
          <div className={`text-xs ${etf.change >= 0 ? 'text-up' : 'text-down'}`}>
            {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </button>
  )
}
