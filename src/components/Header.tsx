import { useState } from 'react'
import { Search, Menu, FileText, ChevronDown, ChevronUp, X, AlertTriangle, TrendingDown, RefreshCw, Shield, CalendarDays, Compass } from 'lucide-react'
// import { Bell } from 'lucide-react' // 알림 아이콘 숨김
import { ThemeSwitch } from './ui/switch'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { DividendCalendar } from './DividendCalendar'
import { mockETFs, type ETF } from '@/data/mockData'

interface HeaderProps {
  onSelectETF?: (etf: ETF) => void
  accountType?: string
  onStartTour?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

// 데모 알림 데이터
const demoNotifications = [
  {
    id: 1,
    type: 'warning',
    icon: AlertTriangle,
    title: '건전성 주의',
    message: 'KODEX 레버리지의 괴리율이 0.15%로 상승했습니다.',
    time: '10분 전',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 2,
    type: 'rebalance',
    icon: RefreshCw,
    title: '리밸런싱 알림',
    message: '포트폴리오 배분이 목표 대비 7% 이탈했습니다.',
    time: '1시간 전',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 3,
    type: 'drop',
    icon: TrendingDown,
    title: '급락 알림',
    message: 'TIGER 반도체가 전일 대비 -3.2% 하락했습니다.',
    time: '2시간 전',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 4,
    type: 'safety',
    icon: Shield,
    title: '안전 알림',
    message: '연금계좌에 부적합 상품(레버리지) 매수 시도가 차단되었습니다.',
    time: '어제',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
]

// 제품소개서 섹션 컴포넌트
function ProductInfoSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#2d2640] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-[17px] font-semibold text-white">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="pb-4 text-[17px] text-gray-300">{children}</div>}
    </div>
  )
}

export function Header({ onSelectETF, accountType = 'general', onStartTour, isDarkMode = true, onToggleTheme }: HeaderProps) {
  const [showProductInfo, setShowProductInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showDividendCalendar, setShowDividendCalendar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 결과
  const searchResults = searchQuery.trim().length >= 1
    ? mockETFs.filter(etf =>
        etf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etf.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etf.ticker.includes(searchQuery)
      ).slice(0, 10)
    : []

  const handleSelectETF = (etf: ETF) => {
    onSelectETF?.(etf)
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[#2d2640] bg-[#191322]/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-[21px] font-bold text-white">All that ETF</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* 돋보기 아이콘 제거 - 홈 검색 기능 활용 */}
          <button
            onClick={() => setShowDividendCalendar(true)}
            title="분배금 캘린더"
            data-tour="dividend-calendar"
            className="icon-btn-3d"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          {/* 알림 아이콘 임시 숨김 - "알림 아이콘 다시 보이게 해줘"로 복구
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(true)}>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#d64f79]" />
          </Button>
          */}
          <button
            onClick={() => setShowProductInfo(true)}
            title="제품 소개서"
            data-tour="product-info"
            className="icon-btn-3d"
          >
            <FileText className="h-5 w-5" />
          </button>
          {onStartTour && (
            <button
              onClick={onStartTour}
              title="페이지 가이드"
              className="icon-btn-3d"
            >
              <Compass className="h-5 w-5" />
            </button>
          )}
          {onToggleTheme && (
            <ThemeSwitch isDarkMode={isDarkMode} onToggle={onToggleTheme} />
          )}
        </div>
      </div>
    </header>

    {/* 검색 모달 */}
    <Dialog open={showSearch} onOpenChange={setShowSearch}>
      <DialogContent className="max-w-md bg-[#1f1a2e] border-[#2d2640] p-0">
        <div className="p-4 border-b border-[#2d2640]">
          <div className="flex items-center gap-3 bg-[#2d2640] rounded-lg px-3 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="종목명 또는 티커 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4 text-gray-500 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="p-4 text-center text-gray-500 text-[17px]">
              종목명 또는 티커를 입력하세요
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-[17px]">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((etf) => (
                <button
                  key={etf.id}
                  onClick={() => handleSelectETF(etf)}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#2d2640] rounded-lg transition-colors"
                >
                  <div className="text-left">
                    <div className="text-[17px] text-white font-medium">{etf.shortName}</div>
                    <div className="text-[15px] text-gray-500">{etf.ticker}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[17px] text-white">{etf.price.toLocaleString()}원</div>
                    <div className={`text-[15px] ${etf.changePercent >= 0 ? 'text-[#d64f79]' : 'text-[#796ec2]'}`}>
                      {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* 알림 모달 */}
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogContent className="max-w-md bg-[#1f1a2e] border-[#2d2640]">
        <DialogHeader>
          <DialogTitle className="text-[21px] text-white flex items-center gap-2">
            알림
            <span className="text-[15px] bg-[#d64f79] text-white px-2 py-0.5 rounded-full">
              {demoNotifications.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {demoNotifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div
                key={notification.id}
                className={`${notification.bgColor} rounded-lg p-3 border border-transparent hover:border-[#3d3650] transition-colors cursor-pointer`}
              >
                <div className="flex gap-3">
                  <div className={`shrink-0 ${notification.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[17px] font-medium ${notification.color}`}>
                        {notification.title}
                      </span>
                      <span className="text-[14px] text-gray-500 shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-[15px] text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t border-[#2d2640]">
          <button className="w-full text-center text-[15px] text-gray-500 hover:text-gray-300 py-2">
            모든 알림 지우기
          </button>
        </div>
      </DialogContent>
    </Dialog>

    {/* 분배금 캘린더 모달 */}
    <DividendCalendar
      isOpen={showDividendCalendar}
      onClose={() => setShowDividendCalendar(false)}
      accountType={accountType}
      onSelectETF={onSelectETF}
    />

    {/* 제품소개서 모달 */}
    <Dialog open={showProductInfo} onOpenChange={setShowProductInfo}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1f1a2e] border-[#2d2640]">
        <DialogHeader>
          <DialogTitle className="text-[23px] text-white flex items-center gap-2">
            ETF MTS Demo
            <span className="text-[15px] bg-[#d64f79]/20 text-[#d64f79] px-2 py-0.5 rounded-full">
              제품 소개
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* 핵심 가치 */}
          <div className="bg-[#2a2438] rounded-lg p-4 text-center">
            <p className="text-[#d64f79] font-bold text-[21px] mb-1">"ETF 투자, 더 쉽고 안전하게"</p>
            <p className="text-gray-400 text-[17px]">투명한 정보 + 쉬운 검증 + 안전한 투자</p>
          </div>

          {/* 왜 필요한가 */}
          <ProductInfoSection title="왜 이 서비스가 필요한가?" defaultOpen={true}>
            <div className="space-y-3">
              <p className="text-gray-400 text-[15px] mb-2">개인 투자자의 고민</p>
              <ul className="space-y-1.5 text-[17px]">
                <li className="flex items-start gap-2">
                  <span className="text-[#d64f79]">•</span>
                  "ETF가 좋다는데... 뭘 사야 하지?"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d64f79]">•</span>
                  "이 ETF 믿어도 되나? 수수료는?"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d64f79]">•</span>
                  "내 연금계좌에 이거 담아도 되나?"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d64f79]">•</span>
                  "비슷한 ETF가 너무 많아서 뭐가 뭔지..."
                </li>
              </ul>
              <p className="text-gray-500 text-[15px] mt-3 italic">
                * 실제 투자자 커뮤니티 및 교육 콘텐츠 댓글 분석 기반
              </p>
            </div>
          </ProductInfoSection>

          {/* 고객 가치 */}
          <ProductInfoSection title="고객이 얻는 가치">
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium mb-1">1. 한눈에 보는 ETF 건전성</p>
                <p className="text-gray-400 text-[15px]">복잡한 지표를 0~100점 단일 점수로 이해</p>
                <p className="text-gray-400 text-[15px]">괴리율, 스프레드, TER, 거래대금 한눈에</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">2. 연금계좌 안전장치</p>
                <p className="text-gray-400 text-[15px]">레버리지/인버스 자동 필터링</p>
                <p className="text-gray-400 text-[15px]">연금적합 상품 필터로 안전한 투자</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">3. 쉬운 비교, 빠른 결정</p>
                <p className="text-gray-400 text-[15px]">최대 4개 ETF 동시 비교</p>
                <p className="text-gray-400 text-[15px]">데이터 기반 선택, 비교 시간 90% 단축</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">4. 투자 교육 통합</p>
                <p className="text-gray-400 text-[15px]">ETF 101, 용어사전, AI 챗봇</p>
                <p className="text-gray-400 text-[15px]">학습과 투자를 한 앱에서</p>
              </div>
            </div>
          </ProductInfoSection>

          {/* 회사 기대효과 */}
          <ProductInfoSection title="회사가 얻는 기대효과">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[15px]">
                <div className="bg-[#2a2438] p-2 rounded">
                  <p className="text-[#d64f79] font-bold">거래 활성화</p>
                  <p className="text-gray-400">ETF 거래대금 증가</p>
                </div>
                <div className="bg-[#2a2438] p-2 rounded">
                  <p className="text-[#d64f79] font-bold">연금 확대</p>
                  <p className="text-gray-400">연금계좌 ETF 비중 확대</p>
                </div>
                <div className="bg-[#2a2438] p-2 rounded">
                  <p className="text-[#d64f79] font-bold">고객 유입</p>
                  <p className="text-gray-400">차별화된 UX로 신규 유입</p>
                </div>
                <div className="bg-[#2a2438] p-2 rounded">
                  <p className="text-[#d64f79] font-bold">이탈 방지</p>
                  <p className="text-gray-400">투자 경험 만족도 향상</p>
                </div>
              </div>
              <div className="text-[15px] space-y-1 mt-2">
                <p><span className="text-white">투자자 보호:</span> <span className="text-gray-400">부적합 상품 투자 방지 → 민원 감소</span></p>
                <p><span className="text-white">정보 투명성:</span> <span className="text-gray-400">건전성 지표 공개 → 신뢰도 향상</span></p>
                <p><span className="text-white">규제 대응:</span> <span className="text-gray-400">적합성 자동 필터 → 컴플라이언스 강화</span></p>
              </div>
            </div>
          </ProductInfoSection>

          {/* 콘텐츠 기획 */}
          <ProductInfoSection title="투자정보 콘텐츠 기획 배경">
            <div className="space-y-2 text-[15px]">
              <p className="text-gray-400">
                투자정보 섹션의 ETF 101, 용어사전 콘텐츠는 실제 투자자들의 니즈를 반영하여 기획되었습니다.
              </p>
              <ul className="space-y-1 text-gray-400">
                <li>• 인기 투자 교육 영상 댓글 분석</li>
                <li>• 투자자 커뮤니티 FAQ 패턴 파악</li>
                <li>• 초보 투자자가 자주 묻는 질문 정리</li>
              </ul>
              <p className="text-gray-500 italic mt-2">
                → "정말 궁금한 것"에 답하는 콘텐츠 구성
              </p>
            </div>
          </ProductInfoSection>

          {/* 핵심 화면 */}
          <ProductInfoSection title="핵심 화면">
            <div className="grid grid-cols-2 gap-2 text-[15px]">
              <div>
                <p className="text-white font-medium">홈</p>
                <p className="text-gray-400">포트폴리오, 인기 ETF, 히트맵</p>
              </div>
              <div>
                <p className="text-white font-medium">탐색</p>
                <p className="text-gray-400">탐색/검증/주문 3모드</p>
              </div>
              <div>
                <p className="text-white font-medium">비교</p>
                <p className="text-gray-400">최대 4개 ETF 비교</p>
              </div>
              <div>
                <p className="text-white font-medium">투자정보</p>
                <p className="text-gray-400">ETF 101, 용어사전, 챗봇</p>
              </div>
            </div>
          </ProductInfoSection>

          {/* 요약 */}
          <div className="bg-[#d64f79]/10 border border-[#d64f79]/30 rounded-lg p-4 text-center">
            <p className="text-white font-bold mb-2">
              "ETF 투자의 진입장벽을 낮추고, 안전하고 현명한 투자를 돕는 MTS"
            </p>
            <div className="flex justify-center gap-4 text-[15px] text-gray-400">
              <span>고객: 쉬운 검증 + 안전한 투자</span>
              <span>|</span>
              <span>회사: 거래 증가 + 신뢰 강화</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
