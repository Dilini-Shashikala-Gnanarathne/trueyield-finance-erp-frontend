import { payrollClient } from './client';
import type { ProcessPayrollRequest, ProcessPayrollResponse, HealthResponse } from './types';

/**
 * Payroll Service API functions.
 * All functions return typed promises and throw ApiError on failure.
 */
export const payrollApi = {
  /**
   * Process payroll via gRPC-backed Finance path (primary production path).
   * POST /api/payroll/process-grpc
   */
  async processViaGrpc(request: ProcessPayrollRequest): Promise<ProcessPayrollResponse> {
    const { data } = await payrollClient.post<ProcessPayrollResponse>(
      '/process-grpc',
      request,
    );
    return data;
  },

  /**
   * Process payroll via REST-backed Finance path (benchmark comparison path).
   * POST /api/payroll/process-rest
   */
  async processViaRest(request: ProcessPayrollRequest): Promise<ProcessPayrollResponse> {
    const { data } = await payrollClient.post<ProcessPayrollResponse>(
      '/process-rest',
      request,
    );
    return data;
  },

  /**
   * Health check for Payroll Service (routed via API Gateway).
   * GET /api/payroll/health
   */
  async health(): Promise<HealthResponse> {
    const { data } = await payrollClient.get<HealthResponse>('/health');
    return data;
  },
} as const;
