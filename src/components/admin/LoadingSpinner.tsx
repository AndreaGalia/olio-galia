interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Caricamento...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive/5">
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4`}></div>
        <p className="text-olive">{message}</p>
      </div>
    </div>
  );
}