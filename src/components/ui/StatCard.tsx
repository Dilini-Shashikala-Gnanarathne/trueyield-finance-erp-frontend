interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconVariant?: 'primary' | 'success' | 'warning' | 'error';
  subtext?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconVariant = 'primary',
  subtext,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className={`stat-card__icon stat-card__icon--${iconVariant}`} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div className="stat-card__value">{value}</div>
      {subtext && <div className="stat-card__subtext">{subtext}</div>}
    </article>
  );
}
