import { useEffect, useState } from 'react'

interface KnowledgeQuoteLoaderProps {
  quotes?: string[]
  className?: string
}

const DEFAULT_QUOTES = [
  'Never share your PIN.',
  'Think before you click.',
  'Cyber safety starts with awareness.',
]

export const KnowledgeQuoteLoader = ({ 
  quotes = DEFAULT_QUOTES,
  className = '' 
}: KnowledgeQuoteLoaderProps) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)
      
      // Change quote after fade out
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
        setIsVisible(true)
      }, 300) // Half of transition duration
    }, 1500) // Change every 1.5 seconds

    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      {/* Quote Text */}
      <div className="mb-6 min-h-[3rem] flex items-center justify-center">
        <p
          className={`text-base font-semibold text-gray-800 text-center transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          "{quotes[currentQuoteIndex]}"
        </p>
      </div>
      
      {/* Spinner */}
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
        </div>
      </div>
      
      {/* Subtitle */}
      <p className="mt-4 text-xs text-gray-500 font-medium">
        Knowledge is Power
      </p>
    </div>
  )
}

