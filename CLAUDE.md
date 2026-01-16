# ETF MTS Demo - 프로젝트 가이드

## 프로젝트 개요

**ETF MTS (Mobile Trading System) Demo**는 ETF 전문 모바일 트레이딩 시스템 프로토타입입니다. 개인 투자자가 ETF를 쉽고 안전하게 탐색, 검증, 투자할 수 있도록 설계된 사용자 중심의 MTS 앱입니다.

### 핵심 철학

1. **투명한 정보 제공**: ETF의 건전성 지표(TER, 괴리율, 스프레드, 유동성)를 명확히 보여주어 투자자가 합리적인 의사결정을 할 수 있도록 지원
2. **리테일 투자자 보호**: 레버리지/인버스 상품 필터링, 안전 알림, 연금계좌 적합 상품 표시 등
3. **직관적인 UX**: 증권사 티커 스타일의 물결 애니메이션, 미니멀한 다크 테마 UI
4. **교육과 투자의 통합**: ETF 101 학습 콘텐츠와 실제 투자 기능을 하나의 앱에서 제공

---

## 기술 스택

| 구분 | 기술 | 설명 |
|------|------|------|
| **언어** | TypeScript | JavaScript + 타입 (버그 방지) |
| **프레임워크** | React 18 | 개발 뼈대/틀 (컴포넌트 기반 UI) |
| **빌드** | Vite | 코드를 브라우저용으로 변환/압축 |
| **스타일** | TailwindCSS | 유틸리티 기반 CSS 프레임워크 |
| **UI** | shadcn/ui | 미리 만들어진 버튼, 카드 등 컴포넌트 |
| **아이콘** | Lucide React | 아이콘 라이브러리 |
| **차트** | Recharts | 파이 차트, 스파크라인 |
| **배포** | Vercel | 서버리스 호스팅 |

### 기술 스택 개념 정리

- **언어**: 코드 작성하는 문법 (TypeScript, JavaScript, Python 등)
- **프레임워크**: 개발 뼈대/틀 (미리 만들어진 구조 위에서 개발)
- **빌드**: 개발용 코드 → 배포용 파일로 변환/압축
- **스타일**: 화면 디자인 (색상, 크기, 배치)
- **UI 라이브러리**: 미리 디자인된 버튼, 카드 등 부품

---

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/                  # shadcn/ui 기반 공통 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── Header.tsx           # 상단 헤더 (계좌 타입 선택: 일반/연금/ISA)
│   ├── BottomNav.tsx        # 하단 네비게이션 (홈/탐색/투자정보/비교/보유)
│   ├── FloatingChatbot.tsx  # 전역 플로팅 챗봇 (검색 기능 포함)
│   └── ETFCard.tsx          # ETF 정보 카드 컴포넌트
├── pages/
│   ├── HomePage.tsx         # 홈 화면 (포트폴리오 요약, 인기 ETF, 히트맵, 시장 현황)
│   ├── DiscoverPage.tsx     # 탐색 화면 (ETF 검색, 필터링, 정렬)
│   ├── ETFDetailPage.tsx    # ETF 상세 화면
│   ├── TradePage.tsx        # 매매 화면
│   ├── PortfolioPage.tsx    # 보유현황 화면
│   ├── ComparePage.tsx      # ETF 비교 화면
│   ├── InvestInfoPage.tsx   # 투자정보 (ETF 101, 용어사전, 리서치 PDF)
│   └── InvestInfoDetailPage.tsx
├── data/
│   ├── mockData.ts          # ETF 목업 데이터 (65+ 종목) + 계좌별 포트폴리오 + 테마 분류
│   └── investInfoData.ts    # 투자정보 콘텐츠 데이터
├── lib/
│   └── utils.ts             # 유틸리티 함수 (cn, formatNumber 등)
├── App.tsx                  # 메인 앱 (라우팅, 상태 관리)
└── main.tsx                 # 엔트리 포인트

pdf/                         # 리서치 PDF 파일
├── new_etf_25_12_3w.pdf
├── etf_weekly_25_12_3w.pdf
└── ...

docs/                        # 프로젝트 문서
└── feature_comparison.md    # 원안 대비 기능 비교 분석
```

---

## 주요 기능

### 1. 홈 화면 (HomePage)

- **계좌별 포트폴리오**: 일반/연금/ISA 계좌 선택 시 각각 다른 평가금액 표시
  - 일반계좌: 약 2,500만원 (공격적 - 성장주, 레버리지 포함)
  - 연금계좌: 약 4,200만원 (안정적 - 배당, 채권 중심)
  - ISA계좌: 약 1,800만원 (균형 - 성장+배당 혼합)
- **계좌 타입별 세금 정보**: 일반(15.4%)/ISA(9.9%)/연금(5.5%) 세율 안내
- **목적별 탐색**: 시장대표, 글로벌, 배당, 채권, 통화, 원자재, 레버리지, 연금 카테고리
- **실시간 인기 ETF**: 거래대금 기준 TOP 5 (우측 물결 흐름 횡스크롤 애니메이션)
  - ETF 분류 배지: 국내/해외 + 자산분류(주식/채권/원자재 등) 표시
- **주간 테마 히트맵**: 12개 테마별 주간 수익률 (상승=빨강, 하락=파랑)
  - **테마 클릭 시 TOP10 모달**: 해당 테마 ETF 수익률순 TOP10 리스트 표시
  - 테마 키워드 매핑: AI/반도체, 2차전지, 배당, 바이오, 금융, 게임, 메타버스, 신재생, 원자재, 중국, 미국, 채권
- **수익률 상하위 TOP5**: 레버리지/인버스 제외한 상승/하락 TOP 5
- **시장 현황**: KOSPI, KOSDAQ, S&P500, NASDAQ, 니케이225, 항셍지수, 환율, 국채 (횡스크롤)
- **ETF 탐색하기 / ETF 101 바로가기**: 각 페이지로 연결

### 2. 탐색 화면 (DiscoverPage)

- **빈 상태 기본값**: 진입 시 테마/검색어 선택 전까지 빈 리스트 표시 (안내 메시지 제공)
- **연금계좌 적합 필터**: 레버리지/인버스 제외 토글
- **시장 필터**: 전체/국내/해외 선택
- **검색**: 종목명, 티커, 카테고리 검색
- **테마 필터**: 전체(아이콘 포함), 시장지수, 채권, 배당, 전략, 통화, 원자재, 레버리지
- **정렬 옵션**: 수익률순, 유동성순, 저비용순(TER), 건전성순 (정렬 변경해도 모든 지표 유지)
- **3가지 모드**:
  - **탐색**: ETF 카드 리스트
  - **검증**: TER, 괴리율, 스프레드, 건전성 점수 테이블 (다차원 동시 조회)
  - **주문**: 빠른 매수/매도 인터페이스

### 3. ETF 상세 화면 (ETFDetailPage)

- 가격 차트 (스파크라인)
- 건전성 점수 (Health Score)
- ETF 분류 배지: 국내/해외 + 자산분류
- 상품 개요, 지수 설명, 운용 전략
- TER, 괴리율, 스프레드, 거래대금 지표
- 배당수익률, 변동성, 추적오차
- 매수/매도 버튼

### 4. 투자정보 화면 (InvestInfoPage)

- **ETF 101**: ETF 기초 개념, 계좌 종류, 투자 전략, 세금
- **용어사전**: NAV, AP, LP, TER, 괴리율 등 전문 용어 설명
- **리서치**: ETF Weekly 보고서, 신규 ETF 라인업 분석 PDF
  - Google Docs Viewer 사용하여 PDF 표시
- **챗봇**: 자주 묻는 질문 빠른 접근 + 검색 기능

### 5. 비교 화면 (ComparePage)

- **최대 4개 ETF 동시 비교** (+ 버튼으로 검색 추가)
- TER, 괴리율, 스프레드, 건전성 점수 비교
- **비교 슬롯 UI**: 하단 플로팅으로 담은 ETF 표시, 어느 화면에서든 접근 가능
- **롱프레스 추가**: ETF 카드 길게 눌러 비교 슬롯에 담기
- 주문 버튼 제거됨 (비교 전용)

### 6. 보유현황 화면 (PortfolioPage)

- **계좌별 보유 ETF**: 계좌 타입에 따라 다른 종목/평가금액 표시
- 자산 배분 파이 차트
- 평가금액, 수익률, 매입단가
- 계좌 타입별 세금 예상 및 절감액 표시
- 리스크 알림 (건전성/괴리율 주의)
- 리밸런싱 제안

### 7. 전역 플로팅 챗봇 (FloatingChatbot)

- 모든 페이지에서 접근 가능 (투자정보 페이지 제외 - 자체 챗봇 있음)
- ETF 관련 질문 검색 기능
- 투자정보 콘텐츠 바로가기
- 용어사전 연결

### 8. 분배금 캘린더 (DividendCalendar)

- **헤더 우측 달력 아이콘**으로 접근
- 월별 달력 뷰 + 분배금 지급일 표시 (핑크색 점)
- 오늘 날짜 은은한 핑크색 원 강조
- 날짜 클릭 시 해당 일자 분배금 지급 ETF 목록 표시
- **보유 ETF 구분**: 내 포트폴리오 ETF는 "보유중" 배지 + 핑크색 배경 강조
- 주당 분배금 금액 표시
- ETF 클릭 시 상세 페이지 이동

---

## UI/UX 특징

### 디자인 시스템

- **다크 테마**: 배경 `#191322`, 카드 `#1f1a2e`, 보더 `#2d2640`
- **메인 컬러**: 핑크 `#d64f79`
- **상승/하락**: 빨강 `text-up` / 파랑 `text-down`
- **폰트**: Pretendard (웹폰트)

### 애니메이션

- **실시간 인기 ETF**: 우측으로 물결 흐르는 횡스크롤 애니메이션 (`tickerWave`) + Shimmer 효과
- **시장 현황**: 우측 횡스크롤 물결 애니메이션 (`marketWave`)
- **라이브 표시**: 핑크색 핑 애니메이션

### ETF 분류 배지

- **시장분류**: 국내(초록) / 해외(파랑)
- **자산분류**: 주식, 채권, 원자재, 통화 등 (회색)

### 히트맵 색상

- **상승**: 빨강 계열 (rgba 239, 68, 68)
  - +3% 이상: 진한 빨강
  - +1.5% ~ +3%: 중간 빨강
  - 0% ~ +1.5%: 연한 빨강
- **하락**: 파랑 계열 (rgba 59, 130, 246)
  - 0% ~ -1.5%: 연한 파랑
  - -1.5% ~ -3%: 중간 파랑
  - -3% 이하: 진한 파랑

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
  assetClass: string      // 자산군 (주식/채권/원자재/통화)
  marketClass: string     // 시장구분 (국내/해외)
}
```

### 계좌별 포트폴리오

```typescript
// 계좌 타입별 포트폴리오 가져오기
getPortfolioByAccountType(accountType: string) => PortfolioETF[]

// 일반계좌: generalPortfolioETFs (공격적)
// 연금계좌: pensionPortfolioETFs (안정적)
// ISA계좌: isaPortfolioETFs (균형)
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

## 배포

### Vercel 배포

```bash
# 프로덕션 배포
npx vercel --prod

# 배포 URL
https://etf-mts-demo.vercel.app
```

### vercel.json 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/pdf/(.*)",
      "headers": [
        { "key": "Content-Type", "value": "application/pdf" },
        { "key": "Cache-Control", "value": "public, max-age=31536000" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/((?!pdf/).*)", "destination": "/index.html" }
  ]
}
```

### PDF 표시 방식

- Google Docs Viewer 사용
- URL 형식: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
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
