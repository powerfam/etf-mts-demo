import { Home, SlidersHorizontal, GitCompare, BookOpen } from 'lucide-react'
// import { Briefcase } from 'lucide-react' // 보유 탭 숨김으로 미사용
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'screening', label: '스크리닝', icon: SlidersHorizontal },
  { id: 'compare', label: '비교', icon: GitCompare },
  { id: 'investinfo', label: '투자정보', icon: BookOpen },
  // { id: 'portfolio', label: '보유', icon: Briefcase }, // 임시 숨김 - "보유 기능 다시 보이게 해줘"로 복구
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
                'nav-btn-3d',
                isActive && 'nav-btn-3d-active'
              )}
            >
              <div className="nav-icon-wrapper">
                <Icon />
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
