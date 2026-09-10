import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { financeApi } from '@/api/finance.api';
import type { CreateJournalEntryRequest, CreateJournalEntryResponse, ApiError } from '@/api/types';

interface UseCreateJournalEntryOptions {
  onSuccess?: (data: CreateJournalEntryResponse) => void;
}

/**
 * Mutation hook to create a journal entry directly against the Finance Service.
 */
export function useCreateJournalEntry(options: UseCreateJournalEntryOptions = {}) {
  return useMutation<CreateJournalEntryResponse, ApiError, CreateJournalEntryRequest>({
    mutationFn: financeApi.createJournalEntry,

    onSuccess: (data) => {
      if (data.wasIdempotent) {
        toast.success(`Journal ${data.journalReference} already exists (idempotent)`, {
          icon: '♻️',
          duration: 5000,
        });
      } else {
        toast.success(`Journal entry ${data.journalReference} created successfully`, {
          duration: 5000,
        });
      }
      options.onSuccess?.(data);
    },

    onError: (error: ApiError) => {
      toast.error(error.message, { duration: 8000 });
    },
  });
}
