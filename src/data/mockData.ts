export interface ETF {
  id: string
  ticker: string
  name: string
  shortName: string
  price: number
  prevClose: number
  change: number
  changePercent: number
  iNav: number
  discrepancy: number
  ter: number
  spread: number
  adtv: number
  aum: number
  trackingError: number
  volatility: number
  dividendYield: number
  category: string
  tags: string[]
  healthScore: number
  isLeveraged?: boolean
  isInverse?: boolean
  isHedged?: boolean
  sparkline: number[]
  overview: string
  indexDescription: string
  strategy: string
  issuer: string
  listedDate: string
  indexProvider: string
  assetClass: string
  marketClass: string
}

export const themes = [
  { id: 'market', name: '시장대표', icon: 'TrendingUp' },
  { id: 'growth', name: '글로벌', icon: 'Rocket' },
  { id: 'dividend', name: '배당', icon: 'Coins' },
  { id: 'bond', name: '채권', icon: 'Shield' },
  { id: 'currency', name: '통화', icon: 'DollarSign' },
  { id: 'commodity', name: '원자재', icon: 'Gem' },
  { id: 'leverage', name: '레버리지', icon: 'Zap' },
  { id: 'pension', name: '연금', icon: 'Wallet' },
]

export const mockETFs: ETF[] = [
  {
    id: '1', ticker: '069500', name: 'KODEX 200', shortName: 'KODEX 200',
    price: 35420, prevClose: 35200, change: 220, changePercent: 0.63,
    iNav: 35415, discrepancy: 0.01, ter: 0.05, spread: 0.02,
    adtv: 892000000000, aum: 5200000000000, trackingError: 0.03, volatility: 12.5, dividendYield: 1.8,
    category: '시장대표', tags: ['국내', 'KOSPI200', '대형주'], healthScore: 98,
    sparkline: [35100, 35200, 35150, 35300, 35280, 35350, 35420],
    overview: 'KOSPI200 지수를 추종하는 국내 대표 ETF',
    indexDescription: 'KOSPI200: 유가증권시장 상장 대형주 200종목',
    strategy: '시가총액 가중 방식의 패시브 운용',
    issuer: '삼성자산운용', listedDate: '2002/10/14', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '2', ticker: '360750', name: 'TIGER 미국S&P500', shortName: 'TIGER 미국S&P500',
    price: 18750, prevClose: 18620, change: 130, changePercent: 0.70,
    iNav: 18745, discrepancy: 0.03, ter: 0.07, spread: 0.03,
    adtv: 756000000000, aum: 8900000000000, trackingError: 0.04, volatility: 14.2, dividendYield: 1.2,
    category: '글로벌', tags: ['미국', 'S&P500', '선진국'], healthScore: 96,
    sparkline: [18200, 18350, 18420, 18380, 18500, 18620, 18750],
    overview: '미국 S&P500 지수를 추종하는 ETF (환노출)',
    indexDescription: 'S&P500: 미국 대형주 500개 종목으로 구성',
    strategy: '보수 0.07%, 환헤지 미적용',
    issuer: '미래에셋자산운용', listedDate: '2020/08/07', indexProvider: 'S&P', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '3', ticker: '133690', name: 'TIGER 미국나스닥100', shortName: 'TIGER 나스닥100',
    price: 112500, prevClose: 111800, change: 700, changePercent: 0.63,
    iNav: 112480, discrepancy: 0.02, ter: 0.07, spread: 0.04,
    adtv: 456000000000, aum: 4200000000000, trackingError: 0.05, volatility: 18.3, dividendYield: 0.5,
    category: '글로벌', tags: ['미국', '나스닥', '기술주'], healthScore: 89,
    sparkline: [109800, 110200, 111000, 110800, 111500, 111800, 112500],
    overview: '미국 나스닥100 지수를 추종하는 ETF',
    indexDescription: '나스닥100: 나스닥 상장 비금융 대형주 100개 종목',
    strategy: '기술주 중심 구성, 환노출 상품',
    issuer: '미래에셋자산운용', listedDate: '2010/10/18', indexProvider: 'NASDAQ', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '4', ticker: '102110', name: 'TIGER 200', shortName: 'TIGER 200',
    price: 35380, prevClose: 35180, change: 200, changePercent: 0.57,
    iNav: 35375, discrepancy: 0.01, ter: 0.05, spread: 0.02,
    adtv: 623000000000, aum: 3800000000000, trackingError: 0.03, volatility: 12.4, dividendYield: 1.9,
    category: '시장대표', tags: ['국내', 'KOSPI200', '대형주'], healthScore: 97,
    sparkline: [35000, 35100, 35080, 35200, 35150, 35180, 35380],
    overview: 'KOSPI200 지수를 추종하는 ETF',
    indexDescription: 'KOSPI200: 유가증권시장 상장 대형주 200종목',
    strategy: '보수 0.05%, 패시브 운용',
    issuer: '미래에셋자산운용', listedDate: '2008/04/03', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '5', ticker: '379800', name: 'KODEX 미국S&P500TR', shortName: 'KODEX S&P500TR',
    price: 16890, prevClose: 16780, change: 110, changePercent: 0.66,
    iNav: 16885, discrepancy: 0.03, ter: 0.05, spread: 0.03,
    adtv: 234000000000, aum: 2100000000000, trackingError: 0.04, volatility: 14.0, dividendYield: 0,
    category: '글로벌', tags: ['미국', 'S&P500', 'TR'], healthScore: 94,
    sparkline: [16500, 16600, 16650, 16700, 16750, 16780, 16890],
    overview: 'S&P500 Total Return 지수 추종 (배당 재투자)',
    indexDescription: 'S&P500 TR: 배당금을 재투자하는 총수익 지수',
    strategy: '배당금 재투자 방식 운용',
    issuer: '삼성자산운용', listedDate: '2021/04/09', indexProvider: 'S&P', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '6', ticker: '122630', name: 'KODEX 레버리지', shortName: 'KODEX 레버리지',
    price: 18950, prevClose: 18700, change: 250, changePercent: 1.34,
    iNav: 18940, discrepancy: 0.05, ter: 0.64, spread: 0.05,
    adtv: 1890000000000, aum: 2800000000000, trackingError: 0.15, volatility: 25.0, dividendYield: 0,
    category: '레버리지', tags: ['국내', 'KOSPI200', '2배'], healthScore: 72, isLeveraged: true,
    sparkline: [18200, 18400, 18300, 18600, 18500, 18700, 18950],
    overview: 'KOSPI200 일일수익률 2배 추종',
    indexDescription: 'KOSPI200 레버리지: 일일 수익률 2배 추종',
    strategy: '파생상품 활용, 일일 수익률 2배 추종',
    issuer: '삼성자산운용', listedDate: '2010/02/22', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '7', ticker: '114800', name: 'KODEX 인버스', shortName: 'KODEX 인버스',
    price: 4125, prevClose: 4180, change: -55, changePercent: -1.32,
    iNav: 4128, discrepancy: -0.07, ter: 0.64, spread: 0.06,
    adtv: 567000000000, aum: 890000000000, trackingError: 0.12, volatility: 12.8, dividendYield: 0,
    category: '인버스', tags: ['국내', 'KOSPI200', '인버스'], healthScore: 68, isInverse: true,
    sparkline: [4300, 4250, 4280, 4200, 4220, 4180, 4125],
    overview: 'KOSPI200 일일수익률 역방향 추종',
    indexDescription: 'KOSPI200 인버스: 일일 수익률 -1배 추종',
    strategy: '파생상품 활용, 지수 하락 시 수익 구조',
    issuer: '삼성자산운용', listedDate: '2009/09/25', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '8', ticker: '161510', name: 'ARIRANG 고배당주', shortName: 'ARIRANG 고배당주',
    price: 12850, prevClose: 12780, change: 70, changePercent: 0.55,
    iNav: 12845, discrepancy: 0.04, ter: 0.23, spread: 0.08,
    adtv: 45000000000, aum: 320000000000, trackingError: 0.08, volatility: 10.2, dividendYield: 5.2,
    category: '배당', tags: ['국내', '고배당', '가치주'], healthScore: 82,
    sparkline: [12600, 12650, 12700, 12720, 12750, 12780, 12850],
    overview: '국내 고배당 종목으로 구성된 ETF',
    indexDescription: 'FnGuide 고배당주 지수 추종',
    strategy: '보수 0.23%, 배당성장률 기반 종목 선별',
    issuer: '한화자산운용', listedDate: '2012/08/29', indexProvider: 'FnGuide', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '9', ticker: '153130', name: 'KODEX 단기채권', shortName: 'KODEX 단기채권',
    price: 102450, prevClose: 102430, change: 20, changePercent: 0.02,
    iNav: 102448, discrepancy: 0.00, ter: 0.05, spread: 0.01,
    adtv: 89000000000, aum: 1200000000000, trackingError: 0.01, volatility: 0.8, dividendYield: 3.2,
    category: '채권', tags: ['국내', '단기채', '안전자산'], healthScore: 99,
    sparkline: [102380, 102390, 102400, 102410, 102420, 102430, 102450],
    overview: '국내 단기 채권에 투자하는 안정형 ETF',
    indexDescription: 'KIS 단기채권 지수 추종',
    strategy: '듀레이션 짧은 채권 위주, 금리 민감도 낮음',
    issuer: '삼성자산운용', listedDate: '2012/02/13', indexProvider: 'KIS', assetClass: '채권', marketClass: '국내',
  },
  {
    id: '10', ticker: '138230', name: 'KOSEF 미국달러선물', shortName: 'KOSEF 달러선물',
    price: 13250, prevClose: 13180, change: 70, changePercent: 0.53,
    iNav: 13245, discrepancy: 0.04, ter: 0.25, spread: 0.05,
    adtv: 78000000000, aum: 450000000000, trackingError: 0.06, volatility: 8.5, dividendYield: 0,
    category: '통화', tags: ['미국', '달러', '환율'], healthScore: 85,
    sparkline: [13050, 13080, 13120, 13100, 13150, 13180, 13250],
    overview: '미국 달러 선물에 투자하는 ETF',
    indexDescription: 'S&P GSCI USD Index 추종',
    strategy: '달러 자산 투자, 환헤지 미적용',
    issuer: '키움투자자산운용', listedDate: '2010/11/18', indexProvider: 'S&P', assetClass: '통화', marketClass: '해외',
  },
  {
    id: '11', ticker: '305720', name: 'KODEX 2차전지산업', shortName: 'KODEX 2차전지',
    price: 8950, prevClose: 8820, change: 130, changePercent: 1.47,
    iNav: 8945, discrepancy: 0.06, ter: 0.45, spread: 0.08,
    adtv: 234000000000, aum: 890000000000, trackingError: 0.12, volatility: 28.5, dividendYield: 0.3,
    category: '테마', tags: ['국내', '2차전지', '성장주'], healthScore: 78,
    sparkline: [8500, 8600, 8550, 8700, 8750, 8820, 8950],
    overview: '2차전지 관련 기업에 투자하는 테마 ETF',
    indexDescription: 'FnGuide 2차전지산업 지수 추종',
    strategy: '2차전지 핵심 밸류체인 투자',
    issuer: '삼성자산운용', listedDate: '2018/09/10', indexProvider: 'FnGuide', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '12', ticker: '091160', name: 'KODEX 반도체', shortName: 'KODEX 반도체',
    price: 42300, prevClose: 41800, change: 500, changePercent: 1.20,
    iNav: 42280, discrepancy: 0.05, ter: 0.45, spread: 0.06,
    adtv: 312000000000, aum: 1100000000000, trackingError: 0.10, volatility: 26.2, dividendYield: 0.4,
    category: '테마', tags: ['국내', '반도체', '기술주'], healthScore: 81,
    sparkline: [40500, 41000, 41200, 41500, 41600, 41800, 42300],
    overview: '국내 반도체 관련 기업에 집중 투자',
    indexDescription: 'KRX 반도체 지수 추종',
    strategy: '삼성전자, SK하이닉스 등 핵심 반도체 기업 투자',
    issuer: '삼성자산운용', listedDate: '2006/06/27', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '13', ticker: '381180', name: 'TIGER 미국테크TOP10', shortName: 'TIGER 테크TOP10',
    price: 15680, prevClose: 15520, change: 160, changePercent: 1.03,
    iNav: 15675, discrepancy: 0.03, ter: 0.49, spread: 0.07,
    adtv: 123000000000, aum: 670000000000, trackingError: 0.09, volatility: 22.5, dividendYield: 0.2,
    category: '글로벌', tags: ['미국', '빅테크', 'TOP10'], healthScore: 84,
    sparkline: [15100, 15200, 15300, 15350, 15450, 15520, 15680],
    overview: '미국 시가총액 상위 10개 기술주에 집중 투자',
    indexDescription: 'NYSE FANG+ 지수 추종',
    strategy: '소수 종목 집중 투자 방식',
    issuer: '미래에셋자산운용', listedDate: '2021/04/29', indexProvider: 'NYSE', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '14', ticker: '251340', name: 'KODEX 코스닥150', shortName: 'KODEX 코스닥150',
    price: 11250, prevClose: 11180, change: 70, changePercent: 0.63,
    iNav: 11245, discrepancy: 0.04, ter: 0.25, spread: 0.05,
    adtv: 178000000000, aum: 520000000000, trackingError: 0.06, volatility: 18.5, dividendYield: 0.5,
    category: '시장대표', tags: ['국내', '코스닥', '중소형'], healthScore: 86,
    sparkline: [10900, 11000, 11050, 11100, 11120, 11180, 11250],
    overview: '코스닥 시장 대표 150개 종목 투자',
    indexDescription: '코스닥150 지수 추종',
    strategy: '저비용 패시브 운용',
    issuer: '삼성자산운용', listedDate: '2016/05/27', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '15', ticker: '132030', name: 'KODEX 골드선물(H)', shortName: 'KODEX 골드선물',
    price: 16780, prevClose: 16650, change: 130, changePercent: 0.78,
    iNav: 16775, discrepancy: 0.03, ter: 0.68, spread: 0.06,
    adtv: 67000000000, aum: 380000000000, trackingError: 0.08, volatility: 14.2, dividendYield: 0,
    category: '원자재', tags: ['금', '원자재', '인플레헤지'], healthScore: 80, isHedged: true,
    sparkline: [16300, 16400, 16450, 16500, 16580, 16650, 16780],
    overview: '금 선물에 투자하는 원자재 ETF (환헤지)',
    indexDescription: 'S&P GSCI Gold Index 추종',
    strategy: '인플레이션 헤지, 안전자산 투자',
    issuer: '삼성자산운용', listedDate: '2010/07/05', indexProvider: 'S&P', assetClass: '원자재', marketClass: '해외',
  },
  {
    id: '16', ticker: '411060', name: 'ACE 미국배당다우존스', shortName: 'ACE 미국배당',
    price: 12450, prevClose: 12380, change: 70, changePercent: 0.57,
    iNav: 12445, discrepancy: 0.04, ter: 0.05, spread: 0.04,
    adtv: 89000000000, aum: 1200000000000, trackingError: 0.05, volatility: 11.8, dividendYield: 3.8,
    category: '배당', tags: ['미국', '배당', '안정형'], healthScore: 92,
    sparkline: [12200, 12250, 12280, 12320, 12350, 12380, 12450],
    overview: '미국 고배당 기업에 투자하는 ETF',
    indexDescription: 'Dow Jones U.S. Dividend 100 지수 추종',
    strategy: '배당 지속성 높은 종목 선별',
    issuer: '한국투자신탁운용', listedDate: '2022/03/17', indexProvider: 'S&P', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '17', ticker: '229200', name: 'KODEX 코스닥150레버리지', shortName: 'KODEX 코스닥레버리지',
    price: 6850, prevClose: 6720, change: 130, changePercent: 1.93,
    iNav: 6845, discrepancy: 0.07, ter: 0.64, spread: 0.08,
    adtv: 456000000000, aum: 620000000000, trackingError: 0.18, volatility: 38.5, dividendYield: 0,
    category: '레버리지', tags: ['국내', '코스닥', '2배'], healthScore: 65, isLeveraged: true,
    sparkline: [6400, 6500, 6450, 6600, 6650, 6720, 6850],
    overview: '코스닥150 일일수익률 2배 추종',
    indexDescription: '코스닥150 레버리지 지수',
    strategy: '상승장 단기 트레이딩용',
    issuer: '삼성자산운용', listedDate: '2016/06/30', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '18', ticker: '252670', name: 'KODEX 200선물인버스2X', shortName: 'KODEX 인버스2X',
    price: 2180, prevClose: 2240, change: -60, changePercent: -2.68,
    iNav: 2182, discrepancy: -0.09, ter: 0.64, spread: 0.10,
    adtv: 890000000000, aum: 1100000000000, trackingError: 0.22, volatility: 26.0, dividendYield: 0,
    category: '인버스', tags: ['국내', 'KOSPI200', '인버스2X'], healthScore: 58, isInverse: true, isLeveraged: true,
    sparkline: [2400, 2350, 2380, 2300, 2280, 2240, 2180],
    overview: 'KOSPI200 선물 일일수익률 -2배 추종',
    indexDescription: 'KOSPI200 선물 인버스 2X',
    strategy: '하락장 2배 수익 추구',
    issuer: '삼성자산운용', listedDate: '2016/09/22', indexProvider: 'KRX', assetClass: '주식', marketClass: '국내',
  },
  {
    id: '19', ticker: '453330', name: 'TIGER 미국S&P500(H)', shortName: 'TIGER S&P500(H)',
    price: 12850, prevClose: 12780, change: 70, changePercent: 0.55,
    iNav: 12845, discrepancy: 0.04, ter: 0.14, spread: 0.04,
    adtv: 123000000000, aum: 890000000000, trackingError: 0.05, volatility: 13.5, dividendYield: 1.3,
    category: '글로벌', tags: ['미국', 'S&P500', '환헤지'], healthScore: 90, isHedged: true,
    sparkline: [12500, 12580, 12620, 12680, 12720, 12780, 12850],
    overview: '미국 S&P500 지수 추종 (환헤지)',
    indexDescription: 'S&P500 지수 (원화 헤지)',
    strategy: '환위험 헤지로 순수 지수 수익 추구',
    issuer: '미래에셋자산운용', listedDate: '2023/03/28', indexProvider: 'S&P', assetClass: '주식', marketClass: '해외',
  },
  {
    id: '20', ticker: '261220', name: 'KODEX WTI원유선물', shortName: 'KODEX WTI원유',
    price: 8450, prevClose: 8380, change: 70, changePercent: 0.84,
    iNav: 8445, discrepancy: 0.06, ter: 0.68, spread: 0.08,
    adtv: 45000000000, aum: 280000000000, trackingError: 0.15, volatility: 32.5, dividendYield: 0,
    category: '원자재', tags: ['원유', 'WTI', '원자재'], healthScore: 72,
    sparkline: [8100, 8200, 8150, 8280, 8320, 8380, 8450],
    overview: 'WTI 원유 선물에 투자하는 원자재 ETF',
    indexDescription: 'S&P GSCI Crude Oil Index 추종',
    strategy: 'WTI 원유 선물 롤오버 전략',
    issuer: '삼성자산운용', listedDate: '2016/11/03', indexProvider: 'S&P', assetClass: '원자재', marketClass: '해외',
  },
]

export const portfolioETFs = mockETFs.slice(0, 5).map((etf, index) => {
  const quantity = [100, 50, 30, 20, 10][index]
  const avgPrice = Math.round(etf.price * (0.9 + Math.random() * 0.2))
  const totalValue = etf.price * quantity
  const profitLoss = (etf.price - avgPrice) * quantity
  const profitLossPercent = ((etf.price - avgPrice) / avgPrice) * 100
  return { ...etf, quantity, avgPrice, totalValue, profitLoss, profitLossPercent }
})
