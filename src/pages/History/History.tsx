import { useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import TransportBadge from '@/components/ui/TransportBadge';
import { usePayrollHistory } from '@/hooks/usePayrollHistory';

function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return '—';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function History() {
  const { history, clearHistory, subscribe } = usePayrollHistory();

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Records"
        title="Payroll Run History"
        description="All payroll runs processed in this session, persisted to browser storage."
        actions={
          history.length > 0 ? (
            <button
              className="btn btn--danger btn--sm"
              onClick={clearHistory}
              id="clear-history-btn"
            >
              🗑 Clear History
            </button>
          ) : undefined
        }
      />

      <div className="section">
        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--clr-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕐</div>
            <h3 style={{ color: 'var(--clr-text-secondary)', marginBottom: '0.5rem' }}>No history yet</h3>
            <p>Payroll runs will appear here after you process them on the Payroll page.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--clr-text-muted)' }}>
              <span>Showing {history.length} run{history.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Period</th>
                    <th>Employees</th>
                    <th>Total Amount</th>
                    <th>Journal Ref</th>
                    <th>Transport</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((run) => (
                    <tr key={`${run.payrollReference}-${run.recordedAt}`}>
                      <td className="td-mono">{run.payrollReference}</td>
                      <td className="td-mono">{run.payrollPeriod}</td>
                      <td>{run.employeeCount?.toLocaleString()}</td>
                      <td className="td-mono">{formatAmount(run.totalAmount)}</td>
                      <td className="td-mono">
                        {run.journalReference ?? (
                          <span style={{ color: 'var(--clr-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <TransportBadge transport={run.financeTransport} />
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${run.status?.toLowerCase()}`}>
                          {run.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(run.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            <div className="flex gap-6 mt-4" style={{ fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--clr-text-muted)' }}>gRPC runs: </span>
                <strong style={{ color: 'var(--clr-grpc)' }}>
                  {history.filter((h) => h.financeTransport === 'GRPC').length}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--clr-text-muted)' }}>REST runs: </span>
                <strong style={{ color: 'var(--clr-rest)' }}>
                  {history.filter((h) => h.financeTransport === 'REST').length}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--clr-text-muted)' }}>Failed: </span>
                <strong style={{ color: 'var(--clr-error)' }}>
                  {history.filter((h) => h.status === 'FAILED').length}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
