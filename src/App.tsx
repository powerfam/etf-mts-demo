import { useState } from 'react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ETFDetailPage } from './pages/ETFDetailPage'
import { TradePage } from './pages/TradePage'
import { PortfolioPage } from './pages/PortfolioPage'
import { ComparePage } from './pages/ComparePage'
import { InvestInfoPage } from './pages/InvestInfoPage'
import { InvestInfoDetailPage } from './pages/InvestInfoDetailPage'
import type { ETF } from './data/mockData'
import type { InvestContent } from './data/investInfoData'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [accountType, setAccountType] = useState('general')
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showTrade, setShowTrade] = useState(false)
  const [selectedContent, setSelectedContent] = useState<InvestContent | null>(null)
  const [showContentDetail, setShowContentDetail] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

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
  }

  const handleSelectContent = (content: InvestContent) => {
    setSelectedContent(content)
    setShowContentDetail(true)
  }

  const handleBackFromContentDetail = () => {
    setShowContentDetail(false)
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
        <DiscoverPage onSelectETF={handleSelectETF} />
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
    </div>
  )
}

export default App
