import { Link } from 'react-router-dom'
import { Guide } from '../types'
import { paths } from '../../../routes/paths'

interface GuideCardProps {
  guide: Guide
  isAIGenerated?: boolean
}

export const GuideCard = ({ guide, isAIGenerated = false }: GuideCardProps) => {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 sm:p-6">
      {isAIGenerated && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 sm:px-2.5 sm:py-1 sm:text-xs">
            <span className="text-xs sm:text-sm">💡</span>
            <span className="hidden sm:inline">AI-Generated Suggestion</span>
            <span className="sm:hidden">AI</span>
          </span>
        </div>
      )}

      {guide.category && (
        <div className="mb-2 sm:mb-3">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-800 sm:px-3 sm:py-1 sm:text-xs">
            {guide.category.title}
          </span>
        </div>
      )}

      <h3 className="mb-2 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors sm:text-lg">
        {guide.title}
      </h3>

      <p className="mb-3 text-xs text-gray-600 line-clamp-3 sm:mb-4 sm:text-sm">{guide.snippet}</p>

      {guide.tags && guide.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
          {guide.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 sm:px-2 sm:py-1 sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link
        to={paths.knowledge.guide(guide.slug)}
        className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors sm:text-sm"
      >
        Read More
        <svg
          className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:ml-2 sm:h-4 sm:w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  )
}

