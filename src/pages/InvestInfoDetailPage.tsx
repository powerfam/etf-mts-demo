import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  Share2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  Check,
  TrendingUp,
  Wallet,
  Rocket,
  Coins,
  BookOpen,
  MessageCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  categoryInfo,
  getRelatedContents,
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

interface InvestInfoDetailPageProps {
  content: InvestContent
  onBack: () => void
  onSelectContent: (content: InvestContent) => void
  onOpenChatbot?: () => void
}

export function InvestInfoDetailPage({
  content,
  onBack,
  onSelectContent,
  onOpenChatbot,
}: InvestInfoDetailPageProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [showFloatingBtn, setShowFloatingBtn] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  // 콘텐츠 변경 시 스크롤 상단으로 이동
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    setFeedback(null) // 피드백도 초기화
    setShowFloatingBtn(true)
  }, [content.id])

  // 스크롤 방향 감지
  const handleScroll = useCallback(() => {
    const currentScrollY = scrollRef.current?.scrollTop || 0

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      // 아래로 스크롤 → 숨김
      setShowFloatingBtn(false)
    } else {
      // 위로 스크롤 → 표시
      setShowFloatingBtn(true)
    }

    lastScrollY.current = currentScrollY
  }, [])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const category = categoryInfo[content.category]
  const relatedContents = getRelatedContents(content.id)
  const CategoryIcon = iconMap[category.icon] || TrendingUp

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${content.question}\n\n${content.summary.join('\n')}\n\n#ETF투자정보`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      console.log('클립보드 복사 실패')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}천`
    return num.toString()
  }

  // 마크다운을 간단히 HTML로 변환
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => {
        // 헤더
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-[21px] font-bold text-white mt-6 mb-3">
              {line.replace('## ', '')}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-[19px] font-semibold text-white mt-4 mb-2">
              {line.replace('### ', '')}
            </h3>
          )
        }
        if (line.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-[17px] font-semibold text-white mt-3 mb-2">
              {line.replace('#### ', '')}
            </h4>
          )
        }

        // 인용문
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-[#d64f79] pl-4 py-2 my-3 bg-[#d64f79]/10 rounded-r-lg text-gray-300 text-[17px]"
            >
              {line.replace('> ', '')}
            </blockquote>
          )
        }

        // 코드 블록 시작/끝
        if (line.startsWith('```')) {
          return null
        }

        // 테이블 (간단 처리)
        if (line.startsWith('|')) {
          const cells = line.split('|').filter((c) => c.trim())
          const isHeader = line.includes('---')
          if (isHeader) return null
          return (
            <div
              key={idx}
              className={`grid gap-2 py-2 px-3 text-[17px] ${
                idx === 0 ? 'bg-[#3d3650] rounded-t-lg font-medium' : 'border-b border-[#3d3650]'
              }`}
              style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
            >
              {cells.map((cell, cellIdx) => (
                <span key={cellIdx} className="text-gray-300">
                  {cell.trim()}
                </span>
              ))}
            </div>
          )
        }

        // 빈 줄
        if (!line.trim()) {
          return <div key={idx} className="h-2" />
        }

        // 일반 텍스트 (볼드, 이탤릭 처리)
        const processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-[#d64f79]">$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-[#3d3650] px-1.5 py-0.5 rounded text-[#d64f79] text-[17px]">$1</code>')

        return (
          <p
            key={idx}
            className="text-gray-300 text-[17px] leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        )
      })
      .filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-[#191322]">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 bg-[#191322]/95 backdrop-blur border-b border-[#2d2640]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[17px]">목록으로</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-[#2d2640] rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Share2 className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* 카테고리 배지 + 질문 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-[15px] border-0 flex items-center gap-1 bg-[#d64f79]/20 text-[#d64f79]"
              >
                <CategoryIcon className="h-3 w-3" />
                {category.label}
              </Badge>
            </div>
            <h1 className="text-[21px] font-bold text-white leading-tight">
              {content.question}
            </h1>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide"
      >
        <div className="px-4 py-4 pb-32 space-y-4">
          {/* 3줄 요약 (펼치기/접기) */}
          <Card className="bg-gradient-to-br from-[#2d2640] to-[#251d35] border-[#3d3650]">
            <CardContent className="p-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between mb-2"
              >
                <h2 className="text-[17px] font-semibold text-[#d64f79]">핵심 요약</h2>
                <ChevronRight
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    expanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expanded && (
                <ul className="space-y-2">
                  {content.summary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[17px]">
                      <span className="text-[#d64f79] mt-0.5 font-bold">{idx + 1}</span>
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* 본문 */}
          <Card className="bg-[#2d2640] border-[#3d3650]">
            <CardContent className="p-4">{renderMarkdown(content.body)}</CardContent>
          </Card>

          {/* 오해가 생긴 이유 */}
          {content.misunderstandingReason && (
            <Card className="bg-[#2d2640] border-[#3d3650]">
              <CardContent className="p-4">
                <h3 className="flex items-center gap-2 text-[17px] font-semibold text-yellow-500 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  오해가 생긴 이유
                </h3>
                <p className="text-gray-300 text-[17px] leading-relaxed">
                  {content.misunderstandingReason}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 출처 및 관련 링크 */}
          <Card className="bg-[#2d2640] border-[#3d3650]">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-[17px] font-semibold text-white flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-[#d64f79]" />
                출처 및 참고자료
              </h3>
              <div className="space-y-2">
                {content.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[17px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    {source.name}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 업데이트 정보 & 면책 */}
          <Card className="bg-[#1f1a2e] border-[#2d2640]">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-[15px] text-gray-400">
                <Clock className="h-3 w-3" />
                <span>최종 업데이트: {content.updatedAt}</span>
              </div>
              <div className="flex items-center gap-2 text-[15px] text-gray-400">
                <Eye className="h-3 w-3" />
                <span>조회 {formatNumber(content.viewCount)}</span>
                <span className="mx-1">•</span>
                <ThumbsUp className="h-3 w-3" />
                <span>도움됨 {formatNumber(content.helpfulCount)}</span>
              </div>
              <p className="text-[15px] text-gray-500 mt-2 leading-relaxed">
                {content.legalDisclaimer}
              </p>
            </CardContent>
          </Card>

          {/* 피드백 버튼 */}
          <Card className="bg-[#2d2640] border-[#3d3650]">
            <CardContent className="p-4">
              <p className="text-[17px] text-gray-300 mb-3 text-center">
                이 콘텐츠가 도움이 되었나요?
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    feedback === 'helpful'
                      ? 'bg-green-600 hover:bg-green-700 border-green-600'
                      : 'border-[#3d3650] text-gray-400 hover:text-white hover:border-green-600'
                  }`}
                  onClick={() => setFeedback('helpful')}
                >
                  <ThumbsUp className="h-4 w-4" />
                  도움됨
                </Button>
                <Button
                  variant={feedback === 'not-helpful' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    feedback === 'not-helpful'
                      ? 'bg-red-600 hover:bg-red-700 border-red-600'
                      : 'border-[#3d3650] text-gray-400 hover:text-white hover:border-red-600'
                  }`}
                  onClick={() => setFeedback('not-helpful')}
                >
                  <ThumbsDown className="h-4 w-4" />
                  아쉬워요
                </Button>
              </div>
              {feedback && (
                <p className="text-[15px] text-center text-gray-500 mt-3">
                  소중한 피드백 감사합니다!
                </p>
              )}
            </CardContent>
          </Card>

          {/* 관련 콘텐츠 */}
          {relatedContents.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[17px] font-semibold text-white">관련 콘텐츠</h3>
              <div className="space-y-2">
                {relatedContents.map((related) => {
                  const relCategory = categoryInfo[related.category]
                  const RelIcon = iconMap[relCategory.icon] || TrendingUp
                  return (
                    <Card
                      key={related.id}
                      className="bg-[#2d2640] border-[#3d3650] hover:border-[#d64f79]/50 transition-all cursor-pointer active:scale-[0.99]"
                      onClick={() => onSelectContent(related)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className="text-[14px] border-0 px-1.5 py-0 flex items-center gap-1 bg-[#d64f79]/20 text-[#d64f79]"
                          >
                            <RelIcon className="h-2.5 w-2.5" />
                            {relCategory.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[17px] text-gray-200 line-clamp-1">
                            {related.question}
                          </p>
                          <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="text-[15px] px-3 py-1.5 bg-[#2d2640] text-gray-400 rounded-full border border-[#3d3650]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 플로팅 챗봇 버튼 - 스크롤 방향에 따라 표시/숨김 */}
      {onOpenChatbot && (
        <button
          onClick={onOpenChatbot}
          className={`fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#d64f79] to-[#8B5CF6] rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
            showFloatingBtn
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}
    </div>
  )
}
