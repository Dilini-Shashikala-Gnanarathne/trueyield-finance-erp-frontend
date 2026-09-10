/**
 * Typed environment variable access.
 * Fails fast at startup if a required variable is missing.
 * This file is the single source of truth for all VITE_* vars.
 */

function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${key}. Check .env.example.`,
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined;
  return value ?? fallback;
}

export const env = {
  /** App display name */
  appName: optionalEnv('VITE_APP_NAME', 'Finance ERP'),

  /** API Gateway base URL — proxied via Vite dev server in development */
  gatewayUrl: optionalEnv('VITE_GATEWAY_URL', 'http://localhost:8080'),

  /** Finance Service direct URL — proxied via Vite dev server in development */
  financeUrl: optionalEnv('VITE_FINANCE_URL', 'http://localhost:8082'),

  /** True when running in development mode */
  isDev: import.meta.env.DEV,
} as const;
