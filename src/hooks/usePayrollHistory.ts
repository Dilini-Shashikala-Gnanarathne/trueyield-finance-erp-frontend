import { useState, useCallback } from 'react';
import type { PayrollHistoryEntry } from '@/api/types';

const STORAGE_KEY = 'finance-erp:payroll-history';
const MAX_ENTRIES = 100;

// ── Persistence helpers (module-level, outside React) ─────────────────────────

function readHistory(): PayrollHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PayrollHistoryEntry[];
  } catch {
    return [];
  }
}

function writeHistory(entries: PayrollHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Gracefully handle QuotaExceededError
    console.warn('[history] Failed to persist payroll history to localStorage.');
  }
}

/**
 * Adds a payroll run to persistent history.
 * Called from useProcessPayroll after a successful mutation.
 * Module-level so it can be called outside of a React component.
 */
export function addPayrollHistoryEntry(entry: PayrollHistoryEntry): void {
  const current = readHistory();
  const updated = [entry, ...current].slice(0, MAX_ENTRIES);
  writeHistory(updated);
  // Notify any subscribed listeners (React components)
  window.dispatchEvent(new CustomEvent('payroll-history-updated'));
}

/**
 * React hook to read and manage payroll history from localStorage.
 * Listens for updates dispatched by addPayrollHistoryEntry.
 */
export function usePayrollHistory() {
  const [history, setHistory] = useState<PayrollHistoryEntry[]>(readHistory);

  // Refresh when another hook/component adds a new entry
  const refresh = useCallback(() => {
    setHistory(readHistory());
  }, []);

  // Subscribe to custom event on mount, unsubscribe on unmount
  const subscribe = useCallback(() => {
    window.addEventListener('payroll-history-updated', refresh);
    return () => window.removeEventListener('payroll-history-updated', refresh);
  }, [refresh]);

  // Expose subscribe so pages can call it in a useEffect
  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, clearHistory, refresh, subscribe };
}
