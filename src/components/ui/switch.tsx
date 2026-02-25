import { Sun, Moon } from 'lucide-react'

interface ThemeSwitchProps {
  isDarkMode: boolean
  onToggle: () => void
}

export function ThemeSwitch({ isDarkMode, onToggle }: ThemeSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative inline-flex h-8 w-16 items-center rounded-full
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#d64f79] focus:ring-offset-2
        ${isDarkMode
          ? 'bg-gradient-to-b from-[#3d3650] to-[#2d2640] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.1)]'
          : 'bg-gradient-to-b from-[#e5e7eb] to-[#d1d5db] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_2px_rgba(255,255,255,0.5)]'
        }
      `}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {/* 트랙 내부 음영 효과 */}
      <span className={`
        absolute inset-0.5 rounded-full
        ${isDarkMode
          ? 'bg-gradient-to-b from-[#252038] to-[#2d2640]'
          : 'bg-gradient-to-b from-[#f3f4f6] to-[#e5e7eb]'
        }
      `} />

      {/* 슬라이딩 노브 (3D 입체감) */}
      <span
        className={`
          relative z-10 inline-flex h-6 w-6 transform items-center justify-center
          rounded-full transition-all duration-300 ease-in-out
          ${isDarkMode
            ? 'translate-x-9 bg-gradient-to-b from-[#3d3650] to-[#191322] shadow-[0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]'
            : 'translate-x-1 bg-gradient-to-b from-white to-[#f3f4f6] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)]'
          }
        `}
      >
        {/* 노브 내부 하이라이트 */}
        <span className={`
          absolute inset-0.5 rounded-full
          ${isDarkMode
            ? 'bg-gradient-to-b from-[#4d4660]/50 to-transparent'
            : 'bg-gradient-to-b from-white/80 to-transparent'
          }
        `} />

        {/* 아이콘 */}
        {isDarkMode ? (
          <Moon className="relative z-10 h-3.5 w-3.5 text-[#d64f79] drop-shadow-sm" />
        ) : (
          <Sun className="relative z-10 h-3.5 w-3.5 text-amber-500 drop-shadow-sm" />
        )}
      </span>

      {/* 배경 아이콘들 */}
      <span className="absolute left-2 z-0 flex items-center justify-center">
        <Sun className={`h-3.5 w-3.5 transition-all duration-300 ${
          isDarkMode
            ? 'text-amber-400/40 opacity-100'
            : 'text-amber-400 opacity-0 scale-75'
        }`} />
      </span>
      <span className="absolute right-2 z-0 flex items-center justify-center">
        <Moon className={`h-3.5 w-3.5 transition-all duration-300 ${
          isDarkMode
            ? 'text-gray-500 opacity-0 scale-75'
            : 'text-gray-400/60 opacity-100'
        }`} />
      </span>
    </button>
  )
}
