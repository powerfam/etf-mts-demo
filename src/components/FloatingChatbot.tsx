import { useState } from 'react'
import {
  MessageCircle,
  X,
  ChevronRight,
  Wallet,
  Rocket,
  Coins,
  BookOpen,
  Search,
} from 'lucide-react'
import {
  investContents,
  categoryInfo,
  getPopularContents,
  type InvestContent,
} from '@/data/investInfoData'

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  Rocket,
  Coins,
  BookOpen,
}

interface FloatingChatbotProps {
  onSelectContent: (content: InvestContent) => void
  onNavigateToGlossary: () => void
}

export function FloatingChatbot({ onSelectContent, onNavigateToGlossary }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showChatbot, setShowChatbot] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const popularContents = getPopularContents()

  // 검색 결과
  const searchResults = searchQuery.trim()
    ? investContents.filter((content) =>
        content.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.summary.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        content.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : []

  const handleContentClick = (content: InvestContent) => {
    onSelectContent(content)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      {showChatbot && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#d64f79] to-[#8B5CF6] rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}

      {/* 바텀시트 */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setIsOpen(false)
              setSearchQuery('')
            }}
          />

          <div className="fixed bottom-0 left-0 right-0 bg-[#191322] rounded-t-3xl z-50 max-h-[75vh] animate-slide-up">
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[#2d2640]">
              <div>
                <h3 className="text-white font-semibold">ETF 무엇이든 물어보세요</h3>
                <p className="text-gray-500 text-xs">검색하거나 자주 묻는 질문을 선택하세요</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowChatbot(false)
                    setIsOpen(false)
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  숨기기
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-1 hover:bg-[#2d2640] rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 검색창 */}
            <div className="px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="ETF, 세금, 계좌, 용어 등 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#2d2640] border border-[#3d3650] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d64f79]/50 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              {/* 검색 결과 */}
              {searchQuery.trim() ? (
                <div className="space-y-2">
                  {searchResults.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-500">{searchResults.length}건의 검색 결과</p>
                      {searchResults.map((content) => {
                        const category = categoryInfo[content.category]
                        return (
                          <button
                            key={content.id}
                            onClick={() => handleContentClick(content)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#2d2640] hover:bg-[#3d3650] rounded-lg transition-all text-left"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3d3650]">
                              {(() => {
                                const Icon = iconMap[category.icon] || BookOpen
                                return <Icon className="h-4 w-4 text-gray-400" />
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-200 line-clamp-1 block">
                                {content.question}
                              </span>
                              <span className="text-[10px] text-gray-500">{category.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          </button>
                        )
                      })}
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>
                      <p className="text-gray-600 text-xs mt-1">다른 키워드로 검색해보세요</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* 인텐트 버튼들 */}
                  <div className="grid grid-cols-2 gap-2">
                    <IntentButton
                      icon={Rocket}
                      title="ETF 처음이에요"
                      subtitle="기초부터 차근차근"
                      color="#3B82F6"
                      onClick={() => {
                        const content = investContents.find(c => c.id === 'what-is-etf')
                        if (content) handleContentClick(content)
                      }}
                    />
                    <IntentButton
                      icon={Wallet}
                      title="계좌 만들고 싶어요"
                      subtitle="ISA, 연금저축, IRP"
                      color="#10B981"
                      onClick={() => {
                        const content = investContents.find(c => c.id === 'account-types')
                        if (content) handleContentClick(content)
                      }}
                    />
                    <IntentButton
                      icon={Coins}
                      title="세금이 궁금해요"
                      subtitle="ETF 세금 총정리"
                      color="#EF4444"
                      onClick={() => {
                        const content = investContents.find(c => c.id === 'etf-tax-guide')
                        if (content) handleContentClick(content)
                      }}
                    />
                    <IntentButton
                      icon={BookOpen}
                      title="용어가 헷갈려요"
                      subtitle="NAV, AP, LP 등"
                      color="#8B5CF6"
                      onClick={() => {
                        onNavigateToGlossary()
                        setIsOpen(false)
                      }}
                    />
                  </div>

                  {/* 구분선 */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-[#3d3650]" />
                    <span className="text-xs text-gray-500">자주 묻는 질문</span>
                    <div className="flex-1 h-px bg-[#3d3650]" />
                  </div>

                  {/* 인기 질문 TOP 5 */}
                  <div className="space-y-2">
                    {popularContents.slice(0, 5).map((content, idx) => (
                      <button
                        key={content.id}
                        onClick={() => handleContentClick(content)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#2d2640] hover:bg-[#3d3650] rounded-lg transition-all text-left"
                      >
                        <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
                        <span className="text-sm text-gray-200 flex-1 line-clamp-1">
                          {content.question}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 다시 표시 버튼 */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-24 right-4 px-3 py-2 bg-[#2d2640] border border-[#3d3650] rounded-full text-xs text-gray-400 hover:text-white transition-colors z-50"
        >
          ETF 도움말
        </button>
      )}
    </>
  )
}

// 의도 기반 버튼
function IntentButton({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[#3d3650] hover:border-opacity-50 transition-all active:scale-[0.98]"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
    >
      <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-sm font-medium text-white">{title}</span>
      <span className="text-[11px] text-gray-500">{subtitle}</span>
    </button>
  )
}
