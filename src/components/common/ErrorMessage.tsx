interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorMessage({ error, onRetry, retryText = "Riprova" }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}