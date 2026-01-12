import { Search, Bell, Menu } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'

interface HeaderProps {
  accountType: string
  onAccountTypeChange: (value: string) => void
}

export function Header({ accountType, onAccountTypeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2d2640] bg-[#191322]/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">ETF</h1>
        </div>

        {/* Account Context Toggle */}
        <ToggleGroup
          type="single"
          value={accountType}
          onValueChange={(value) => value && onAccountTypeChange(value)}
          className="hidden sm:flex"
        >
          <ToggleGroupItem value="general" className="text-xs">
            일반
          </ToggleGroupItem>
          <ToggleGroupItem value="pension" className="text-xs">
            연금
          </ToggleGroupItem>
          <ToggleGroupItem value="isa" className="text-xs">
            ISA
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#d64f79]" />
          </Button>
        </div>
      </div>

      {/* Mobile Account Toggle */}
      <div className="flex justify-center pb-2 sm:hidden">
        <ToggleGroup
          type="single"
          value={accountType}
          onValueChange={(value) => value && onAccountTypeChange(value)}
        >
          <ToggleGroupItem value="general" className="text-xs">
            일반
          </ToggleGroupItem>
          <ToggleGroupItem value="pension" className="text-xs">
            연금
          </ToggleGroupItem>
          <ToggleGroupItem value="isa" className="text-xs">
            ISA
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  )
}
