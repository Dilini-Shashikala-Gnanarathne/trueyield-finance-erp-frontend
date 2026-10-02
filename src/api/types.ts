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
