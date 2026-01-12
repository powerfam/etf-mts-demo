# ETF MTS Demo - 프로젝트 가이드

## 프로젝트 개요

**ETF MTS (Mobile Trading System) Demo**는 키움증권의 ETF 전문 모바일 트레이딩 시스템 프로토타입입니다. 개인 투자자가 ETF를 쉽고 안전하게 탐색, 검증, 투자할 수 있도록 설계된 사용자 중심의 MTS 앱입니다.

### 핵심 철학

1. **투명한 정보 제공**: ETF의 건전성 지표(TER, 괴리율, 스프레드, 유동성)를 명확히 보여주어 투자자가 합리적인 의사결정을 할 수 있도록 지원
2. **리테일 투자자 보호**: 레버리지/인버스 상품 필터링, 안전 알림, 연금계좌 적합 상품 표시 등
3. **직관적인 UX**: 증권사 티커 스타일의 물결 애니메이션, 미니멀한 다크 테마 UI
4. **교육과 투자의 통합**: ETF 101 학습 콘텐츠와 실제 투자 기능을 하나의 앱에서 제공

---

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui 컴포넌트
- **Icons**: Lucide React
- **State Management**: React useState (로컬 상태)

---

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # shadcn/ui 기반 공통 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── Header.tsx       # 상단 헤더 (계좌 타입 선택)
│   ├── BottomNav.tsx    # 하단 네비게이션 (홈/탐색/투자정보/비교/보유)
│   └── ETFCard.tsx      # ETF 정보 카드 컴포넌트
├── pages/
│   ├── HomePage.tsx         # 홈 화면 (포트폴리오 요약, 인기 ETF, 시장 현황)
│   ├── DiscoverPage.tsx     # 탐색 화면 (ETF 검색, 필터링, 정렬)
│   ├── ETFDetailPage.tsx    # ETF 상세 화면
│   ├── TradePage.tsx        # 매매 화면
│   ├── PortfolioPage.tsx    # 보유현황 화면
│   ├── ComparePage.tsx      # ETF 비교 화면
│   ├── InvestInfoPage.tsx   # 투자정보 (ETF 101, 용어사전, 리서치)
│   └── InvestInfoDetailPage.tsx
├── data/
│   ├── mockData.ts          # ETF 목업 데이터 (50+ 종목)
│   └── investInfoData.ts    # 투자정보 콘텐츠 데이터
├── lib/
│   └── utils.ts             # 유틸리티 함수 (cn, formatNumber 등)
├── App.tsx                  # 메인 앱 (라우팅, 상태 관리)
└── main.tsx                 # 엔트리 포인트
```

---

## 주요 기능

### 1. 홈 화면 (HomePage)

- **내 ETF 평가금액**: 포트폴리오 총 가치 및 수익률 표시
- **계좌 타입별 세금 정보**: 일반/ISA/연금계좌별 세율 안내
- **목적별 탐색**: 시장대표, 글로벌, 배당, 채권, 통화, 원자재, 레버리지, 연금 카테고리
- **실시간 인기 ETF**: 거래대금 기준 TOP 10 (우측 물결 흐름 횡스크롤 애니메이션)
- **시장 현황**: KOSPI, KOSDAQ, S&P500, NASDAQ, 니케이225, 항셍지수, 환율, 국채 (우측 횡스크롤)
- **ETF 101 바로가기**: 기초 학습 콘텐츠로 연결 (탐색 페이지)

### 2. 탐색 화면 (DiscoverPage)

- **연금계좌 적합 필터**: 레버리지/인버스 제외 토글
- **검색**: 종목명, 티커, 카테고리 검색
- **테마 필터**: 시장대표, 글로벌, 배당, 채권, 통화, 원자재, 레버리지, 연금
- **정렬 옵션**: 건전성순, 저비용순(TER), 유동성순(거래대금), 수익률순
- **3가지 모드**:
  - **탐색**: ETF 카드 리스트
  - **검증**: TER, 괴리율, 스프레드, 건전성 점수 테이블
  - **주문**: 빠른 매수/매도 인터페이스

### 3. ETF 상세 화면 (ETFDetailPage)

- 가격 차트 (스파크라인)
- 건전성 점수 (Health Score)
- 상품 개요, 지수 설명, 운용 전략
- TER, 괴리율, 스프레드, 거래대금 지표
- 배당수익률, 변동성, 추적오차
- 매수/매도 버튼

### 4. 투자정보 화면 (InvestInfoPage)

- **ETF 101**: ETF 기초 개념, 계좌 종류, 투자 전략, 세금
- **용어사전**: NAV, AP, LP, TER, 괴리율 등 전문 용어 설명
- **리서치**: ETF Weekly 보고서, 신규 ETF 라인업 분석 PDF
- **챗봇**: 자주 묻는 질문 빠른 접근

### 5. 비교 화면 (ComparePage)

- 최대 3개 ETF 동시 비교
- TER, 괴리율, 스프레드, 건전성 점수 비교

### 6. 보유현황 화면 (PortfolioPage)

- 보유 ETF 목록
- 평가금액, 수익률, 매입단가
- 계좌 타입별 세금 예상

---

## UI/UX 특징

### 디자인 시스템

- **다크 테마**: 배경 `#191322`, 카드 `#1f1a2e`, 보더 `#2d2640`
- **메인 컬러**: 핑크 `#d64f79`
- **상승/하락**: 빨강 `text-up` / 파랑 `text-down`
- **폰트**: Pretendard (웹폰트)

### 애니메이션

- **실시간 인기 ETF**: 우측으로 물결 흐르는 횡스크롤 애니메이션 (`tickerWave`)
- **시장 현황**: 우측 횡스크롤 물결 애니메이션 (`marketWave`)
- **라이브 표시**: 핑크색 핑 애니메이션

---

## 데이터 모델

### ETF Interface

```typescript
interface ETF {
  id: string
  ticker: string          // 종목코드
  name: string            // 정식명칭
  shortName: string       // 단축명
  price: number           // 현재가
  prevClose: number       // 전일종가
  change: number          // 등락폭
  changePercent: number   // 등락률
  iNav: number            // 추정순자산가치
  discrepancy: number     // 괴리율
  ter: number             // 총보수율
  spread: number          // 스프레드
  adtv: number            // 평균거래대금
  aum: number             // 순자산총액
  trackingError: number   // 추적오차
  volatility: number      // 변동성
  dividendYield: number   // 배당수익률
  category: string        // 카테고리
  tags: string[]          // 태그
  healthScore: number     // 건전성 점수 (0-100)
  isLeveraged?: boolean   // 레버리지 여부
  isInverse?: boolean     // 인버스 여부
  isHedged?: boolean      // 환헤지 여부
  sparkline: number[]     // 차트 데이터
  overview: string        // 상품 개요
  indexDescription: string // 지수 설명
  strategy: string        // 운용 전략
  issuer: string          // 운용사
  listedDate: string      // 상장일
  indexProvider: string   // 지수 제공자
  assetClass: string      // 자산군
  marketClass: string     // 시장구분
}
```

---

## 네비게이션

| Tab | 라벨 | 아이콘 | 페이지 |
|-----|------|--------|--------|
| home | 홈 | Home | HomePage |
| discover | 탐색 | Search | DiscoverPage |
| investinfo | 투자정보 | BookOpen | InvestInfoPage |
| compare | 비교 | GitCompare | ComparePage |
| portfolio | 보유 | Briefcase | PortfolioPage |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 향후 개선 사항

- [ ] 실시간 API 연동 (현재 목업 데이터)
- [ ] 사용자 인증/로그인
- [ ] 실제 주문 연동
- [ ] 알림 기능
- [ ] 관심종목 저장
- [ ] 포트폴리오 분석 리포트

---

## 라이선스

내부 데모용 프로젝트 - 키움증권
