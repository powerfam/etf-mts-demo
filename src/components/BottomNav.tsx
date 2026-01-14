import { Home, Search, GitCompare, Briefcase, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'discover', label: '탐색', icon: Search },
  { id: 'investinfo', label: '투자정보', icon: BookOpen },
  { id: 'compare', label: '비교', icon: GitCompare },
  { id: 'portfolio', label: '보유', icon: Briefcase },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2d2640] bg-[#191322]/95 backdrop-blur" data-tour="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive ? 'text-[#d64f79]' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_8px_rgba(214,79,121,0.5)]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
