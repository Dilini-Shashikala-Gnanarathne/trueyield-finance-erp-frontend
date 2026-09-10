import { financeClient } from './client';
import type {
  CreateJournalEntryRequest,
  CreateJournalEntryResponse,
  HealthResponse,
} from './types';

/**
 * Finance Service API functions (direct, bypassing API Gateway).
 * Used for the journal entry form and Finance health checks.
 */
export const financeApi = {
  /**
   * Create a journal entry directly against the Finance Service.
   * POST /api/finance/journal-entries
   * Returns 201 (new) or 200 (idempotent repeat).
   */
  async createJournalEntry(
    request: CreateJournalEntryRequest,
  ): Promise<CreateJournalEntryResponse> {
    const { data } = await financeClient.post<CreateJournalEntryResponse>(
      '/journal-entries',
      request,
    );
    return data;
  },

  /**
   * Health check for Finance Service (direct, not via API Gateway).
   * GET /api/finance/health
   */
  async health(): Promise<HealthResponse> {
    const { data } = await financeClient.get<HealthResponse>('/health');
    return data;
  },
} as const;
