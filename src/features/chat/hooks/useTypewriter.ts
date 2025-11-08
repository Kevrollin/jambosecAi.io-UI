import { useState, useEffect, useRef } from 'react'

/**
 * Hook for typewriter effect - displays text character by character
 */
export function useTypewriter(text: string, speed: number = 30): string {
  const [displayedText, setDisplayedText] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDisplayedText('')
    let currentIndex = 0

    const typeNext = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        timeoutRef.current = setTimeout(typeNext, speed)
      }
    }

    typeNext()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed])

  return displayedText
}

