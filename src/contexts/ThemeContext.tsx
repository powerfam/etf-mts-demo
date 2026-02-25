import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('etf-mts-theme')
    return saved !== 'light' // 기본값은 다크 모드
  })

  useEffect(() => {
    localStorage.setItem('etf-mts-theme', isDarkMode ? 'dark' : 'light')
    // HTML 요소에 클래스 추가하여 전역 스타일 적용
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode')
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
