interface ShimmerLoaderProps {
  className?: string
  count?: number
}

export const ShimmerLoader = ({ className = '', count = 1 }: ShimmerLoaderProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`}
          style={{
            backgroundImage: 'linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb)',
            animation: 'shimmer 2s infinite',
          }}
        />
      ))}
    </>
  )
}

// Add shimmer animation to global CSS
export const ShimmerCard = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <ShimmerLoader className="h-5 w-3/4 mb-3 sm:h-6 sm:mb-4" />
      <ShimmerLoader className="h-3 w-full mb-2 sm:h-4" />
      <ShimmerLoader className="h-3 w-5/6 mb-3 sm:h-4 sm:mb-4" />
      <ShimmerLoader className="h-8 w-28 rounded-lg sm:h-10 sm:w-32" />
    </div>
  )
}

