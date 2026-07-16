interface StatCardProps {
  label: string
  value: number
  accent?: 'primary' | 'accent' | 'ink'
}

export default function StatCard({ label, value, accent = 'ink' }: StatCardProps) {
  const colorClass =
    accent === 'primary'
      ? 'text-[var(--color-primary)]'
      : accent === 'accent'
        ? 'text-[var(--color-accent)]'
        : 'text-[var(--color-ink)]'

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
      <p className={`mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold ${colorClass}`}>
        {value}
      </p>
    </div>
  )
}
