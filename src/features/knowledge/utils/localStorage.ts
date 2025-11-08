const RECENTLY_VIEWED_KEY = 'jambosec_recently_viewed_guides'
const MAX_RECENT_GUIDES = 5

export type RecentlyViewedGuide = {
  slug: string
  title: string
  viewedAt: string
}

/**
 * Get recently viewed guides from local storage
 */
export const getRecentlyViewedGuides = (): RecentlyViewedGuide[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
    if (!stored) return []
    const guides = JSON.parse(stored) as RecentlyViewedGuide[]
    // Sort by most recent first
    return guides.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
  } catch {
    return []
  }
}

/**
 * Add a guide to recently viewed
 */
export const addRecentlyViewedGuide = (slug: string, title: string): void => {
  try {
    const guides = getRecentlyViewedGuides()
    // Remove if already exists
    const filtered = guides.filter((g) => g.slug !== slug)
    // Add new one at the beginning
    const updated = [
      { slug, title, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_RECENT_GUIDES)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear recently viewed guides
 */
export const clearRecentlyViewedGuides = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY)
  } catch {
    // Ignore storage errors
  }
}

