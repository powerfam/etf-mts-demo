import React, { useState, useMemo } from 'react'
import { ChevronLeft, Search, X, Mic, RefreshCw, ChevronDown, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockETFs } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

interface SearchPageProps {
  isOpen: boolean
  onClose: () => void
  onSelectETF: (etf: ETF) => void
  compareETFs: ETF[]
  onAddToCompare: (etf: ETF) => void
  onGoToCompare: () => void
}

// 퀵 필터 칩
const quickFilters = [
  { id: 'kodex200', label: 'KODEX200' },
  { id: 'sp500', label: 'S&P500' },
  { id: 'nasdaq', label: '나스닥' },
  { id: 'global', label: '전세계주식' },
]

// 정렬 기준
const sortOptions = [
  { id: 'change', label: '등락률순' },
  { id: 'volume', label: '거래량순' },
  { id: 'aum', label: '순자산순' },
  { id: 'ter', label: 'TER순' },
  { id: 'dividend', label: '연배당률순' },
]

// 종목 필터 기준
const stockFilters = [
  { id: 'all', label: '전체' },
  { id: 'personal', label: '개인연금' },
  { id: 'retirement', label: '퇴직연금' },
]

// 상세 뷰 탭
const detailTabs = [
  { id: 'basic', label: '기본' },
  { id: 'returns', label: '수익률' },
  { id: 'flow', label: '자금유입' },
]

export function SearchPage({ isOpen, onClose, onSelectETF, compareETFs, onAddToCompare, onGoToCompare }: SearchPageProps) {
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('etf-recent-searches')
    return saved ? JSON.parse(saved) : ['KODEX200', 'S&P500', '나스닥100', 'KIWOOM 200']
  })

  // 필터/정렬 상태
  const [selectedSort, setSelectedSort] = useState('change')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // 뷰 모드 상태
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary')
  const [detailTab, setDetailTab] = useState('basic')

  // 선택된 퀵 필터
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null)

  // 실시간 조회순위 (거래대금 기준)
  const popularETFs = useMemo(() => {
    return [...mockETFs]
      .sort((a, b) => b.adtv - a.adtv)
      .slice(0, 5)
  }, [])

  // 검색 결과
  const searchResults = useMemo(() => {
    let results = [...mockETFs]

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(etf =>
        etf.name.toLowerCase().includes(query) ||
        etf.shortName.toLowerCase().includes(query) ||
        etf.ticker.toLowerCase().includes(query)
      )
    }

    // 퀵 필터 적용
    if (selectedQuickFilter) {
      switch (selectedQuickFilter) {
        case 'kodex200':
          results = results.filter(etf => etf.shortName.includes('KODEX') || etf.shortName.includes('200'))
          break
        case 'sp500':
          results = results.filter(etf => etf.shortName.includes('S&P') || etf.shortName.includes('500'))
          break
        case 'nasdaq':
          results = results.filter(etf => etf.shortName.includes('나스닥') || etf.shortName.includes('NASDAQ'))
          break
        case 'global':
          results = results.filter(etf => etf.marketClass === '해외')
          break
      }
    }

    // 종목 필터 (연금 가능 여부)
    if (selectedFilter === 'personal' || selectedFilter === 'retirement') {
      results = results.filter(etf => !etf.isLeveraged && !etf.isInverse)
    }

    // 정렬
    switch (selectedSort) {
      case 'change':
        results.sort((a, b) => b.changePercent - a.changePercent)
        break
      case 'volume':
        results.sort((a, b) => b.adtv - a.adtv)
        break
      case 'aum':
        results.sort((a, b) => b.aum - a.aum)
        break
      case 'ter':
        results.sort((a, b) => a.ter - b.ter)
        break
      case 'dividend':
        results.sort((a, b) => b.dividendYield - a.dividendYield)
        break
    }

    return results
  }, [searchQuery, selectedQuickFilter, selectedFilter, selectedSort])

  // 자동완성 결과
  const autoCompleteResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return []
    const query = searchQuery.toLowerCase()
    return mockETFs
      .filter(etf =>
        etf.shortName.toLowerCase().includes(query) ||
        etf.ticker.toLowerCase().includes(query)
      )
      .slice(0, 5)
  }, [searchQuery])

  // 검색 실행
  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery
    if (searchTerm.trim()) {
      // 최근 검색어에 추가
      const newRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10)
      setRecentSearches(newRecent)
      localStorage.setItem('etf-recent-searches', JSON.stringify(newRecent))
    }
    setShowResults(true)
  }

  // 최근 검색어 삭제
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('etf-recent-searches')
  }

  // ETF 선택
  const handleSelectETF = (etf: ETF) => {
    onSelectETF(etf)
    onClose()
  }

  // 비교함 담기
  const handleAddToCompare = (etf: ETF, e: React.MouseEvent) => {
    e.stopPropagation()
    if (compareETFs.length >= 3) {
      alert('비교함에는 3개까지 담을 수 있어요.')
      return
    }
    if (!compareETFs.find(e => e.id === etf.id)) {
      onAddToCompare(etf)
    }
  }

  // 비교함에 있는지 확인
  const isInCompare = (etfId: string) => compareETFs.some(e => e.id === etfId)

  // 정렬 라벨 가져오기
  const getSortLabel = () => sortOptions.find(o => o.id === selectedSort)?.label || '등락률순'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#191322]">
      {/* 헤더 */}
      <div className="sticky top-0 bg-[#191322] border-b border-[#2d2640] z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onClose}>
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">ETF 검색</h1>
        </div>

        {/* 검색 입력창 */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#1f1a2e] border border-[#3d3650] rounded-xl px-3 py-2.5">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value) setShowResults(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="종목명을 입력해주세요"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
            <button className="p-1 text-gray-400 hover:text-[#d64f79]">
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 퀵 필터 칩 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setSelectedQuickFilter(selectedQuickFilter === filter.id ? null : filter.id)
                setShowResults(true)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedQuickFilter === filter.id
                  ? 'bg-[#d64f79] text-white'
                  : 'bg-[#2d2640] text-gray-400 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2d2640] text-gray-400 whitespace-nowrap">
            전체삭제
          </button>
        </div>
      </div>

      {/* 검색 결과 전 - 자동완성 & 인기 ETF */}
      {!showResults ? (
        <div className="flex-1 overflow-y-auto pb-24">
          {/* 자동완성 결과 */}
          {searchQuery && autoCompleteResults.length > 0 && (
            <div className="px-4 py-2 border-b border-[#2d2640]">
              <div className="text-xs text-gray-500 mb-2">검색 결과</div>
              {autoCompleteResults.map(etf => (
                <button
                  key={etf.id}
                  onClick={() => {
                    setSearchQuery(etf.shortName)
                    handleSearch(etf.shortName)
                  }}
                  className="w-full flex items-center justify-between py-2 hover:bg-[#2d2640]/50 rounded px-2"
                >
                  <span className="text-sm text-white">{etf.shortName}</span>
                  <span className={`text-xs ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 최근 검색어 */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="px-4 py-3 border-b border-[#2d2640]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">최근 ETF 검색</span>
                <button onClick={clearRecentSearches} className="text-xs text-gray-500 hover:text-[#d64f79]">
                  전체삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(term)
                      handleSearch(term)
                    }}
                    className="px-3 py-1.5 rounded-full text-xs bg-[#2d2640] text-gray-300 hover:bg-[#3d3650]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 조회수가 집중된 ETF */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">조회수가 집중된 ETF종목은?</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">2026.02.12 16:10:30 기준</span>
                <button className="p-1 text-gray-400 hover:text-[#d64f79]">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {popularETFs.map((etf, index) => (
                <div
                  key={etf.id}
                  onClick={() => handleSelectETF(etf)}
                  className="flex items-center gap-3 p-3 bg-[#1f1a2e] rounded-lg cursor-pointer hover:bg-[#2a2438] transition-colors"
                >
                  {/* 순위 */}
                  <span className={`text-sm font-bold w-4 ${index < 3 ? 'text-[#d64f79]' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>

                  {/* ETF 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{etf.shortName}</div>
                  </div>

                  {/* 가격 & 등락률 */}
                  <div className="text-right shrink-0">
                    <div className="text-sm text-white">{formatNumber(etf.price)}</div>
                    <div className={`text-xs ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </div>
                  </div>

                  {/* 비교함 담기 */}
                  <button
                    onClick={(e) => handleAddToCompare(etf, e)}
                    className={`p-1.5 rounded ${
                      isInCompare(etf.id) ? 'text-[#d64f79]' : 'text-gray-500 hover:text-[#d64f79]'
                    }`}
                  >
                    <svg className="h-5 w-5" fill={isInCompare(etf.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 검색 결과 화면 */
        <div className="flex-1 overflow-y-auto pb-24">
          {/* 결과 헤더 */}
          <div className="sticky top-0 bg-[#191322] px-4 py-2 border-b border-[#2d2640] z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">
                총 <span className="text-[#d64f79] font-bold">{searchResults.length}</span>건
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="flex items-center gap-1 text-xs text-gray-400"
                >
                  {getSortLabel()}
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="p-1.5 rounded bg-[#2d2640] text-gray-400"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-[#3d3650]">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-3 py-1 text-xs font-medium ${
                    viewMode === 'summary' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
                  }`}
                >
                  요약
                </button>
                <button
                  onClick={() => setViewMode('detail')}
                  className={`px-3 py-1 text-xs font-medium ${
                    viewMode === 'detail' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
                  }`}
                >
                  상세
                </button>
              </div>

              {viewMode === 'detail' && (
                <div className="flex gap-1">
                  {detailTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id)}
                      className={`px-2 py-1 text-xs rounded ${
                        detailTab === tab.id ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 결과 리스트 - 요약 뷰 */}
          {viewMode === 'summary' && (
            <div className="px-4 py-2 space-y-1">
              {searchResults.map(etf => (
                <div
                  key={etf.id}
                  onClick={() => handleSelectETF(etf)}
                  className="flex items-center gap-3 p-3 bg-[#1f1a2e] rounded-lg cursor-pointer hover:bg-[#2a2438] transition-colors"
                >
                  {/* ETF 뱃지 */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2d2640] text-[10px] text-gray-400 font-medium shrink-0">
                    ETF
                  </div>

                  {/* ETF 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{etf.shortName}</div>
                    <div className="text-xs text-gray-500">{formatNumber(etf.price)}원</div>
                  </div>

                  {/* 등락률 */}
                  <div className={`text-sm font-medium ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                    {formatPercent(etf.changePercent)}
                  </div>

                  {/* 비교함 담기 */}
                  <button
                    onClick={(e) => handleAddToCompare(etf, e)}
                    className={`p-1.5 rounded ${
                      isInCompare(etf.id) ? 'text-[#d64f79]' : 'text-gray-500 hover:text-[#d64f79]'
                    }`}
                  >
                    <svg className="h-5 w-5" fill={isInCompare(etf.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>

                  {/* 즐겨찾기 */}
                  <button className="p-1.5 text-gray-500 hover:text-yellow-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 결과 리스트 - 상세 뷰 (테이블) */}
          {viewMode === 'detail' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-xs">
                <thead className="bg-[#1f1a2e] sticky top-0">
                  <tr className="border-b border-[#2d2640]">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium sticky left-0 bg-[#1f1a2e] min-w-[140px]">종목</th>
                    {detailTab === 'basic' && (
                      <>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">현재가</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">등락률</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">iNAV</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">괴리율</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">거래량</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">거래대금</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">순자산</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">TER</th>
                      </>
                    )}
                    {detailTab === 'returns' && (
                      <>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1일</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1주</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1개월</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">3개월</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">6개월</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">YTD</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1년</th>
                      </>
                    )}
                    {detailTab === 'flow' && (
                      <>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1일</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1주</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">1개월</th>
                        <th className="text-right py-2 px-2 text-gray-400 font-medium">3개월</th>
                      </>
                    )}
                    <th className="text-center py-2 px-2 text-gray-400 font-medium">비교담기</th>
                    <th className="text-center py-2 px-2 text-gray-400 font-medium">관심추가</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(etf => (
                    <tr
                      key={etf.id}
                      onClick={() => handleSelectETF(etf)}
                      className="border-b border-[#2d2640] hover:bg-[#1f1a2e] cursor-pointer"
                    >
                      <td className="py-2.5 px-3 text-white font-medium sticky left-0 bg-[#191322] hover:bg-[#1f1a2e]">
                        <div className="truncate max-w-[140px]">{etf.shortName}</div>
                      </td>
                      {detailTab === 'basic' && (
                        <>
                          <td className="text-right py-2 px-2 text-white">{formatNumber(etf.price)}원</td>
                          <td className={`text-right py-2 px-2 ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent)}
                          </td>
                          <td className="text-right py-2 px-2 text-gray-300">{formatNumber(etf.iNav)}</td>
                          <td className={`text-right py-2 px-2 ${etf.discrepancy >= 0 ? 'text-up' : 'text-down'}`}>
                            {etf.discrepancy.toFixed(2)}%
                          </td>
                          <td className="text-right py-2 px-2 text-gray-300">{(etf.adtv / 100000000).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{(etf.adtv / 100000000).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{(etf.aum / 100000000).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{etf.ter.toFixed(2)}%</td>
                        </>
                      )}
                      {detailTab === 'returns' && (
                        <>
                          <td className={`text-right py-2 px-2 ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 1.5) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 1.5)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 3) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 3)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 5) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 5)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 8) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 8)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 10) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 10)}
                          </td>
                          <td className={`text-right py-2 px-2 ${(etf.changePercent * 15) >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent * 15)}
                          </td>
                        </>
                      )}
                      {detailTab === 'flow' && (
                        <>
                          <td className="text-right py-2 px-2 text-gray-300">{(Math.random() * 100 - 50).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{(Math.random() * 500 - 250).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{(Math.random() * 1000 - 500).toFixed(0)}억</td>
                          <td className="text-right py-2 px-2 text-gray-300">{(Math.random() * 2000 - 1000).toFixed(0)}억</td>
                        </>
                      )}
                      <td className="text-center py-2 px-2">
                        <button
                          onClick={(e) => handleAddToCompare(etf, e)}
                          className={`p-1 rounded ${isInCompare(etf.id) ? 'text-[#d64f79]' : 'text-gray-500'}`}
                        >
                          <svg className="h-4 w-4" fill={isInCompare(etf.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                      </td>
                      <td className="text-center py-2 px-2">
                        <button className="p-1 text-gray-500 hover:text-yellow-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 비교하기 플로팅 버튼 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => {
            onClose()
            onGoToCompare()
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1f1a2e] border border-[#3d3650] rounded-full shadow-lg"
        >
          <span className="text-sm text-white">비교하기</span>
          <span className="text-sm text-[#d64f79]">({compareETFs.length}/3)</span>
          <Search className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* 정렬/필터 모달 */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">정렬기준 선택</DialogTitle>
          </DialogHeader>

          {/* 종목 필터 기준 */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">종목 필터 기준</div>
            <div className="flex gap-2">
              {stockFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-[#d64f79] text-white'
                      : 'bg-[#2d2640] text-gray-400'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 정렬 기준 */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">결과 정렬 기준</div>
            <div className="space-y-1">
              {sortOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedSort(option.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSort === option.id
                      ? 'bg-[#2d2640] text-white'
                      : 'text-gray-400 hover:bg-[#2d2640]/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFilterModal(false)}
            className="w-full py-2.5 bg-[#d64f79] text-white rounded-lg text-sm font-medium"
          >
            확인
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
