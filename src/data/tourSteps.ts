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
    target: '[data-tour="portfolio-summary"]',
    title: '포트폴리오 요약',
    content: '내 ETF 포트폴리오의 총 평가금액과 수익률을 한눈에 확인할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="category-buttons"]',
    title: '유형별 탐색',
    content: '시장지수, 채권, 배당, 전략, 통화, 원자재, 레버리지 등 투자 목적에 맞는 ETF를 빠르게 찾아보세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="popular-etf"]',
    title: '실시간 인기 ETF',
    content: '거래대금 기준 TOP 5 인기 ETF입니다. 클릭하면 상세 정보를, 꾹 누르면 비교 목록에 추가됩니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="compare-tip"]',
    title: '💡 ETF 비교하기',
    content: '어떤 ETF든 0.5초 이상 꾹 누르면 비교 목록에 추가됩니다. 최대 4개까지 담아서 한번에 비교해보세요!',
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
    target: '[data-tour="search-input"]',
    title: 'ETF 검색',
    content: '종목명(예: KODEX), 티커(예: 069500), 카테고리(예: 배당)로 원하는 ETF를 검색하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="pension-filter"]',
    title: '연금계좌 적합 필터',
    content: '이 토글을 켜면 레버리지/인버스 등 연금계좌 부적합 상품이 자동 필터링됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="mode-tabs"]',
    title: '3가지 모드 전환',
    content: '탐색: ETF 카드 리스트 / 검증: TER, 괴리율, 스프레드 테이블 / 주문: 빠른 매수/매도',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-filter"]',
    title: '유형별 필터',
    content: '시장지수, 채권, 배당, 전략, 통화, 원자재, 레버리지 등 7개 유형으로 필터링할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sort-options"]',
    title: '정렬 옵션',
    content: '수익률순, 유동성순, 저비용순, 건전성순으로 정렬하여 원하는 ETF를 찾으세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="etf-card"]',
    title: 'ETF 카드 사용법',
    content: '탭하면 상세 페이지로 이동합니다. 꾹 누르면(0.5초) 비교 목록에 추가됩니다!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="compare-bar"]',
    title: '비교 목록',
    content: '하단에 비교 목록이 표시됩니다. 최대 4개까지 담고 [비교하기] 버튼을 누르면 상세 비교 페이지로 이동합니다.',
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
    target: '[data-tour="account-selector"]',
    title: '계좌 선택',
    content: '드롭다운을 눌러 일반/연금/ISA 계좌를 선택하세요. 계좌 유형별로 보유 ETF와 세금 정보가 다르게 표시됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="account-type-badge"]',
    title: '계좌 유형 표시',
    content: '현재 조회 중인 계좌 유형이 아이콘과 함께 표시됩니다. 일반(회색), 연금(초록), ISA(파랑)으로 구분됩니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="portfolio-chart"]',
    title: '자산 배분',
    content: '선택한 계좌의 ETF 자산 배분 비율을 차트로 확인하세요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tax-info"]',
    title: '세금 정보',
    content: '계좌 유형별 예상 세금을 안내합니다. 연금/ISA는 일반계좌 대비 절감액도 표시됩니다.',
    placement: 'top',
  },
  {
    target: '[data-tour="holdings-list"]',
    title: '보유 종목',
    content: '각 ETF의 평가금액, 수익률, 건전성 지표를 확인하세요. 꾹 누르면 비교 목록에 추가됩니다.',
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
    title: '환영합니다!',
    content: 'ETF MTS Demo에 오신 것을 환영합니다. 주요 기능을 안내해드릴게요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dividend-calendar"]',
    title: '분배금 캘린더',
    content: '달력 아이콘을 누르면 ETF 분배금 지급 일정과 보유 ETF의 배당 스케줄을 확인할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="category-buttons"]',
    title: 'ETF 탐색하기',
    content: '유형별로 ETF를 빠르게 찾아볼 수 있습니다. 관심 있는 유형을 탭해보세요.',
    placement: 'top',
  },
  {
    target: '[data-tour="popular-etf"]',
    title: '비교 기능 TIP',
    content: 'ETF 카드를 꾹 누르면(0.5초) 비교 목록에 추가됩니다. 최대 4개까지 담아서 비교해보세요!',
    placement: 'top',
  },
  {
    target: '[data-tour="bottom-nav"]',
    title: '하단 네비게이션',
    content: '홈, 탐색, 투자정보, 비교, 보유 메뉴로 이동할 수 있습니다.',
    placement: 'top',
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
