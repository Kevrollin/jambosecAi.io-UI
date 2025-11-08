interface LanguageToggleProps {
  currentLang: 'en' | 'sw';
  onToggle: () => void;
  className?: string;
}

export const LanguageToggle = ({ currentLang, onToggle, className = '' }: LanguageToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center bg-gray-200 rounded-sm p-0.5 sm:p-0.5 md:p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={`Switch to ${currentLang === 'en' ? 'Swahili' : 'English'}`}
      role="switch"
      aria-checked={currentLang === 'en'}
    >
      {/* Container for proper sizing */}
      <div className="relative flex items-center w-16 sm:w-20 md:w-24 h-6 sm:h-7 md:h-8">
        {/* Sliding pill indicator */}
        <span
          className="absolute top-0.5 sm:top-0.5 md:top-1 left-0.5 sm:left-0.5 md:left-1 h-5 sm:h-6 md:h-7 w-[calc(50%-0.125rem)] sm:w-[calc(50%-0.25rem)] bg-blue-600 rounded-sm transition-transform duration-300 ease-in-out"
          style={{
            transform: currentLang === 'en' 
              ? 'translateX(0)' 
              : 'translateX(calc(100% + 0.25rem))'
          }}
        />
        
        {/* Language options */}
        <span
          className={`relative flex-1 text-center text-[10px] sm:text-xs md:text-sm font-semibold py-1 sm:py-1.5 md:py-2 rounded-full transition-colors duration-300 z-10 ${
            currentLang === 'en' ? 'text-white' : 'text-gray-900'
          }`}
        >
          EN
        </span>
        <span
          className={`relative flex-1 text-center text-[10px] sm:text-xs md:text-sm font-semibold py-1 sm:py-1.5 md:py-2 rounded-full transition-colors duration-300 z-10 ${
            currentLang === 'sw' ? 'text-white' : 'text-gray-900'
          }`}
        >
          SW
        </span>
      </div>
    </button>
  );
};
