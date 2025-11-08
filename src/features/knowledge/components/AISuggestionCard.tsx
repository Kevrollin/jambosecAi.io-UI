import { AIGeneratedSuggestion } from '../types'
import { GuideCard } from './GuideCard'

interface AISuggestionCardProps {
  suggestion: AIGeneratedSuggestion
}

export const AISuggestionCard = ({ suggestion }: AISuggestionCardProps) => {
  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <span className="text-xl sm:text-2xl">💡</span>
        <h3 className="text-base font-semibold text-blue-900 sm:text-lg">AI-Generated Suggestion</h3>
      </div>

      <div className="mb-4 rounded-lg border border-blue-200 bg-white p-3 sm:mb-6 sm:p-4">
        <h4 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">{suggestion.title}</h4>
        <div
          className="prose prose-xs max-w-none text-gray-700 sm:prose-sm"
          dangerouslySetInnerHTML={{
            __html: suggestion.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      </div>

      {suggestion.relatedGuides.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h5 className="mb-2 text-xs font-semibold text-gray-700 sm:mb-3 sm:text-sm">Related Articles</h5>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestion.relatedGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

