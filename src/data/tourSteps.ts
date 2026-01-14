import type { TourStep } from '../components/OnboardingTour'

// 홈 화면 투어
export const homeTourSteps: TourStep[] = [
  {
    target: '[data-tour="account-toggle"]',
    title: '계좌 선택',
    content: '일반/연금/ISA 계좌를 선택하세요. 계좌 유형에 따라 세금 정보와 적합 상품이 달라집니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="portfolio-summary"]',
    title: '포트폴리오 요약',
    content: '선택한 계좌의 총 평가금액과 수익률을 한눈에 확인할 수 있습니다. 계좌별 세율도 표시됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="category-buttons"]',
    title: '목적별 탐색',
    content: '시장대표, 글로벌, 배당, 채권, 통화, 원자재, 레버리지, 연금 등 투자 목적에 맞는 ETF를 빠르게 찾아보세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="popular-etf"]',
    title: '실시간 인기 ETF',
    content: '거래대금 기준 TOP 5 인기 ETF입니다. 물결처럼 흐르는 실시간 티커 형태로 표시됩니다. 클릭하면 상세 정보를 볼 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="heatmap"]',
    title: '주간 테마 히트맵',
    content: 'AI/반도체, 배당, 채권 등 12개 테마별 주간 수익률을 색상으로 표시합니다. 빨강=상승, 파랑=하락. 레버리지/인버스는 제외됩니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="top-gainers"]',
    title: '오늘의 수익률 상위',
    content: '레버리지/인버스를 제외한 오늘 수익률 TOP 5 종목입니다. 시장의 강세 테마를 빠르게 파악하세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="top-losers"]',
    title: '오늘의 수익률 하위',
    content: '오늘 가장 많이 하락한 TOP 5 종목입니다. 저점 매수 기회를 찾거나 시장 약세 테마를 확인하세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="market-status"]',
    title: '시장 현황',
    content: 'KOSPI, KOSDAQ, S&P500, NASDAQ, 니케이225, 항셍지수, 환율, 국채 등 주요 지수를 한눈에 확인하세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="quick-links"]',
    title: '빠른 이동',
    content: 'ETF 탐색하기와 ETF 101 학습 콘텐츠로 바로 이동할 수 있습니다.',
    placement: 'top',
  },
]

// 탐색 화면 투어
export const discoverTourSteps: TourStep[] = [
  {
    target: '[data-tour="pension-filter"]',
    title: '연금계좌 적합 필터',
    content: '연금/ISA 계좌 선택 시 자동으로 켜집니다. 레버리지/인버스 등 부적합 상품이 자동 필터링되어 실수로 매수하는 것을 방지합니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="search-input"]',
    title: 'ETF 검색',
    content: '종목명(예: KODEX), 티커(예: 069500), 카테고리(예: 배당)로 원하는 ETF를 검색하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="mode-tabs"]',
    title: '3가지 모드 전환',
    content: '탐색: ETF 카드 리스트 / 검증: TER, 괴리율, 스프레드 테이블 비교 / 주문: 빠른 매수/매도 인터페이스',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-filter"]',
    title: '테마별 필터',
    content: '시장대표, 글로벌, 배당, 채권, 통화, 원자재, 레버리지, 연금 등 8개 테마로 필터링할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sort-options"]',
    title: '정렬 옵션',
    content: '건전성순(ETF 품질), 저비용순(TER 낮은순), 유동성순(거래대금 높은순), 수익률순으로 정렬할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="etf-card"]',
    title: 'ETF 카드',
    content: '각 ETF의 현재가, 등락률, 건전성 점수를 확인하세요. 클릭하면 상세 페이지로 이동합니다.',
    placement: 'bottom',
  },
]

// 투자정보 화면 투어
export const investInfoTourSteps: TourStep[] = [
  {
    target: '[data-tour="etf-101"]',
    title: 'ETF 101 / 용어사전 / 리서치',
    content: 'ETF 기초 개념, 전문 용어, 주간 리포트를 탭으로 전환하며 학습할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="glossary"]',
    title: '용어사전 탭',
    content: 'NAV, TER, 괴리율, LP, AP 등 ETF 투자에 필요한 전문 용어를 쉽게 설명합니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="research"]',
    title: '리서치 탭',
    content: 'ETF Weekly 보고서와 신규 ETF 라인업 분석 리포트를 PDF로 제공합니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="chatbot"]',
    title: 'AI 챗봇',
    content: 'ETF 관련 궁금한 점을 바로 질문할 수 있습니다. 자주 묻는 질문도 제공됩니다.',
    placement: 'top',
  },
]

// 비교 화면 투어
export const compareTourSteps: TourStep[] = [
  {
    target: '[data-tour="compare-slots"]',
    title: 'ETF 비교 슬롯',
    content: '최대 5개의 ETF를 동시에 비교할 수 있습니다. + 버튼을 눌러 추가하고, X를 눌러 제거하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="compare-table"]',
    title: '지표 비교 테이블',
    content: 'TER, 괴리율, 스프레드, 거래대금, 건전성 점수 등을 카테고리별로 비교합니다. 가장 좋은 지표에 초록색 표시됩니다.',
    placement: 'top',
  },
]

// 보유현황 화면 투어
export const portfolioTourSteps: TourStep[] = [
  {
    target: '[data-tour="portfolio-chart"]',
    title: '자산 배분',
    content: '보유 ETF의 자산 배분 비율을 차트로 확인하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="holdings-list"]',
    title: '보유 종목',
    content: '각 ETF의 평가금액, 수익률, 매입단가를 확인할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="tax-info"]',
    title: '세금 정보',
    content: '계좌 유형별 예상 세금과 절감액을 안내합니다.',
    placement: 'top',
  },
]

// ETF 상세 화면 투어
export const detailTourSteps: TourStep[] = [
  {
    target: '[data-tour="health-score"]',
    title: '건전성 점수',
    content: 'TER, 괴리율, 스프레드, 유동성을 종합한 0~100점 점수입니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="key-metrics"]',
    title: '핵심 지표',
    content: '투자 결정에 필요한 TER, 괴리율, 스프레드를 한눈에 확인하세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="trade-buttons"]',
    title: '매매 버튼',
    content: '매수/매도 버튼을 눌러 바로 주문 화면으로 이동합니다.',
    placement: 'top',
  },
]

// 전체 앱 첫 방문 투어 (간소화)
export const welcomeTourSteps: TourStep[] = [
  {
    target: '[data-tour="account-toggle"]',
    title: '환영합니다! 🎉',
    content: '먼저 계좌 유형을 선택하세요. 연금/ISA 계좌는 부적합 상품이 자동 필터링됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="bottom-nav"]',
    title: '하단 네비게이션',
    content: '홈, 탐색, 투자정보, 비교, 보유 메뉴로 이동할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="product-info"]',
    title: '제품 소개서',
    content: '이 아이콘을 클릭하면 서비스 소개를 볼 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="chatbot-button"]',
    title: 'AI 챗봇',
    content: 'ETF 관련 궁금한 점은 언제든 챗봇에게 물어보세요!',
    placement: 'top',
  },
]

// 페이지별 투어 맵
export const tourStepsByPage: Record<string, TourStep[]> = {
  home: homeTourSteps,
  discover: discoverTourSteps,
  investinfo: investInfoTourSteps,
  compare: compareTourSteps,
  portfolio: portfolioTourSteps,
  detail: detailTourSteps,
  welcome: welcomeTourSteps,
}
