import { useState, useEffect, useCallback } from 'react'
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

  const step = steps[currentStep]

  const calculatePosition = useCallback(() => {
    if (!step?.target) return

    const element = document.querySelector(step.target)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const placement = step.placement || 'bottom'
    const padding = 12
    const tooltipWidth = 320
    const tooltipHeight = 160

    let top = 0
    let left = 0
    let arrowTop = 0
    let arrowLeft = 0

    switch (placement) {
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowTop = -8
        arrowLeft = tooltipWidth / 2 - 8
        break
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowTop = tooltipHeight - 8
        arrowLeft = tooltipWidth / 2 - 8
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - padding
        arrowTop = tooltipHeight / 2 - 8
        arrowLeft = tooltipWidth - 8
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + padding
        arrowTop = tooltipHeight / 2 - 8
        arrowLeft = -8
        break
    }

    // Boundary check
    if (left < 10) left = 10
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
    if (top < 10) top = 10
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = window.innerHeight - tooltipHeight - 10
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 10001,
    })

    setArrowStyle({
      position: 'absolute',
      top: `${arrowTop}px`,
      left: `${arrowLeft}px`,
    })

    // Highlight element
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [step])

  useEffect(() => {
    if (isOpen) {
      calculatePosition()
      window.addEventListener('resize', calculatePosition)
      window.addEventListener('scroll', calculatePosition)
      return () => {
        window.removeEventListener('resize', calculatePosition)
        window.removeEventListener('scroll', calculatePosition)
      }
    }
  }, [isOpen, currentStep, calculatePosition])

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  if (!isOpen || !step) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  // Get spotlight position
  const getSpotlightStyle = () => {
    const element = document.querySelector(step.target)
    if (!element) return {}
    const rect = element.getBoundingClientRect()
    return {
      position: 'fixed' as const,
      top: `${rect.top - 4}px`,
      left: `${rect.left - 4}px`,
      width: `${rect.width + 8}px`,
      height: `${rect.height + 8}px`,
      borderRadius: '8px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
      zIndex: 10000,
      pointerEvents: 'none' as const,
    }
  }

  return (
    <>
      {/* Spotlight overlay */}
      <div style={getSpotlightStyle()} />

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="bg-[#1f1a2e] border border-[#d64f79] rounded-xl shadow-2xl p-4"
      >
        {/* Arrow */}
        <div
          style={arrowStyle}
          className="w-4 h-4 bg-[#1f1a2e] border-l border-t border-[#d64f79] rotate-45"
        />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-[#d64f79] font-bold text-sm mb-1">{step.title}</h3>
          <p className="text-gray-300 text-xs leading-relaxed">{step.content}</p>
        </div>

        {/* Progress & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-[#d64f79]' : 'bg-[#3d3650]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-white px-2"
            >
              건너뛰기
            </button>
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="h-7 px-2"
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
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
