interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  deleteTooltip?: string;
  variant?: 'desktop' | 'mobile';
}

export default function ActionButtons({
  onEdit,
  onDelete,
  deleteDisabled = false,
  deleteTooltip,
  variant = 'desktop'
}: ActionButtonsProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 text-sm bg-olive text-white rounded-lg hover:bg-salvia transition-colors flex items-center justify-center space-x-1 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Modifica</span>
        </button>
        <button
          onClick={onDelete}
          disabled={deleteDisabled}
          title={deleteTooltip}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onEdit}
        className="text-olive hover:text-salvia transition-colors flex items-center space-x-1 group cursor-pointer"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-medium">Modifica</span>
      </button>
      <button
        onClick={onDelete}
        disabled={deleteDisabled}
        title={deleteTooltip}
        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 group cursor-pointer"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="font-medium">Elimina</span>
      </button>
    </div>
  );
}