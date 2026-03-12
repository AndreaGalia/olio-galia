const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_SVG_URL || '';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
      <div className="text-center">
        <img
          src={LOGO_URL}
          alt="Olio Galia"
          className="h-8 w-auto mx-auto animate-pulse"
        />
        {message && <p className="text-black/50 text-sm mt-6">{message}</p>}
      </div>
    </div>
  );
}
