import { useState } from 'react'

// 브랜드명 → 로고 파일 매핑
const logoMap: Record<string, string> = {
  'KODEX': '/img/logo/kodex.JPG',
  'TIGER': '/img/logo/tiger.JPG',
  'ACE': '/img/logo/ace.JPG',
  'SOL': '/img/logo/sol.JPG',
  'RISE': '/img/logo/rise.JPG',
  'HANARO': '/img/logo/HANARO.png',
  'PLUS': '/img/logo/PLUS.png',
  'KIWOOM': '/img/logo/kiwoom.png',
  'KOSEF': '/img/logo/kiwoom.png', // KOSEF는 키움 브랜드
  '1Q': '/img/logo/1q.png',
  'TIME': '/img/logo/time.jpeg',
}

// ETF 종목명에서 브랜드 추출
const extractBrand = (shortName: string): string | null => {
  const upperName = shortName.toUpperCase()

  // 브랜드 키워드 순서대로 체크 (긴 것부터)
  const brands = ['KODEX', 'TIGER', 'HANARO', 'KIWOOM', 'KOSEF', 'RISE', 'PLUS', 'TIME', 'ACE', 'SOL', '1Q']

  for (const brand of brands) {
    if (upperName.startsWith(brand) || upperName.includes(brand)) {
      return brand
    }
  }

  return null
}

interface ETFLogoProps {
  shortName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ETFLogo({ shortName, size = 'md', className = '' }: ETFLogoProps) {
  const [imageError, setImageError] = useState(false)

  const brand = extractBrand(shortName)
  const logoSrc = brand ? logoMap[brand] : null

  // 사이즈 클래스
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const sizeClass = sizeClasses[size]

  // 로고가 있고 에러가 없으면 이미지 표시 (원형)
  if (logoSrc && !imageError) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-white flex items-center justify-center ${className}`}>
        <img
          src={logoSrc}
          alt={brand || 'ETF'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // 기본 ETF 뱃지 (폴백, 원형)
  return (
    <div className={`flex items-center justify-center ${sizeClass} rounded-full bg-[#2d2640] text-[11px] text-gray-400 font-medium ${className}`}>
      ETF
    </div>
  )
}
