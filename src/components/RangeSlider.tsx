import { useState, useEffect, useCallback, useRef } from 'react'
import { HelpCircle } from 'lucide-react'

interface RangeSliderProps {
  label: string
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  onHelpClick?: () => void
  unit?: string
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
  onHelpClick,
  unit = ''
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<'min' | 'max' | null>(null)
  const localValueRef = useRef<[number, number]>(value)

  useEffect(() => {
    setLocalValue(value)
    localValueRef.current = value
  }, [value])

  const formatDisplay = (val: number) => {
    if (formatValue) return formatValue(val)
    return `${val}${unit}`
  }

  const getPercent = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const getValueFromPercent = (percent: number) => {
    const rawValue = min + (percent / 100) * (max - min)
    const steppedValue = Math.round(rawValue / step) * step
    return Math.max(min, Math.min(max, steppedValue))
  }

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isDragging.current = type
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleMouseUp)
  }

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = ((clientX - rect.left) / rect.width) * 100
    const clampedPercent = Math.max(0, Math.min(100, percent))
    const newValue = getValueFromPercent(clampedPercent)

    setLocalValue(prev => {
      let newLocalValue: [number, number]
      if (isDragging.current === 'min') {
        const newMin = Math.min(newValue, prev[1] - step)
        newLocalValue = [Math.max(min, newMin), prev[1]]
      } else {
        const newMax = Math.max(newValue, prev[0] + step)
        newLocalValue = [prev[0], Math.min(max, newMax)]
      }
      localValueRef.current = newLocalValue
      return newLocalValue
    })
  }, [min, max, step])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX)
  }, [handleMove])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      onChange(localValueRef.current)
      isDragging.current = null
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleMouseUp)
  }, [onChange, handleMouseMove, handleTouchMove])

  const leftPercent = getPercent(localValue[0])
  const rightPercent = getPercent(localValue[1])

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[17px] text-white font-medium">{label}</span>
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="p-0.5 hover:bg-[#2d2640] rounded transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>
        <span className="text-[15px] text-[#d64f79]">
          {formatDisplay(localValue[0])} ~ {formatDisplay(localValue[1])}
        </span>
      </div>

      <div
        ref={sliderRef}
        className="relative h-5 flex items-center"
      >
        {/* Track background */}
        <div className="absolute w-full h-1.5 bg-[#2d2640] rounded-full" />

        {/* Active track */}
        <div
          className="absolute h-1.5 bg-[#d64f79] rounded-full"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`
          }}
        />

        {/* Min handle */}
        <div
          className="absolute w-5 h-5 bg-[#d64f79] rounded-full cursor-pointer shadow-lg
                     flex items-center justify-center transform -translate-x-1/2
                     hover:scale-110 transition-transform touch-none"
          style={{ left: `${leftPercent}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>

        {/* Max handle */}
        <div
          className="absolute w-5 h-5 bg-[#d64f79] rounded-full cursor-pointer shadow-lg
                     flex items-center justify-center transform -translate-x-1/2
                     hover:scale-110 transition-transform touch-none"
          style={{ left: `${rightPercent}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[14px] text-gray-500">{formatDisplay(min)}</span>
        <span className="text-[14px] text-gray-500">{formatDisplay(max)}</span>
      </div>
    </div>
  )
}
