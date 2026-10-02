interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, description, actions }: PageHeaderProps) {
  const desc = description ?? subtitle;
  return (
    <header className="page-header">
      <div className="flex items-center justify-between">
        <div>
          {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
          <h1 className="page-header__title">{title}</h1>
          {desc && <p className="page-header__description">{desc}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
