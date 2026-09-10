import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';
import FormField from '@/components/forms/FormField';
import ResponseViewer from '@/components/ui/ResponseViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCreateJournalEntry } from '@/hooks/useCreateJournalEntry';
import type { CreateJournalEntryResponse } from '@/api/types';

// ── Zod schema ────────────────────────────────────────────────────────────────
const journalSchema = z.object({
  reference: z
    .string()
    .min(1, 'Reference is required')
    .max(100, 'Maximum 100 characters')
    .regex(/^[A-Z0-9-]+$/, 'Use only uppercase letters, digits, and hyphens'),
  description: z.string().min(1, 'Description is required').max(500, 'Maximum 500 characters'),
  debitAccount: z.string().min(1, 'Debit account is required'),
  creditAccount: z.string().min(1, 'Credit account is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,4})?$/, 'Enter a valid decimal amount (up to 4 decimal places)'),
  currency: z
    .string()
    .length(3, 'Must be a 3-letter ISO 4217 code')
    .toUpperCase(),
  sourceSystem: z.string().optional(),
});

type JournalFormValues = z.infer<typeof journalSchema>;

const ACCOUNT_OPTIONS = [
  'SALARY_EXPENSE',
  'PAYROLL_PAYABLE',
  'ACCOUNTS_PAYABLE',
  'ACCOUNTS_RECEIVABLE',
  'CASH',
  'BANK',
  'RETAINED_EARNINGS',
  'TAX_PAYABLE',
  'OPERATING_EXPENSE',
  'REVENUE',
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD'];

export default function JournalEntry() {
  const [lastResponse, setLastResponse] = useState<CreateJournalEntryResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      reference: `JE-${new Date().toISOString().slice(0, 7).replace('-', '')}-001`,
      currency: 'USD',
      sourceSystem: 'FINANCE-ERP-FRONTEND',
    },
  });

  const mutation = useCreateJournalEntry({
    onSuccess: (data) => setLastResponse(data),
  });

  const onSubmit = (values: JournalFormValues) => {
    mutation.mutate(values);
  };

  const handleReset = () => {
    reset();
    setLastResponse(null);
    mutation.reset();
  };

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Finance"
        title="Create Journal Entry"
        description="Post a double-entry bookkeeping journal directly to the Finance Service. Supports idempotent retries via the reference field."
      />

      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 560px) 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Form ───────────────────────────────────────────────────── */}
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-grid">

                {/* Reference */}
                <FormField
                  id="reference"
                  label="Reference (Idempotency Key)"
                  required
                  error={errors.reference}
                  hint="Unique business key. Retrying with the same reference returns the existing entry."
                >
                  <input
                    id="reference"
                    type="text"
                    placeholder="JE-202608-001"
                    className={`form-input text-mono${errors.reference ? ' form-input--error' : ''}`}
                    {...register('reference')}
                  />
                </FormField>

                {/* Description */}
                <FormField
                  id="description"
                  label="Description"
                  required
                  error={errors.description}
                >
                  <input
                    id="description"
                    type="text"
                    placeholder="Payroll for period 2026-08 — 25 employees"
                    className={`form-input${errors.description ? ' form-input--error' : ''}`}
                    {...register('description')}
                  />
                </FormField>

                {/* Debit / Credit accounts */}
                <div className="form-grid form-grid--2col">
                  <FormField
                    id="debitAccount"
                    label="Debit Account"
                    required
                    error={errors.debitAccount}
                  >
                    <select
                      id="debitAccount"
                      className={`form-select${errors.debitAccount ? ' form-select--error' : ''}`}
                      {...register('debitAccount')}
                    >
                      <option value="">Select account…</option>
                      {ACCOUNT_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    id="creditAccount"
                    label="Credit Account"
                    required
                    error={errors.creditAccount}
                  >
                    <select
                      id="creditAccount"
                      className={`form-select${errors.creditAccount ? ' form-select--error' : ''}`}
                      {...register('creditAccount')}
                    >
                      <option value="">Select account…</option>
                      {ACCOUNT_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Amount / Currency */}
                <div className="form-grid form-grid--2col">
                  <FormField
                    id="amount"
                    label="Amount"
                    required
                    error={errors.amount}
                    hint="Stored as string to preserve precision"
                  >
                    <input
                      id="amount"
                      type="text"
                      placeholder="208333.3300"
                      className={`form-input text-mono${errors.amount ? ' form-input--error' : ''}`}
                      {...register('amount')}
                    />
                  </FormField>

                  <FormField
                    id="currency"
                    label="Currency (ISO 4217)"
                    required
                    error={errors.currency}
                  >
                    <select
                      id="currency"
                      className={`form-select${errors.currency ? ' form-select--error' : ''}`}
                      {...register('currency')}
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Source System */}
                <FormField
                  id="sourceSystem"
                  label="Source System"
                  error={errors.sourceSystem}
                  hint="Optional — identifies the calling system in audit logs"
                >
                  <input
                    id="sourceSystem"
                    type="text"
                    placeholder="FINANCE-ERP-FRONTEND"
                    className="form-input"
                    {...register('sourceSystem')}
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
                    id="submit-journal-btn"
                    className="btn btn--primary btn--lg"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" label="Creating journal entry…" />
                        Creating…
                      </>
                    ) : (
                      'Create Journal Entry'
                    )}
                  </button>
                </div>

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

          {/* ── Response ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {lastResponse ? (
              <>
                <ResponseViewer
                  data={lastResponse}
                  isSuccess
                  statusLabel={lastResponse.wasIdempotent ? '200 OK · Idempotent' : '201 Created'}
                />
                {lastResponse.wasIdempotent && (
                  <div className="card" style={{ background: 'var(--clr-warning-dim)', borderColor: 'var(--clr-warning-border)' }}>
                    <strong style={{ color: 'var(--clr-warning)' }}>♻️ Idempotent Response</strong>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>
                      A journal entry with this reference already existed. The Finance Service returned the existing entry — no duplicate was created.
                      This demonstrates safe retry behaviour in distributed systems.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📒</div>
                <p>Fill in the form and submit to see the journal entry response.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                  Submit the same reference twice to observe the idempotency guarantee.
                </p>
              </div>
            )}

            {/* Double-entry explainer */}
            <div className="card" style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', lineHeight: '1.7' }}>
              <strong style={{ color: 'var(--clr-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                📖 Double-Entry Bookkeeping
              </strong>
              <p>Every transaction creates two equal and opposite lines:</p>
              <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: 'var(--clr-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--clr-success)' }}>DEBIT:  SALARY_EXPENSE   $208,333.33</div>
                <div style={{ color: 'var(--clr-error)' }}>CREDIT: PAYROLL_PAYABLE  $208,333.33</div>
              </div>
              <p style={{ marginTop: '0.75rem' }}>Total debits = Total credits. The accounting equation always balances.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
