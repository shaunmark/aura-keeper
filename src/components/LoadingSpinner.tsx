interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'large', fullScreen = true }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {size === 'large' && (
        <p className="text-indigo-600 text-lg font-medium animate-pulse">Loading...</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
} 