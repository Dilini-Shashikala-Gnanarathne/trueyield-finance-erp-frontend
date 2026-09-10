import { useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import TransportBadge from '@/components/ui/TransportBadge';
import { usePayrollHistory } from '@/hooks/usePayrollHistory';

export default function Dashboard() {
  const { history, subscribe } = usePayrollHistory();

  // Subscribe to live history updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [subscribe]);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Overview"
        title="Finance ERP Dashboard"
        description="Monitor service health, payroll metrics, and transaction activity in real time."
      />

      <div className="section">
      
        {/* ── Recent Activity ────────────────────────────────────────────── */}
        <div>
          <h2 className="section-title">Recent Payroll Runs</h2>
          {history.length === 0 ? (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
              No payroll runs yet. Go to <strong style={{ color: 'var(--clr-primary)' }}>Process Payroll</strong> to get started.
            </div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Period</th>
                    <th>Employees</th>
                    <th>Total Amount</th>
                    <th>Transport</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((run) => (
                    <tr key={run.payrollReference}>
                      <td className="td-mono">{run.payrollReference}</td>
                      <td>{run.payrollPeriod}</td>
                      <td>{run.employeeCount?.toLocaleString()}</td>
                      <td className="td-mono">
                        ${(run.totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td><TransportBadge transport={run.financeTransport} /></td>
                      <td>
                        <span className={`status-badge status-badge--${run.status?.toLowerCase()}`}>
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
