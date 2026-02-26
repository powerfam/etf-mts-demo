import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingCart, Star, Smartphone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockETFs } from '@/data/mockData'
import { formatNumber, formatPercent } from '@/lib/utils'
import { ETFLogo } from '@/components/ETFLogo'
import type { ETF } from '@/data/mockData'

interface QuickSearchPageProps {
  isOpen: boolean
  onClose: () => void
  onSelectETF: (etf: ETF) => void
  initialTab?: string
  compareETFs: ETF[]
  onAddToCompare: (etf: ETF) => void
  onGoToCompare: () => void
  embedded?: boolean  // 모달이 아닌 임베디드 페이지로 렌더링
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
  '한국': ['KOSPI200', 'KOSDAQ150', 'KRX300'],
  '미국': ['S&P500', '나스닥100', '다우존스30'],
  '중국': ['CSI300', '항셍테크'],
  '유럽': ['유로스탁스50', 'MSCI선진국'],
}

// 섹터 카테고리 (실제 ETF 데이터 기반)
const sectorCategories = [
  '반도체/AI', '2차전지', '바이오/헬스케어', '금융',
  '게임/엔터', '원자재', '배당', 'ESG'
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

// 시드 기반 랜덤 함수 (ETF id 기반으로 일관된 값 생성)
const seededRandom = (seed: number, index: number) => {
  const x = Math.sin(seed * 9999 + index * 1000) * 10000
  return x - Math.floor(x)
}

// Mock data for returns and flows (실제로는 API에서 가져옴)
// ETF id 기반 시드로 일관된 값 생성 (정렬 시 필요)
const generateMockReturns = (etf: ETF) => {
  const seed = parseInt(etf.id.replace(/\D/g, '') || '0', 10)
  return {
    '1일': etf.changePercent,
    '1주': parseFloat((seededRandom(seed, 1) * 10 - 5).toFixed(2)),
    '1개월': parseFloat((seededRandom(seed, 2) * 20 - 10).toFixed(2)),
    '3개월': parseFloat((seededRandom(seed, 3) * 30 - 15).toFixed(2)),
    '6개월': parseFloat((seededRandom(seed, 4) * 50 - 25).toFixed(2)),
    'YTD': parseFloat((seededRandom(seed, 5) * 40 - 20).toFixed(2)),
    '1년': parseFloat((seededRandom(seed, 6) * 60 - 30).toFixed(2)),
    '3년': null as number | null,
    '5년': null as number | null,
    '10년': null as number | null,
  }
}

const generateMockFlow = (etf: ETF) => {
  const seed = parseInt(etf.id.replace(/\D/g, '') || '0', 10)
  return {
    '전일': Math.round((seededRandom(seed, 10) * 200 - 100) * 10) / 10,
    '1주': Math.round((seededRandom(seed, 11) * 500 - 250) * 10) / 10,
    '1개월': Math.round((seededRandom(seed, 12) * 2000 - 1000) * 10) / 10,
    '3개월': Math.round((seededRandom(seed, 13) * 5000 - 2500) * 10) / 10,
    '6개월': Math.round((seededRandom(seed, 14) * 10000 - 5000) * 10) / 10,
    '1년': Math.round((seededRandom(seed, 15) * 20000 - 10000) * 10) / 10,
    'YTD': Math.round((seededRandom(seed, 16) * 15000 - 7500) * 10) / 10,
  }
}


export function QuickSearchPage({
  isOpen,
  onClose,
  onSelectETF,
  initialTab = 'index',
  compareETFs,
  onAddToCompare,
  onGoToCompare,
  embedded = false
}: QuickSearchPageProps) {
  // 탭 상태
  const [activeTab, setActiveTab] = useState(initialTab)

  // initialTab 변경 시 activeTab 동기화
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // 선택된 지수/섹터
  const [selectedIndex, setSelectedIndex] = useState('KOSPI200')
  const [selectedSector, setSelectedSector] = useState('반도체/AI')
  // 뷰 모드 (요약/상세) - 디폴트: 요약
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary')
  // 상세 탭
  const [detailTab, setDetailTab] = useState('basic')
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  // 지수 선택 모달
  const [showIndexModal, setShowIndexModal] = useState(false)
  // 정렬/필터 상태
  const [selectedSort, setSelectedSort] = useState('change')
  const [selectedStockFilter, setSelectedStockFilter] = useState('all')
  // 즐겨찾기 상태
  const [favorites, setFavorites] = useState<string[]>([])
  // 테이블 헤더 클릭 정렬 상태
  const [columnSort, setColumnSort] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)

  // 탭에 따른 ETF 필터링
  const filteredETFs = useMemo(() => {
    let results = [...mockETFs]

    switch (activeTab) {
      case 'parking':
        // 단기자금/파킹형 ETF (머니마켓, CD금리, 단기채, 국채, 통안채)
        results = results.filter(etf => {
          const name = etf.shortName
          return (
            name.includes('머니마켓') ||
            name.includes('CD금리') ||
            name.includes('KOFR') ||
            name.includes('단기채') ||
            name.includes('단기통안') ||
            name.includes('국채') ||
            name.includes('국고채') ||
            (etf.category === '채권' && !name.includes('혼합'))
          )
        })
        break
      case 'country':
        // 투자국가별 (레버리지/인버스 제외)
        results = results.filter(etf => {
          if (etf.isLeveraged || etf.isInverse) return false
          const name = etf.shortName.toUpperCase()

          if (selectedIndex === 'KOSPI200') {
            return (name.includes('200') || name.includes('KOSPI') || name.includes('코스피')) &&
                   !name.includes('미국') && !name.includes('중국') && !name.includes('차이나')
          }
          if (selectedIndex === 'KOSDAQ150') {
            return name.includes('코스닥') || name.includes('KOSDAQ')
          }
          if (selectedIndex === 'KRX300') {
            return name.includes('KRX') || name.includes('MSCI KOREA')
          }
          if (selectedIndex === 'S&P500') {
            return name.includes('미국') && (name.includes('S&P') || name.includes('500'))
          }
          if (selectedIndex === '나스닥100') {
            return name.includes('미국') && (name.includes('나스닥') || name.includes('NASDAQ'))
          }
          if (selectedIndex === '다우존스30') {
            return name.includes('다우')
          }
          if (selectedIndex === 'CSI300') {
            return name.includes('차이나') || name.includes('CSI') || name.includes('중국')
          }
          if (selectedIndex === '항셍테크') {
            return name.includes('항셍') || name.includes('홍콩')
          }
          if (selectedIndex === '유로스탁스50') {
            return name.includes('유로') || name.includes('EURO')
          }
          if (selectedIndex === 'MSCI선진국') {
            return name.includes('MSCI') && name.includes('선진')
          }
          return true
        })
        break
      case 'leverage':
        // 인버스/레버리지
        results = results.filter(etf => etf.isLeveraged || etf.isInverse)
        break
      case 'sector':
        // 섹터별 (레버리지/인버스 제외)
        results = results.filter(etf => {
          if (etf.isLeveraged || etf.isInverse) return false
          const name = etf.shortName
          const sector = selectedSector

          if (sector === '반도체/AI') {
            return name.includes('반도체') || name.includes('AI') ||
                   name.includes('파운드리') || name.includes('메모리') ||
                   name.includes('빅테크') || name.includes('로봇')
          }
          if (sector === '2차전지') {
            return name.includes('2차전지') || name.includes('배터리')
          }
          if (sector === '바이오/헬스케어') {
            return name.includes('바이오') || name.includes('헬스케어') ||
                   name.includes('제약') || name.includes('비만')
          }
          if (sector === '금융') {
            return name.includes('금융') || name.includes('은행') ||
                   name.includes('보험') || name.includes('증권')
          }
          if (sector === '게임/엔터') {
            return name.includes('게임') || name.includes('메타버스') ||
                   name.includes('K콘텐츠') || name.includes('엔터')
          }
          if (sector === '원자재') {
            return name.includes('골드') || name.includes('금') ||
                   name.includes('WTI') || name.includes('원유') ||
                   name.includes('구리') || name.includes('농산물') ||
                   etf.category === '원자재'
          }
          if (sector === '배당') {
            return name.includes('배당') || name.includes('커버드콜') ||
                   name.includes('인컴') || name.includes('리츠') ||
                   etf.category === '배당'
          }
          if (sector === 'ESG') {
            return name.includes('ESG') || name.includes('신재생') ||
                   name.includes('원자력')
          }
          return false
        })
        break
      case 'index':
        // 지수 추종 ETF (레버리지/인버스 제외)
        results = results.filter(etf => {
          if (etf.isLeveraged || etf.isInverse) return false
          const name = etf.shortName.toUpperCase()

          if (selectedIndex === 'KOSPI200') {
            return (name.includes('200') || name.includes('KOSPI') || name.includes('코스피')) &&
                   !name.includes('미국') && !name.includes('코스닥') && !name.includes('KOSDAQ')
          }
          if (selectedIndex === 'KOSDAQ150') {
            return name.includes('코스닥') || name.includes('KOSDAQ')
          }
          if (selectedIndex === 'KRX300') {
            return name.includes('KRX') && !name.includes('KOSPI') && !name.includes('KOSDAQ')
          }
          if (selectedIndex === 'S&P500') {
            return (name.includes('S&P') || name.includes('S&P500') || name.includes('500')) &&
                   (name.includes('미국') || name.includes('US') || etf.tags?.some(t => t.includes('미국')))
          }
          if (selectedIndex === '나스닥100') {
            return name.includes('나스닥') || name.includes('NASDAQ')
          }
          if (selectedIndex === '다우존스30') {
            return name.includes('다우') || name.includes('DOW')
          }
          if (selectedIndex === 'CSI300') {
            return name.includes('CSI') || name.includes('차이나') || name.includes('중국')
          }
          if (selectedIndex === '항셍테크') {
            return name.includes('항셍') || name.includes('홍콩') || name.includes('HANG')
          }
          if (selectedIndex === '유로스탁스50') {
            return name.includes('유로') || name.includes('EURO') || name.includes('유럽')
          }
          if (selectedIndex === 'MSCI선진국') {
            return name.includes('MSCI') && (name.includes('선진') || name.includes('WORLD'))
          }
          return false
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

  // 테이블 헤더 클릭 정렬 핸들러
  const handleColumnSort = (column: string) => {
    setColumnSort(prev => {
      if (prev?.column === column) {
        // 같은 컬럼 클릭: asc <-> desc 토글
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      // 새 컬럼 클릭: 기본 내림차순 (가격/수익률 등은 높은게 먼저)
      return { column, direction: 'desc' }
    })
  }

  // 정렬 아이콘 렌더링
  const renderSortIcon = (column: string) => {
    if (columnSort?.column !== column) {
      return <ChevronDown className="h-3 w-3 opacity-30" />
    }
    return columnSort.direction === 'asc'
      ? <ChevronUp className="h-3 w-3 text-[#d64f79]" />
      : <ChevronDown className="h-3 w-3 text-[#d64f79]" />
  }

  // 컬럼 정렬 적용된 ETF 리스트
  const sortedETFs = useMemo(() => {
    if (!columnSort) return filteredETFs

    const sorted = [...filteredETFs]
    const { column, direction } = columnSort
    const multiplier = direction === 'asc' ? 1 : -1

    sorted.sort((a, b) => {
      let aVal: number, bVal: number

      // 수익률 컬럼 정렬 (return_1일, return_1주, ...)
      if (column.startsWith('return_')) {
        const period = column.replace('return_', '') as keyof ReturnType<typeof generateMockReturns>
        const aReturns = generateMockReturns(a)
        const bReturns = generateMockReturns(b)
        aVal = aReturns[period] ?? -999
        bVal = bReturns[period] ?? -999
        return (aVal - bVal) * multiplier
      }

      // 자금유입 컬럼 정렬 (flow_전일, flow_1주, ...)
      if (column.startsWith('flow_')) {
        const period = column.replace('flow_', '') as keyof ReturnType<typeof generateMockFlow>
        const aFlows = generateMockFlow(a)
        const bFlows = generateMockFlow(b)
        aVal = aFlows[period]
        bVal = bFlows[period]
        return (aVal - bVal) * multiplier
      }

      switch (column) {
        case 'price':
          aVal = a.price; bVal = b.price; break
        case 'change':
          aVal = a.changePercent; bVal = b.changePercent; break
        case 'ter':
          aVal = a.ter; bVal = b.ter; break
        case 'discrepancy':
          aVal = Math.abs(a.discrepancy); bVal = Math.abs(b.discrepancy); break
        case 'volume':
          aVal = a.adtv / a.price; bVal = b.adtv / b.price; break
        case 'adtv':
          aVal = a.adtv; bVal = b.adtv; break
        case 'aum':
          aVal = a.aum; bVal = b.aum; break
        case 'dividend':
          aVal = a.dividendYield; bVal = b.dividendYield; break
        case 'health':
          aVal = a.healthScore; bVal = b.healthScore; break
        case 'inav':
          aVal = a.iNav; bVal = b.iNav; break
        default:
          return 0
      }
      return (aVal - bVal) * multiplier
    })

    return sorted
  }, [filteredETFs, columnSort])

  // 비교함에 있는지 확인
  const isInCompare = (etfId: string) => compareETFs.some(e => e.id === etfId)

  // 즐겨찾기 토글
  const toggleFavorite = (etfId: string) => {
    setFavorites(prev =>
      prev.includes(etfId) ? prev.filter(id => id !== etfId) : [...prev, etfId]
    )
  }

  // 가로보기 모드 (테이블만 90도 회전)
  const [isLandscape, setIsLandscape] = useState(false)
  // 실제 화면 방향 감지
  const [isDeviceLandscape, setIsDeviceLandscape] = useState(
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  )

  // 화면 방향 변경 감지
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsDeviceLandscape(window.innerWidth > window.innerHeight)
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  // 닫을 때 가로보기 모드 리셋
  const handleClose = () => {
    setIsLandscape(false)
    onClose()
  }

  if (!isOpen) return null

  // embedded 모드: 페이지 내 임베디드 / 모달 모드: 전체화면 오버레이
  const containerClass = embedded
    ? 'pb-20 bg-[#191322]'
    : 'fixed inset-0 z-50 bg-[#191322]'

  // 가로보기 모드일 때 전체화면 오버레이로 테이블만 표시
  if (isLandscape) {
    // 디바이스가 이미 가로인 경우 transform 적용하지 않음
    const needsRotation = !isDeviceLandscape

    return (
      <div className="fixed inset-0 z-[100] bg-[#191322] flex flex-col">
        {/* 가로보기 컨테이너 - 디바이스가 세로일 때만 90도 회전 */}
        <div
          className="flex-1 origin-center"
          style={needsRotation ? {
            transform: 'rotate(90deg)',
            width: '100vh',
            height: '100vw',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-50vw',
            marginLeft: '-50vh',
          } : {
            width: '100%',
            height: '100%',
          }}
        >
          {/* 가로보기 헤더 */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#191322] border-b border-[#3d3650]/40">
            <h1 className="text-[17px] font-semibold text-white">ETF 스크리닝 (가로보기)</h1>
            <button
              onClick={() => setIsLandscape(false)}
              className="px-3 py-1 rounded-lg bg-[#d64f79] text-white text-[15px]"
            >
              세로로 돌아가기
            </button>
          </div>
          {/* 가로보기 테이블 */}
          <div className="flex-1 overflow-auto p-2 rounded-xl border border-[#3d3650]/40">
            <table className="w-full min-w-[800px] text-[15px]">
              <thead className="bg-[#2d2640]/60 sticky top-0">
                <tr>
                  <th className="text-left text-gray-400 font-medium px-2 py-2">종목</th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('price')}>
                    <span className="inline-flex items-center gap-1">현재가 {renderSortIcon('price')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('change')}>
                    <span className="inline-flex items-center gap-1">등락률 {renderSortIcon('change')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('ter')}>
                    <span className="inline-flex items-center gap-1">TER {renderSortIcon('ter')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('discrepancy')}>
                    <span className="inline-flex items-center gap-1">괴리율 {renderSortIcon('discrepancy')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('adtv')}>
                    <span className="inline-flex items-center gap-1">거래대금 {renderSortIcon('adtv')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('aum')}>
                    <span className="inline-flex items-center gap-1">AUM {renderSortIcon('aum')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('dividend')}>
                    <span className="inline-flex items-center gap-1">배당률 {renderSortIcon('dividend')}</span>
                  </th>
                  <th className="text-right text-gray-400 font-medium px-2 py-2 cursor-pointer hover:text-white" onClick={() => handleColumnSort('health')}>
                    <span className="inline-flex items-center gap-1">건전성 {renderSortIcon('health')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedETFs.slice(0, 30).map((etf) => (
                  <tr
                    key={etf.id}
                    onClick={() => {
                      setIsLandscape(false)
                      onSelectETF(etf)
                    }}
                    className="border-b border-[#3d3650]/40 hover:bg-[#2d2640]/30 cursor-pointer"
                  >
                    <td className="px-2 py-2">
                      <div className="marquee-wrapper max-w-[120px]">
                        <span className="marquee-text text-white">{etf.shortName}</span>
                      </div>
                    </td>
                    <td className="text-right px-2 py-2 text-white">{formatNumber(etf.price)}</td>
                    <td className={`text-right px-2 py-2 ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </td>
                    <td className="text-right px-2 py-2 text-white">{etf.ter.toFixed(2)}%</td>
                    <td className={`text-right px-2 py-2 ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                      {etf.discrepancy.toFixed(2)}%
                    </td>
                    <td className="text-right px-2 py-2 text-white">{(etf.adtv / 100000000).toFixed(0)}억</td>
                    <td className="text-right px-2 py-2 text-white">{(etf.aum / 100000000).toFixed(0)}억</td>
                    <td className="text-right px-2 py-2 text-white">{etf.dividendYield.toFixed(1)}%</td>
                    <td className="text-right px-2 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[14px] ${
                        etf.healthScore >= 85 ? 'bg-green-500/20 text-green-400' :
                        etf.healthScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {etf.healthScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* 헤더 */}
      <div className={`${embedded ? '' : 'sticky top-0'} bg-[#191322] border-b border-[#3d3650]/40 z-10`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {!embedded && (
              <button onClick={handleClose}>
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}
            <h1 className="text-[21px] font-semibold text-white">ETF 빠른검색</h1>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 pb-2 gap-2">
          {tabMenus.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[17px] whitespace-nowrap transition-colors ${
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
        <div className="px-4 py-2 border-b border-[#3d3650]/40">
          <button
            onClick={() => setShowIndexModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2d2640] rounded-lg text-[17px] text-white"
          >
            <span>{selectedIndex}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeTab === 'sector' && (
        <div className="px-4 py-2 border-b border-[#3d3650]/40">
          <div className="flex flex-wrap gap-2">
            {sectorCategories.slice(0, 6).map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-full text-[15px] transition-colors ${
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

      {/* 통합 컨트롤 바: 결과수 + 뷰모드 + 정렬 + 가로보기 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[17px] text-gray-400 font-medium">{filteredETFs.length}개 ETF</span>
        <div className="flex items-center gap-2">
          {/* 요약/상세 토글 */}
          <div className="flex bg-[#2d2640] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 rounded text-[15px] transition-colors ${
                viewMode === 'summary' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              요약
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-3 py-1 rounded text-[15px] transition-colors ${
                viewMode === 'detail' ? 'bg-[#d64f79] text-white' : 'text-gray-400'
              }`}
            >
              상세
            </button>
          </div>
          {/* 가로보기 버튼 */}
          <button
            onClick={() => setIsLandscape(true)}
            className="icon-btn-3d"
            title="가로보기"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          {/* 정렬 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2d2640] text-[15px] text-white"
            >
              <span>
                {sortOptions.find(o => o.id === selectedSort)?.label || '정렬'} - {stockFilters.find(f => f.id === selectedStockFilter)?.label || '전체'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1f1a2e] border border-[#3d3650]/40 rounded-lg shadow-lg z-50 overflow-hidden">
                {/* 종목 필터 */}
                <div className="px-3 py-2 border-b border-[#3d3650]/40">
                  <div className="text-[14px] text-gray-500 mb-1.5">종목 필터</div>
                  <div className="flex flex-wrap gap-1">
                    {stockFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedStockFilter(filter.id)}
                        className={`px-2 py-0.5 rounded text-[14px] transition-colors ${
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
                {/* 정렬 옵션 */}
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedSort(option.id)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-[15px] transition-colors ${
                        selectedSort === option.id
                          ? 'bg-[#d64f79] text-white font-medium'
                          : 'text-gray-300 hover:bg-[#2d2640]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 뷰 탭 (상세 모드일 때만) */}
      {viewMode === 'detail' && (
        <div className="flex gap-4 px-4 pb-2 border-b border-[#3d3650]/40">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id)}
              className={`text-[17px] pb-2 transition-colors ${
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
          <div className="mx-4 rounded-xl overflow-hidden">
            {sortedETFs.map((etf) => (
              <div
                key={etf.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#2d2640]/50 transition-colors"
              >
                {/* ETF 로고 */}
                <button
                  onClick={() => onSelectETF(etf)}
                  className="shrink-0"
                >
                  <ETFLogo shortName={etf.shortName} size="md" />
                </button>

                {/* 종목명 + 가격/수익률 (2줄) */}
                <button
                  onClick={() => onSelectETF(etf)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="marquee-wrapper max-w-[180px]">
                    <span className="marquee-text text-[16px] text-white">{etf.shortName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[14px] text-gray-400">{formatNumber(etf.price)}원</span>
                    <span className={`text-[14px] ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                </button>

                {/* 아이콘 버튼들 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddToCompare(etf)}
                    className={`icon-btn-3d ${isInCompare(etf.id) ? 'icon-btn-3d-active' : ''}`}
                    disabled={compareETFs.length >= 3 && !isInCompare(etf.id)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(etf.id)}
                    className={`icon-btn-3d ${favorites.includes(etf.id) ? 'icon-btn-3d-active' : ''}`}
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(etf.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 상세 뷰 - 테이블 형식
          <div className="overflow-x-auto rounded-xl border border-[#3d3650]/40">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#2d2640]/60 sticky top-0">
                <tr>
                  <th className="text-left text-[15px] text-gray-400 font-medium px-4 py-2 w-40 whitespace-nowrap">종목</th>
                  {detailTab === 'basic' && (
                    <>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('price')}>
                        <span className="inline-flex items-center gap-0.5">현재가 {renderSortIcon('price')}</span>
                      </th>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('change')}>
                        <span className="inline-flex items-center gap-0.5">등락률 {renderSortIcon('change')}</span>
                      </th>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('inav')}>
                        <span className="inline-flex items-center gap-0.5">iNAV {renderSortIcon('inav')}</span>
                      </th>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('discrepancy')}>
                        <span className="inline-flex items-center gap-0.5">괴리율 {renderSortIcon('discrepancy')}</span>
                      </th>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('volume')}>
                        <span className="inline-flex items-center gap-0.5">거래량 {renderSortIcon('volume')}</span>
                      </th>
                      <th className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleColumnSort('adtv')}>
                        <span className="inline-flex items-center gap-0.5">거래대금 {renderSortIcon('adtv')}</span>
                      </th>
                    </>
                  )}
                  {detailTab === 'returns' && (
                    <>
                      {returnPeriods.map((period) => {
                        const colId = `return_${period}`
                        return (
                          <th
                            key={period}
                            className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white whitespace-nowrap"
                            onClick={() => handleColumnSort(colId)}
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {period} {renderSortIcon(colId)}
                            </span>
                          </th>
                        )
                      })}
                    </>
                  )}
                  {detailTab === 'flow' && (
                    <>
                      {flowPeriods.map((period) => {
                        const colId = `flow_${period}`
                        return (
                          <th
                            key={period}
                            className="text-right text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:text-white whitespace-nowrap"
                            onClick={() => handleColumnSort(colId)}
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {period} {renderSortIcon(colId)}
                            </span>
                          </th>
                        )
                      })}
                    </>
                  )}
                  <th className="text-center text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap">비교담기</th>
                  <th className="text-center text-[15px] text-gray-400 font-medium px-2 py-2 whitespace-nowrap">관심추가</th>
                </tr>
              </thead>
              <tbody>
                {sortedETFs.map((etf) => {
                  const returns = generateMockReturns(etf)
                  const flows = generateMockFlow(etf)
                  return (
                    <tr
                      key={etf.id}
                      className="border-b border-[#3d3650]/40 hover:bg-[#2d2640]/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectETF(etf)}
                          className="text-left"
                        >
                          <div className="marquee-wrapper max-w-[140px]">
                            <span className="marquee-text text-[17px] text-white">{etf.shortName}</span>
                          </div>
                        </button>
                      </td>
                      {detailTab === 'basic' && (
                        <>
                          <td className="text-right text-[17px] text-white px-2 py-3">
                            {formatNumber(etf.price)}원
                          </td>
                          <td className={`text-right text-[17px] px-2 py-3 ${etf.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                            {formatPercent(etf.changePercent)}
                          </td>
                          <td className="text-right text-[17px] text-white px-2 py-3">
                            {formatNumber(etf.iNav)}
                          </td>
                          <td className={`text-right text-[17px] px-2 py-3 ${Math.abs(etf.discrepancy) > 0.1 ? 'text-yellow-400' : 'text-white'}`}>
                            {etf.discrepancy.toFixed(2)}%
                          </td>
                          <td className="text-right text-[17px] text-white px-2 py-3">
                            {Math.floor(etf.adtv / etf.price / 1000).toLocaleString()}천주
                          </td>
                          <td className="text-right text-[17px] text-white px-2 py-3">
                            {(etf.adtv / 100000000).toFixed(0)}억
                          </td>
                        </>
                      )}
                      {detailTab === 'returns' && (
                        <>
                          {returnPeriods.map((period) => {
                            const value = returns[period as keyof typeof returns]
                            const isNull = value === null
                            const numValue = isNull ? 0 : value
                            return (
                              <td
                                key={period}
                                className={`text-right text-[17px] px-2 py-3 ${
                                  isNull ? 'text-gray-500' :
                                  numValue >= 0 ? 'text-up' : 'text-down'
                                }`}
                              >
                                {isNull ? '-' : `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`}
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
                                className={`text-right text-[17px] px-2 py-3 ${
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
                          className={`icon-btn-3d ${isInCompare(etf.id) ? 'icon-btn-3d-active' : ''}`}
                          disabled={compareETFs.length >= 3 && !isInCompare(etf.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="text-center px-2 py-3">
                        <button
                          onClick={() => toggleFavorite(etf.id)}
                          className={`icon-btn-3d ${favorites.includes(etf.id) ? 'icon-btn-3d-active' : ''}`}
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
        <DialogContent className="bg-[#1f1a2e] border-[#3d3650]/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">중분류 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {Object.entries(indexCategories).map(([country, indices]) => (
              <div key={country}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-[#d64f79] text-white text-[15px] font-medium">
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
                      className={`px-3 py-1.5 rounded-lg text-[17px] transition-colors ${
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

    </div>
  )
}
