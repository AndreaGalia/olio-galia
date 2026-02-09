interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4" />
        {message && <p className="text-olive text-lg">{message}</p>}
      </div>
    </div>
  );
}