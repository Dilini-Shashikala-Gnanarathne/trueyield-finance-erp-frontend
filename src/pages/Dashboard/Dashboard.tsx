import { useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';

export default function Dashboard() {
  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Overview"
        title="Finance ERP Dashboard"
        description="Manage journal entries, track marketplace activity, and monitor service health."
      />

      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-secondary)' }}>
            Welcome to Finance ERP. Use the sidebar to navigate to Journal Entries, Marketplace, or your Profile.
          </p>
        </div>
      </div>
    </div>
  );
}
