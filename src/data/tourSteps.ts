import type { TourStep } from '../components/OnboardingTour'

// 홈 화면 투어
export const homeTourSteps: TourStep[] = [
  {
    target: '[data-tour="dividend-calendar"]',
    title: '분배금 캘린더',
    content: '달력 아이콘을 누르면 ETF 분배금 지급 일정을 확인할 수 있습니다. 내가 보유한 ETF는 강조 표시됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="product-info"]',
    title: '제품 소개서',
    content: '문서 아이콘을 누르면 이 ETF MTS Demo의 핵심 가치와 기능을 소개하는 제품 소개서를 확인할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="portfolio-summary"]',
    title: '포트폴리오 요약',
    content: '내 ETF 포트폴리오의 총 평가금액과 수익률을 한눈에 확인할 수 있습니다. 계좌 유형(일반/연금/ISA)도 선택 가능합니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-search"]',
    title: 'ETF 빠른검색',
    content: '단기자금, 투자국가, 인버스/레버리지, 섹터, 지수별로 ETF를 빠르게 검색할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="trending-themes"]',
    title: '지금 뜨는 테마',
    content: '실시간 인기 테마 TOP5가 자동으로 흘러갑니다. 클릭하면 해당 테마의 ETF 목록을 확인할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="popular-etf"]',
    title: '인기 테마 랭킹',
    content: '혁신기술, ESG, 배당, 트렌드 탭별 인기 ETF TOP5를 확인하세요. 클릭하면 상세 페이지로 이동합니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="heatmap"]',
    title: '테마 히트맵',
    content: '12개 테마별 수익률을 색상으로 표시합니다. 빨강=상승, 파랑=하락. 클릭하면 해당 테마 ETF 목록을 확인합니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="constituent-search"]',
    title: '구성종목 검색',
    content: '삼성전자, NVIDIA 등 구성종목으로 ETF를 검색합니다. 특정 주식이 담긴 ETF를 찾고 싶을 때 유용합니다.',
    placement: 'top',
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
    content: '최대 3개의 ETF를 동시에 비교할 수 있습니다. + 버튼을 눌러 ETF를 검색하고 추가하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="compare-table"]',
    title: '지표 비교 테이블',
    content: 'TER, 괴리율, 스프레드, 거래대금, 건전성 점수 등을 카테고리별로 비교합니다. 가장 좋은 지표에 초록색 표시됩니다.',
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
    target: '[data-tour="portfolio-summary"]',
    title: 'All that ETF에 오신 것을 환영합니다!',
    content: 'ETF 투자를 더 쉽고 안전하게. 주요 기능을 안내해드릴게요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dividend-calendar"]',
    title: '분배금 캘린더',
    content: '달력 아이콘을 누르면 ETF 분배금 지급 일정을 확인할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-search"]',
    title: 'ETF 빠른검색',
    content: '단기자금, 투자국가, 섹터 등 조건별로 ETF를 빠르게 검색할 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="heatmap"]',
    title: '테마 히트맵',
    content: '테마별 수익률을 색상으로 한눈에 파악하세요. 클릭하면 해당 테마 ETF 목록을 볼 수 있습니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="bottom-nav"]',
    title: '하단 네비게이션',
    content: '홈, 비교, 투자정보 메뉴로 이동할 수 있습니다.',
    placement: 'top',
  },
]

// 페이지별 투어 맵
export const tourStepsByPage: Record<string, TourStep[]> = {
  home: homeTourSteps,
  investinfo: investInfoTourSteps,
  compare: compareTourSteps,
  detail: detailTourSteps,
  welcome: welcomeTourSteps,
}
