import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { FloatingChatbot } from './components/FloatingChatbot'
import { OnboardingTour } from './components/OnboardingTour'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ETFDetailPage } from './pages/ETFDetailPage'
import { TradePage } from './pages/TradePage'
import { PortfolioPage } from './pages/PortfolioPage'
import { ComparePage } from './pages/ComparePage'
import { InvestInfoPage } from './pages/InvestInfoPage'
import { InvestInfoDetailPage } from './pages/InvestInfoDetailPage'
import { LoginPage } from './pages/LoginPage'
import type { ETF } from './data/mockData'
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

  // 온보딩 투어 상태
  const [showTour, setShowTour] = useState(false)
  const [tourType, setTourType] = useState<string>('welcome')

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

  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
    setShowDetail(false)
    setShowTrade(false)
    setShowContentDetail(false)
    // 탭 변경 시 스크롤을 맨 위로 초기화
    window.scrollTo(0, 0)
  }

  const handleSelectContent = (content: InvestContent) => {
    setSelectedContent(content)
    setShowContentDetail(true)
  }

  const handleBackFromContentDetail = () => {
    setShowContentDetail(false)
  }

  // 챗봇에서 콘텐츠 선택 시 투자정보 상세로 이동
  const handleChatbotContentSelect = (content: InvestContent) => {
    setSelectedContent(content)
    setShowContentDetail(true)
    setActiveTab('investinfo')
  }

  // 챗봇에서 용어사전으로 이동
  const handleNavigateToGlossary = () => {
    setActiveTab('investinfo')
  }

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
        <FloatingChatbot
          onSelectContent={handleChatbotContentSelect}
          onNavigateToGlossary={handleNavigateToGlossary}
        />
      </div>
    )
  }

  // Show ETF detail page
  if (showDetail && selectedETF) {
    return (
      <div className="min-h-screen bg-[#191322]">
        <ETFDetailPage
          key={selectedETF.id}
          etf={selectedETF}
          accountType={accountType}
          onBack={handleBackFromDetail}
          onTrade={handleTrade}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
        <FloatingChatbot
          onSelectContent={handleChatbotContentSelect}
          onNavigateToGlossary={handleNavigateToGlossary}
        />
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
        <FloatingChatbot
          onSelectContent={handleChatbotContentSelect}
          onNavigateToGlossary={handleNavigateToGlossary}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#191322]">
      <Header accountType={accountType} onAccountTypeChange={setAccountType} />

      {activeTab === 'home' && (
        <HomePage
          accountType={accountType}
          onSelectETF={handleSelectETF}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'discover' && (
        <DiscoverPage onSelectETF={handleSelectETF} accountType={accountType} />
      )}

      {activeTab === 'compare' && (
        <ComparePage onSelectETF={handleSelectETF} />
      )}

      {activeTab === 'investinfo' && (
        <InvestInfoPage
          onSelectContent={handleSelectContent}
          externalChatbotOpen={isChatbotOpen}
          onExternalChatbotClose={() => setIsChatbotOpen(false)}
        />
      )}

      {activeTab === 'portfolio' && (
        <PortfolioPage
          accountType={accountType}
          onSelectETF={handleSelectETF}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />

      {/* 전역 플로팅 챗봇 (투자정보 페이지 제외 - 해당 페이지는 자체 챗봇 있음) */}
      {activeTab !== 'investinfo' && (
        <FloatingChatbot
          onSelectContent={handleChatbotContentSelect}
          onNavigateToGlossary={handleNavigateToGlossary}
        />
      )}

      {/* 온보딩 투어 */}
      <OnboardingTour
        steps={tourStepsByPage[tourType] || tourStepsByPage.welcome}
        isOpen={showTour}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />

      {/* 투어 시작 버튼 (개발/데모용) */}
      <button
        onClick={() => handleStartTour(activeTab)}
        className="fixed bottom-24 left-4 px-3 py-2 bg-[#2d2640] border border-[#3d3650] rounded-full text-xs text-gray-400 hover:text-white hover:border-[#d64f79] transition-colors z-40"
        title="이 페이지 투어 시작"
      >
        🎯 가이드
      </button>
    </div>
  )
}

export default App
