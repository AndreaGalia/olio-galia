interface OrderFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export default function OrderFilters({ statusFilter, onStatusChange }: OrderFiltersProps) {
  const filters = [
    { value: 'all', label: 'Tutti' },
    { value: 'paid', label: 'Pagati' },
    { value: 'shipping', label: 'In Preparazione' },
    { value: 'shipped', label: 'Spediti' },
    { value: 'delivered', label: 'Consegnati' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10 mb-8">
      <h2 className="text-xl font-serif text-olive mb-4">Filtri</h2>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
            className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === filter.value
                ? 'bg-olive text-white border-olive'
                : 'text-olive border-olive/30 hover:border-olive hover:bg-olive/5'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}