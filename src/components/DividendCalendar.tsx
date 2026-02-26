import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Coins } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
// import { Badge } from './ui/badge' // 보유종목 표시 숨김으로 미사용
import { getDividendsByDate, getDividendDates, type ETF } from '@/data/mockData'
// import { getAccountTypesForETF } from '@/data/mockData' // 보유종목 표시 숨김으로 미사용

interface DividendCalendarProps {
  isOpen: boolean
  onClose: () => void
  accountType?: string
  onSelectETF?: (etf: ETF) => void
}

// 계좌 타입별 스타일 설정 - 보유종목 표시 숨김으로 미사용
// const accountTypeStyles: Record<string, { label: string; bgColor: string; textColor: string }> = {
//   general: { label: '일반', bgColor: 'bg-gray-500', textColor: 'text-white' },
//   pension: { label: '연금', bgColor: 'bg-emerald-500', textColor: 'text-white' },
//   isa: { label: 'ISA', bgColor: 'bg-blue-500', textColor: 'text-white' },
// }

export function DividendCalendar({ isOpen, onClose, onSelectETF }: DividendCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  // 분배금 일정이 있는 날짜들
  const dividendDates = useMemo(() => getDividendDates(), [])

  // 선택된 날짜의 분배금 ETF 목록
  const selectedDividends = useMemo(() => getDividendsByDate(selectedDate), [selectedDate])

  // 달력 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDay = firstDay.getDay() // 0 = Sunday
    const daysInMonth = lastDay.getDate()

    const days: { date: number; dateString: string; isCurrentMonth: boolean }[] = []

    // 이전 달의 날짜들
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i
      const month = currentMonth === 0 ? 12 : currentMonth
      const year = currentMonth === 0 ? currentYear - 1 : currentYear
      days.push({
        date,
        dateString: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
        isCurrentMonth: false
      })
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true
      })
    }

    // 다음 달의 날짜들 (6주 채우기)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const month = currentMonth === 11 ? 1 : currentMonth + 2
      const year = currentMonth === 11 ? currentYear + 1 : currentYear
      days.push({
        date: i,
        dateString: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false
      })
    }

    return days
  }, [currentYear, currentMonth])

  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString)
  }

  const handleETFClick = (etf: ETF) => {
    onSelectETF?.(etf)
    // 캘린더를 닫지 않음 - 뒤로 가기 시 캘린더로 복귀하도록
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[85vh] flex flex-col bg-[#1f1a2e] border-[#2d2640] p-0">
        {/* 헤더 - 고정 */}
        <DialogHeader className="shrink-0 p-3 pb-2 border-b border-[#2d2640]">
          <DialogTitle className="text-base text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#d64f79]" />
            분배금 캘린더
          </DialogTitle>
        </DialogHeader>

        {/* 달력 영역 - 고정 높이 */}
        <div className="shrink-0">
          {/* 달력 헤더 */}
          <div className="px-3 py-2 flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="p-1 hover:bg-[#2d2640] rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>
            <span className="text-white font-semibold text-sm">
              {currentYear}년 {monthNames[currentMonth]}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-[#2d2640] rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="px-3 grid grid-cols-7 gap-0.5 text-center">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={`text-[11px] py-0.5 font-medium ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 - 컴팩트 */}
          <div className="px-3 pb-2 grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => {
              const isToday = day.dateString === todayString
              const isSelected = day.dateString === selectedDate
              const hasDividend = dividendDates.includes(day.dateString)
              const dayOfWeek = index % 7

              return (
                <button
                  key={`${day.dateString}-${index}`}
                  onClick={() => handleDateClick(day.dateString)}
                  className={`
                    relative h-8 flex flex-col items-center justify-center rounded text-xs transition-all
                    ${!day.isCurrentMonth ? 'text-gray-600' :
                      dayOfWeek === 0 ? 'text-red-400' :
                      dayOfWeek === 6 ? 'text-blue-400' : 'text-white'}
                    ${isSelected ? 'bg-[#2d2640] ring-1 ring-[#d64f79]' : 'hover:bg-[#2d2640]/50'}
                    ${isToday ? 'font-bold' : ''}
                  `}
                >
                  {/* 오늘 날짜 표시 (은은한 원) */}
                  {isToday && (
                    <span className="absolute inset-0.5 rounded-full bg-[#d64f79]/20 border border-[#d64f79]/40" />
                  )}
                  <span className="relative z-10">{day.date}</span>
                  {/* 분배금 있는 날짜 표시 */}
                  {hasDividend && day.isCurrentMonth && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#d64f79]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 선택된 날짜의 분배금 ETF 리스트 - 나머지 공간 채움 + 스크롤 */}
        <div className="flex-1 flex flex-col min-h-0 border-t border-[#2d2640]">
          <div className="shrink-0 px-3 py-2 bg-[#2a2438]">
            <p className="text-xs text-gray-400">
              {selectedDate.replace(/-/g, '.')} 분배금 지급
              {selectedDividends.length > 0 && (
                <span className="ml-2 text-[#d64f79] font-medium">
                  {selectedDividends.length}개 ETF
                </span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedDividends.length === 0 ? (
              <div className="px-3 py-6 text-center text-gray-500 text-sm">
                해당 날짜에 분배금 지급 예정인 ETF가 없습니다
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {selectedDividends.map((dividend) => {
                  // 보유종목 표시 기능 숨김 - "보유종목 표시 다시 보이게 해줘"로 복구
                  // const accountTypes = getAccountTypesForETF(dividend.etfId)
                  // const isOwned = accountTypes.length > 0
                  return (
                    <button
                      key={dividend.etfId}
                      onClick={() => handleETFClick(dividend.etf)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg transition-all bg-[#2d2640]/50 hover:bg-[#2d2640]"
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-sm text-white font-medium">
                            {dividend.etf.shortName}
                          </span>
                          {/* 보유계좌 배지 숨김 - "보유종목 표시 다시 보이게 해줘"로 복구
                          {accountTypes.map((type) => {
                            const style = accountTypeStyles[type]
                            return (
                              <Badge
                                key={type}
                                variant="default"
                                className={`text-[7px] px-1 py-0 ${style.bgColor} hover:${style.bgColor} ${style.textColor}`}
                              >
                                {style.label}
                              </Badge>
                            )
                          })}
                          */}
                        </div>
                        <div className="text-[11px] text-gray-500">{dividend.etf.ticker}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#d64f79] font-semibold">
                          {dividend.dividendPerShare.toLocaleString()}원
                        </div>
                        <div className="text-[11px] text-gray-500">
                          주당
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 범례 - 고정 하단 */}
        <div className="shrink-0 px-3 py-1.5 border-t border-[#2d2640]">
          <div className="flex items-center justify-center gap-3 text-[8px] text-gray-500">
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d64f79]/30 border border-[#d64f79]/50" />
              <span>오늘</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[#d64f79]" />
              <span>지급일</span>
            </div>
          </div>
          {/* 보유계좌 범례 숨김 - "보유종목 표시 다시 보이게 해줘"로 복구 */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
