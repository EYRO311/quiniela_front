// src/components/atoms/StatItem.tsx

interface StatItemProps {
  label: string;
  value: string | number;
}

export default function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}