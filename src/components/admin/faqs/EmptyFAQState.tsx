'use client';

interface EmptyFAQStateProps {
  onCreateClick: () => void;
  labels: {
    title: string;
    description: string;
    button: string;
  };
}

export default function EmptyFAQState({ onCreateClick, labels }: EmptyFAQStateProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-12 text-center">
      <svg
        className="mx-auto h-12 w-12 text-olive/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{labels.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{labels.description}</p>
      <div className="mt-6">
        <button
          onClick={onCreateClick}
          className="px-6 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
        >
          {labels.button}
        </button>
      </div>
    </div>
  );
}
