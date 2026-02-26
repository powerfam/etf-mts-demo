import { useState, useEffect } from 'react'
import {
  Search,
  TrendingUp,
  Clock,
  ChevronRight,
  MessageCircle,
  X,
  Wallet,
  Rocket,
  Coins,
  BookOpen,
  Flame,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
  ExternalLink,
  BookOpenCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  investContents,
  categoryInfo,
  getPopularContents,
  getRecentUpdates,
  type Category,
  type InvestContent,
} from '@/data/investInfoData'

// 아이콘 매핑
const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  Wallet,
  Rocket,
  Coins,
  BookOpen,
}

type MainTab = 'concepts' | 'glossary' | 'research'
type ResearchSubTab = 'weekly' | 'lineup'

// 리서치 PDF 데이터 (요약 포함)
const researchPDFs = {
  weekly: [
    { id: 'w1', title: 'ETF Weekly (26.01.05)', date: '2026.01.05', filename: '260105_Kiwoom_ETF_Weekly.pdf', summary: '신년 첫 주 글로벌 ETF 시장 동향 및 투자 전략 분석' },
    { id: 'w2', title: 'ETF Weekly (25.12.29)', date: '2025.12.29', filename: '251229_Kiwoom_ETF_Weekly.pdf', summary: '연말 결산 특집: 2025년 ETF 시장 리뷰 및 2026 전망' },
    { id: 'w3', title: 'ETF Weekly (25.12.15)', date: '2025.12.15', filename: '251215_Kiwoom_ETF_Weekly.pdf', summary: '배당 시즌 도래, 고배당 ETF 투자 포인트 정리' },
  ],
  lineup: [
    { id: 'l1', title: '뉴 ETF 라인업 (1월 2주)', date: '2026.01.10', filename: 'new_etf_26_1_2w.pdf', summary: 'AI 반도체·미국 배당 신규 ETF 상장 분석' },
    { id: 'l2', title: '뉴 ETF 라인업 (12월 4주)', date: '2025.12.27', filename: 'new_etf_25_12_4w.pdf', summary: '밸류업 지수 추종 ETF 및 커버드콜 상품 분석' },
    { id: 'l3', title: '뉴 ETF 라인업 (12월 3주)', date: '2025.12.20', filename: 'new_etf_25_12_3w.pdf', summary: '글로벌 원자력·양자컴퓨팅 테마 ETF 신규 상장' },
  ],
}

interface InvestInfoPageProps {
  onSelectContent: (content: InvestContent) => void
  externalChatbotOpen?: boolean
  onExternalChatbotClose?: () => void
}

export function InvestInfoPage({
  onSelectContent,
  externalChatbotOpen,
  onExternalChatbotClose,
}: InvestInfoPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [mainTab, setMainTab] = useState<MainTab>('concepts')
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [showChatbot, setShowChatbot] = useState(true) // 챗봇 표시 여부
  const [researchSubTab, setResearchSubTab] = useState<ResearchSubTab>('weekly')
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null)

  // 외부에서 챗봇 열기 요청 처리
  useEffect(() => {
    if (externalChatbotOpen) {
      setIsChatbotOpen(true)
      onExternalChatbotClose?.()
    }
  }, [externalChatbotOpen, onExternalChatbotClose])

  const popularContents = getPopularContents()
  const recentUpdates = getRecentUpdates()

  // 메인 탭에 따른 카테고리 필터
  const conceptCategories: Category[] = ['basic', 'account', 'strategy', 'tax']
  const glossaryCategories: Category[] = ['glossary']

  const currentCategories = mainTab === 'concepts' ? conceptCategories : glossaryCategories
  const categories = currentCategories.map(key => [key, categoryInfo[key]] as [Category, typeof categoryInfo[Category]])

  // 검색 및 필터링
  const filteredContents = investContents.filter((content) => {
    // 메인 탭 필터
    const matchesMainTab = mainTab === 'concepts'
      ? conceptCategories.includes(content.category)
      : glossaryCategories.includes(content.category)

    const matchesSearch =
      searchQuery === '' ||
      content.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.summary.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      content.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory

    return matchesMainTab && matchesSearch && matchesCategory
  })

  // 탭 변경 시 카테고리 초기화
  const handleTabChange = (tab: MainTab) => {
    setMainTab(tab)
    setSelectedCategory('all')
    setSearchQuery('')
  }

  return (
    <div className="relative h-full">
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-4 py-4 pb-24 space-y-5">
          {/* 헤더 */}
          <div>
            <h1 className="text-[23px] font-bold text-white">ETF All In One</h1>
            <p className="text-gray-500 text-[16px]">ETF 정보의 모든 것</p>
          </div>

          {/* 메인 탭 */}
          <div className="flex bg-[#2d2640] rounded-lg p-1" data-tour="etf-101">
            <button
              onClick={() => handleTabChange('concepts')}
              className={`flex-1 py-2 px-3 rounded-md text-[17px] font-medium transition-all ${
                mainTab === 'concepts'
                  ? 'bg-[#d64f79] text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ETF 101
            </button>
            <button
              onClick={() => handleTabChange('glossary')}
              className={`flex-1 py-2 px-3 rounded-md text-[17px] font-medium transition-all ${
                mainTab === 'glossary'
                  ? 'bg-[#d64f79] text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              data-tour="glossary"
            >
              용어사전
            </button>
            <button
              onClick={() => handleTabChange('research')}
              className={`flex-1 py-2 px-3 rounded-md text-[17px] font-medium transition-all ${
                mainTab === 'research'
                  ? 'bg-[#d64f79] text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              data-tour="research"
            >
              리서치
            </button>
          </div>

          {/* 검색바 (리서치 탭 제외) */}
          {mainTab !== 'research' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#2d2640] border border-[#3d3650] rounded-lg text-[17px] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d64f79]/50 transition-all"
              />
            </div>
          )}

          {/* 카테고리 (기초 개념 탭에서만 표시) */}
          {mainTab === 'concepts' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {categories.map(([key, info]) => {
                const Icon = iconMap[info.icon] || TrendingUp
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[16px] font-medium transition-all ${
                      selectedCategory === key
                        ? 'bg-[#d64f79] text-white'
                        : 'bg-[#2d2640] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${selectedCategory === key ? '' : 'text-gray-500'}`} />
                    <span>{info.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* 용어사전 탭 헤더 */}
          {mainTab === 'glossary' && (
            <div className="bg-[#2d2640] border border-[#3d3650] rounded-lg p-3">
              <p className="text-[17px] text-gray-300 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#d64f79]" />
                ETF 전문용어를 쉽게 설명합니다
              </p>
            </div>
          )}

          {/* 리서치 탭 콘텐츠 */}
          {mainTab === 'research' && (
            <>
              {/* PDF 뷰어 모드 */}
              {selectedPDF ? (
                <div className="space-y-3">
                  {/* 뒤로가기 버튼 */}
                  <button
                    onClick={() => setSelectedPDF(null)}
                    className="flex items-center gap-2 text-[17px] text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    목록으로
                  </button>

                  {/* PDF 뷰어 - Google Docs Viewer 사용 */}
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-white">
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(`https://etf-mts-demo.vercel.app/pdf/${selectedPDF}`)}&embedded=true`}
                        className="w-full border-0"
                        style={{
                          height: 'calc(100vh - 220px)',
                          minHeight: '600px',
                          maxHeight: '900px'
                        }}
                        title="PDF Viewer"
                        allow="fullscreen"
                      />
                    </div>
                  </div>

                  {/* 페이지 안내 */}
                  <p className="text-[15px] text-gray-500 text-center">
                    PDF 뷰어에서 페이지 넘김, 확대/축소가 가능합니다
                  </p>

                  {/* 하단 액션 버튼 */}
                  <div className="flex gap-2">
                    <a
                      href={`https://etf-mts-demo.vercel.app/pdf/${selectedPDF}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2d2640] border border-[#3d3650] rounded-lg text-[17px] text-gray-300 hover:bg-[#3d3650] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      새 탭에서 열기
                    </a>
                    <a
                      href={`https://etf-mts-demo.vercel.app/pdf/${selectedPDF}`}
                      download
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#d64f79] rounded-lg text-[17px] text-white hover:bg-[#b33d5f] transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      다운로드
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {/* 리서치 서브탭 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResearchSubTab('weekly')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-[17px] font-medium transition-all ${
                        researchSubTab === 'weekly'
                          ? 'bg-[#d64f79] text-white'
                          : 'bg-[#2d2640] text-gray-400 hover:text-gray-200 border border-[#3d3650]'
                      }`}
                    >
                      ETF Weekly
                    </button>
                    <button
                      onClick={() => setResearchSubTab('lineup')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-[17px] font-medium transition-all ${
                        researchSubTab === 'lineup'
                          ? 'bg-[#d64f79] text-white'
                          : 'bg-[#2d2640] text-gray-400 hover:text-gray-200 border border-[#3d3650]'
                      }`}
                    >
                      뉴 라인업
                    </button>
                  </div>

                  {/* 리서치 헤더 */}
                  <div className="bg-[#2d2640] border border-[#3d3650] rounded-lg p-3">
                    <p className="text-[17px] text-gray-300 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#d64f79]" />
                      {researchSubTab === 'weekly'
                        ? '키움증권 ETF 주간 리서치 보고서'
                        : '신규 상장 ETF 라인업 분석'}
                    </p>
                  </div>

                  {/* PDF 목록 */}
                  <div className="space-y-3">
                    {researchPDFs[researchSubTab].map((pdf) => (
                      <button
                        key={pdf.id}
                        onClick={() => setSelectedPDF(pdf.filename)}
                        className="w-full bg-[#2d2640] border border-[#3d3650] rounded-xl p-4 hover:border-[#d64f79]/50 hover:bg-[#352d48] transition-all active:scale-[0.99] text-left"
                      >
                        <div className="flex items-start gap-3">
                          {/* PDF 아이콘 */}
                          <div className="flex-shrink-0 w-12 h-14 bg-gradient-to-br from-[#d64f79] to-[#b33d5f] rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>

                          {/* PDF 정보 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[17px] font-medium text-white mb-1">
                              {pdf.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[15px] text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {pdf.date}
                            </div>
                            <p className="text-[15px] text-gray-300 mt-1.5 line-clamp-1">
                              {pdf.summary}
                            </p>
                          </div>

                          {/* 읽기 아이콘 */}
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#d64f79]/20 mt-1">
                            <BookOpenCheck className="h-4 w-4 text-[#d64f79]" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* 검색/필터 결과 (리서치 탭 제외) */}
          {mainTab !== 'research' && (searchQuery || selectedCategory !== 'all') ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[17px] text-gray-400">
                  {filteredContents.length}건의 결과
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchQuery('')
                  }}
                  className="text-[16px] text-[#d64f79]"
                >
                  초기화
                </button>
              </div>
              {filteredContents.length > 0 ? (
                <div className="space-y-2">
                  {filteredContents.map((content) => (
                    <SimpleCard
                      key={content.id}
                      content={content}
                      onClick={() => onSelectContent(content)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500 text-[17px]">검색 결과가 없습니다</p>
                </div>
              )}
            </div>
          ) : mainTab !== 'research' && mainTab === 'glossary' ? (
            // 용어사전 그리드
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredContents.map((content) => (
                <GlossaryMiniCard
                  key={content.id}
                  content={content}
                  onClick={() => onSelectContent(content)}
                />
              ))}
            </div>
          ) : mainTab !== 'research' ? (
            <>
              {/* 인기 질문 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#d64f79]" />
                  <h2 className="text-[18px] font-semibold text-white">인기 질문</h2>
                </div>
                <div className="space-y-2">
                  {popularContents
                    .filter(c => conceptCategories.includes(c.category))
                    .map((content, index) => (
                    <RankCard
                      key={content.id}
                      content={content}
                      rank={index + 1}
                      onClick={() => onSelectContent(content)}
                    />
                  ))}
                </div>
              </section>

              {/* 최신 업데이트 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#d64f79]" />
                  <h2 className="text-[18px] font-semibold text-white">최신 업데이트</h2>
                </div>
                <div className="space-y-2">
                  {recentUpdates
                    .filter(c => conceptCategories.includes(c.category))
                    .slice(0, 3)
                    .map((content) => (
                    <SimpleCard
                      key={content.id}
                      content={content}
                      onClick={() => onSelectContent(content)}
                      showDate
                    />
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </ScrollArea>

      {/* 플로팅 챗봇 버튼 */}
      {showChatbot && !isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#d64f79] to-[#8B5CF6] rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
          data-tour="chatbot"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}

      {/* 바텀시트 챗봇 */}
      {isChatbotOpen && (
        <>
          {/* 배경 딤 처리 */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsChatbotOpen(false)}
          />

          {/* 바텀시트 */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#191322] rounded-t-3xl z-50 max-h-[70vh] animate-slide-up">
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[#2d2640]">
              <div>
                <h3 className="text-white font-semibold">ETF 무엇이든 물어보세요</h3>
                <p className="text-gray-500 text-[15px]">자주 묻는 질문을 선택하세요</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowChatbot(false)
                    setIsChatbotOpen(false)
                  }}
                  className="text-[15px] text-gray-500 hover:text-gray-300"
                >
                  숨기기
                </button>
                <button
                  onClick={() => setIsChatbotOpen(false)}
                  className="p-1 hover:bg-[#2d2640] rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 의도 기반 빠른 선택 */}
            <div className="p-4 space-y-3">
              {/* 인텐트 버튼들 */}
              <div className="grid grid-cols-2 gap-2">
                <IntentButton
                  icon={Rocket}
                  title="ETF 처음이에요"
                  subtitle="기초부터 차근차근"
                  color="#3B82F6"
                  onClick={() => {
                    const content = investContents.find(c => c.id === 'what-is-etf')
                    if (content) {
                      onSelectContent(content)
                      setIsChatbotOpen(false)
                    }
                  }}
                />
                <IntentButton
                  icon={Wallet}
                  title="계좌 만들고 싶어요"
                  subtitle="ISA, 연금저축, IRP"
                  color="#10B981"
                  onClick={() => {
                    const content = investContents.find(c => c.id === 'account-types')
                    if (content) {
                      onSelectContent(content)
                      setIsChatbotOpen(false)
                    }
                  }}
                />
                <IntentButton
                  icon={Coins}
                  title="세금이 궁금해요"
                  subtitle="ETF 세금 총정리"
                  color="#EF4444"
                  onClick={() => {
                    const content = investContents.find(c => c.id === 'etf-tax-guide')
                    if (content) {
                      onSelectContent(content)
                      setIsChatbotOpen(false)
                    }
                  }}
                />
                <IntentButton
                  icon={BookOpen}
                  title="용어가 헷갈려요"
                  subtitle="NAV, AP, LP 등"
                  color="#8B5CF6"
                  onClick={() => {
                    handleTabChange('glossary')
                    setIsChatbotOpen(false)
                  }}
                />
              </div>

              {/* 구분선 */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#3d3650]" />
                <span className="text-[15px] text-gray-500">자주 묻는 질문</span>
                <div className="flex-1 h-px bg-[#3d3650]" />
              </div>

              {/* 인기 질문 TOP 5 */}
              <div className="space-y-2">
                {popularContents.slice(0, 5).map((content, idx) => (
                  <button
                    key={content.id}
                    onClick={() => {
                      onSelectContent(content)
                      setIsChatbotOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#2d2640] hover:bg-[#3d3650] rounded-lg transition-all text-left"
                  >
                    <span className="text-[15px] text-gray-500 w-4">{idx + 1}</span>
                    <span className="text-[17px] text-gray-200 flex-1 line-clamp-1">
                      {content.question}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 챗봇 다시 표시 버튼 (숨긴 경우) */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-24 right-4 px-3 py-2 bg-[#2d2640] border border-[#3d3650] rounded-full text-[15px] text-gray-400 hover:text-white transition-colors z-50"
        >
          💬 도움말
        </button>
      )}
    </div>
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
      <span className="text-[17px] font-medium text-white">{title}</span>
      <span className="text-[14px] text-gray-500">{subtitle}</span>
    </button>
  )
}

// 순위 카드 (인기 질문용)
function RankCard({
  content,
  rank,
  onClick,
}: {
  content: InvestContent
  rank: number
  onClick: () => void
}) {
  const category = categoryInfo[content.category]
  const Icon = iconMap[category.icon] || TrendingUp

  return (
    <Card
      className="bg-[#2d2640]/80 border-[#3d3650]/50 hover:bg-[#2d2640] transition-all cursor-pointer active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* 순위 */}
          <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[15px] font-bold bg-[#3d3650] text-gray-400">
            {rank}
          </span>

          {/* 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <p className="text-[16px] text-white font-medium line-clamp-1">
              {content.question}
            </p>
            <p className="text-[14px] text-gray-500 mt-0.5 flex items-center gap-1">
              <Icon className="h-3 w-3 text-gray-500" />
              {category.label}
            </p>
          </div>

          <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-600" />
        </div>
      </CardContent>
    </Card>
  )
}

// 심플 카드 (검색결과, 최신 업데이트용)
function SimpleCard({
  content,
  onClick,
  showDate = false,
}: {
  content: InvestContent
  onClick: () => void
  showDate?: boolean
}) {
  const category = categoryInfo[content.category]
  const Icon = iconMap[category.icon] || TrendingUp

  return (
    <Card
      className="bg-[#2d2640]/80 border-[#3d3650]/50 hover:bg-[#2d2640] transition-all cursor-pointer active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* 카테고리 아이콘 */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#3d3650]">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <p className="text-[16px] text-white font-medium line-clamp-2 leading-snug">
              {content.question}
            </p>
            <p className="text-[15px] text-gray-500 mt-1 line-clamp-1">
              {content.summary[0]}
            </p>
            {showDate && (
              <p className="text-[14px] text-gray-600 mt-1">
                {content.updatedAt} 업데이트
              </p>
            )}
          </div>

          <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-600 mt-1" />
        </div>
      </CardContent>
    </Card>
  )
}

// 용어사전 미니 카드 (그리드용)
function GlossaryMiniCard({
  content,
  onClick,
}: {
  content: InvestContent
  onClick: () => void
}) {
  // 용어 설명 추출 (첫 번째 summary에서 = 이후 부분)
  const description = content.summary[0]?.split(',')[0]?.replace(/.*=\s*/, '') || ''
  // 한글 용어명 추출 (question에서 괄호 안 내용)
  const koreanTermMatch = content.question.match(/\(([^)]+)\)/)
  const koreanTerm = koreanTermMatch ? koreanTermMatch[1] : ''

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-[#2d2640] border border-[#3d3650] rounded-xl hover:border-[#d64f79]/50 hover:bg-[#352d48] transition-all active:scale-[0.97] min-h-[100px]"
    >
      {/* 용어 (영문 약어) */}
      <span className="text-[21px] font-bold text-[#d64f79]">
        {content.title}
      </span>
      {/* 한글 용어명 */}
      {koreanTerm && (
        <span className="text-[14px] text-gray-300 mb-1">
          {koreanTerm}
        </span>
      )}
      {/* 한글 설명 */}
      <span className="text-[14px] text-gray-500 text-center line-clamp-2">
        {description}
      </span>
    </button>
  )
}
