import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onTouchStart, ...props }, ref) => {
    // PWA standalone 모드에서 iOS 키보드 이슈 해결
    const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      // 약간의 지연 후 focus 호출하여 iOS PWA에서 키보드가 나오도록 함
      setTimeout(() => {
        input.focus()
      }, 10)
      onTouchStart?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#3d3450] bg-[#2a2438] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d64f79] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "touch-action-manipulation",
          className
        )}
        ref={ref}
        onTouchStart={handleTouchStart}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
