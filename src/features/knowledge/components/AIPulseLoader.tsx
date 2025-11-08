import { Shield } from 'lucide-react'

interface AIPulseLoaderProps {
  text?: string
  className?: string
}

export const AIPulseLoader = ({ 
  text = 'Analyzing your query securely…',
  className = '' 
}: AIPulseLoaderProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Pulse Container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Multiple pulse waves */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-blue-400/30 animate-ping" />
        <div 
          className="absolute w-24 h-24 rounded-full border-2 border-green-400/30 animate-ping" 
          style={{ animationDelay: '0.5s', animationDuration: '2s' }}
        />
        <div 
          className="absolute w-24 h-24 rounded-full border-2 border-blue-500/20 animate-ping" 
          style={{ animationDelay: '1s', animationDuration: '2.5s' }}
        />
        
        {/* Center Icon */}
        <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 shadow-lg">
          <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Additional outer ring for radar effect */}
        <div 
          className="absolute w-32 h-32 rounded-full border border-blue-300/20"
          style={{
            animation: 'radar-sweep 3s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Loading Text */}
      <p className="text-sm font-medium text-gray-700 text-center max-w-xs">
        {text}
      </p>
      
      {/* Custom CSS for radar sweep animation */}
      <style>{`
        @keyframes radar-sweep {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

