import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

export interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface OnboardingTourProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingTour({ steps, isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({})
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({})
  const [isPositioned, setIsPositioned] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = steps[currentStep]

  const calculatePosition = useCallback(() => {
    if (!step?.target) return

    // 모바일/데스크톱에 따라 적절한 요소 선택
    const isMobile = window.innerWidth < 640
    let targetSelector = step.target

    // account-toggle의 경우 모바일에서는 mobile 버전 사용
    if (step.target === '[data-tour="account-toggle"]' && isMobile) {
      targetSelector = '[data-tour="account-toggle-mobile"]'
    }

    const element = document.querySelector(targetSelector)
    if (!element) {
      // 요소를 찾지 못하면 화면 중앙에 표시
      const tooltipWidth = isMobile ? Math.min(300, window.innerWidth - 32) : 320

      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${tooltipWidth}px`,
        zIndex: 10001,
      })
      setSpotlightStyle({ display: 'none' })
      setArrowStyle({ display: 'none' })
      setIsPositioned(true)
      return
    }

    const rect = element.getBoundingClientRect()
    const tooltipWidth = isMobile ? Math.min(300, window.innerWidth - 32) : 320
    const tooltipHeight = tooltipRef.current?.offsetHeight || 160
    const padding = isMobile ? 8 : 12
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Spotlight 스타일 업데이트
    setSpotlightStyle({
      position: 'fixed',
      top: `${rect.top - 4}px`,
      left: `${rect.left - 4}px`,
      width: `${rect.width + 8}px`,
      height: `${rect.height + 8}px`,
      borderRadius: '8px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
      zIndex: 10000,
      pointerEvents: 'none',
      transition: 'all 0.3s ease',
    })

    // 요소 위치에 따라 자동으로 placement 결정
    let placement = step.placement || 'bottom'

    // 모바일에서는 공간에 따라 자동 조정
    if (isMobile) {
      const spaceAbove = rect.top
      const spaceBelow = viewportHeight - rect.bottom

      if (placement === 'bottom' && spaceBelow < tooltipHeight + 80) {
        placement = 'top'
      } else if (placement === 'top' && spaceAbove < tooltipHeight + 20) {
        placement = 'bottom'
      }
    }

    let top = 0
    let left = 0
    let arrowTop = 'auto'
    let arrowBottom = 'auto'
    let arrowLeft = '50%'
    let arrowTransform = 'translateX(-50%) rotate(45deg)'
    let arrowBorderStyle = ''

    switch (placement) {
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowTop = '-6px'
        arrowBorderStyle = 'border-l border-t'
        break
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowBottom = '-6px'
        arrowTop = 'auto'
        arrowBorderStyle = 'border-r border-b'
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - padding
        arrowLeft = 'auto'
        arrowTransform = 'translateY(-50%) rotate(45deg)'
        arrowBorderStyle = 'border-t border-r'
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + padding
        arrowLeft = '-6px'
        arrowTransform = 'translateY(-50%) rotate(45deg)'
        arrowBorderStyle = 'border-b border-l'
        break
    }

    // 화면 경계 체크 및 조정
    const margin = 16

    // 좌우 경계 조정
    if (left < margin) {
      const diff = margin - left
      left = margin
      // 화살표 위치도 조정
      if (placement === 'top' || placement === 'bottom') {
        const newArrowLeft = Math.max(20, tooltipWidth / 2 - diff)
        arrowLeft = `${newArrowLeft}px`
        arrowTransform = 'rotate(45deg)'
      }
    }
    if (left + tooltipWidth > viewportWidth - margin) {
      const diff = (left + tooltipWidth) - (viewportWidth - margin)
      left = viewportWidth - tooltipWidth - margin
      // 화살표 위치도 조정
      if (placement === 'top' || placement === 'bottom') {
        const newArrowLeft = Math.min(tooltipWidth - 20, tooltipWidth / 2 + diff)
        arrowLeft = `${newArrowLeft}px`
        arrowTransform = 'rotate(45deg)'
      }
    }

    // 상하 경계 조정
    if (top < margin) {
      top = margin
    }
    if (top + tooltipHeight > viewportHeight - 80) { // 하단 네비게이션 공간 확보
      top = viewportHeight - tooltipHeight - 80
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 10001,
      transition: 'all 0.3s ease',
    })

    setArrowStyle({
      position: 'absolute',
      top: arrowTop,
      bottom: arrowBottom,
      left: arrowLeft,
      transform: arrowTransform,
      className: arrowBorderStyle,
    } as React.CSSProperties)

    setIsPositioned(true)
  }, [step])

  // 요소로 스크롤 후 위치 재계산
  const scrollToElement = useCallback(() => {
    if (!step?.target) return

    // 모바일/데스크톱에 따라 적절한 요소 선택
    const isMobile = window.innerWidth < 640
    let targetSelector = step.target

    // account-toggle의 경우 모바일에서는 mobile 버전 사용
    if (step.target === '[data-tour="account-toggle"]' && isMobile) {
      targetSelector = '[data-tour="account-toggle-mobile"]'
    }

    const element = document.querySelector(targetSelector)
    if (!element) {
      calculatePosition()
      return
    }

    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // 요소가 화면 밖에 있으면 스크롤
    if (rect.top < 80 || rect.bottom > viewportHeight - 120) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 스크롤 완료 후 위치 재계산
      setTimeout(() => {
        calculatePosition()
      }, 400)
    } else {
      calculatePosition()
    }
  }, [step, calculatePosition])

  useEffect(() => {
    if (isOpen) {
      setIsPositioned(false)
      // 약간의 딜레이 후 스크롤 및 위치 계산
      const timer = setTimeout(() => {
        scrollToElement()
      }, 100)

      const handleResize = () => {
        calculatePosition()
      }

      const handleScroll = () => {
        calculatePosition()
      }

      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isOpen, currentStep, scrollToElement, calculatePosition])

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setIsPositioned(false)
    }
  }, [isOpen])

  if (!isOpen || !step) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsPositioned(false)
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsPositioned(false)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  // 화살표 border 클래스 결정
  const getArrowBorderClass = () => {
    const placement = step.placement || 'bottom'
    switch (placement) {
      case 'bottom':
        return 'border-l border-t'
      case 'top':
        return 'border-r border-b'
      case 'left':
        return 'border-t border-r'
      case 'right':
        return 'border-b border-l'
      default:
        return 'border-l border-t'
    }
  }

  return (
    <>
      {/* Spotlight overlay */}
      <div style={spotlightStyle as React.CSSProperties} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          opacity: isPositioned ? 1 : 0,
        }}
        className="bg-[#1f1a2e] border border-[#d64f79] rounded-xl shadow-2xl p-4"
      >
        {/* Arrow */}
        {arrowStyle.display !== 'none' && (
          <div
            style={arrowStyle}
            className={`w-3 h-3 bg-[#1f1a2e] ${getArrowBorderClass()} border-[#d64f79]`}
          />
        )}

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-gray-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="mb-4 pr-6">
          <h3 className="text-[#d64f79] font-bold text-sm mb-2">{step.title}</h3>
          <p className="text-gray-300 text-xs leading-relaxed">{step.content}</p>
        </div>

        {/* Progress & Navigation */}
        <div className="flex items-center justify-between gap-2">
          {/* Progress dots - 모바일에서는 숨김 */}
          <div className="hidden sm:flex gap-1 flex-shrink-0">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-[#d64f79]' : 'bg-[#3d3650]'
                }`}
              />
            ))}
          </div>

          {/* Step counter for mobile */}
          <div className="sm:hidden text-xs text-gray-400">
            {currentStep + 1} / {steps.length}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              건너뛰기
            </button>
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-7 px-3 text-xs"
            >
              {currentStep === steps.length - 1 ? '완료' : '다음'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-0.5" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
