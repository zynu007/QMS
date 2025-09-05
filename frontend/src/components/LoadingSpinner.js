import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`animate-spin text-indigo-600 ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;