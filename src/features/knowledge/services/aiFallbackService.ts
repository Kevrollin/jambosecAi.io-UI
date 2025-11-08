import { Guide, AIGeneratedSuggestion } from '../types'
import { getAISuggestion } from './knowledgeService'

/**
 * Generate AI suggestion using the backend API (Gemini).
 * Falls back to mock if backend is unavailable.
 */
export const generateAISuggestion = async (
  query: string,
  allGuides: Guide[],
): Promise<AIGeneratedSuggestion> => {
  try {
    // Extract related guides based on keywords
    const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
    const relatedGuides = allGuides
      .filter((guide) => {
        const titleLower = guide.title.toLowerCase()
        const tagsLower = (guide.tags || []).join(' ').toLowerCase()
        const searchText = `${titleLower} ${tagsLower}`
        return keywords.some((keyword) => searchText.includes(keyword))
      })
      .slice(0, 3)

    // Call backend AI suggestion API
    const relatedGuideSlugs = relatedGuides.map((g) => g.slug)
    const suggestion = await getAISuggestion(query, relatedGuideSlugs)

    // getAISuggestion already converts to camelCase, so return directly
    return suggestion
  } catch (error) {
    console.error('Error generating AI suggestion from backend:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    // Fallback to mock if backend fails
    return _fallbackMockSuggestion(query, allGuides)
  }
}

/**
 * Mock fallback when backend is unavailable.
 */
function _fallbackMockSuggestion(
  query: string,
  allGuides: Guide[],
): AIGeneratedSuggestion {
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  const relatedGuides = allGuides
    .filter((guide) => {
      const titleLower = guide.title.toLowerCase()
      const tagsLower = (guide.tags || []).join(' ').toLowerCase()
      const searchText = `${titleLower} ${tagsLower}`
      return keywords.some((keyword) => searchText.includes(keyword))
    })
    .slice(0, 3)

  const isSwahili =
    /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(query) ||
    query.toLowerCase().includes('mpesa') ||
    query.toLowerCase().includes('salamu')

  if (isSwahili) {
    return {
      title: `Ushauri wa Usalama wa Kidijitali: ${query}`,
      content: `Kuhusu "${query}", hii ni ushauri muhimu wa usalama wa kidijitali:

1. **Thibitisha chanzo**: Daima hakikisha kuwa ujumbe au taarifa inayokuja kwako ni kutoka kwa chanzo cha kuaminika.

2. **Usishiriki maelezo binafsi**: Usikariri nambari yako ya siri, PIN, au maelezo yoyote ya kifedha kwa mtu yeyote.

3. **Tumia wifi salama**: Epuka kutumia wifi za umma zisizo na password kwa shughuli za kifedha.

4. **Angalia anwani za tovuti**: Hakikisha anwani ya tovuti ni sahihi kabla ya kuingiza maelezo yako.

5. **Ripoti matukio yoyote ya shaka**: Ikiwa utagundua shughuli yoyote isiyo ya kawaida, ripoti mara moja kwa mamlaka husika.

**Onyo**: Hii ni ushauri wa jumla. Kwa msaada maalum, wasiliana na mamlaka husika au mtaalamu wa usalama wa kidijitali.`,
      relatedGuides: relatedGuides,
    }
  }

  return {
    title: `Cybersecurity Advice: ${query}`,
    content: `Regarding "${query}", here is important cybersecurity advice:

1. **Verify the source**: Always ensure that messages or information you receive are from a trusted source.

2. **Don't share personal details**: Never share your password, PIN, or any financial information with anyone.

3. **Use secure WiFi**: Avoid using public WiFi without passwords for financial activities.

4. **Check website URLs**: Ensure the website URL is correct before entering your details.

5. **Report any suspicious activity**: If you notice any unusual activity, report it immediately to the relevant authorities.

**Note**: This is general advice. For specific assistance, contact relevant authorities or a cybersecurity expert.`,
    relatedGuides: relatedGuides,
  }
}

/**
 * Check if a query might need AI fallback (when no guides match)
 */
export const shouldUseAIFallback = (query: string, matchedGuides: Guide[]): boolean => {
  return matchedGuides.length === 0 && query.trim().length > 0
}
