import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, X, MessageSquare, BookOpen, LogOut, UserCircle } from 'lucide-react'
import { paths } from '../routes/paths'
import { useAuth } from '../features/accounts/context/AuthContext'
import { LanguageToggle } from './LanguageToggle'
import { useNavbar } from './NavbarContext'

export const MobileMenu = () => {
  const navigate = useNavigate()
  const { account, logout } = useAuth()
  const { mobileMenuOpen, setMobileMenuOpen } = useNavbar()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Language state management
  const [language, setLanguage] = useState<'en' | 'sw'>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang === 'sw' || savedLang === 'en') {
      setLanguage(savedLang)
    }
    
    // Listen for language changes from chat page
    const handleLanguageChange = (e: CustomEvent) => {
      if (e.detail === 'sw' || e.detail === 'en') {
        setLanguage(e.detail)
      }
    }
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  useEffect(() => {
    localStorage.setItem('lang', language)
    // Dispatch custom event for chat page sync (in same window)
    const event = new CustomEvent('languageChange', { detail: language })
    window.dispatchEvent(event)
    console.log('Navbar: Language changed to', language, '- event dispatched')
  }, [language])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-expanded]')
      ) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen, setMobileMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate(paths.auth.login, { replace: true })
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { to: paths.chat.root, label: 'Chat', icon: MessageSquare },
    { to: paths.knowledge.root, label: 'Knowledge', icon: BookOpen },
  ]

  // Handle navigation with proper menu closing
  const handleNavigation = (path: string) => {
    // Close menu immediately to prevent any UI blocking
    setMobileMenuOpen(false)
    // Use requestAnimationFrame to ensure menu closes before navigation
    requestAnimationFrame(() => {
      navigate(path)
    })
  }

  return (
    <>
      {/* Mobile menu overlay with backdrop - Outside nav so it renders on mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu panel - Glassmorphic */}
          <div
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed top-4 left-4 right-4 z-[110] mx-auto max-w-sm max-h-[85vh] bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden translate-y-0 opacity-100 scale-100"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }}
          >
          {/* Menu Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">JamboSec</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              type="button"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="px-4 py-5 space-y-3 overflow-y-auto max-h-[calc(85vh-80px)]">
            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <button
                    key={link.to}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNavigation(link.to)
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-left text-gray-700 hover:bg-white/20 hover:backdrop-blur-sm border border-transparent hover:border-white/20"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Language Toggle in Mobile */}
            <div className="px-4 py-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-xl mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Language</span>
                <LanguageToggle
                  currentLang={language}
                  onToggle={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                />
              </div>
            </div>

            {/* User Menu in Mobile */}
            <div className="px-4 py-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-xl space-y-3 mt-2">
              <div className="flex items-center space-x-3 px-2">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-200/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-sm font-semibold text-blue-700">
                    {account?.displayName?.[0]?.toUpperCase() || account?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {account?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {account?.email}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNavigation(paths.accounts.root)
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-white/20 hover:backdrop-blur-sm border border-transparent hover:border-white/20 transition-all w-full text-left"
              >
                <UserCircle className="h-5 w-5" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-red-50/50 hover:backdrop-blur-sm hover:text-red-600 border border-transparent hover:border-red-200/30 transition-all"
                type="button"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
