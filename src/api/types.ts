// ─── Payroll Service DTOs (mirrors Java backend) ─────────────────────────────

export interface ProcessPayrollRequest {
  /** Payroll period in YYYY-MM format, e.g. "2026-08" */
  payrollPeriod: string;
  /** Number of employees to include. Range: 1–10 000 */
  employeeCount: number;
}

export interface ProcessPayrollResponse {
  payrollReference: string;
  payrollPeriod: string;
  employeeCount: number;
  totalAmount: number;
  status: PayrollStatus;
  journalReference: string | null;
  financeTransport: FinanceTransport;
  createdAt: string;
  message: string | null;
}

export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
export type FinanceTransport = 'GRPC' | 'REST';

// ─── Finance Service DTOs ─────────────────────────────────────────────────────

export interface CreateJournalEntryRequest {
  /** Idempotency key / business reference, e.g. "JE-2026-08-001" */
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  /** Transmitted as string to preserve decimal precision (no floating-point) */
  amount: string;
  /** ISO 4217 3-letter code, e.g. "USD" */
  currency: string;
  sourceSystem?: string;
}

export interface CreateJournalEntryResponse {
  journalReference: string;
  status: string;
  message: string;
  wasIdempotent: boolean;
  createdAt: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'UP' | 'DOWN' | string;
  service?: string;
  timestamp?: string;
}

// ─── Normalized API Error (never leak AxiosError to UI) ──────────────────────

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
  timestamp?: string;
}

// ─── Benchmark ────────────────────────────────────────────────────────────────

export interface BenchmarkSample {
  iteration: number;
  latencyMs: number;
  success: boolean;
}

export interface BenchmarkResult {
  transport: FinanceTransport;
  samples: BenchmarkSample[];
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
  successRate: number;
}

// ─── Local History ─────────────────────────────────────────────────────────────

export interface PayrollHistoryEntry extends ProcessPayrollResponse {
  /** ISO string timestamp when the frontend recorded this run */
  recordedAt: string;
}
