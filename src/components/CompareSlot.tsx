import { useState, useRef, useEffect } from 'react'
import { X, Scale, ChevronUp, ChevronDown } from 'lucide-react'
import type { ETF } from '@/data/mockData'

interface CompareSlotProps {
  compareETFs: ETF[]
  onRemove: (etfId: string) => void
  onClear: () => void
  onGoToCompare: () => void
}

export function CompareSlot({ compareETFs, onRemove, onClear, onGoToCompare }: CompareSlotProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const prevLengthRef = useRef(compareETFs.length)

  // 새 ETF 추가 시에만 애니메이션 트리거
  useEffect(() => {
    if (compareETFs.length > prevLengthRef.current && compareETFs.length > 0) {
      const lastETF = compareETFs[compareETFs.length - 1]
      setAnimatingId(lastETF.id)
      const timer = setTimeout(() => setAnimatingId(null), 400)
      return () => clearTimeout(timer)
    }
    prevLengthRef.current = compareETFs.length
  }, [compareETFs.length])

  if (compareETFs.length === 0) return null

  return (
    <div
      className={`fixed left-0 right-0 z-40 px-4 transition-all duration-300 ease-out ${
        isMinimized ? 'bottom-[68px]' : 'bottom-[68px]'
      }`}
    >
      <div
        className={`bg-[#2a1f3d]/95 backdrop-blur-sm border border-[#d64f79]/40 rounded-2xl shadow-2xl shadow-[#d64f79]/10 overflow-hidden transition-all duration-300 ${
          isMinimized ? 'py-2 px-3' : 'p-3'
        }`}
      >
        {/* 헤더 - 항상 표시 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[#d64f79]" />
            <span>비교 목록</span>
            <span className="bg-[#d64f79] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {compareETFs.length}
            </span>
            {isMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {!isMinimized && (
              <button
                onClick={onClear}
                className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
              >
                전체삭제
              </button>
            )}
            <button
              onClick={onGoToCompare}
              disabled={compareETFs.length < 2}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                compareETFs.length >= 2
                  ? 'bg-[#d64f79] text-white hover:bg-[#e5608a] active:scale-95'
                  : 'bg-[#3d3650] text-gray-500 cursor-not-allowed'
              }`}
            >
              비교하기
            </button>
          </div>
        </div>

        {/* 슬롯 영역 - 최소화 아닐 때만 표시 */}
        {!isMinimized && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {compareETFs.map((etf, index) => (
              <button
                key={etf.id}
                onClick={() => onRemove(etf.id)}
                className={`group relative flex items-center gap-1.5 bg-[#3d3650] hover:bg-red-500/30 rounded-lg px-2.5 py-2 min-w-0 shrink-0 max-w-[140px] cursor-pointer transition-all active:scale-95 ${
                  animatingId === etf.id ? 'animate-slot-in' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                title={`${etf.name} - 클릭하여 삭제`}
              >
                {/* 순번 */}
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#d64f79]/30 text-[#d64f79] text-[10px] flex items-center justify-center font-bold group-hover:bg-red-500/50 group-hover:text-white transition-colors">
                  {index + 1}
                </span>
                {/* ETF 이름 */}
                <span className="truncate text-xs text-white font-medium group-hover:line-through group-hover:text-gray-400 transition-all">
                  {etf.shortName}
                </span>
                {/* X 아이콘 - 호버 시 표시 */}
                <X className="flex-shrink-0 w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-all" />

                {/* CSS Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1f1a2e] border border-[#3d3650] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  <p className="text-xs text-white">{etf.name}</p>
                  <p className="text-[10px] text-gray-400">{etf.ticker} • 클릭하여 삭제</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3d3650]" />
                </div>
              </button>
            ))}

            {/* 빈 슬롯 표시 */}
            {Array.from({ length: 4 - compareETFs.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex-shrink-0 w-10 h-8 rounded-lg border border-dashed border-[#3d3650] flex items-center justify-center"
              >
                <span className="text-[10px] text-gray-600">{compareETFs.length + idx + 1}</span>
              </div>
            ))}
          </div>
        )}

        {/* 최소화 상태일 때 미니 칩 표시 */}
        {isMinimized && (
          <div className="flex gap-1 mt-1.5 overflow-hidden">
            {compareETFs.slice(0, 4).map((etf) => (
              <div
                key={etf.id}
                className="bg-[#3d3650] rounded px-1.5 py-0.5 text-[10px] text-white truncate max-w-[60px]"
              >
                {etf.shortName.slice(0, 6)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
