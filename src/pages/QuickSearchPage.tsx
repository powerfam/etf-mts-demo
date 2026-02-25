import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronDown, Filter, ShoppingCart, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockETFs } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { ETF } from '@/data/mockData'

interface QuickSearchPageProps {
  isOpen: boolean
  onClose: () => void
  onSelectETF: (etf: ETF) => void
  initialTab?: string
  compareETFs: ETF[]
  onAddToCompare: (etf: ETF) => void
  onGoToCompare: () => void
}

// 탭 메뉴 정의
const tabMenus = [
  { id: 'parking', label: '단기자금(파킹형)' },
  { id: 'country', label: '투자국가' },
  { id: 'leverage', label: '인버스/레버리지' },
  { id: 'sector', label: '섹터' },
  { id: 'index', label: '지수' },
]

// 지수 카테고리 (투자국가 / 지수 탭용)
const indexCategories = {
  '한국': ['KOSPI200', 'KOSDAQ150'],
  '미국': ['S&P500', '나스닥100'],
  '중국': ['항셍', '항셍테크'],
  '일본': ['Nikkei225', 'Eurostoxx50'],
  '인도': ['Nifty50'],
}

// 섹터 카테고리
const sectorCategories = [
  '반도체', '2차전지', '바이오', '금융', '에너지', '소비재',
  '산업재', '유틸리티', 'IT', '통신', '헬스케어', '소재'
]

// 정렬 옵션
const sortOptions = [
  { id: 'change', label: '등락률순' },
  { id: 'volume', label: '거래량순' },
  { id: 'aum', label: '순자산순' },
  { id: 'ter', label: 'TER순' },
  { id: 'dividend', label: '연배당률순' },
]

// 종목 필터 (연금 적합성)
const stockFilters = [
  { id: 'all', label: '전체' },
  { id: 'retirement', label: '퇴직연금' },
  { id: 'personal', label: '개인연금' },
]

// 상세 뷰 탭
const detailTabs = [
  { id: 'basic', label: '기본정보' },
  { id: 'returns', label: '수익률' },
  { id: 'flow', label: '자금유입' },
]

// 수익률 기간
const returnPeriods = ['1일', '1주', '1개월', '3개월', '6개월', 'YTD', '1년', '3년', '5년', '10년']
const flowPeriods = ['전일', '1주', '1개월', '3개월', '6개월', '1년', 'YTD']

// Mock data for returns and flows (실제로는 API에서 가져옴)
const generateMockReturns = (etf: ETF) => ({
  '1일': etf.changePercent,
  '1주': (Math.random() * 10 - 5).toFixed(2),
  '1개월': (Math.random() * 20 - 10).toFixed(2),
  '3개월': (Math.random() * 30 - 15).toFixed(2),
  '6개월': (Math.random() * 50 - 25).toFixed(2),
  'YTD': (Math.random() * 40 - 20).toFixed(2),
  '1년': (Math.random() * 60 - 30).toFixed(2),
  '3년': '-',
  '5년': '-',
  '10년': '-',
})

const generateMockFlow = (_etf: ETF) => ({
  '전일': Math.round((Math.random() * 200 - 100) * 10) / 10,
  '1주': Math.round((Math.random() * 500 - 250) * 10) / 10,
  '1개월': Math.round((Math.random() * 2000 - 1000) * 10) / 10,
  '3개월': Math.round((Math.random() * 5000 - 2500) * 10) / 10,
  '6개월': Math.round((Math.random() * 10000 - 5000) * 10) / 10,
  '1년': Math.round((Math.random() * 20000 - 10000) * 10) / 10,
  'YTD': Math.round((Math.random() * 15000 - 7500) * 10) / 10,
})

export function QuickSearchPage({
  isOpen,
  onClose,
  onSelectETF,
  initialTab = 'index',
  compareETFs,
  onAddToCompare,
  onGoToCompare
}: QuickSearchPageProps) {
  // 탭 상태
  const [activeTab, setActiveTab] = useState(initialTab)
  // 선택된 지수/섹터
  const [selectedIndex, setSelectedIndex] = useState('KOSDAQ150')
  const [selectedSector, setSelectedSector] = useState('반도체')
  // 뷰 모드 (요약/상세) - 디폴트: 요약
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary')
  // 상세 탭
  const [detailTab, setDetailTab] = useState('basic')
  // 필터 모달
  const [showFilterModal, setShowFilterModal] = useState(false)
  // 지수 선택 모달
  const [showIndexModal, setShowIndexModal] = useState(false)
  // 정렬/필터 상태
  const [selectedSort, setSelectedSort] = useState('change')
  const [selectedStockFilter, setSelectedStockFilter] = useState('all')
  // 즐겨찾기 상태
  const [favorites, setFavorites] = useState<string[]>([])

  // 탭에 따른 ETF 필터링
  const filteredETFs = useMemo(() => {
    let results = [...mockETFs]

    switch (activeTab) {
      case 'parking':
        // 단기자금/파킹형 ETF (머니마켓, CD금리, 단기채)
        results = results.filter(etf =>
          etf.shortName.includes('머니마켓') ||
          etf.shortName.includes('CD금리') ||
          etf.shortName.includes('KOFR') ||
          etf.shortName.includes('단기') ||
          etf.shortName.includes('파킹') ||
          etf.category === '채권'
        )
        break
      case 'country':
        // 투자국가별
        results = results.filter(etf => {
          const name = etf.shortName.toUpperCase()
          if (selectedIndex.includes('KOSPI') || selectedIndex.includes('KOSDAQ')) {
            return etf.marketClass === '국내'
          } else if (selectedIndex.includes('S&P') || selectedIndex.includes('나스닥')) {
            return name.includes('미국') || name.includes('S&P') || name.includes('나스닥') || name.includes('NASDAQ')
          } else if (selectedIndex.includes('항셍')) {
            return name.includes('중국') || name.includes('차이나') || name.includes('홍콩') || name.includes('항셍')
          } else if (selectedIndex.includes('Nikkei')) {
            return name.includes('일본') || name.includes('NIKKEI') || name.includes('니케이')
          } else if (selectedIndex.includes('Nifty')) {
            return name.includes('인도') || name.includes('INDIA')
          }
          return true
        })
        break
      case 'leverage':
        // 인버스/레버리지
        results = results.filter(etf => etf.isLeveraged || etf.isInverse)
        break
      case 'sector':
        // 섹터별
        results = results.filter(etf => {
          const name = etf.shortName.toUpperCase()
          const sector = selectedSector
          if (sector === '반도체') return name.includes('반도체') || name.includes('AI') || name.includes('칩')
          if (sector === '2차전지') return name.includes('2차전지') || name.includes('배터리') || name.includes('EV')
          if (sector === '바이오') return name.includes('바이오') || name.includes('헬스') || name.includes('제약')
          if (sector === '금융') return name.includes('금융') || name.includes('은행') || name.includes('보험')
          if (sector === '에너지') return name.includes('에너지') || name.includes('원유') || name.includes('가스')
          if (sector === '소비재') return name.includes('소비') || name.includes('리테일')
          if (sector === '산업재') return name.includes('산업') || name.includes('기계') || name.includes('조선')
          if (sector === '유틸리티') return name.includes('유틸') || name.includes('전력')
          if (sector === 'IT') return name.includes('IT') || name.includes('테크') || name.includes('소프트')
          if (sector === '통신') return name.includes('통신') || name.includes('미디어')
          if (sector === '헬스케어') return name.includes('헬스') || name.includes('바이오') || name.includes('의료')
          if (sector === '소재') return name.includes('소재') || name.includes('철강') || name.includes('화학')
          return false
        })
        break
      case 'index':
        // 지수 추종
        results = results.filter(etf => {
          const name = etf.shortName.toUpperCase()
          if (selectedIndex === 'KOSPI200') return name.includes('KOSPI') || name.includes('코스피') || name.includes('200')
          if (selectedIndex === 'KOSDAQ150') return name.includes('KOSDAQ') || name.includes('코스닥') || name.includes('150')
          if (selectedIndex === 'S&P500') return name.includes('S&P') || name.includes('500')
          if (selectedIndex === '나스닥100') return name.includes('나스닥') || name.includes('NASDAQ') || name.includes('100')
          if (selectedIndex === '항셍') return name.includes('항셍') || name.includes('홍콩')
          if (selectedIndex === '항셍테크') return name.includes('항셍') && name.includes('테크')
          if (selectedIndex === 'Nikkei225') return name.includes('니케이') || name.includes('NIKKEI') || name.includes('일본')
          if (selectedIndex === 'Eurostoxx50') return name.includes('유로') || name.includes('EURO')
          if (selectedIndex === 'Nifty50') return name.includes('인도') || name.includes('NIFTY')
          return true
        })
        break
    }

    // 종목 필터 (연금 적합성)
    if (selectedStockFilter === 'retirement' || selectedStockFilter === 'personal') {
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
  }, [activeTab, selectedIndex, selectedSector, selectedStockFilter, selectedSort])

  // 비교함에 있는지 확인
  const isInCompare = (etfId: string) => compareETFs.some(e => e.id === etfId)

  // 즐겨찾기 토글
  const toggleFavorite = (etfId: string) => {
    setFavorites(prev =>
      prev.includes(etfId) ? prev.filter(id => id !== etfId) : [...prev, etfId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#191322]">
      {/* 헤더 */}
      <div className="sticky top-0 bg-[#191322] border-b border-[#2d2640] z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose}>
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">ETF 빠른검색</h1>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="p-2 rounded-lg bg-[#2d2640] text-white"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 pb-2 gap-2">
          {tabMenus.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#d64f79] text-white'
                  : 'bg-[#2d2640] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 서브 필터 (지수/국가/섹터 선택) */}
      {(activeTab === 'index' || activeTab === 'country') && (
        <div className="px-4 py-2 border-b border-[#2d2640]">
          <button
            onClick={() => setShowIndexModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2d2640] rounded-lg text-sm text-white"
          >
            <span>{selectedIndex}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeTab === 'sector' && (
        <div className="px-4 py-2 border-b border-[#2d2640]">
          <div className="flex flex-wrap gap-2">
            {sectorCategories.slice(0, 6).map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  selectedSector === sector
                    ? 'bg-[#d64f79] text-white'
                    : 'bg-[#2d2640] text-gray-400'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 결과 카운트 & 뷰 토글 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-400">총 {filteredETFs.length}건</span>
        <div className="flex items-center gap-2">
          {/* 요약/상세 토글 */}
          <div className="flex bg-[#2d2640] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === 'summary' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              요약
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === 'detail' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              상세
            </button>
          </div>
        </div>
      </div>

      {/* 상세 뷰 탭 (상세 모드일 때만) */}
      {viewMode === 'detail' && (
        <div className="flex gap-4 px-4 pb-2 border-b border-[#2d2640]">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id)}
              className={`text-sm pb-2 transition-colors ${
                detailTab === tab.id
                  ? 'text-[#d64f79] border-b-2 border-[#d64f79] font-medium'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ETF 리스트 */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {viewMode === 'summary' ? (
          // 요약 뷰
          <div className="divide-y divide-[#2d2640]">
            {filteredETFs.map((etf) => (
              <div
                key={etf.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#2d2640]/50 transition-colors"
              >
                <button
                  onClick={() => onSelectETF(etf)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d2640] text-gray-400">
                      ETF
                    </span>
                    <span className="text-sm text-white truncate">{etf.shortName}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{formatNumber(etf.price)}원</span>
                    <span className={`text-xs ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddToCompare(etf)}
                    className={`p-2 rounded-lg transition-colors ${
                      isInCompare(etf.id) ? 'bg-[#d64f79] text-white' : 'bg-[#2d2640] text-gray-400'
                    }`}
                    disabled={compareETFs.length >= 3 && !isInCompare(etf.id)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(etf.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(etf.id) ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(etf.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 상세 뷰 - 테이블 형식
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#2d2640] sticky top-0">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-2 w-40">종목</th>
                  {detailTab === 'basic' && (
                    <>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">현재가</th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">등락률</th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">iNAV</th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">괴리율</th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">거래량</th>
                      <th className="text-right text-xs text-gray-400 font-medium px-2 py-2">거래대금</th>
                    </>
                  )}
                  {detailTab === 'returns' && (
                    <>
                      {returnPeriods.map((period) => (
                        <th key={period} className="text-right text-xs text-gray-400 font-medium px-2 py-2">
                          {period}
                        </th>
                      ))}
                    </>
                  )}
                  {detailTab === 'flow' && (
                    <>
                      {flowPeriods.map((period) => (
                        <th key={period} className="text-right text-xs text-gray-400 font-medium px-2 py-2">
                          {period}
                        </th>
                      ))}
                    </>
                  )}
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">비교담기</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-2 py-2">관심추가</th>
                </tr>
              </thead>
              <tbody>
                {filteredETFs.map((etf) => {
                  const returns = generateMockReturns(etf)
                  const flows = generateMockFlow(etf)
                  return (
                    <tr
                      key={etf.id}
                      className="border-b border-[#2d2640] hover:bg-[#2d2640]/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectETF(etf)}
                          className="text-left"
                        >
                          <div className="text-sm text-white truncate max-w-[140px]">{etf.shortName}</div>
                        </button>
                      </td>
                      {detailTab === 'basic' && (
                        <>
                          <td className="text-right text-sm text-white px-2 py-3">
                            {formatNumber(etf.price)}원
                          </td>
                          <td className={`text-right text-sm px-2 py-3 ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent)}
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3">
                            {formatNumber(etf.iNav)}
                          </td>
                          <td className={`text-right text-sm px-2 py-3 ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                            {etf.discrepancy.toFixed(2)}%
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3">
                            {Math.floor(etf.adtv / etf.price / 1000).toLocaleString()}천주
                          </td>
                          <td className="text-right text-sm text-white px-2 py-3">
                            {(etf.adtv / 100000000).toFixed(0)}억
                          </td>
                        </>
                      )}
                      {detailTab === 'returns' && (
                        <>
                          {returnPeriods.map((period) => {
                            const value = returns[period as keyof typeof returns]
                            const numValue = parseFloat(String(value))
                            return (
                              <td
                                key={period}
                                className={`text-right text-sm px-2 py-3 ${
                                  value === '-' ? 'text-gray-500' :
                                  numValue >= 0 ? 'text-up' : 'text-down'
                                }`}
                              >
                                {value === '-' ? '-' : `${numValue >= 0 ? '+' : ''}${value}%`}
                              </td>
                            )
                          })}
                        </>
                      )}
                      {detailTab === 'flow' && (
                        <>
                          {flowPeriods.map((period) => {
                            const value = flows[period as keyof typeof flows]
                            return (
                              <td
                                key={period}
                                className={`text-right text-sm px-2 py-3 ${
                                  value >= 0 ? 'text-up' : 'text-down'
                                }`}
                              >
                                {value >= 0 ? '+' : ''}{value}억
                              </td>
                            )
                          })}
                        </>
                      )}
                      <td className="text-center px-2 py-3">
                        <button
                          onClick={() => onAddToCompare(etf)}
                          className={`p-1.5 rounded transition-colors ${
                            isInCompare(etf.id) ? 'bg-[#d64f79] text-white' : 'text-gray-500 hover:text-white'
                          }`}
                          disabled={compareETFs.length >= 3 && !isInCompare(etf.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="text-center px-2 py-3">
                        <button
                          onClick={() => toggleFavorite(etf.id)}
                          className={`p-1.5 rounded transition-colors ${
                            favorites.includes(etf.id) ? 'text-yellow-400' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${favorites.includes(etf.id) ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredETFs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500">해당 조건의 ETF가 없습니다</p>
          </div>
        )}
      </div>

      {/* 비교하기 플로팅 버튼 */}
      {compareETFs.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
          <button
            onClick={onGoToCompare}
            className="w-full py-3 rounded-xl bg-[#d64f79] text-white font-medium flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            비교하기 ({compareETFs.length}/3)
          </button>
        </div>
      )}

      {/* 지수 선택 모달 */}
      <Dialog open={showIndexModal} onOpenChange={setShowIndexModal}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">중분류 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {Object.entries(indexCategories).map(([country, indices]) => (
              <div key={country}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-[#d64f79] text-white text-xs font-medium">
                    {country}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-2">
                  {indices.map((index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedIndex(index)
                        setShowIndexModal(false)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedIndex === index
                          ? 'bg-[#2d2640] text-white border border-[#d64f79]'
                          : 'bg-[#2d2640] text-gray-400 hover:text-white'
                      }`}
                    >
                      {index}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 필터 모달 */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="bg-[#1f1a2e] border-[#2d2640] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">정렬기준 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 종목 필터 기준 */}
            <div>
              <h3 className="text-sm text-gray-400 mb-2">종목 필터 기준</h3>
              <div className="flex flex-wrap gap-2">
                {stockFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedStockFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedStockFilter === filter.id
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
            <div>
              <h3 className="text-sm text-gray-400 mb-2">결과 정렬 기준</h3>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedSort(option.id)}
                    className={`w-full px-4 py-3 rounded-lg text-sm text-left transition-colors ${
                      selectedSort === option.id
                        ? 'bg-[#d64f79] text-white'
                        : 'bg-[#2d2640] text-gray-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowFilterModal(false)}
            className="w-full py-3 mt-4 rounded-xl bg-[#d64f79] text-white font-medium"
          >
            확인
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
