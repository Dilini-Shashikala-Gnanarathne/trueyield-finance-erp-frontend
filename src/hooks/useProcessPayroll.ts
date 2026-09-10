import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { payrollApi } from '@/api/payroll.api';
import type {
  ProcessPayrollRequest,
  ProcessPayrollResponse,
  ApiError,
  FinanceTransport,
} from '@/api/types';
import { addPayrollHistoryEntry } from './usePayrollHistory';

interface UseProcessPayrollOptions {
  onSuccess?: (data: ProcessPayrollResponse) => void;
}

/**
 * Mutation hook to process a payroll run.
 * Wraps both the gRPC and REST transport paths.
 * On success, persists the result to local history.
 */
export function useProcessPayroll(options: UseProcessPayrollOptions = {}) {
  return useMutation<ProcessPayrollResponse, ApiError, ProcessPayrollRequest & { transport: FinanceTransport }>({
    mutationFn: ({ transport, ...request }) =>
      transport === 'GRPC'
        ? payrollApi.processViaGrpc(request)
        : payrollApi.processViaRest(request),

    onSuccess: (data) => {
      toast.success(
        `Payroll ${data.payrollReference} processed via ${data.financeTransport}`,
        { duration: 5000 },
      );
      // Persist to local history so the History page can display it
      addPayrollHistoryEntry({ ...data, recordedAt: new Date().toISOString() });
      options.onSuccess?.(data);
    },

    onError: (error: ApiError) => {
      toast.error(error.message, { duration: 8000 });
    },
  });
}
