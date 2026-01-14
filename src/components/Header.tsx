import { useState } from 'react'
import { Search, Bell, Menu, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface HeaderProps {
  accountType: string
  onAccountTypeChange: (value: string) => void
}

// 제품소개서 섹션 컴포넌트
function ProductInfoSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#2d2640] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="pb-4 text-sm text-gray-300">{children}</div>}
    </div>
  )
}

export function Header({ accountType, onAccountTypeChange }: HeaderProps) {
  const [showProductInfo, setShowProductInfo] = useState(false)

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[#2d2640] bg-[#191322]/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">ETF</h1>
        </div>

        {/* Account Context Toggle */}
        <ToggleGroup
          type="single"
          value={accountType}
          onValueChange={(value) => value && onAccountTypeChange(value)}
          className="hidden sm:flex"
          data-tour="account-toggle"
        >
          <ToggleGroupItem value="general" className="text-xs">
            일반
          </ToggleGroupItem>
          <ToggleGroupItem value="pension" className="text-xs">
            연금
          </ToggleGroupItem>
          <ToggleGroupItem value="isa" className="text-xs">
            ISA
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#d64f79]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProductInfo(true)}
            title="제품 소개서"
            data-tour="product-info"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Account Toggle */}
      <div className="flex justify-center pb-2 sm:hidden">
        <ToggleGroup
          type="single"
          value={accountType}
          onValueChange={(value) => value && onAccountTypeChange(value)}
          data-tour="account-toggle-mobile"
        >
          <ToggleGroupItem value="general" className="text-xs">
            일반
          </ToggleGroupItem>
          <ToggleGroupItem value="pension" className="text-xs">
            연금
          </ToggleGroupItem>
          <ToggleGroupItem value="isa" className="text-xs">
            ISA
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>

    {/* 제품소개서 모달 */}
    <Dialog open={showProductInfo} onOpenChange={setShowProductInfo}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1f1a2e] border-[#2d2640]">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            ETF MTS Demo
            <span className="text-xs bg-[#d64f79]/20 text-[#d64f79] px-2 py-0.5 rounded-full">
              제품 소개
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* 핵심 가치 */}
          <div className="bg-[#2a2438] rounded-lg p-4 text-center">
            <p className="text-[#d64f79] font-bold text-lg mb-1">"ETF 투자, 더 쉽고 안전하게"</p>
            <p className="text-gray-400 text-sm">투명한 정보 + 쉬운 검증 + 안전한 투자</p>
          </div>

          {/* 왜 필요한가 */}
          <ProductInfoSection title="왜 이 서비스가 필요한가?" defaultOpen={true}>
            <div className="space-y-3">
              <p className="text-gray-400 text-xs mb-2">개인 투자자의 고민</p>
              <ul className="space-y-1.5 text-sm">
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
              <p className="text-gray-500 text-xs mt-3 italic">
                * 실제 투자자 커뮤니티 및 교육 콘텐츠 댓글 분석 기반
              </p>
            </div>
          </ProductInfoSection>

          {/* 고객 가치 */}
          <ProductInfoSection title="고객이 얻는 가치">
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium mb-1">1. 한눈에 보는 ETF 건전성</p>
                <p className="text-gray-400 text-xs">복잡한 지표를 0~100점 단일 점수로 이해</p>
                <p className="text-gray-400 text-xs">괴리율, 스프레드, TER, 거래대금 한눈에</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">2. 계좌 맞춤형 안전장치</p>
                <p className="text-gray-400 text-xs">연금계좌: 레버리지/인버스 자동 필터링</p>
                <p className="text-gray-400 text-xs">계좌별 예상 세금 자동 계산 (5.5%/9.9%/15.4%)</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">3. 쉬운 비교, 빠른 결정</p>
                <p className="text-gray-400 text-xs">최대 3개 ETF 동시 비교</p>
                <p className="text-gray-400 text-xs">데이터 기반 선택, 비교 시간 90% 단축</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">4. 투자 교육 통합</p>
                <p className="text-gray-400 text-xs">ETF 101, 용어사전, AI 챗봇</p>
                <p className="text-gray-400 text-xs">학습과 투자를 한 앱에서</p>
              </div>
            </div>
          </ProductInfoSection>

          {/* 회사 기대효과 */}
          <ProductInfoSection title="회사가 얻는 기대효과">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
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
              <div className="text-xs space-y-1 mt-2">
                <p><span className="text-white">투자자 보호:</span> <span className="text-gray-400">부적합 상품 투자 방지 → 민원 감소</span></p>
                <p><span className="text-white">정보 투명성:</span> <span className="text-gray-400">건전성 지표 공개 → 신뢰도 향상</span></p>
                <p><span className="text-white">규제 대응:</span> <span className="text-gray-400">적합성 자동 필터 → 컴플라이언스 강화</span></p>
              </div>
            </div>
          </ProductInfoSection>

          {/* 콘텐츠 기획 */}
          <ProductInfoSection title="투자정보 콘텐츠 기획 배경">
            <div className="space-y-2 text-xs">
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
            <div className="grid grid-cols-2 gap-2 text-xs">
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
                <p className="text-gray-400">최대 3개 ETF 비교</p>
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
            <div className="flex justify-center gap-4 text-xs text-gray-400">
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
