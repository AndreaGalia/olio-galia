interface SellerStatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  colorClass?: string;
}

export default function SellerStatsCard({
  title,
  value,
  subtitle,
  colorClass = 'text-gray-900'
}: SellerStatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}
