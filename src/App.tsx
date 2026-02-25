import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
// import { FloatingChatbot } from './components/FloatingChatbot' // 임시 숨김
import { CompareSlot } from './components/CompareSlot'
import { OnboardingTour } from './components/OnboardingTour'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ETFDetailPage } from './pages/ETFDetailPage'
import { TradePage } from './pages/TradePage'
// import { PortfolioPage } from './pages/PortfolioPage' // 보유 기능 숨김
import { ComparePage } from './pages/ComparePage'
import { InvestInfoPage } from './pages/InvestInfoPage'
import { InvestInfoDetailPage } from './pages/InvestInfoDetailPage'
import { LoginPage } from './pages/LoginPage'
import { SearchPage } from './pages/SearchPage'
import { QuickSearchPage } from './pages/QuickSearchPage'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { mockETFs, type ETF } from './data/mockData'
import type { InvestContent } from './data/investInfoData'
import { tourStepsByPage } from './data/tourSteps'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('etf-mts-auth') === 'authenticated'
  })
  const [activeTab, setActiveTab] = useState('home')
  const [accountType, setAccountType] = useState('general')
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showTrade, setShowTrade] = useState(false)
  const [selectedContent, setSelectedContent] = useState<InvestContent | null>(null)
  const [showContentDetail, setShowContentDetail] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickSearch, setShowQuickSearch] = useState(false)
  const [quickSearchTab, setQuickSearchTab] = useState('index')

  // 탐색 페이지 필터 상태 (기본값: 'none' - 아무것도 선택되지 않음) - 탐색 메뉴 숨김으로 미사용
  // const [selectedTheme, setSelectedTheme] = useState<string>('none')

  // 비교 ETF 목록 (최대 4개)
  const [compareETFs, setCompareETFs] = useState<ETF[]>([])

  // 스와이프 네비게이션용 ETF 목록 (기본값: 전체 ETF 목록 중 상위 20개)
  const [etfNavigationList, setEtfNavigationList] = useState<ETF[]>(() =>
    mockETFs.slice(0, 20)
  )

  // 온보딩 투어 상태
  const [showTour, setShowTour] = useState(false)
  const [tourType, setTourType] = useState<string>('welcome')

  // 테마 컨텍스트 사용
  const { isDarkMode, toggleTheme } = useTheme()

  // 첫 방문 시 웰컴 투어 표시
  useEffect(() => {
    const hasSeenWelcomeTour = localStorage.getItem('etf-mts-welcome-tour')
    if (!hasSeenWelcomeTour && isAuthenticated) {
      // 첫 로그인 후 약간의 딜레이를 주고 투어 시작
      const timer = setTimeout(() => {
        setTourType('welcome')
        setShowTour(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  const handleStartTour = (type: string) => {
    setTourType(type)
    setShowTour(true)
  }

  const handleTourComplete = () => {
    setShowTour(false)
    if (tourType === 'welcome') {
      localStorage.setItem('etf-mts-welcome-tour', 'completed')
    }
  }

  const handleTourClose = () => {
    setShowTour(false)
    if (tourType === 'welcome') {
      localStorage.setItem('etf-mts-welcome-tour', 'skipped')
    }
  }

  const handleSelectETF = (etf: ETF) => {
    setSelectedETF(etf)
    setShowDetail(true)
    // 네비게이션 리스트에 없으면 맨 앞에 추가
    setEtfNavigationList(prev => {
      if (prev.find(e => e.id === etf.id)) return prev
      return [etf, ...prev].slice(0, 30) // 최대 30개 유지
    })
  }

  // 스와이프로 ETF 변경
  const handleNavigateETF = (etf: ETF) => {
    setSelectedETF(etf)
    window.scrollTo(0, 0)
  }

  const handleTrade = () => {
    setShowDetail(false)
    setShowTrade(true)
  }

  const handleBackFromDetail = () => {
    setShowDetail(false)
    setSelectedETF(null)
  }

  const handleBackFromTrade = () => {
    setShowTrade(false)
  }

  const handleNavigate = (tab: string, _theme?: string) => {
    setActiveTab(tab)
    setShowDetail(false)
    setShowTrade(false)
    setShowContentDetail(false)
    // 테마 필터 설정 - 탐색 메뉴 숨김으로 미사용
    // if (theme) {
    //   setSelectedTheme(theme)
    // }
    // 탭 변경 시 스크롤을 맨 위로 초기화
    window.scrollTo(0, 0)
  }

  // 비교 목록에 ETF 추가 (롱프레스)
  const handleAddToCompare = (etf: ETF) => {
    setCompareETFs(prev => {
      if (prev.find(e => e.id === etf.id)) return prev // 이미 있으면 무시
      if (prev.length >= 3) return prev // 최대 3개
      return [...prev, etf]
    })
  }

  // 비교 목록에서 ETF 제거
  const handleRemoveFromCompare = (etfId: string) => {
    setCompareETFs(prev => prev.filter(e => e.id !== etfId))
  }

  // 비교하기 버튼 클릭 시 비교 탭으로 이동
  const handleGoToCompare = () => {
    setActiveTab('compare')
    window.scrollTo(0, 0)
  }

  // 상세 페이지에서 비교하기 클릭 시 (ETF 추가 + 비교 탭 이동)
  const handleAddToCompareAndNavigate = (etf: ETF) => {
    handleAddToCompare(etf)
    setShowDetail(false)
    setActiveTab('compare')
    window.scrollTo(0, 0)
  }

  // 비교 목록 초기화
  const handleClearCompare = () => {
    setCompareETFs([])
  }

  const handleSelectContent = (content: InvestContent) => {
    setSelectedContent(content)
    setShowContentDetail(true)
  }

  const handleBackFromContentDetail = () => {
    setShowContentDetail(false)
  }

  // 챗봇에서 콘텐츠 선택 시 투자정보 상세로 이동 - 임시 숨김
  // const handleChatbotContentSelect = (content: InvestContent) => {
  //   setSelectedContent(content)
  //   setShowContentDetail(true)
  //   setActiveTab('investinfo')
  // }

  // 챗봇에서 용어사전으로 이동 - 임시 숨김
  // const handleNavigateToGlossary = () => {
  //   setActiveTab('investinfo')
  // }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  // Show trade page
  if (showTrade) {
    return (
      <div className="min-h-screen bg-[#191322]">
        <TradePage
          etf={selectedETF}
          accountType={accountType}
          onBack={handleBackFromTrade}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
        {/* FloatingChatbot 임시 숨김 - "챗봇 버튼 다시 보이게 해줘"로 복구 */}
      </div>
    )
  }

  // Show ETF detail page
  if (showDetail && selectedETF) {
    const currentIdx = etfNavigationList.findIndex(e => e.id === selectedETF.id)
    return (
      <div className="min-h-screen bg-[#191322]">
        <ETFDetailPage
          key={selectedETF.id}
          etf={selectedETF}
          accountType={accountType}
          onBack={handleBackFromDetail}
          onTrade={handleTrade}
          onAddToCompare={handleAddToCompareAndNavigate}
          etfList={etfNavigationList}
          currentIndex={currentIdx >= 0 ? currentIdx : 0}
          onNavigateETF={handleNavigateETF}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
        {/* FloatingChatbot 임시 숨김 */}
      </div>
    )
  }

  // Show Invest Info detail page
  if (showContentDetail && selectedContent) {
    return (
      <div className="min-h-screen bg-[#191322]">
        <InvestInfoDetailPage
          content={selectedContent}
          onBack={handleBackFromContentDetail}
          onSelectContent={handleSelectContent}
          onOpenChatbot={() => {
            setShowContentDetail(false)
            setIsChatbotOpen(true)
          }}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
        {/* FloatingChatbot 임시 숨김 */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#191322]">
      <Header onSelectETF={handleSelectETF} accountType={accountType} onStartTour={() => handleStartTour(activeTab)} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      {activeTab === 'home' && (
        <HomePage
          accountType={accountType}
          onSelectETF={handleSelectETF}
          onNavigate={handleNavigate}
          onLongPressETF={handleAddToCompare}
          onAccountTypeChange={setAccountType}
          onOpenSearch={() => setShowSearch(true)}
          onOpenQuickSearch={(tab: string) => {
            setQuickSearchTab(tab)
            setShowQuickSearch(true)
          }}
        />
      )}

      {/* 스크리닝 페이지 (기존 DiscoverPage 활용) */}
      {activeTab === 'screening' && (
        <DiscoverPage
          onSelectETF={handleSelectETF}
          accountType={accountType}
          onLongPressETF={handleAddToCompare}
        />
      )}

      {activeTab === 'compare' && (
        <ComparePage
          onSelectETF={handleSelectETF}
          initialETFs={compareETFs}
          onClearInitialETFs={handleClearCompare}
        />
      )}

      {activeTab === 'investinfo' && (
        <InvestInfoPage
          onSelectContent={handleSelectContent}
          externalChatbotOpen={isChatbotOpen}
          onExternalChatbotClose={() => setIsChatbotOpen(false)}
        />
      )}

      {/* 보유 페이지 임시 숨김 - "보유 기능 다시 보이게 해줘"로 복구
      {activeTab === 'portfolio' && (
        <PortfolioPage
          accountType={accountType}
          onSelectETF={handleSelectETF}
          onLongPressETF={handleAddToCompare}
          onAccountTypeChange={setAccountType}
        />
      )}
      */}

      {/* 비교 슬롯 UI */}
      <CompareSlot
        compareETFs={compareETFs}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onGoToCompare={handleGoToCompare}
      />

      <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />

      {/* FloatingChatbot 임시 숨김 - "챗봇 버튼 다시 보이게 해줘"로 복구
      {activeTab !== 'investinfo' && (
        <FloatingChatbot
          onSelectContent={handleChatbotContentSelect}
          onNavigateToGlossary={handleNavigateToGlossary}
          hasCompareSlot={compareETFs.length > 0}
        />
      )}
      */}

      {/* 온보딩 투어 */}
      <OnboardingTour
        steps={tourStepsByPage[tourType] || tourStepsByPage.welcome}
        isOpen={showTour}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />

      {/* 검색 페이지 */}
      <SearchPage
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectETF={(etf) => {
          setShowSearch(false)
          handleSelectETF(etf)
        }}
        compareETFs={compareETFs}
        onAddToCompare={handleAddToCompare}
        onGoToCompare={() => {
          setShowSearch(false)
          handleGoToCompare()
        }}
      />

      {/* ETF 빠른검색 페이지 */}
      <QuickSearchPage
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
        onSelectETF={(etf) => {
          setShowQuickSearch(false)
          handleSelectETF(etf)
        }}
        initialTab={quickSearchTab}
        compareETFs={compareETFs}
        onAddToCompare={handleAddToCompare}
        onGoToCompare={() => {
          setShowQuickSearch(false)
          handleGoToCompare()
        }}
      />

    </div>
  )
}

// ThemeProvider로 감싼 App
function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

export default AppWithTheme
