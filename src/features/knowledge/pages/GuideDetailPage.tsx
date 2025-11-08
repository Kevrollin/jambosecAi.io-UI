import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSettings } from '../../../providers/SettingsContext'
import { LanguageToggle } from '../../../components/LanguageToggle'
import { AIPulseLoader } from '../components/AIPulseLoader'
import { KnowledgeQuoteLoader } from '../components/KnowledgeQuoteLoader'
import { getGuideDetail, submitGuideFeedback } from '../services/knowledgeService'
import { addRecentlyViewedGuide } from '../utils/localStorage'
import { GuideDetail } from '../types'
import { paths } from '../../../routes/paths'

export const GuideDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { settings, setLocale } = useSettings()
  const [guide, setGuide] = useState<GuideDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false)
  
  // Minimum display time for loader (2.5 seconds)
  const [showLoader, setShowLoader] = useState(true)
  const MIN_LOADER_DISPLAY_TIME = 2500 // 2.5 seconds

  const currentLang = (settings.locale === 'sw' ? 'sw' : 'en') as 'en' | 'sw'

  useEffect(() => {
    if (!slug) {
      navigate(paths.knowledge.root)
      return
    }

    const loadGuide = async () => {
      setIsLoading(true)
      setError(null)
      setShowLoader(true)
      setGuide(null) // Clear previous guide when loading new one
      setFeedback(null) // Reset feedback for new article
      setShowFeedbackThanks(false) // Reset feedback thanks message
      const startTime = Date.now()
      
      try {
        const guideData = await getGuideDetail(slug)
        setGuide(guideData)
        // Add to recently viewed
        addRecentlyViewedGuide(guideData.slug, guideData.title)
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } catch (err) {
        setError('Failed to load guide. Please try again.')
        console.error('Error loading guide:', err)
        
        // Even on error, show loader for minimum time
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } finally {
        setShowLoader(false)
        setIsLoading(false)
      }
    }

    loadGuide()
  }, [slug, settings.locale, navigate])

  const handleLanguageToggle = useCallback(() => {
    const newLang = currentLang === 'en' ? 'sw' : 'en'
    setLocale(newLang)
  }, [currentLang, setLocale])

  const handleFeedback = useCallback(
    async (value: 'helpful' | 'not-helpful') => {
      if (!slug) return

      setFeedback(value)
      setShowFeedbackThanks(true)

      try {
        // Send feedback to backend
        await submitGuideFeedback(slug, value)
      } catch (error) {
        console.error('Failed to submit feedback:', error)
        // Still show thanks message even if submission fails
      }

      setTimeout(() => {
        setShowFeedbackThanks(false)
      }, 3000)
    },
    [slug],
  )

  if (isLoading || showLoader) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to={paths.knowledge.root}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 sm:text-sm"
              >
                ← {currentLang === 'sw' ? 'Rudi kwenye Jukwaa la Maarifa' : 'Back to Knowledge Hub'}
              </Link>
              <div className="flex-shrink-0">
                <LanguageToggle
                  currentLang={currentLang}
                  onToggle={handleLanguageToggle}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Loader */}
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <AIPulseLoader 
            text={
              currentLang === 'sw'
                ? 'Inapakia mwongozo kwa usalama…'
                : 'Loading guide securely…'
            }
          />
          <div className="mt-8">
            <KnowledgeQuoteLoader
              quotes={
                currentLang === 'sw'
                  ? [
                      'Usishiriki PIN yako kamwe.',
                      'Fikiria kabla ya kubofya.',
                      'Usalama wa kidijitali huanza na ufahamu.',
                    ]
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 sm:p-6">
            <p className="text-sm font-medium sm:text-base">{error || 'Guide not found'}</p>
            <Link
              to={paths.knowledge.root}
              className="mt-3 inline-block text-xs font-medium underline sm:mt-4 sm:text-sm"
            >
              {currentLang === 'sw' ? 'Rudi kwenye Jukwaa la Maarifa' : 'Back to Knowledge Hub'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={paths.knowledge.root}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 sm:text-sm"
            >
              ← {currentLang === 'sw' ? 'Rudi kwenye Jukwaa la Maarifa' : 'Back to Knowledge Hub'}
            </Link>
            <div className="flex-shrink-0">
              <LanguageToggle
                currentLang={currentLang}
                onToggle={handleLanguageToggle}
              />
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Category Badge */}
        {guide.category && (
          <div className="mb-3 sm:mb-4">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 sm:px-3 sm:py-1 sm:text-sm">
              {guide.category.title}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl lg:text-4xl">{guide.title}</h1>

        {/* Meta Info */}
        <div className="mb-6 flex items-center gap-4 text-xs text-gray-600 sm:mb-8 sm:text-sm">
          <time dateTime={guide.published_at}>
            {new Date(guide.published_at).toLocaleDateString(currentLang === 'sw' ? 'sw-KE' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5 sm:mb-8 sm:gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 sm:px-3 sm:py-1 sm:text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div
            className="prose prose-sm max-w-none text-gray-700 sm:prose-base lg:prose-lg"
            dangerouslySetInnerHTML={{
              __html: guide.body
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br />')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>'),
            }}
          />
        </div>

        {/* Feedback Section */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
            {currentLang === 'sw' ? 'Ili kuwa na manufaa?' : 'Was this helpful?'}
          </h2>
          {!showFeedbackThanks ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <button
                onClick={() => handleFeedback('helpful')}
                disabled={feedback !== null}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  feedback === 'helpful'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base sm:text-lg">👍</span>
                {currentLang === 'sw' ? 'Na manufaa' : 'Helpful'}
              </button>
              <button
                onClick={() => handleFeedback('not-helpful')}
                disabled={feedback !== null}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  feedback === 'not-helpful'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base sm:text-lg">👎</span>
                {currentLang === 'sw' ? 'Haija manufaa' : 'Not helpful'}
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-green-50 p-3 text-green-700 sm:p-4">
              <p className="text-sm font-medium sm:text-base">
                {currentLang === 'sw'
                  ? 'Asante kwa maoni yako!'
                  : 'Thank you for your feedback!'}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

