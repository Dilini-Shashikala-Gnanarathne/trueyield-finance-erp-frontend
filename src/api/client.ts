import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generates a compact request correlation ID for distributed tracing */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Normalizes any axios error into our ApiError shape so UI code never sees AxiosError */
function normalizeError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: 'An unexpected error occurred. Please try again.',
    status: error.response?.status ?? 0,
  };

  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    apiError.message =
      (data['message'] as string | undefined) ??
      (data['detail'] as string | undefined) ??
      (data['title'] as string | undefined) ??
      apiError.message;
    if (typeof data['detail'] === 'string') apiError.detail = data['detail'];
    if (typeof data['timestamp'] === 'string') apiError.timestamp = data['timestamp'];
  } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
    apiError.message = 'Request timed out. Is the backend running?';
  } else if (error.code === 'ERR_NETWORK') {
    apiError.message = 'Cannot reach the server. Ensure the backend services are running.';
  } else if (error.message) {
    apiError.message = error.message;
  }

  return apiError;
}

// ── Factory ────────────────────────────────────────────────────────────────────

function createClient(baseURL: string, timeoutMs = 10_000) {
  const instance = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ── Request interceptor: inject correlation & client headers ──────────────
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers['X-Request-Id'] = generateRequestId();
    config.headers['X-Client'] = 'finance-erp-frontend/1.0';
    return config;
  });

  // ── Response interceptor: pass-through success; normalize errors ───────────
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        return Promise.reject(normalizeError(error));
      }
      // Non-axios error — rethrow as-is
      return Promise.reject(error);
    },
  );

  return instance;
}

// ── Exported clients ───────────────────────────────────────────────────────────

/**
 * Client for Payroll Service via API Gateway.
 * In dev, Vite proxy routes /api/payroll → http://localhost:8080
 */
export const payrollClient = createClient('/api/payroll');

/**
 * Client for Finance Service (direct).
 * In dev, Vite proxy routes /api/finance → http://localhost:8082
 */
export const financeClient = createClient('/api/finance');
