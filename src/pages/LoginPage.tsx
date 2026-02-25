import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ShinyText } from '../components/ui/shiny-text'
import { Lock, User, Eye, EyeOff } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

const VALID_CREDENTIALS = {
  id: 'master',
  password: 'testkw123!'
}

const ETF_LOGOS = [
  '/img/logo/tiger.JPG',
  '/img/logo/kodex.JPG',
  '/img/logo/ace.JPG',
  '/img/logo/sol.JPG',
  '/img/logo/rise.JPG',
  '/img/logo/tiger.JPG',
  '/img/logo/kodex.JPG',
  '/img/logo/ace.JPG',
  '/img/logo/sol.JPG',
  '/img/logo/rise.JPG',
]

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      if (userId === VALID_CREDENTIALS.id && password === VALID_CREDENTIALS.password) {
        sessionStorage.setItem('etf-mts-auth', 'authenticated')
        onLogin()
      } else {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen lg:h-screen bg-[#191322] flex flex-col lg:flex-row overflow-auto">
      {/* Mobile: Top Visual Section / Desktop: Right Side */}
      <div className="order-1 lg:order-2 w-full lg:w-1/2 relative overflow-hidden h-[40vh] min-h-[200px] lg:h-full flex-shrink-0">
        {/* Background Hero Image */}
        <div className="absolute inset-0">
          <img
            src="/img/home_login.png"
            alt="ETF MTS Preview"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'left center' }}
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#191322] via-[#191322]/60 to-transparent" />
          {/* Glossy Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* Content Overlay - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex relative z-10 h-full flex-col justify-end p-10">
          {/* ETF Logo Wave */}
          <div className="w-full overflow-hidden mb-8">
            <div className="flex animate-logoWave">
              {[...ETF_LOGOS, ...ETF_LOGOS].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-12 h-12 mx-3 rounded-lg overflow-hidden opacity-40 hover:opacity-60 transition-opacity duration-300"
                >
                  <img
                    src={logo}
                    alt="ETF Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="text-left space-y-3">
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">
              Smart Investment Platform
            </p>
            <ShinyText
              text="All that ETF"
              className="text-4xl font-bold tracking-tight"
              color="#9ca3af"
              shineColor="#d64f79"
              speed={3}
              spread={90}
            />
            <p className="text-gray-500 text-base max-w-md leading-relaxed">
              ETF 탐색부터 검증, 투자까지 한 곳에서.
              <br />
              스마트한 투자의 시작.
            </p>
          </div>
        </div>

        {/* Mobile: Compact Content Overlay */}
        <div className="flex lg:hidden relative z-10 h-full flex-col justify-end p-4 pb-6">
          {/* ETF Logo Wave - Smaller on mobile */}
          <div className="w-full overflow-hidden mb-4">
            <div className="flex animate-logoWave">
              {[...ETF_LOGOS, ...ETF_LOGOS].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-8 h-8 mx-2 rounded-md overflow-hidden opacity-40"
                >
                  <img
                    src={logo}
                    alt="ETF Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Text - Centered & Compact */}
          <div className="text-center space-y-1">
            <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">
              Smart Investment Platform
            </p>
            <ShinyText
              text="All that ETF"
              className="text-xl font-bold tracking-tight"
              color="#9ca3af"
              shineColor="#d64f79"
              speed={3}
              spread={90}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Login Form / Desktop: Left Side */}
      <div className="order-2 lg:order-1 w-full lg:w-1/2 flex items-center justify-center p-4 py-8 lg:p-8 relative z-10 flex-shrink-0">
        <Card className="w-full max-w-sm bg-[#1f1a2e]/95 border-none backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 bg-[#d64f79]/20 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-[#d64f79]" />
            </div>
            <CardTitle className="text-lg lg:text-xl text-white">ETF MTS Demo</CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              로그인이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">아이디</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="pl-10"
                    placeholder="아이디 입력"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="비밀번호 입력"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading || !userId || !password}
                className="w-full"
                size="lg"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes logoWave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-logoWave {
          animation: logoWave 25s linear infinite;
        }
      `}</style>
    </div>
  )
}
