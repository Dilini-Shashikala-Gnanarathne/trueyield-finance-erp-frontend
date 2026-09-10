import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';
import FormField from '@/components/forms/FormField';
import SegmentedControl from '@/components/forms/SegmentedControl';
import ResponseViewer from '@/components/ui/ResponseViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useProcessPayroll } from '@/hooks/useProcessPayroll';
import type { FinanceTransport, ProcessPayrollResponse } from '@/api/types';

// ── Zod schema (single source of truth for this form) ─────────────────────────
const payrollSchema = z.object({
  payrollPeriod: z
    .string()
    .min(1, 'Payroll period is required')
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be YYYY-MM format, e.g. 2026-08'),
  employeeCount: z
    .number({ invalid_type_error: 'Employee count must be a number' })
    .int('Must be a whole number')
    .min(1, 'At least 1 employee required')
    .max(10_000, 'Maximum 10 000 employees per run'),
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

const TRANSPORT_OPTIONS = [
  {
    value: 'GRPC' as const,
    label: '⚡ gRPC (Primary)',
    description: 'Calls Finance Service via gRPC/Protobuf — the primary production path',
  },
  {
    value: 'REST' as const,
    label: '🌐 REST (Benchmark)',
    description: 'Calls Finance Service via REST/JSON — for benchmark comparison only',
  },
];

export default function Payroll() {
  const [transport, setTransport] = useState<FinanceTransport>('GRPC');
  const [lastResponse, setLastResponse] = useState<ProcessPayrollResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      payrollPeriod: new Date().toISOString().slice(0, 7), // current YYYY-MM
      employeeCount: 25,
    },
  });

  const mutation = useProcessPayroll({
    onSuccess: (data) => setLastResponse(data),
  });

  const onSubmit = (values: PayrollFormValues) => {
    mutation.mutate({ ...values, transport });
  };

  const handleReset = () => {
    reset();
    setLastResponse(null);
    mutation.reset();
  };

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Payroll"
        title="Process Payroll Run"
        description="Submit a payroll run against the Finance Service. Toggle between gRPC (primary) and REST (benchmark) transport paths."
      />

      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,480px) 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-grid" style={{ gap: '1.5rem' }}>

                {/* Transport toggle */}
                <FormField id="transport" label="Finance Transport">
                  <SegmentedControl
                    id="transport"
                    value={transport}
                    options={TRANSPORT_OPTIONS}
                    onChange={setTransport}
                    aria-label="Finance transport protocol"
                  />
                  <span className="form-hint">
                    {transport === 'GRPC'
                      ? '→ Payroll Service → gRPC :9090 → Finance Service'
                      : '→ Payroll Service → REST :8082 → Finance Service'}
                  </span>
                </FormField>

                {/* Payroll Period */}
                <FormField
                  id="payrollPeriod"
                  label="Payroll Period"
                  required
                  error={errors.payrollPeriod}
                  hint="Format: YYYY-MM (e.g. 2026-08)"
                >
                  <input
                    id="payrollPeriod"
                    type="text"
                    placeholder="2026-08"
                    className={`form-input${errors.payrollPeriod ? ' form-input--error' : ''}`}
                    aria-describedby={errors.payrollPeriod ? 'payrollPeriod-error' : 'payrollPeriod-hint'}
                    {...register('payrollPeriod')}
                  />
                </FormField>

                {/* Employee Count */}
                <FormField
                  id="employeeCount"
                  label="Employee Count"
                  required
                  error={errors.employeeCount}
                  hint="1 – 10 000 employees per run"
                >
                  <input
                    id="employeeCount"
                    type="number"
                    min={1}
                    max={10_000}
                    placeholder="25"
                    className={`form-input${errors.employeeCount ? ' form-input--error' : ''}`}
                    aria-describedby={errors.employeeCount ? 'employeeCount-error' : 'employeeCount-hint'}
                    {...register('employeeCount', { valueAsNumber: true })}
                  />
                </FormField>

                {/* Actions */}
                <div className="flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={handleReset}
                    disabled={mutation.isPending}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    id="submit-payroll-btn"
                    className="btn btn--primary btn--lg"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" label="Processing payroll…" />
                        Processing…
                      </>
                    ) : (
                      `Run Payroll via ${transport}`
                    )}
                  </button>
                </div>

                {/* Inline error display */}
                {mutation.isError && (
                  <div className="response-viewer animate-in">
                    <div className="response-viewer__header">
                      <span className="response-viewer__title">❌ Error</span>
                      <span className="response-viewer__status response-viewer__status--error">
                        HTTP {mutation.error.status}
                      </span>
                    </div>
                    <pre className="response-viewer__body">{mutation.error.message}</pre>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* ── Response Panel ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {lastResponse ? (
              <>
                <ResponseViewer
                  data={lastResponse}
                  isSuccess
                  statusLabel={`201 Created · ${lastResponse.financeTransport}`}
                />

                {/* Kafka Event Banner */}
                <div className="card animate-in" style={{
                  border: '1px solid rgba(249,115,22,0.4)',
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(13,20,36,0.95) 100%)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span>📨</span> KAFKA EVENT PUBLISHED
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(249,115,22,0.15)', color: '#fb923c', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      Topic: payroll.events
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--clr-text-secondary)', margin: '0 0 0.75rem 0' }}>
                    Reference <strong>{lastResponse.payrollReference}</strong> was published to Kafka. Both <strong>notification-service</strong> and <strong>payslip-service</strong> consumed this event independently!
                  </p>
                  <Link
                    to="/kafka-stream"
                    className="btn btn--secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', borderColor: 'rgba(249,115,22,0.4)', color: '#fb923c', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <span>⚡ Inspect Kafka Stream & Fan-Out</span> →
                  </Link>
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                <p>Submit the form to see the API response here.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                  The response includes the journal reference created in Finance Service.
                </p>
              </div>
            )}

            {/* Info card */}
            <div className="card" style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', lineHeight: '1.7' }}>
              <strong style={{ color: 'var(--clr-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                What happens when you submit?
              </strong>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Payroll Service validates the request</li>
                <li>Generates payroll reference (PAY-YYYY-MM-NNNN)</li>
                <li>Calls Finance Service via <strong>{transport}</strong> to create a double-entry journal</li>
                <li>Saves payroll record with status PROCESSED</li>
                <li>Returns full response with journal reference</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
