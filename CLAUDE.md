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
| **엑셀** | xlsx | 데이터 스키마 문서 생성 |
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
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── Header.tsx           # 상단 헤더 (계좌 타입 선택, 검색, 알림, 분배금 캘린더)
│   ├── BottomNav.tsx        # 하단 네비게이션 (홈/탐색/투자정보/비교) - 보유 탭 숨김
│   ├── FloatingChatbot.tsx  # 전역 플로팅 챗봇 (검색 기능 포함)
│   ├── DividendCalendar.tsx # 분배금 캘린더 모달 컴포넌트
│   └── ETFCard.tsx          # ETF 정보 카드 컴포넌트
├── pages/
│   ├── HomePage.tsx         # 홈 화면 (포트폴리오 요약, 인기 ETF, 히트맵, 시장 현황)
│   ├── DiscoverPage.tsx     # 탐색 화면 (ETF 검색, 필터링, 정렬)
│   ├── ETFDetailPage.tsx    # ETF 상세 화면
│   ├── TradePage.tsx        # 매매 화면
│   ├── PortfolioPage.tsx    # 보유현황 화면 (자산배분, 분배금 일정, 리밸런싱)
│   ├── ComparePage.tsx      # ETF 비교 화면
│   ├── InvestInfoPage.tsx   # 투자정보 (ETF 101, 용어사전, 리서치 PDF)
│   └── InvestInfoDetailPage.tsx
├── data/
│   ├── mockData.ts          # ETF 목업 데이터 (65+ 종목) + 계좌별 포트폴리오 + 테마 분류 + 분배금 일정
│   ├── investInfoData.ts    # 투자정보 콘텐츠 데이터
│   └── tourSteps.ts         # 가이드 투어 단계 정의
├── lib/
│   └── utils.ts             # 유틸리티 함수 (cn, formatNumber, formatPercent 등)
├── App.tsx                  # 메인 앱 (라우팅, 상태 관리)
└── main.tsx                 # 엔트리 포인트

scripts/
└── generate-schema-excel.cjs  # 데이터 스키마 엑셀 문서 생성 스크립트

pdf/                         # 리서치 PDF 파일
├── new_etf_25_12_3w.pdf
├── etf_weekly_25_12_3w.pdf
└── ...

docs/                        # 프로젝트 문서
├── feature_comparison.md              # 원안 대비 기능 비교 분석
├── ETF_MTS_데이터스키마_명세서.xlsx    # 데이터 스키마 명세서
├── ETF_콘텐츠_데이터_분석_보고서.md
└── ETF_투자정보_콘텐츠_기획안.md
```

---

## 주요 기능

### 1. 홈 화면 (HomePage)

- **계좌별 포트폴리오**: 일반/연금/ISA 계좌 선택 시 각각 다른 평가금액 표시
  - 일반계좌: 약 2,500만원 (공격적 - 성장주, 레버리지 포함)
  - 연금계좌: 약 4,200만원 (안정적 - 배당, 채권 중심)
  - ISA계좌: 약 1,800만원 (균형 - 성장+배당 혼합)
- **계좌 타입별 세금 정보**: 일반(15.4%)/ISA(9.9%)/연금(5.5%) 세율 안내
- **ETF 빠른 검색 카드**: 흰색 배경 카드로 테마별 빠른 진입
  - 단기자금(파킹형), 투자국가, 인버스/레버리지, 섹터, 지수
  - 클릭 시 QuickSearchPage로 해당 테마 필터 적용
- **인기 테마 랭킹 TOP5**: 혁신, 가치, 배당/인컴 탭별 ETF 리스트
  - 호버 시 연한 회색 배경 (`hover:bg-[#3d3650]/50`)
- **히트맵**: 1D/1주/YTD 기간별 테마 수익률 히트맵
  - **테마 클릭 시 TOP10 모달**: 해당 테마 ETF 수익률순 TOP10 리스트 표시
  - 테마 키워드 매핑: AI/반도체, 2차전지, 배당, 바이오, 금융, 게임, 메타버스, 신재생, 원자재, 중국, 미국, 채권
- **구성종목 검색 TOP10**: 국내/해외 인기 주식 검색 (핑크색 돋보기 아이콘 버튼)
- **시장 현황**: KOSPI, KOSDAQ, S&P500, NASDAQ, 니케이225, 항셍지수, 환율, 국채 (횡스크롤)
- **ETF 탐색하기 / ETF 101 바로가기**: 각 페이지로 연결

### 1-1. ETF 빠른검색 (QuickSearchPage)

- **탭 메뉴**: 단기자금(파킹형), 투자국가, 인버스/레버리지, 섹터, 지수
- **서브 필터**: 지수/국가별 선택 모달 (KOSPI200, S&P500, 나스닥100 등)
- **섹터 필터**: 반도체/AI, 2차전지, 바이오/헬스케어, 금융, 게임/엔터, 원자재, 배당, ESG
- **요약/상세 뷰 토글**: 요약(리스트) / 상세(테이블)
- **상세 탭**: 기본정보, 수익률, 자금유입
- **정렬/필터 모달**: 종목 필터 (전체/퇴직연금/개인연금), 정렬 기준 (등락률/거래량/순자산/TER/연배당률)
- **가로보기 모드**: 90도 회전하여 더 많은 정보 표시
- **종목명 marquee**: 긴 종목명 잘리지 않게 스크롤 처리
- **비교함 추가**: 최대 3개까지 ETF 담기

### 2. 탐색 화면 (DiscoverPage/스크리닝)

- **기본 표시**: 수익률순 TOP 10 ETF 표시 (빈 상태 아님)
- **검색**: 종목명, 티커, 카테고리 검색
- **스크리닝 필터 버튼**: 상세 필터 옵션 (운용사, 자산클래스, 투자지역, TER, AUM, 배당수익률 등)
- **정렬 드롭다운**: 수익률순, 유동성순, 저비용순, 보유고객순
- **2가지 뷰 모드**:
  - **테이블**: 종목, 현재가, 등락률, TER, 괴리율, 거래대금, 비교, 관심
  - **카드**: ETF 카드 리스트
- **가로보기 모드**: 90도 회전하여 더 많은 정보 표시
- **종목명 marquee**: 긴 종목명 잘리지 않게 스크롤 처리
- **비교함 추가**: ETF 카드 담기 버튼
- **즐겨찾기**: 관심 종목 추가 버튼

### 3. ETF 상세 화면 (ETFDetailPage)

- **헤더**: 티커 코드 중앙 정렬, 종목명 중앙 정렬
- **랭킹 배지**: "어제 ETF 조회수 N위" (거래대금 기준 TOP 10)
- **가격 정보**: 현재가, 등락률, iNAV, 괴리율
- **차트**: 라인/캔들 차트 토글 (단일 버튼)
- **스와이프 네비게이션**: 좌우 스와이프로 다른 종목 전환
- **탭 메뉴**: 개요, 구성, 배당, 지표모니터, 키움인사이트
- **하단 버튼**: "비교하러가기", "주문하러가기"

#### 개요 탭:
- **종목개요**: 시장분류 배지(국내/해외) + 카테고리 배지 + 상품 설명
- **기초지수**: 추종 지수 정보
- **주요특징**: 운용 전략 (핵심 키워드 핑크색 하이라이트)
- **투자정보 카드**: 2x3 그리드 레이아웃
  - 순자산(AUM), 거래대금, 배당수익률
  - 총보수(TER), 운용사, 상장일
- **자세히 보기 모달**:
  - ETF 개요 (운용사, 상장일, 기초자산, 기초지수, 시가총액, AUM, 구성종목수, 레버리지)
  - 수수료(연): 총보수율, TER, 실부담비용률 + **i 아이콘 클릭 시 설명 팝업**
  - 세금: 증권거래, 매매차익, 현금배당
  - 거래정보: 당일고저, 52주고저, 거래량, 거래대금

#### 배당 탭:
- **월별/연도별 탭**: 솔리드 핑크 배경에 흰색 텍스트 (가시성 개선)
- **배당 내역 테이블**: 배당락일, 지급일, 주당 배당금
- (예상 배당금 부분 제거됨)

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

### 6. 보유현황 화면 (PortfolioPage) - **현재 숨김 처리됨**

> **복구 방법**: "보유 기능 다시 보이게 해줘"

- **계좌 선택 드롭다운**: 일반/연금/ISA 계좌 간 전환
- **계좌별 보유 ETF**: 계좌 타입에 따라 다른 종목/평가금액 표시
- **자산 배분 파이 차트**:
  - 종목별 비중 파이 차트
  - 커스텀 툴팁 (종목명, 금액, 비중% 표시)
- **자산 클래스 비중 바**:
  - 주식(핑크), 채권(초록), 원자재(주황), 통화(시안), 혼합(보라)
  - 막대 그래프 형태로 비중 시각화
- **세금 정보**: 계좌 타입별 예상 세금 및 절감액 표시
- **리스크 알림**: 건전성/괴리율 주의 종목 표시
- **리밸런싱 제안**: 목표 배분 대비 차이 안내
- **분배금 일정 섹션**:
  - 보유 ETF 중 30일 내 분배금 예정 종목 표시
  - 지급일, 주당 분배금 표시
  - 탭하면 분배금 캘린더 모달 오픈
- **보유 종목 리스트**: 전체/수익/손실 필터링

### 7. 전역 플로팅 챗봇 (FloatingChatbot) - **현재 숨김 처리됨**

> **복구 방법**: "챗봇 버튼 다시 보이게 해줘"

- 모든 페이지에서 접근 가능 (투자정보 페이지 제외 - 자체 챗봇 있음)
- ETF 관련 질문 검색 기능
- 투자정보 콘텐츠 바로가기
- 용어사전 연결

### 8. 분배금 캘린더 (DividendCalendar)

- **접근 방식**:
  - 헤더 우측 달력 아이콘
  - 보유현황 페이지 분배금 일정 섹션 탭
- **월별 달력 뷰**:
  - 분배금 지급일 핑크색 점 표시
  - 오늘 날짜 은은한 핑크색 원 강조
  - 요일별 색상 구분 (일요일=빨강, 토요일=파랑)
- **날짜별 분배금 ETF 목록**:
  - 해당 일자 분배금 지급 ETF 표시
  - 주당 분배금 금액 표시
- **보유 ETF 계좌 타입 표시**:
  - 일반(회색), 연금(초록), ISA(파랑) 배지
  - 보유 ETF는 핑크색 배경 강조
- **범례**: 오늘, 지급일, 보유계좌 타입 안내
- ETF 클릭 시 상세 페이지 이동 (캘린더 유지)

---

## UI/UX 특징

### 로그인 페이지 (LoginPage)

- **슬로건**: "All that ETF"
- **다크모드 고정**: 라이트모드 설정과 무관하게 항상 다크모드 유지
- **구현**: CSS로 `.light-mode` 클래스 무시 처리

### 테마 시스템 (다크/라이트 모드)

- **테마 토글**: 헤더 우측 3D 입체감 스위치 버튼
- **다크 테마** (기본값): 배경 `#191322`, 카드 `#1f1a2e`, 보더 `#2d2640`
- **라이트 테마**: 배경 `#f8f9fa`, 카드 `#ffffff`, 보더 `#e5e7eb`
- **테마 저장**: localStorage에 저장하여 새로고침 후에도 유지
- **예외 페이지**: 로그인 페이지는 항상 다크모드
- **구현 파일**:
  - `src/contexts/ThemeContext.tsx` - 전역 테마 상태 관리
  - `src/components/ui/switch.tsx` - 3D 입체감 토글 스위치
  - `src/index.css` - `.light-mode` 클래스 기반 스타일

### 디자인 시스템

- **메인 컬러**: 핑크 `#d64f79`
- **상승/하락**: 빨강 `text-up` / 파랑 `text-down`
- **폰트**: Pretendard (웹폰트)

### 계좌 타입별 색상

- **일반계좌**: 회색 (`bg-gray-500`)
- **연금계좌**: 초록 (`bg-emerald-500`)
- **ISA계좌**: 파랑 (`bg-blue-500`)

### 자산 클래스별 색상

- **주식**: 핑크 (`#d64f79`)
- **채권**: 초록 (`#4ade80`)
- **원자재**: 주황 (`#f59e0b`)
- **통화**: 시안 (`#06b6d4`)
- **혼합**: 보라 (`#796ec2`)

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

### DividendSchedule Interface

```typescript
interface DividendSchedule {
  etfId: string           // ETF ID (FK → ETF.id)
  date: string            // 지급일 (YYYY-MM-DD)
  dividendPerShare: number // 주당 분배금 (원)
  exDividendDate: string  // 배당락일 (YYYY-MM-DD)
}
```

### PortfolioETF Interface

```typescript
interface PortfolioETF extends ETF {
  quantity: number        // 보유 수량
  avgPrice: number        // 평균 매입단가
  totalValue: number      // 평가금액 (현재가 × 수량)
  profitLoss: number      // 손익금액
  profitLossPercent: number // 손익률 (%)
}
```

### 계좌별 포트폴리오

```typescript
// 계좌 타입별 포트폴리오 가져오기
getPortfolioByAccountType(accountType: string) => PortfolioETF[]

// 일반계좌: generalPortfolioETFs (공격적)
// 연금계좌: pensionPortfolioETFs (안정적 - 배당/채권 중심)
// ISA계좌: isaPortfolioETFs (균형 - 성장+배당 혼합)
```

### 유틸리티 함수

```typescript
// 특정 날짜의 분배금 ETF 목록
getDividendsByDate(date: string): (DividendSchedule & { etf: ETF })[]

// 분배금 일정이 있는 날짜 목록
getDividendDates(): string[]

// 포트폴리오 ETF ID 목록
getPortfolioETFIds(accountType: string): string[]

// 특정 ETF를 보유한 계좌 유형 목록
getAccountTypesForETF(etfId: string): string[]
```

---

## 네비게이션

| 순서 | Tab | 라벨 | 아이콘 | 페이지 | 상태 |
|------|-----|------|--------|--------|------|
| 1 | home | 홈 | Home | HomePage | 활성 |
| 2 | discover | 탐색 | Search | DiscoverPage | 활성 |
| 3 | compare | 비교 | GitCompare | ComparePage | 활성 |
| 4 | investinfo | 투자정보 | BookOpen | InvestInfoPage | 활성 |
| - | portfolio | 보유 | Briefcase | PortfolioPage | **숨김** |

---

## 데이터 스키마 문서

데이터 스키마 명세서: `docs/ETF_MTS_데이터스키마_명세서.xlsx`

### 포함된 시트

| 시트명 | 설명 |
|--------|------|
| ETF_마스터 | ETF 기본 정보 33개 필드 |
| 포트폴리오_보유 | 보유 종목 데이터 15개 필드 |
| 분배금_일정 | 분배금 일정 4개 필드 |
| 테마_카테고리 | 테마 분류 3개 필드 |
| 계좌_타입 | 계좌 유형 5개 필드 |
| 투자정보_콘텐츠 | 투자정보 콘텐츠 18개 필드 |
| 시장_지수 | 시장 지수 5개 필드 |
| 히트맵_테마 | 주간 테마 히트맵 3개 필드 |
| 코드_정의 | 코드값 정의 |
| API_명세 | 향후 개발용 API 엔드포인트 |

### 스키마 문서 재생성

```bash
node scripts/generate-schema-excel.cjs
```

---

## 배포

### Vercel 배포

```bash
# 프로덕션 배포
npx vercel --prod

# 배포 URL
https://etf-mts-demo-close-beta.vercel.app
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

# 데이터 스키마 엑셀 생성
node scripts/generate-schema-excel.cjs
```

---

## 주요 데이터 제약사항

### 연금계좌 투자 제한
- 레버리지/인버스 ETF 투자 불가
- `pensionPortfolioETFs`에 레버리지/인버스 상품 포함 금지

### 분배금 일정
- 배당/커버드콜 ETF 위주로 구성
- 월배당 ETF는 매월 말 지급일 추가

### 계좌 타입별 세율
- 일반계좌: 15.4%
- ISA계좌: 9.9% (비과세 한도 200만원)
- 연금계좌: 5.5% (세금이연)

---

## 향후 개선 사항

- [ ] 실시간 API 연동 (현재 목업 데이터)
- [ ] 사용자 인증/로그인
- [ ] 실제 주문 연동
- [ ] 알림 기능
- [ ] 관심종목 저장
- [ ] 포트폴리오 분석 리포트
- [ ] 분배금 알림 푸시

---

## 라이선스

내부 데모용 프로젝트
