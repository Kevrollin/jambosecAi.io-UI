import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSettings } from '../../../providers/SettingsContext'
import { LanguageToggle } from '../../../components/LanguageToggle'
import { GuideCard } from '../components/GuideCard'
import { AISuggestionCard } from '../components/AISuggestionCard'
import { AIPulseLoader } from '../components/AIPulseLoader'
import { KnowledgeQuoteLoader } from '../components/KnowledgeQuoteLoader'
import { useNavbar } from '../../../components/NavbarContext'
import {
  getCategories,
  getGuides,
  searchKnowledge,
} from '../services/knowledgeService'
import {
  generateAISuggestion,
  shouldUseAIFallback,
} from '../services/aiFallbackService'
import { Guide, GuideCategory, AIGeneratedSuggestion, SearchResult } from '../types'

export const KnowledgeHubPage = () => {
  const { settings, setLocale } = useSettings()
  const { toggleMobileMenu } = useNavbar()
  const [categories, setCategories] = useState<GuideCategory[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [aiSuggestion, setAISuggestion] = useState<AIGeneratedSuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Minimum display time for loader (2.5 seconds)
  const [showLoader, setShowLoader] = useState(true)
  const MIN_LOADER_DISPLAY_TIME = 2500 // 2.5 seconds

  const currentLang = (settings.locale === 'sw' ? 'sw' : 'en') as 'en' | 'sw'

  // Load categories and guides on mount and language change
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setShowLoader(true)
    const startTime = Date.now()
    
    try {
      const [categoriesData, guidesData] = await Promise.all([
        getCategories(),
        getGuides(),
      ])
      setCategories(categoriesData)
      setGuides(guidesData)
      setAISuggestion(null)
      
      // Ensure minimum display time
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    } catch (err) {
      setError('Failed to load knowledge base. Please try again later.')
      console.error('Error loading knowledge base:', err)
      
      // Even on error, show loader for minimum time
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    } finally {
      setShowLoader(false)
      setIsLoading(false)
    }
  }, [settings.locale])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle category filter
  const handleCategoryChange = useCallback(
    async (categorySlug: string) => {
      setSelectedCategory(categorySlug)
      setSearchQuery('')
      setAISuggestion(null)
      setIsLoading(true)
      setShowLoader(true)
      const startTime = Date.now()
      
      try {
        const filteredGuides = await getGuides({
          category: categorySlug || undefined,
        })
        setGuides(filteredGuides)
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } catch (err) {
        setError('Failed to filter guides. Please try again.')
        console.error('Error filtering guides:', err)
        
        // Even on error, show loader for minimum time
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } finally {
        setShowLoader(false)
        setIsLoading(false)
      }
    },
    [settings.locale],
  )

  // Handle search
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      setSelectedCategory('')
      setAISuggestion(null)

      if (!query.trim()) {
        // Reset to all guides
        setIsLoading(true)
        setShowLoader(true)
        const startTime = Date.now()
        try {
          const allGuides = await getGuides()
          setGuides(allGuides)
          
          // Ensure minimum display time
          const elapsed = Date.now() - startTime
          const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        } catch (err) {
          setError('Failed to load guides.')
          const elapsed = Date.now() - startTime
          const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        } finally {
          setShowLoader(false)
          setIsLoading(false)
        }
        return
      }

      setIsSearching(true)
      setShowLoader(true)
      const searchStartTime = Date.now()
      try {
        // Try regular guide search first (faster and more relevant for guides)
        const guideResults = await getGuides({ search: query })
        
        // Also try semantic search for documents/chunks
        let searchResults: SearchResult[] = []
        try {
          searchResults = await searchKnowledge(query, 10)
        } catch {
          // Semantic search might fail, continue with guide results
        }

        // Use guide results as primary
        let combinedGuides = guideResults

        // Try to match search results to existing guides
        if (searchResults.length > 0) {
          // Get all guides to match against
          const allGuidesForMatching = await getGuides()
          const guideMap = new Map(allGuidesForMatching.map((g) => [g.slug, g]))
          
          // Add guides that match search results
          const matchedGuides = searchResults
            .map((result) => guideMap.get(result.document_slug))
            .filter((g): g is Guide => g !== undefined)
          
          // Merge and deduplicate
          const guideSlugs = new Set(combinedGuides.map((g) => g.slug))
          matchedGuides.forEach((guide) => {
            if (!guideSlugs.has(guide.slug)) {
              combinedGuides.push(guide)
              guideSlugs.add(guide.slug)
            }
          })
        }

        setGuides(combinedGuides)

        // Check if we need AI fallback
        if (shouldUseAIFallback(query, combinedGuides)) {
          try {
            // Get all guides for related recommendations
            const allGuides = await getGuides()
            console.log('Generating AI suggestion for query:', query)
            const suggestion = await generateAISuggestion(query, allGuides)
            console.log('AI suggestion received:', suggestion)
            setAISuggestion(suggestion)
          } catch (aiError) {
            console.error('Error generating AI suggestion:', aiError)
            // Don't set error state, just log it - user can still see empty results
          }
        }
        
        // Ensure minimum display time for search
        const elapsed = Date.now() - searchStartTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } catch (err) {
        setError('Search failed. Please try again.')
        console.error('Search error:', err)
        
        // Even on error, show loader for minimum time
        const elapsed = Date.now() - searchStartTime
        const remainingTime = Math.max(0, MIN_LOADER_DISPLAY_TIME - elapsed)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      } finally {
        setShowLoader(false)
        setIsSearching(false)
      }
    },
    [settings.locale],
  )

  // Toggle language
  const handleLanguageToggle = useCallback(() => {
    const newLang = currentLang === 'en' ? 'sw' : 'en'
    setLocale(newLang)
  }, [currentLang, setLocale])

  // Filtered categories with "All Topics"
  const displayCategories = useMemo(() => {
    return [
      { slug: '', title: currentLang === 'sw' ? 'Mada Zote' : 'All Topics' },
      ...categories,
    ]
  }, [categories, currentLang])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Hamburger + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Open menu"
                type="button"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate sm:text-2xl lg:text-3xl">
                  {currentLang === 'sw' ? 'Jukwaa la Maarifa' : 'Knowledge Hub'}
                </h1>
                <p className="hidden text-xs text-gray-600 sm:block sm:text-sm">
                  {currentLang === 'sw'
                    ? 'Jifunze juu ya usalama wa kidijitali na mazoezi bora'
                    : 'Learn about cybersecurity and best practices'}
                </p>
              </div>
            </div>

            {/* Right: Language Toggle */}
            <div className="flex-shrink-0">
              <LanguageToggle
                currentLang={currentLang}
                onToggle={handleLanguageToggle}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                currentLang === 'sw'
                  ? 'Tafuta mada... (mfano: M-Pesa PIN)'
                  : 'Search topics... (e.g., M-Pesa PIN)'
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 pr-10 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-3"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4 overflow-x-auto sm:mb-6">
          <div className="flex gap-1 border-b border-gray-200 sm:gap-2">
            {displayCategories.map((category) => (
              <button
                key={category.slug}
                onClick={() => handleCategoryChange(category.slug)}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                  selectedCategory === category.slug
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 sm:mb-6 sm:p-4">
            <p className="text-sm sm:text-base">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-xs font-medium underline sm:text-sm"
            >
              {currentLang === 'sw' ? 'Jaribu tena' : 'Try again'}
            </button>
          </div>
        )}

        {/* Loading State - Initial Load */}
        {(isLoading || showLoader) && !isSearching && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AIPulseLoader 
              text={
                currentLang === 'sw'
                  ? 'Inachambua ombi lako kwa usalama…'
                  : 'Analyzing your query securely…'
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
        )}

        {/* Searching State */}
        {(isSearching || showLoader) && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AIPulseLoader 
              text={
                currentLang === 'sw'
                  ? 'Inatafuta vidokezo vya usalama wa kidijitali…'
                  : 'Scanning for digital safety tips…'
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
        )}

        {/* AI Suggestion */}
        {!isLoading && !isSearching && !showLoader && aiSuggestion && (
          <div className="mb-6 sm:mb-8">
            <AISuggestionCard suggestion={aiSuggestion} />
          </div>
        )}

        {/* Guides Grid */}
        {!isLoading && !isSearching && !showLoader && guides.length > 0 && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !isSearching &&
          !showLoader &&
          guides.length === 0 &&
          !aiSuggestion &&
          !searchQuery && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center sm:p-12">
              <p className="text-sm text-gray-600 sm:text-base">
                {currentLang === 'sw'
                  ? 'Hakuna mwongozo unaopatikana kwa kategoria hii.'
                  : 'No guides available for this category.'}
              </p>
            </div>
          )}

        {/* No Search Results (without AI) */}
        {!isLoading &&
          !isSearching &&
          !showLoader &&
          guides.length === 0 &&
          !aiSuggestion &&
          searchQuery && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center sm:p-12">
              <p className="text-sm text-gray-600 sm:text-base">
                {currentLang === 'sw'
                  ? `Hakuna matokeo yaliyopatikana kwa "${searchQuery}".`
                  : `No results found for "${searchQuery}".`}
              </p>
            </div>
          )}
      </div>
    </div>
  )
}

